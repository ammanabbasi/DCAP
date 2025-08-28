import axios from 'axios';
import Qs from 'qs';
import store from '../redux/store';
import { CONFIG, Logger } from '../config/buildConfig';

const ROOT_URL = CONFIG.API_BASE_URL.replace('/api/', '');
const BASE_URL = CONFIG.API_BASE_URL;
const client = axios.create({
  baseURL: BASE_URL, 
  timeout: 1000000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});


client?.interceptors?.request.use(
  async config => {
    const requestConfig = config;
    const token = store?.getState()?.userReducer?.user?.token;
    if (token) {
      requestConfig?.headers?.Authorization = `Bearer ${token}`;
    }
    Logger.log(
      'DealerVait API Config =>',
      `${config?.baseURL}${config.url}`,
      config?.params ? config?.params : JSON.stringify(config?.data),
    );
    requestConfig.paramsSerializer = params => {
      return Qs.stringify(params, {
        arrayFormat: 'brackets',
        encode: false,
      });
    };
    return requestConfig;
  },
  err => {
    return Promise.reject(err);
  },
);
export { BASE_URL, ROOT_URL, client };
