require('dotenv').config();
const { LocalStorage } = require('quasar');

const environments = {
  production: {
    apiUrl: process.env.PROD_API_URL,
    externalUrl: process.env.PROD_EXTERNAL_URL,
    dbName: process.env.PROD_DB_NAME,
    updateConfig: {
      enabled: process.env.PROD_UPDATE_ENABLED === 'true',
      url: process.env.PROD_UPDATE_URL
    }
  },
  testing: {
    apiUrl: process.env.TEST_API_URL,
    externalUrl: process.env.TEST_EXTERNAL_URL,
    dbName: process.env.TEST_DB_NAME,
    updateConfig: {
      enabled: process.env.TEST_UPDATE_ENABLED === 'true',
      url: process.env.TEST_UPDATE_URL
    }
  },
  development: {
    apiUrl: process.env.DEV_API_URL,
    externalUrl: process.env.DEV_EXTERNAL_URL,
    dbName: process.env.DEV_DB_NAME,
    updateConfig: {
      enabled: process.env.DEV_UPDATE_ENABLED === 'true',
      url: process.env.DEV_UPDATE_URL
    }
  },
  local: {
    apiUrl: process.env.LOCAL_API_URL,
    externalUrl: process.env.LOCAL_EXTERNAL_URL,
    dbName: process.env.LOCAL_DB_NAME,
    updateConfig: {
      enabled: process.env.LOCAL_UPDATE_ENABLED === 'true',
      url: process.env.LOCAL_UPDATE_URL
    }
  }
};

const version = '2.0.0';

const github = {
  user: process.env.GITHUB_USER || 'randywsuarez',
  repository: process.env.GITHUB_REPO || 'windowsTest',
  
  // Canales de actualización
  updateChannels: {
    stable: {
      name: 'Stable',
      description: 'Production-ready releases',
      default: true
    },
    beta: {
      name: 'Beta',
      description: 'Preview releases with new features',
      default: false
    },
    dev: {
      name: 'Development',
      description: 'Latest development builds',
      default: false
    }
  }
};

// Getters para mantener compatibilidad con código existente
const compatibilityGetters = {
  get project() {
    const env = LocalStorage.getItem('environment') || 'development';
    return {
      db: environments[env]?.dbName || environments.development.dbName,
      url: environments[env]?.externalUrl || environments.development.externalUrl
    };
  },
  
  get mongodb() {
    return {
      server: environments.production?.apiUrl,
      public: environments.testing?.apiUrl,
      dev: environments.development?.apiUrl,
      local: environments.local?.apiUrl
    };
  }
};

module.exports = {
  environments,
  version,
  githubToken: process.env.API_KEY,
  github,
  ...compatibilityGetters
};
