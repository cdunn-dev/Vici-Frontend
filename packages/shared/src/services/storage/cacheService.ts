import { storageService } from './storageService';

// Default cache time (30 minutes)
const DEFAULT_CACHE_TIME = 30 * 60 * 1000;

interface CachedItem<T> {
  data: T;
  expiresAt: number;
}

/**
 * Cache service for managing data caching
 */
export const cacheService = {
  /**
   * Set cached data with expiration
   */
  set: async <T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TIME): Promise<void> => {
    try {
      const expiresAt = Date.now() + ttl;
      const cachedItem: CachedItem<T> = {
        data,
        expiresAt,
      };
      await storageService.setItem(`cache:${key}`, cachedItem);
    } catch (error) {
      console.error(`Error caching data for key ${key}:`, error);
      throw new Error(`Failed to cache data for key ${key}`);
    }
  },

  /**
   * Get cached data if not expired
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const cachedItem = await storageService.getItem<CachedItem<T>>(`cache:${key}`);
      
      if (!cachedItem) {
        return null;
      }
      
      // Check if data is expired
      if (cachedItem.expiresAt < Date.now()) {
        // Remove expired data
        await cacheService.remove(key);
        return null;
      }
      
      return cachedItem.data;
    } catch (error) {
      console.error(`Error retrieving cached data for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove cached data
   */
  remove: async (key: string): Promise<void> => {
    try {
      await storageService.removeItem(`cache:${key}`);
    } catch (error) {
      console.error(`Error removing cached data for key ${key}:`, error);
      throw new Error(`Failed to remove cached data for key ${key}`);
    }
  },

  /**
   * Clear all cached data
   */
  clearAll: async (): Promise<void> => {
    try {
      const allKeys = await storageService.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache:'));
      
      if (cacheKeys.length > 0) {
        await storageService.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  },

  /**
   * Get cache with automated fetch if expired
   */
  getOrFetch: async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = DEFAULT_CACHE_TIME
  ): Promise<T> => {
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<T>(key);
      
      if (cachedData !== null) {
        return cachedData;
      }
      
      // If not in cache or expired, fetch new data
      const freshData = await fetchFn();
      
      // Cache the fresh data
      await cacheService.set(key, freshData, ttl);
      
      return freshData;
    } catch (error) {
      console.error(`Error in getOrFetch for key ${key}:`, error);
      throw error;
    }
  },

  /**
   * Invalidate a cache entry and fetch fresh data
   */
  invalidateAndFetch: async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = DEFAULT_CACHE_TIME
  ): Promise<T> => {
    try {
      // Remove the existing cache entry
      await cacheService.remove(key);
      
      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Cache the fresh data
      await cacheService.set(key, freshData, ttl);
      
      return freshData;
    } catch (error) {
      console.error(`Error in invalidateAndFetch for key ${key}:`, error);
      throw error;
    }
  },
}; 