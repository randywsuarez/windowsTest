import axios from 'axios';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { ipcRenderer } from 'electron';
import { getCurrentEnvironment, getEnvironmentConfig, getUpdateConfig } from '../utils/envHelper';

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
    this.config = config;
    this.user = config.github.user;
    this.repo = config.github.repository;
    this.token = config.token;
    this.currentVersion = config.version;
    this.updateInfo = null;
    
    // Obtener el entorno actual y su configuración
    this.currentEnvironment = getCurrentEnvironment();
    this.envConfig = getEnvironmentConfig();
    this.updateConfig = getUpdateConfig();
    
    // Configurar según el entorno
    this.useGithub = this.updateConfig.useGithub;
    this.serverUrl = this.updateConfig.url;
    this.checkIntervalHours = this.updateConfig.checkIntervalHours;
    
    // Determinar si es portable
    this.isPortable = this.checkIfPortable();
    this.lastUpdateCheck = null;
    
    // Crear instancia de axios para GitHub API
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    // Configurar eventos de IPC si está disponible
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
  
  // Verificar si se está ejecutando como aplicación portable
  checkIfPortable() {
    try {
      const appPath = process.cwd();
      // Portable típicamente se ejecuta desde ubicaciones no estándar
      return !appPath.includes('Program Files') && 
             !appPath.includes('AppData') &&
             fs.existsSync(path.join(appPath, 'portable'));
    } catch (error) {
      console.error('Error verificando estado portable:', error);
      return false;
    }
  }
  
  // Verificar si hay actualizaciones disponibles
  async checkForUpdates(forceCheck = false) {
    try {
      // Actualizar la configuración por si el entorno ha cambiado
      this.currentEnvironment = getCurrentEnvironment();
      this.envConfig = getEnvironmentConfig();
      this.updateConfig = getUpdateConfig();
      this.useGithub = this.updateConfig.useGithub;
      this.serverUrl = this.updateConfig.url;
      
      // Verificar si debemos omitir basado en la última comprobación
      if (!forceCheck && this.lastUpdateCheck) {
        const hoursSinceLastCheck = (Date.now() - this.lastUpdateCheck) / (1000 * 60 * 60);
        if (hoursSinceLastCheck < this.updateConfig.checkIntervalHours) {
          console.log(`Omitiendo verificación de actualización. Última verificación hace ${hoursSinceLastCheck.toFixed(1)} horas.`);
          return { result: false, message: 'Too soon to check again' };
        }
      }
      
      this.lastUpdateCheck = Date.now();
      
      // Primero intentar con servidor local si está configurado y no se especificó usar GitHub
      if (!this.useGithub && this.serverUrl) {
        try {
          // Intentar verificar el servidor primero con un timeout corto
          const isServerAvailable = await this.checkServerAvailability();
          
          if (isServerAvailable) {
            // Servidor disponible, proceder con la verificación normal
            return await this.checkCustomServer();
          } else {
            // Servidor no disponible, mostrar advertencia y usar GitHub como respaldo
            console.warn(`Servidor de actualización local no disponible: ${this.serverUrl}`);
            
            // Mostrar notificación solo si la verificación fue manual (force=true)
            if (forceCheck && this.onServerUnavailable) {
              this.onServerUnavailable(this.serverUrl);
            }
            
            // Usar GitHub como respaldo
            return await this.checkGitHubReleases();
          }
        } catch (serverError) {
          // Error al verificar servidor local, registrar y continuar con GitHub
          console.error('Error al verificar servidor local, usando GitHub como respaldo:', serverError);
          
          // Notificar solo si fue verificación manual
          if (forceCheck && this.onServerError) {
            this.onServerError(serverError);
          }
          
          // Usar GitHub como respaldo
          return await this.checkGitHubReleases();
        }
      } else {
        // Usar GitHub directamente si está configurado para ello
        return await this.checkGitHubReleases();
      }
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
      return { 
        result: false, 
        error: error.toString(),
        message: 'Failed to check for updates'
      };
    }
  }
  
  // Nuevo método para verificar disponibilidad del servidor
  async checkServerAvailability() {
    try {
      // Intentar hacer una solicitud al endpoint /info con timeout corto
      await axios.get(`${this.serverUrl}/info`, {
        timeout: 3000 // 3 segundos de timeout
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Verificar actualizaciones usando la API de GitHub
  async checkGitHubReleases() {
    try {
      const apiUrl = `/repos/${this.user}/${this.repo}/releases`;
      const response = await this.api.get(apiUrl);
      
      if (!response.data || response.data.length === 0) {
        return { 
          result: false, 
          message: 'No releases found',
          source: 'github'
        };
      }
      
      // Obtener el canal activo
      const activeChannel = localStorage.getItem('updateChannel') || 'stable';
      
      // Filtrar por canal usando etiquetas
      let releases = response.data.filter(release => {
        if (activeChannel === 'stable') {
          return !release.prerelease && !release.draft;
        }
        
        if (release.draft) return false;
        
        const hasChannelTag = release.tag_name.includes(activeChannel) || 
                              (release.labels && release.labels.some(l => l.name === activeChannel));
                              
        return activeChannel === 'beta' 
          ? (hasChannelTag || release.prerelease) 
          : hasChannelTag;
      });
      
      // Ordenar por versión (más reciente primero)
      releases.sort((a, b) => {
        const versionA = a.tag_name.replace(/^v/, '');
        const versionB = b.tag_name.replace(/^v/, '');
        return compareVersions(versionB, versionA);
      });
      
      if (releases.length === 0) {
        return { 
          result: false, 
          message: 'No releases found for this channel',
          source: 'github'
        };
      }
      
      const latestRelease = releases[0];
      const latestVersion = latestRelease.tag_name.replace(/^v/, '');
      
      // Verificar si la versión más reciente es mayor
      if (compareVersions(latestVersion, this.currentVersion) <= 0) {
        return { 
          result: false, 
          message: 'Already on latest version',
          version: latestVersion,
          currentVersion: this.currentVersion,
          source: 'github'
        };
      }
      
      // Buscar el asset adecuado para descargar
      const assetPattern = this.isPortable ? /portable/i : /setup|installer/i;
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
          version: latestVersion,
          source: 'github'
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
        isPortable: this.isPortable,
        channel: activeChannel,
        source: 'github'
      };
    } catch (error) {
      console.error('Error verificando releases de GitHub:', error);
      throw error;
    }
  }
  
  // Verificar actualizaciones desde servidor personalizado
  async checkCustomServer() {
    try {
      // Obtener el canal activo
      const channel = localStorage.getItem('updateChannel') || 'stable';
      
      // Realizar solicitud al servidor con timeout
      const response = await axios.get(`${this.serverUrl}/latest`, {
        params: { channel, environment: this.currentEnvironment },
        timeout: 5000 // 5 segundos de timeout
      });
      
      if (!response.data || !response.data.version) {
        console.warn('Respuesta inválida del servidor de actualización:', response.data);
        
        // Si fue una verificación manual y hay un callback, notificar
        if (this.onServerInvalidResponse) {
          this.onServerInvalidResponse(response.data);
        }
        
        // Intentar con GitHub como respaldo
        return await this.checkGitHubReleases();
      }
      
      // Verificar si hay una versión más reciente
      if (compareVersions(response.data.version, this.currentVersion) <= 0) {
        return {
          result: false,
          message: 'Already on latest version',
          version: response.data.version,
          currentVersion: this.currentVersion,
          source: 'custom-server'
        };
      }
      
      // Hay actualización disponible
      return {
        result: true,
        version: response.data.version,
        currentVersion: this.currentVersion,
        releaseDate: new Date(response.data.pub_date),
        releaseNotes: response.data.notes,
        downloadUrl: response.data.url,
        assetName: path.basename(response.data.url),
        channel: response.data.channel,
        isPortable: this.isPortable,
        source: 'custom-server'
      };
    } catch (error) {
      console.error('Error verificando servidor de actualizaciones personalizado:', error);
      
      // Si tenemos una función para notificar el error del servidor
      if (this.onServerError) {
        this.onServerError(error);
      }
      
      // En caso de error, intentar con GitHub como respaldo
      return await this.checkGitHubReleases();
    }
  }
  
  // Descargar actualización
  async downloadUpdate(updateInfo) {
    try {
      // Guardar la información de actualización para usarla durante la instalación
      this.updateInfo = updateInfo;
      
      // Si no es portable y no estamos en desarrollo, usar electron-updater
      if (!this.isPortable && process.env.NODE_ENV !== 'development') {
        if (ipcRenderer) {
          ipcRenderer.send('download-update');
        }
        return true;
      }
      
      // Si es portable o en desarrollo, manejar descarga manualmente
      console.log('Descargando actualización desde:', updateInfo.downloadUrl);
      
      // Mostrar diálogo de progreso
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
      
      // Guardar archivo descargado
      const downloadDir = path.join(process.cwd(), 'updates');
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }
      
      const downloadPath = path.join(downloadDir, updateInfo.assetName);
      fs.writeFileSync(downloadPath, Buffer.from(response.data));
      
      // Si es un archivo zip, extraerlo
      if (downloadPath.endsWith('.zip')) {
        await this.extractUpdate(downloadPath, updateInfo);
      }
      
      if (this.onUpdateDownloaded) {
        this.onUpdateDownloaded(downloadPath);
      }
      
      return downloadPath;
    } catch (error) {
      console.error('Error descargando actualización:', error);
      if (this.onDownloadError) {
        this.onDownloadError(error);
      }
      throw error;
    }
  }
  
  // Extraer actualización de archivo zip
  async extractUpdate(zipPath, updateInfo) {
    try {
      const zip = new AdmZip(zipPath);
      const extractDir = path.join(process.cwd(), 'updates', 'extracted');
      
      if (fs.existsSync(extractDir)) {
        // Limpiar directorio de extracción previo
        this.deleteFolderRecursive(extractDir);
      }
      
      fs.mkdirSync(extractDir, { recursive: true });
      
      // Extraer contenido
      zip.extractAllTo(extractDir, true);
      console.log('Actualización extraída en:', extractDir);
      
      return extractDir;
    } catch (error) {
      console.error('Error extrayendo actualización:', error);
      throw error;
    }
  }
  
  // Instalar actualización
  async installUpdate(downloadPath) {
    try {
      // Si no es portable y no estamos en desarrollo, usar electron-updater
      if (!this.isPortable && process.env.NODE_ENV !== 'development') {
        if (ipcRenderer) {
          ipcRenderer.send('install-update');
        }
        return true;
      }
      
      // Si es portable o estamos en desarrollo, manejar instalación manualmente
      if (downloadPath.endsWith('.exe') || downloadPath.endsWith('.msi')) {
        // En Windows, ejecutar el instalador
        const { spawn } = require('child_process');
        spawn(downloadPath, [], { detached: true, stdio: 'ignore' }).unref();
        
        // Cerrar la aplicación actual
        setTimeout(() => {
          if (ipcRenderer) {
            ipcRenderer.send('quit-app');
          }
        }, 1000);
        
        return true;
      } else if (fs.existsSync(path.join(path.dirname(downloadPath), 'extracted'))) {
        // Actualización portable con archivos extraídos
        console.log('Instalando actualización portable...');
        
        // 1. Crear respaldo de datos
        const appPath = process.cwd();
        const backupPath = path.join(appPath, 'backup_' + Date.now());
        const extractedPath = path.join(path.dirname(downloadPath), 'extracted');
        
        if (!fs.existsSync(backupPath)) {
          fs.mkdirSync(backupPath, { recursive: true });
        }
        
        // 2. Identificar y respaldar datos importantes
        const dataToBackup = [
          { source: 'data', destination: 'data' },           // Carpeta de base de datos NeDB
          { source: 'settings.json', destination: 'settings.json' }, // Configuración (si existe)
          { source: 'logs', destination: 'logs' },           // Registros (si existen)
        ];
        
        // Realizar respaldo
        for (const item of dataToBackup) {
          const sourcePath = path.join(appPath, item.source);
          const destinationPath = path.join(backupPath, item.destination);
          
          if (fs.existsSync(sourcePath)) {
            console.log(`Respaldando ${item.source} en ${destinationPath}`);
            
            if (fs.lstatSync(sourcePath).isDirectory()) {
              this.copyFolderRecursive(sourcePath, destinationPath);
            } else {
              fs.copyFileSync(sourcePath, destinationPath);
            }
          }
        }
        
        // 3. Crear archivo de metadatos del respaldo
        const backupInfo = {
          date: new Date().toISOString(),
          fromVersion: this.currentVersion,
          toVersion: this.updateInfo.version,
          backupItems: dataToBackup.map(item => item.source),
          environment: this.currentEnvironment,
          appPath: appPath
        };
        
        fs.writeFileSync(
          path.join(backupPath, 'backup_metadata.json'),
          JSON.stringify(backupInfo, null, 2)
        );
        
        // 4. Actualizar archivos desde la carpeta extraída
        console.log('Actualizando archivos de aplicación...');
        
        const excludeFromUpdate = [
          'data',           // No sobrescribir datos de usuario
          'settings.json',  // No sobrescribir configuración
          'logs',           // No sobrescribir logs
          'backup_*',       // No tocar carpetas de respaldo
          'updates'         // No tocar carpeta de actualizaciones
        ];
        
        // Reemplazar archivos de aplicación
        this.updateFilesRecursive(extractedPath, appPath, excludeFromUpdate);
        
        // 5. Restaurar datos de usuario desde respaldo
        console.log('Restaurando datos de usuario...');
        
        for (const item of dataToBackup) {
          const backupItemPath = path.join(backupPath, item.destination);
          const destItemPath = path.join(appPath, item.source);
          
          if (fs.existsSync(backupItemPath)) {
            if (fs.existsSync(destItemPath)) {
              // Si ya existe en la nueva versión, eliminarlo primero
              if (fs.lstatSync(destItemPath).isDirectory()) {
                this.deleteFolderRecursive(destItemPath);
              } else {
                fs.unlinkSync(destItemPath);
              }
            }
            
            // Restaurar desde respaldo
            if (fs.lstatSync(backupItemPath).isDirectory()) {
              this.copyFolderRecursive(backupItemPath, destItemPath);
            } else {
              fs.copyFileSync(backupItemPath, destItemPath);
            }
          }
        }
        
        // 6. Limpiar archivos temporales
        try {
          this.deleteFolderRecursive(extractedPath);
          fs.unlinkSync(downloadPath);
        } catch (e) {
          console.warn('No se pudieron limpiar todos los archivos temporales:', e);
        }
        
        // 7. Crear archivo de historial de actualización
        const updateLogPath = path.join(appPath, 'update_history.json');
        let updateHistory = [];
        
        if (fs.existsSync(updateLogPath)) {
          try {
            updateHistory = JSON.parse(fs.readFileSync(updateLogPath, 'utf8'));
          } catch (e) {
            console.warn('No se pudo leer el historial de actualizaciones:', e);
          }
        }
        
        updateHistory.push({
          date: new Date().toISOString(),
          fromVersion: this.currentVersion,
          toVersion: this.updateInfo.version,
          environment: this.currentEnvironment,
          backupPath: backupPath,
          success: true
        });
        
        fs.writeFileSync(updateLogPath, JSON.stringify(updateHistory, null, 2));
        
        // 8. Reiniciar la aplicación
        console.log('Actualización completa. Reiniciando aplicación...');
        
        setTimeout(() => {
          if (ipcRenderer) {
            ipcRenderer.send('restart-app');
          }
        }, 1000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error instalando actualización:', error);
      
      // Registrar el error en el historial
      try {
        const appPath = process.cwd();
        const updateLogPath = path.join(appPath, 'update_history.json');
        let updateHistory = [];
        
        if (fs.existsSync(updateLogPath)) {
          try {
            updateHistory = JSON.parse(fs.readFileSync(updateLogPath, 'utf8'));
          } catch (e) {
            console.error('No se pudo leer el historial:', e);
          }
        }
        
        updateHistory.push({
          date: new Date().toISOString(),
          fromVersion: this.currentVersion,
          toVersion: this.updateInfo ? this.updateInfo.version : 'unknown',
          error: error.toString(),
          success: false
        });
        
        fs.writeFileSync(updateLogPath, JSON.stringify(updateHistory, null, 2));
      } catch (e) {
        console.error('No se pudo registrar el error de actualización:', e);
      }
      
      throw error;
    }
  }
  
  // Método auxiliar para copiar carpetas recursivamente
  copyFolderRecursive(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      if (fs.lstatSync(sourcePath).isDirectory()) {
        // Es un directorio, copiar recursivamente
        this.copyFolderRecursive(sourcePath, destPath);
      } else {
        // Es un archivo, copiar directamente
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }
  
  // Método auxiliar para actualizar archivos recursivamente
  updateFilesRecursive(source, destination, excludePatterns = []) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      // Verificar si el archivo/carpeta debe ser excluido
      const shouldExclude = excludePatterns.some(pattern => {
        if (pattern.endsWith('*')) {
          // Es un patrón wildcard
          return file.startsWith(pattern.slice(0, -1));
        } else {
          // Es una coincidencia exacta
          return file === pattern;
        }
      });
      
      if (shouldExclude) {
        console.log(`Omitiendo elemento excluido: ${file}`);
        return;
      }
      
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      if (fs.lstatSync(sourcePath).isDirectory()) {
        // Es un directorio, actualizar recursivamente
        this.updateFilesRecursive(sourcePath, destPath, excludePatterns);
      } else {
        // Es un archivo, actualizar
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }
  
  // Método auxiliar para eliminar carpeta recursivamente
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
  
  // Cambiar canal de actualización
  setUpdateChannel(channel) {
    if (this.config.github.updateChannels[channel]) {
      localStorage.setItem('updateChannel', channel);
      return true;
    }
    return false;
  }
  
  // Obtener canal actual
  getUpdateChannel() {
    return {
      active: localStorage.getItem('updateChannel') || 'stable',
      channels: this.config.github.updateChannels
    };
  }
}

export default UpdateService;