import axios from 'axios';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { ipcRenderer } from 'electron';

// Simple semver comparison function
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

class UpdateService {
  constructor(config) {
    this.user = config.github.user;
    this.repo = config.github.repository;
    this.organization = config.github.organization;
    this.token = config.token;
    this.currentVersion = config.version;
    this.activeChannel = config.github.activeChannel || 'stable';
    this.updateConfig = config.updates || {};
    this.isPortable = this.checkIfPortable();
    this.localTesting = config.updates && config.updates.localTesting || false;
    this.lastUpdateCheck = null;
    this.config = config;
    
    // Create axios instance with GitHub API authentication
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    // Set up event listener for updates from main process
    if (ipcRenderer) {
      ipcRenderer.on('update-status', (event, status) => {
        this.updateStatus = status;
        console.log('Update status:', status);
      });
      
      ipcRenderer.on('update-available', (event, info) => {
        this.updateInfo = info;
        if (this.onUpdateAvailable) {
          this.onUpdateAvailable(info);
        }
      });
      
      ipcRenderer.on('download-progress', (event, progress) => {
        this.downloadProgress = progress;
        if (this.onDownloadProgress) {
          this.onDownloadProgress(progress);
        }
      });
      
      ipcRenderer.on('update-downloaded', () => {
        if (this.onUpdateDownloaded) {
          this.onUpdateDownloaded();
        }
      });
    }
  }
  
  // Check if running as portable app
  checkIfPortable() {
    try {
      const appPath = process.cwd();
      // Portable typically runs from non-standard locations
      return !appPath.includes('Program Files') && 
             !appPath.includes('AppData') &&
             fs.existsSync(path.join(appPath, 'portable'));
    } catch (error) {
      console.error('Error checking portable status:', error);
      return false;
    }
  }
  
  // Check for available updates
  async checkForUpdates(forceCheck = false) {
    try {
      // Check if we should skip based on last check time
      if (!forceCheck && this.lastUpdateCheck) {
        const hoursSinceLastCheck = (Date.now() - this.lastUpdateCheck) / (1000 * 60 * 60);
        if (hoursSinceLastCheck < this.updateConfig.checkIntervalHours) {
          console.log(`Skipping update check. Last check was ${hoursSinceLastCheck.toFixed(1)} hours ago.`);
          return { result: false, message: 'Too soon to check again' };
        }
      }
      
      this.lastUpdateCheck = Date.now();
      
      // If in local testing mode, use local server
      if (this.localTesting) {
        return await this.checkLocalUpdates();
      }
      
      // For installed (non-portable) and non-development mode, use electron-updater
      if (!this.isPortable && process.env.NODE_ENV !== 'development') {
        if (ipcRenderer) {
          ipcRenderer.send('check-for-updates', { channel: this.activeChannel });
        }
        return { result: true, message: 'Checking using electron-updater' };
      }
      
      // For portable or development mode, use GitHub API directly
      return await this.checkGitHubReleases();
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { 
        result: false, 
        error: error.toString(),
        message: 'Failed to check for updates'
      };
    }
  }
  
  // Check updates using GitHub API
  async checkGitHubReleases() {
    try {
      const apiUrl = this.organization 
        ? `/repos/${this.organization}/${this.repo}/releases`
        : `/repos/${this.user}/${this.repo}/releases`;
        
      const response = await this.api.get(apiUrl);
      
      if (!response.data || response.data.length === 0) {
        return { result: false, message: 'No releases found' };
      }
      
      // Filter by active channel using tags (stable, beta, dev)
      let releases = response.data.filter(release => {
        // For stable channel, use only stable releases (no prerelease)
        if (this.activeChannel === 'stable') {
          return !release.prerelease && !release.draft;
        }
        
        // For other channels, look for tags in the release
        if (release.draft) return false;
        
        const hasChannelTag = release.tag_name.includes(this.activeChannel) || 
                              (release.labels && release.labels.some(l => l.name === this.activeChannel));
                              
        return this.activeChannel === 'beta' 
          ? (hasChannelTag || release.prerelease) 
          : hasChannelTag;
      });
      
      // Sort by version (most recent first)
      releases.sort((a, b) => {
        // Extract version numbers
        const versionA = a.tag_name.replace(/^v/, '');
        const versionB = b.tag_name.replace(/^v/, '');
        return compareVersions(versionB, versionA); // Reversed for descending order
      });
      
      if (releases.length === 0) {
        return { result: false, message: 'No releases found for this channel' };
      }
      
      const latestRelease = releases[0];
      const latestVersion = latestRelease.tag_name.replace(/^v/, '');
      
      // Check if latest version is greater than current
      if (!this.updateConfig.allowDowngrade && compareVersions(latestVersion, this.currentVersion) <= 0) {
        return { 
          result: false, 
          message: 'Already on latest version',
          version: latestVersion,
          currentVersion: this.currentVersion
        };
      }
      
      // Find suitable asset to download
      const assetPattern = this.isPortable 
        ? /portable/i
        : /setup|installer/i;
        
      const assets = latestRelease.assets.filter(asset => 
        asset.name.endsWith('.exe') || 
        asset.name.endsWith('.zip') || 
        asset.name.endsWith('.msi')
      );
      
      const asset = assets.find(a => assetPattern.test(a.name)) || assets[0];
      
      if (!asset) {
        return { 
          result: false, 
          message: 'No suitable download found',
          version: latestVersion
        };
      }
      
      return {
        result: true,
        version: latestVersion,
        currentVersion: this.currentVersion,
        releaseDate: new Date(latestRelease.published_at),
        releaseNotes: latestRelease.body,
        downloadUrl: asset.browser_download_url,
        assetName: asset.name,
        isPortable: this.isPortable
      };
    } catch (error) {
      console.error('Error checking GitHub releases:', error);
      throw error;
    }
  }
  
