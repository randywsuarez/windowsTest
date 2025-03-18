// utils/envHelper.js
import env from './env';
import { LocalStorage } from 'quasar';

// Mapeo entre los valores antiguos de 'api' y los nuevos entornos
const API_TO_ENV_MAP = {
  'server': 'production',
  'public': 'testing',
  'dev': 'development',
  'local': 'local'
};

// Mapeo inverso para retrocompatibilidad
const ENV_TO_API_MAP = {
  'production': 'server',
  'testing': 'public',
  'development': 'dev',
  'local': 'local'
};

/**
 * Obtiene el nombre del entorno actual
 * @returns {string} - Nombre del entorno (production, testing, development, local)
 */
export function getCurrentEnvironment() {
  // Primero intentar obtener el nuevo formato
  let environment = LocalStorage.getItem('environment');
  
  if (!environment) {
    // Si no existe, intentar convertir desde el formato antiguo
    const oldApiSetting = LocalStorage.getItem('api');
    environment = oldApiSetting ? API_TO_ENV_MAP[oldApiSetting] : 'production';
    
    // Guardar en el nuevo formato para futuras referencias
    LocalStorage.set('environment', environment);
  }
  
  return environment;
}

/**
 * Establece el entorno actual
 * @param {string} environment - Nombre del entorno a establecer
 */
export function setEnvironment(environment) {
  if (env.environments[environment]) {
    // Guardar en nuevo formato
    LocalStorage.set('environment', environment);
    
    // También actualizar el formato antiguo para compatibilidad
    LocalStorage.set('api', ENV_TO_API_MAP[environment] || 'server');
    
    return true;
  }
  return false;
}

/**
 * Obtiene la configuración completa del entorno actual
 * @returns {Object} - Configuración del entorno
 */
export function getEnvironmentConfig() {
  const environment = getCurrentEnvironment();
  return env.environments[environment] || env.environments.production;
}

/**
 * Obtiene la URL de la API del entorno actual
 * @returns {string} - URL de la API
 */
export function getApiUrl() {
  return getEnvironmentConfig().api;
}

/**
 * Obtiene la URL externa del entorno actual
 * @returns {string} - URL externa
 */
export function getExternalUrl() {
  return getEnvironmentConfig().external;
}

/**
 * Obtiene el nombre de la base de datos del entorno actual
 * @returns {string} - Nombre de la base de datos
 */
export function getDbName() {
  return getEnvironmentConfig().db;
}

/**
 * Obtiene la configuración de actualización del entorno actual
 * @returns {Object} - Configuración de actualización
 */
export function getUpdateConfig() {
  return getEnvironmentConfig().update;
}

/**
 * Obtiene una lista de todos los entornos disponibles
 * @returns {Array} - Lista de objetos con información de los entornos
 */
export function getAvailableEnvironments() {
  return Object.keys(env.environments).map(key => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    api: env.environments[key].api,
    external: env.environments[key].external,
    db: env.environments[key].db
  }));
}

export default {
  getCurrentEnvironment,
  setEnvironment,
  getEnvironmentConfig,
  getApiUrl,
  getExternalUrl,
  getDbName,
  getUpdateConfig,
  getAvailableEnvironments
};