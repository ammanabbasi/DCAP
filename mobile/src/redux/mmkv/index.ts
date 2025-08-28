import { storage } from './storage';

export const MMKVStorage = {
  setItem: (key: any, value: any) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: any) => {
    const value = storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: any) => {
    storage.delete(key);
    return Promise.resolve();
  },
};
