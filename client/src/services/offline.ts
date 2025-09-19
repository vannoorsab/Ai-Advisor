// IndexedDB offline caching service
interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiry?: number;
}

class OfflineCache {
  private dbName = 'AICareerAdvisorCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  async set(key: string, data: any, expiryMinutes?: number): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    const cacheItem: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : undefined
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as CacheItem;
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (result.expiry && Date.now() > result.expiry) {
          this.delete(key);
          resolve(null);
          return;
        }
        
        resolve(result.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineCache = new OfflineCache();

// Sync service for online/offline data synchronization
export class SyncService {
  private syncQueue: Array<{
    url: string;
    method: string;
    data?: any;
    timestamp: number;
  }> = [];

  async queueSync(url: string, method: string, data?: any) {
    this.syncQueue.push({
      url,
      method,
      data,
      timestamp: Date.now()
    });
    
    // Store queue in cache
    await offlineCache.set('syncQueue', this.syncQueue);
    
    // Try to sync if online
    if (navigator.onLine) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (this.syncQueue.length === 0) {
      const cachedQueue = await offlineCache.get('syncQueue');
      if (cachedQueue) {
        this.syncQueue = cachedQueue;
      }
    }

    const processedItems: number[] = [];
    
    for (let i = 0; i < this.syncQueue.length; i++) {
      const item = this.syncQueue[i];
      try {
        await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await import('./firebase').then(m => m.getAuthToken())}`
          },
          body: item.data ? JSON.stringify(item.data) : undefined
        });
        
        processedItems.push(i);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        break; // Stop processing on error
      }
    }
    
    // Remove processed items
    processedItems.reverse().forEach(index => {
      this.syncQueue.splice(index, 1);
    });
    
    // Update cached queue
    await offlineCache.set('syncQueue', this.syncQueue);
  }
}

export const syncService = new SyncService();

// Auto-sync when coming back online
window.addEventListener('online', () => {
  syncService.processSyncQueue();
});
