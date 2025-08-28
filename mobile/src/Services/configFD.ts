import axios from 'axios';
import Qs from 'qs';
import store from '../redux/store';
import { CONFIG, Logger } from '../config/buildConfig';

// Use secondary API for file uploads (dcgptrnapi)
const ROOT_URL = 'https://dcgptrnapi.azurewebsites.net';
const BASE_URL = `${ROOT_URL}/api/`;
const client1 = axios.create({
  baseURL: BASE_URL,
  timeout: 1000000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});
client1?.interceptors?.request.use(
  async config => {
    const requestConfig = config;
    const token = store?.getState()?.userReducer?.user?.token;
    if (token) {
      requestConfig?.headers?.Authorization = `Bearer ${token}`;
    }
    Logger.log(
      'DealerVait API Config =>',
      `${config.baseURL}${config.url}`,
      config.params ? config.params : JSON.stringify(config.data),
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
    Logger.error('Request Error =>', err.response ? err?.response?.data : err.message);
    return Promise.reject(err);
  },
);
export { BASE_URL, ROOT_URL, client1 };