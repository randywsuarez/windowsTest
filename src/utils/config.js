require('dotenv').config();

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

module.exports = {
  environments,
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  databaseUrl: process.env.DATABASE_URL,
};
