import axios from 'axios';
import { Notify } from 'quasar';
import { LocalStorage } from 'quasar';
import { getCurrentEnvironment, getEnvironmentConfig } from '../utils/envHelper';

// Obtener la configuración actual del entorno
const currentEnvironment = getCurrentEnvironment();
const envConfig = getEnvironmentConfig();

// Instancia principal para la API interna
let instance = axios.create({
    baseURL: envConfig.api,
    headers: {
        'X-Environment': currentEnvironment,
        'X-DB-Name': envConfig.db
    }
});

// Instancia secundaria para la API externa
export const externalApi = axios.create({
    baseURL: envConfig.external,
    headers: {
        'X-Environment': currentEnvironment,
        'X-DB-Name': envConfig.db
    }
});

// Configurar interceptores para instancia principal
instance.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        var data = error;

        if (error.response) {
            if (error.response.status == 401) {
                return Promise.reject(data.response.data);
            }

            data = error.response.data;
        }

        return Promise.reject(data);
    }
);

instance.interceptors.request.use(
    function (config) {
        var token = LocalStorage.getItem('token');
        if (token) {
            if (!config.params) config.params = {};
            config.params.access_token = token;
        }
        
        let conf = LocalStorage.getItem('empresa');
        if (conf) config.params['conf'] = conf;

        // Actualizar la información del entorno en cada solicitud
        // en caso de que haya cambiado
        const currentEnv = getCurrentEnvironment();
        const currentConfig = getEnvironmentConfig();
        
        config.headers['X-Environment'] = currentEnv;
        config.headers['X-DB-Name'] = currentConfig.db;
        
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Configurar interceptores similares para externalApi
externalApi.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        return Promise.reject(error.response?.data || error);
    }
);

externalApi.interceptors.request.use(
    function (config) {
        var token = LocalStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Actualizar la información del entorno en cada solicitud
        const currentEnv = getCurrentEnvironment();
        const currentConfig = getEnvironmentConfig();
        
        config.headers['X-Environment'] = currentEnv;
        config.headers['X-DB-Name'] = currentConfig.db;
        
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default instance;