  // Check updates from local server (for testing)
  async checkLocalUpdates() {
    try {
      const response = await axios.get('http://localhost:3000/latest');
      const latestVersion = response.data.version;
      
      if (!this.updateConfig.allowDowngrade && compareVersions(latestVersion, this.currentVersion) <= 0) {
        return { 
          result: false, 
          message: 'Already on latest version',
          version: latestVersion,
          currentVersion: this.currentVersion
        };
      }
      
      return {
        result: true,
        version: latestVersion,
        currentVersion: this.currentVersion,
        releaseDate: new Date(),
        releaseNotes: response.data.notes,
        downloadUrl: response.data.url,
        assetName: path.basename(response.data.url),
        isPortable: this.isPortable
      };
    } catch (error) {
      console.error('Error checking local updates:', error);
      throw error;
    }
  }
  
  // Download update
  async downloadUpdate(updateInfo) {
    try {
      // If not portable and not in development, use electron-updater
      if (!this.isPortable && process.env.NODE_ENV !== 'development') {
        if (ipcRenderer) {
          ipcRenderer.send('download-update');
        }
        return true;
      }
      
      // If portable or in development, handle download manually
      console.log('Downloading update from:', updateInfo.downloadUrl);
      
      // Show progress dialog
      if (this.onDownloadStart) {
        this.onDownloadStart();
      }
      
      const response = await axios({
        url: updateInfo.downloadUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        headers: { 'Authorization': `token ${this.token}` },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (this.onDownloadProgress) {
            this.onDownloadProgress({ percent: percentCompleted });
          }
        }
      });
      
      // Save downloaded file
      const downloadDir = path.join(process.cwd(), 'updates');
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }
      
      const downloadPath = path.join(downloadDir, updateInfo.assetName);
      fs.writeFileSync(downloadPath, Buffer.from(response.data));
      
      // If it's a zip file, extract it
      if (downloadPath.endsWith('.zip')) {
        await this.extractUpdate(downloadPath, updateInfo);
      }
      
      if (this.onUpdateDownloaded) {
        this.onUpdateDownloaded(downloadPath);
      }
      
      return downloadPath;
    } catch (error) {
      console.error('Error downloading update:', error);
      if (this.onDownloadError) {
        this.onDownloadError(error);
      }
      throw error;
    }
  }
  
  // Extract update from zip file
  async extractUpdate(zipPath, updateInfo) {
    try {
      const zip = new AdmZip(zipPath);
      const extractDir = path.join(process.cwd(), 'updates', 'extracted');
      
      if (fs.existsSync(extractDir)) {
        // Clean previous extraction directory
        this.deleteFolderRecursive(extractDir);
      }
      
      fs.mkdirSync(extractDir, { recursive: true });
      
      // Extract content
      zip.extractAllTo(extractDir, true);
      console.log('Update extracted to:', extractDir);
      
      return extractDir;
    } catch (error) {
      console.error('Error extracting update:', error);
      throw error;
    }
  }
  
  // Install update
  async installUpdate(downloadPath) {
    try {
      // If not portable and not in development, use electron-updater
      if (!this.isPortable && process.env.NODE_ENV !== 'development') {
        if (ipcRenderer) {
          ipcRenderer.send('install-update');
        }
        return true;
      }
      
      // If portable or in development, launch installer manually
      if (downloadPath.endsWith('.exe') || downloadPath.endsWith('.msi')) {
        // On Windows, run the installer
        const { spawn } = require('child_process');
        spawn(downloadPath, [], { detached: true, stdio: 'ignore' }).unref();
        
        // Close current app
        setTimeout(() => {
          if (ipcRenderer) {
            ipcRenderer.send('quit-app');
          }
        }, 1000);
        
        return true;
      } else if (fs.existsSync(path.join(downloadPath, 'extracted'))) {
        // File replacement for portable update
        // This approach depends on your app structure
        console.log('Installing portable update...');
        
        // Specific implementation for your portable case
        // ...
        
        // Restart app
        setTimeout(() => {
          if (ipcRenderer) {
            ipcRenderer.send('restart-app');
          }
        }, 1000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing update:', error);
      throw error;
    }
  }
  
  // Utility to recursively delete folder
  deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach(file => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
    }
  }
  
  // Change update channel
  setUpdateChannel(channel) {
    if (this.config.github.updateChannels[channel]) {
      this.activeChannel = channel;
      // Save preference to localStorage
      localStorage.setItem('updateChannel', channel);
      return true;
    }
    return false;
  }
  
  // Get current channel
  getUpdateChannel() {
    return {
      active: this.activeChannel,
      channels: this.config.github.updateChannels
    };
  }
}

export default UpdateService;