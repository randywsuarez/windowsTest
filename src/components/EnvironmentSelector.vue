<template>
  <div>
    <q-btn flat dense round icon="settings_applications" color="primary">
      <q-menu>
        <q-list style="min-width: 280px">
          <q-item>
            <q-item-section>
              <q-item-label class="text-primary text-bold">Environment Selection</q-item-label>
              <q-item-label caption>Select the working environment</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-separator />
          
          <!-- Environment Selector -->
          <q-item>
            <q-item-section>
              <q-item-label caption>Current Environment</q-item-label>
              <q-select
                ref="environmentSelect"
                v-model="selectedEnvironment"
                :options="environmentOptions"
                option-label="label"
                map-options
                emit-value
                dense
                outlined
                class="q-mt-sm"
                @update:model-value="handleEnvironmentChange"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" @click="handleEnvironmentChange(scope.opt.value)">
                    <q-item-section avatar>
                      <q-icon :name="getEnvironmentIcon(scope.opt.value)" :color="getEnvironmentColor(scope.opt.value)" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                
                <template v-slot:selected>
                  <div class="row items-center">
                    <q-icon :name="getEnvironmentIcon(selectedEnvironment)" :color="getEnvironmentColor(selectedEnvironment)" class="q-mr-xs" />
                    <div>{{ getEnvironmentLabel(selectedEnvironment) }}</div>
                  </div>
                </template>
              </q-select>
            </q-item-section>
          </q-item>
          
          <!-- Connection Details -->
          <q-item>
            <q-item-section>
              <q-expansion-item
                icon="info"
                label="Connection Details"
                caption="API and database information"
                dense
                header-class="text-primary"
              >
                <q-card>
                  <q-card-section>
                    <div class="text-caption">
                      <div class="row q-mb-sm">
                        <div class="col-4 text-weight-bold">API URL:</div>
                        <div class="col-8 ellipsis" :title="currentConfig.api">{{ currentConfig.api }}</div>
                      </div>
                      <div class="row q-mb-sm">
                        <div class="col-4 text-weight-bold">External URL:</div>
                        <div class="col-8 ellipsis" :title="currentConfig.external">{{ currentConfig.external }}</div>
                      </div>
                      <div class="row">
                        <div class="col-4 text-weight-bold">Database:</div>
                        <div class="col-8">{{ currentConfig.db }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-item-section>
          </q-item>
          
          <!-- Update Channel -->
          <q-item>
            <q-item-section>
              <q-expansion-item
                icon="system_update"
                label="Update Channel"
                caption="Configure update settings"
                dense
                header-class="text-primary"
              >
                <q-card>
                  <q-card-section>
                    <q-select
                      v-model="selectedChannel"
                      :options="updateChannelOptions"
                      option-label="label"
                      map-options
                      emit-value
                      label="Update Channel"
                      dense
                      outlined
                      class="q-mb-md"
                    />
                    
                    <div class="row q-mb-sm">
                      <div class="col-12">
                        <q-toggle v-model="updateSettings.checkAutomatically" label="Check for updates automatically" />
                      </div>
                    </div>
                    
                    <div class="row q-mb-sm" v-if="updateSettings.checkAutomatically">
                      <div class="col-12">
                        <q-select
                          v-model="updateSettings.checkIntervalHours"
                          :options="[1, 6, 12, 24, 48, 168]"
                          label="Check frequency"
                          dense
                          outlined
                          emit-value
                          map-options
                          :option-label="opt => hourToLabel(opt)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-item-section>
          </q-item>
          
          <q-separator />
          
          <!-- Actions -->
          <q-item>
            <q-item-section class="row justify-between">
              <q-btn
                outline
                color="negative"
                label="Cancel"
                v-close-popup
              />
              <q-btn
                color="primary"
                label="Apply Changes"
                @click="requestAuthAndApply"
                v-close-popup
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
    
    <!-- Environment Badge -->
    <q-chip
      :color="getEnvironmentColor(selectedEnvironment)"
      text-color="white"
      class="q-ml-sm"
      dense
      square
      @mouseover="showConnectionInfo"
    >
      {{ getEnvironmentLabel(selectedEnvironment) }}
      <q-tooltip v-if="showTooltip" class="bg-grey-9" :style="{ maxWidth: '400px' }">
        <div class="text-body2">Connection Information:</div>
        <div class="text-caption">API: {{ currentConfig.api }}</div>
        <div class="text-caption">External: {{ currentConfig.external }}</div>
        <div class="text-caption">Database: {{ currentConfig.db }}</div>
      </q-tooltip>
    </q-chip>
  </div>
</template>

<script>
import { getEnvironmentConfig, getCurrentEnvironment, setEnvironment, getAvailableEnvironments } from '../utils/envHelper';
import { LocalStorage } from 'quasar';
import env from '../utils/env';

export default {
  name: 'EnvironmentSelector',
  
  data() {
    const currentEnvironment = getCurrentEnvironment();
    const currentConfig = getEnvironmentConfig();
    
    return {
      selectedEnvironment: currentEnvironment,
      currentConfig: currentConfig,
      
      // Update settings
      selectedChannel: LocalStorage.getItem('updateChannel') || 'stable',
      updateSettings: {
        checkAutomatically: true,
        checkIntervalHours: 24
      },
      
      // Original values for comparing changes
      originalEnvironment: currentEnvironment,
      originalChannel: LocalStorage.getItem('updateChannel') || 'stable',
      
      // Load settings from localStorage if available
      initialized: false,
      
      showTooltip: false,
      timer: null,
    };
  },
  
  computed: {
    environmentOptions() {
      return getAvailableEnvironments();
    },
    
    updateChannelOptions() {
      const channels = env.github.updateChannels || {};
      return Object.keys(channels).map(key => ({
        value: key,
        label: channels[key].name,
        description: channels[key].description
      }));
    },
    
    hasChanges() {
      // Check if environment or channel has changed
      return this.selectedEnvironment !== this.originalEnvironment || 
             this.selectedChannel !== this.originalChannel;
    }
  },
  
  created() {
    // Load saved update settings
    this.loadSettings();
  },
  
  methods: {
    getEnvironmentIcon(env) {
      switch(env) {
        case 'production': return 'business';
        case 'testing': return 'science';
        case 'development': return 'code';
        case 'local': return 'laptop';
        default: return 'settings';
      }
    },
    
    getEnvironmentColor(env) {
      switch(env) {
        case 'production': return 'negative';
        case 'testing': return 'warning';
        case 'development': return 'info';
        case 'local': return 'positive';
        default: return 'grey';
      }
    },
    
    getEnvironmentLabel(env) {
      const option = this.environmentOptions.find(opt => opt.value === env);
      console.log(option);
      return option ? option.label : env;
    },
    
    hourToLabel(hours) {
      if (hours === 1) return 'Every hour';
      if (hours === 24) return 'Daily';
      if (hours === 168) return 'Weekly';
      return `Every ${hours} hours`;
    },
    
    // Request authentication before applying changes
    requestAuthAndApply() {
      // If no changes were made, no need for authentication
      if (!this.hasChanges) {
        this.$q.notify({
          type: 'info',
          message: 'No changes to apply'
        });
        return;
      }
      
      // If changing to non-production environment, don't require auth
      if (this.selectedEnvironment !== 'production' && this.originalEnvironment !== 'production') {
        this.applyChanges();
        return;
      }
      
      // Request authentication for critical changes (especially involving production)
      this.$q.dialog({
        title: 'Authorization Required',
        message: `You need leader authorization to change ${this.selectedEnvironment === 'production' ? 'to' : 'from'} Production environment`,
        prompt: {
          model: '',
          type: 'password',
          isValid: (val) => val.length > 0 || 'Please enter a password',
        },
        persistent: true,
      }).onOk(async (password) => {
        this.$q.loading.show();
        
        try {
          // Validate authorization code
          let result = await this.$db
            .collection('securityTest')
            .conditions({ key: password })
            .limit(1)
            .all_data()
            .get();
          
          if (result.length) {
            // Authorization successful
            this.$q.loading.hide();
            this.$q.notify({ 
              type: 'positive', 
              message: `Authorization successful - Changes applied`,
              timeout: 2000
            });
            
            // Apply the changes
            this.applyChanges();
          } else {
            // Authorization failed
            this.$q.loading.hide();
            this.$q.notify({ 
              type: 'negative', 
              message: `Invalid authorization code`,
              timeout: 2000
            });
          }
        } catch (error) {
          // Error during authorization check
          this.$q.loading.hide();
          this.$q.notify({ 
            type: 'negative', 
            message: `Authorization error: ${error.toString()}`,
            timeout: 2000
          });
        }
      }).onCancel(() => {
        // Reset to original values
        this.selectedEnvironment = this.originalEnvironment;
        this.selectedChannel = this.originalChannel;
      });
    },
    
    // Apply changes after successful authorization
    applyChanges() {
      // Save environment selection
      if (this.selectedEnvironment !== this.originalEnvironment) {
        setEnvironment(this.selectedEnvironment);
        this.currentConfig = getEnvironmentConfig();
        this.originalEnvironment = this.selectedEnvironment;
        
        // Show notification
        this.$q.notify({
          type: 'positive',
          message: `Switched to ${this.getEnvironmentLabel(this.selectedEnvironment)} environment`,
          actions: [
            { label: 'Reload', color: 'white', handler: () => window.location.reload() }
          ]
        });
      }
      
      // Save update channel
      if (this.selectedChannel !== this.originalChannel) {
        LocalStorage.set('updateChannel', this.selectedChannel);
        this.originalChannel = this.selectedChannel;
        
        // Show notification
        this.$q.notify({
          type: 'positive',
          message: `Update channel changed to ${this.selectedChannel}`
        });
      }
      
      // Save update settings
      LocalStorage.set('updateSettings', JSON.stringify(this.updateSettings));
      
      // Emit event for parent components
      this.$emit('environment-changed', this.selectedEnvironment);
    },
    
    loadSettings() {
      if (!this.initialized) {
        // Load update settings
        const savedSettings = LocalStorage.getItem('updateSettings');
        if (savedSettings) {
          try {
            this.updateSettings = { ...this.updateSettings, ...JSON.parse(savedSettings) };
          } catch (e) {
            console.error('Error loading update settings:', e);
          }
        }
        
        this.initialized = true;
      }
    },
    
    // Method for parent components to open the menu programmatically
    openMenu() {
      // Implementation depends on Quasar's API
      // This might require a ref to the q-btn with q-menu
    },
    
    handleEnvironmentChange(newEnv) {
      this.selectedEnvironment = newEnv;
      this.$emit('environment-changed', newEnv);
      this.$refs.environmentSelect.hidePopup();
    },
    
    showConnectionInfo() {
      clearTimeout(this.timer); // Clear any existing timer
      this.timer = setTimeout(() => {
        this.showTooltip = true;
      }, 3000); // Show tooltip after 3 seconds
    },
  }
}
</script>

<style lang="scss" scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>