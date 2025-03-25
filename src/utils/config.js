require('dotenv').config();
const { LocalStorage } = require('quasar');

const environments = {
  production: {
    api: process.env.PROD_API_URL,
    external: process.env.PROD_EXTERNAL_URL,
    db: process.env.PROD_DB_NAME,
    update: {
      enabled: process.env.PROD_UPDATE_ENABLED === 'true',
      url: process.env.PROD_UPDATE_URL
    }
  },
  testing: {
    api: process.env.TEST_API_URL,
    external: process.env.TEST_EXTERNAL_URL,
    db: process.env.TEST_DB_NAME,
    update: {
      enabled: process.env.TEST_UPDATE_ENABLED === 'true',
      url: process.env.TEST_UPDATE_URL
    }
  },
  development: {
    api: process.env.DEV_API_URL,
    external: process.env.DEV_EXTERNAL_URL,
    db: process.env.DEV_DB_NAME,
    update: {
      enabled: process.env.DEV_UPDATE_ENABLED === 'true',
      url: process.env.DEV_UPDATE_URL
    }
  },
  local: {
    api: process.env.LOCAL_API_URL,
    external: process.env.LOCAL_EXTERNAL_URL,
    db: process.env.LOCAL_DB_NAME,
    update: {
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
    const envConfig = environments[env] || environments.development;
    return {
      db: envConfig.db,
      url: envConfig.external
    };
  },
  
  get mongodb() {
    return {
      server: environments.production.api,
      public: environments.testing.api,
      dev: environments.development.api,
      local: environments.local.api
    };
  }
};

// Exportar el módulo con la misma estructura que env.js
const config = {
  environments,
  version,
  githubToken: process.env.API_KEY,
  github,
  ...compatibilityGetters
};

// Asegurarnos de que el objeto tenga los mismos métodos que el original
Object.defineProperties(config, {
  project: {
    get: function() {
      return compatibilityGetters.project;
    }
  },
  mongodb: {
    get: function() {
      return compatibilityGetters.mongodb;
    }
  }
});

module.exports = config;
