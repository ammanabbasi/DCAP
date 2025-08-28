import {client} from './config';
import { client1 } from './configFD';

export const getRequest = url => client.get(url);

export const getRequestWithParams = (url: any, params: any = {}) =>
  client.get(url, params);

export const putRequestWithParams = (url: any, params: any = {}) =>
  client.put(url, params);

export const postRequest = (url: any, payload: any = {}) => client.post(url, payload);

export const patchRequest = (url: any, payload: any = {}) => client.patch(url, payload);

export const putRequest = (url: any, payload: any = {}) => client.put(url, payload);

export const deleteRequest = (url: any, payload: any = {}) =>
  client.delete(url, {data:payload});

export const postRequestFD = (url: any, payload: any = {}) => client1.post(url, payload);
export const patchRequestFD = (url: any, payload: any = {}) => client1.patch(url, payload);
export const putRequestFD = (url: any, payload: any = {}) => client1.put(url, payload);