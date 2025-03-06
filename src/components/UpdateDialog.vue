<template>
    <div>
      <!-- Update Available Dialog -->
      <q-dialog v-model="showUpdateDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">New Update Available</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
  
          <q-separator />
  
          <q-card-section>
            <div class="q-mb-md">
              <span class="text-subtitle1">Current version: {{ updateInfo.currentVersion }}</span><br>
              <span class="text-subtitle1 text-primary">New version: {{ updateInfo.version }}</span>
            </div>
            
            <div v-if="updateInfo.releaseNotes" class="q-pa-sm">
              <div class="text-subtitle1 q-mb-sm">Release notes:</div>
              <div class="update-notes q-pa-sm bg-grey-2 rounded-borders" style="max-height: 200px; overflow-y: auto;">
                <div v-html="formattedReleaseNotes"></div>
              </div>
            </div>
            
            <div v-if="updateInfo.releaseDate" class="q-mt-sm">
              <span class="text-caption">Released on: {{ formatDate(updateInfo.releaseDate) }}</span>
            </div>
          </q-card-section>
  
          <q-separator />
  
          <q-card-section v-if="downloading">
            <div class="text-subtitle1 q-mb-sm">Downloading update...</div>
            <q-linear-progress :value="downloadProgress.percent / 100" color="primary" />
            <div class="text-caption q-mt-xs">{{ downloadProgress.percent }}% completed</div>
          </q-card-section>
  
          <q-card-actions align="right">
            <q-btn label="Later" color="negative" v-close-popup />
            <q-btn 
              :label="downloading ? 'Downloading...' : 'Update Now'" 
              :loading="downloading" 
              color="primary" 
              @click="downloadAndInstall" 
              :disable="downloading" />
          </q-card-actions>
        </q-card>
      </q-dialog>
  
      <!-- Update Settings Dialog -->
      <q-dialog v-model="showSettingsDialog">
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Update Settings</div>
          </q-card-section>
  
          <q-separator />
  
          <q-card-section>
            <div class="q-mb-md">
              <q-toggle v-model="settings.checkAutomatically" label="Check for updates automatically" />
            </div>
            
            <div class="q-mb-md" v-if="settings.checkAutomatically">
              <q-select 
                v-model="settings.checkIntervalHours" 
                :options="[1, 6, 12, 24, 48, 168]" 
                label="Check frequency"
                emit-value
                map-options
                :option-label="opt => hourToLabel(opt)"
                :display-value="hourToLabel(settings.checkIntervalHours)"
                dense
                options-dense />
            </div>
            
            <div class="q-mb-md">
              <q-toggle v-model="settings.notifyOnAvailable" label="Notify when updates are available" />
            </div>
            
            <div class="q-mb-md">
              <q-toggle v-model="settings.downloadAutomatically" label="Download updates automatically" />
            </div>
            
            <div class="q-mb-md">
              <q-select 
                v-model="selectedChannel" 
                :options="channelOptions" 
                label="Update channel"
                emit-value
                map-options
                option-label="label"
                dense
                options-dense>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </q-card-section>
  
          <q-separator />
  
          <q-card-actions align="right">
            <q-btn label="Cancel" color="negative" v-close-popup />
            <q-btn label="Save" color="primary" @click="saveSettings" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex';
  // Removed marked import
  
  export default {
    name: 'UpdateDialog',
    
    props: {
      updateService: {
        type: Object,
        required: true
      }
    },
    
    data() {
      return {
        showUpdateDialog: false,
        showSettingsDialog: false,
        updateInfo: {
          currentVersion: '',
          version: '',
          releaseNotes: '',
          releaseDate: null
        },
        downloading: false,
        downloadProgress: {
          percent: 0
        },
        settings: {
          checkAutomatically: true,
          checkIntervalHours: 24,
          notifyOnAvailable: true,
          downloadAutomatically: false
        },
        selectedChannel: 'stable',
        downloadPath: null
      };
    },
    
    computed: {
      channelOptions() {
        // Convert update channels from env.js to options for q-select
        const channels = this.updateService.config?.github?.updateChannels || {};
        return Object.keys(channels).map(key => ({
          value: key,
          label: channels[key].name,
          description: channels[key].description
        }));
      },
      
      formattedReleaseNotes() {
        if (!this.updateInfo.releaseNotes) return '';
        
        // Basic markdown to HTML conversion for compatibility
        return this.updateInfo.releaseNotes
          .replace(/\n/g, '<br>') // Convert line breaks to HTML breaks
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
          .replace(/#{3}(.*?)(?=\n|$)/g, '<h3>$1</h3>') // h3
          .replace(/#{2}(.*?)(?=\n|$)/g, '<h2>$1</h2>') // h2
          .replace(/#{1}(.*?)(?=\n|$)/g, '<h1>$1</h1>') // h1
          .replace(/- (.*?)(?=\n|$)/g, '• $1<br>'); // Lists
      }
    },
    
    created() {
      // Load saved settings
      this.loadSettings();
      
      // Register callbacks in the update service
      this.updateService.onUpdateAvailable = this.onUpdateAvailable;
      this.updateService.onDownloadStart = this.onDownloadStart;
      this.updateService.onDownloadProgress = this.onDownloadProgress;
      this.updateService.onDownloadError = this.onDownloadError;
      this.updateService.onUpdateDownloaded = this.onUpdateDownloaded;
    },
    
    methods: {
      // Format date
      formatDate(date) {
        if (!date) return '';
        
        if (typeof date === 'string') {
          date = new Date(date);
        }
        
        return date.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      },
      
      // Convert hours to readable text
      hourToLabel(hours) {
        if (hours === 1) return 'Every hour';
        if (hours === 24) return 'Daily';
        if (hours === 168) return 'Weekly';
        return `Every ${hours} hours`;
      },
      
      // Check for updates manually
      async checkForUpdates(notify = true) {
        try {
          const result = await this.updateService.checkForUpdates(true);
          
          if (result.result === true) {
            this.updateInfo = result;
            this.showUpdateDialog = true;
            return true;
          } else if (notify) {
            this.$q.notify({
              type: 'positive',
              message: 'No updates available',
              caption: 'You already have the latest version'
            });
          }
          
          return false;
        } catch (error) {
          console.error('Error checking for updates:', error);
          
          if (notify) {
            this.$q.notify({
              type: 'negative',
              message: 'Error checking for updates',
              caption: error.toString()
            });
          }
          
          return false;
        }
      },
      
      // Download and install update
      async downloadAndInstall() {
        try {
          this.downloading = true;
          this.downloadProgress = { percent: 0 };
          
          this.downloadPath = await this.updateService.downloadUpdate(this.updateInfo);
          
          // Installation will be handled in the onUpdateDownloaded callback
        } catch (error) {
          console.error('Error downloading update:', error);
          this.downloading = false;
          
          this.$q.notify({
            type: 'negative',
            message: 'Error downloading update',
            caption: error.toString()
          });
        }
      },
      
      // Callback when an update is available
      onUpdateAvailable(info) {
        this.updateInfo = info;
        this.showUpdateDialog = true;
      },
      
      // Callback when download starts
      onDownloadStart() {
        this.downloading = true;
        this.downloadProgress = { percent: 0 };
      },
      
      // Callback for download progress
      onDownloadProgress(progress) {
        this.downloadProgress = progress;
      },
      
      // Callback for download error
      onDownloadError(error) {
        this.downloading = false;
        
        this.$q.notify({
          type: 'negative',
          message: 'Error downloading update',
          caption: error.toString()
        });
      },
      
      // Callback when download completes
      onUpdateDownloaded(downloadPath) {
        this.downloading = false;
        this.downloadPath = downloadPath;
        
        this.$q.dialog({
          title: 'Update Downloaded',
          message: 'Do you want to install the update now? The application will restart.',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          try {
            await this.updateService.installUpdate(this.downloadPath);
          } catch (error) {
            console.error('Error installing update:', error);
            
            this.$q.notify({
              type: 'negative',
              message: 'Error installing update',
              caption: error.toString()
            });
          }
        });
      },
      
      // Show settings dialog
      showSettings() {
        this.showSettingsDialog = true;
      },
      
      // Save settings
      saveSettings() {
        // Save to localStorage
        localStorage.setItem('updateSettings', JSON.stringify(this.settings));
        localStorage.setItem('updateChannel', this.selectedChannel);
        
        // Update service configuration
        this.updateService.setUpdateChannel(this.selectedChannel);
        
        this.showSettingsDialog = false;
        
        this.$q.notify({
          type: 'positive',
          message: 'Update settings saved'
        });
      },
      
      // Load settings
      loadSettings() {
        try {
          // Load from localStorage
          const savedSettings = localStorage.getItem('updateSettings');
          if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
          }
          
          const savedChannel = localStorage.getItem('updateChannel');
          if (savedChannel && this.channelOptions.some(opt => opt.value === savedChannel)) {
            this.selectedChannel = savedChannel;
          }
        } catch (error) {
          console.error('Error loading update settings:', error);
        }
      }
    }
  }
  </script>
  
  <style>
  .update-notes {
    white-space: pre-line;
  }
  </style>