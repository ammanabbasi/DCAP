import { MMKV } from 'react-native-mmkv';

// Create main storage instance with encryption
export const storage = new MMKV({
  id: 'dealerscloud-storage',
  encryptionKey: 'dealerscloud-encryption-key-2024', // Should be stored securely in production
});

// Create separate storage for sensitive data
export const secureStorage = new MMKV({
  id: 'dealerscloud-secure',
  encryptionKey: 'dealerscloud-secure-key-2024', // Should be generated dynamically
});

// Create cache storage for temporary data
export const cacheStorage = new MMKV({
  id: 'dealerscloud-cache',
});

// Storage utilities
export const StorageUtils = {
  // Set with expiry
  setWithExpiry: (key: string, value: any, expiryInMinutes: number = 60) => {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + expiryInMinutes * 60000,
    };
    storage.set(key, JSON.stringify(item));
  },

  // Get with expiry check
  getWithExpiry: (key: string) => {
    const itemStr = storage.getString(key);
    if (!itemStr) {
      return null;
    }
    
    try {
      const item = JSON.parse(itemStr);
      const now = new Date();
      
      if (now.getTime() > item.expiry) {
        storage.delete(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error parsing stored item:', error);
      return null;
    }
  },

  // Clear expired items
  clearExpired: () => {
    const keys = storage.getAllKeys();
    const now = new Date().getTime();
    
    keys.forEach(key => {
      const itemStr = storage.getString(key);
      if (itemStr) {
        try {
          const item = JSON.parse(itemStr);
          if (item.expiry && now > item.expiry) {
            storage.delete(key);
          }
        } catch {
          // Not a JSON object with expiry, skip
        }
      }
    });
  },

  // Get storage size
  getStorageSize: () => {
    const keys = storage.getAllKeys();
    let totalSize = 0;
    
    keys.forEach(key => {
      const value = storage.getString(key);
      if (value) {
        totalSize += value.length;
      }
    });
    
    return totalSize;
  },

  // Clear all storage (except secure)
  clearAll: () => {
    storage.clearAll();
    cacheStorage.clearAll();
  },

  // Sync queue for offline operations
  queueOfflineOperation: (operation: any) => {
    const queue = storage.getString('offline_queue');
    const operations = queue ? JSON.parse(queue) : [];
    operations.push({
      ...operation,
      timestamp: new Date().toISOString(),
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    storage.set('offline_queue', JSON.stringify(operations));
  },

  // Get offline queue
  getOfflineQueue: () => {
    const queue = storage.getString('offline_queue');
    return queue ? JSON.parse(queue) : [];
  },

  // Clear offline queue
  clearOfflineQueue: () => {
    storage.delete('offline_queue');
  },

  // Remove specific operation from queue
  removeFromOfflineQueue: (operationId: string) => {
    const queue = storage.getString('offline_queue');
    if (queue) {
      const operations = JSON.parse(queue);
      const filtered = operations.filter((op: any) => op.id !== operationId);
      storage.set('offline_queue', JSON.stringify(filtered));
    }
  },
};

// Auto-clear expired items on app start
StorageUtils.clearExpired();

export default storage;