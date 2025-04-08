import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage service for managing app data
 */
export const storageService = {
  /**
   * Save data to storage
   */
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw new Error(`Failed to save data for key ${key}`);
    }
  },

  /**
   * Get data from storage
   */
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove data from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw new Error(`Failed to remove data for key ${key}`);
    }
  },

  /**
   * Clear all app data from storage
   */
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  },

  /**
   * Get all keys from storage
   */
  getAllKeys: async (): Promise<readonly string[]> => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  /**
   * Get multiple items from storage
   */
  multiGet: async <T>(keys: readonly string[]): Promise<Record<string, T | null>> => {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.reduce((result, [key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
        return result;
      }, {} as Record<string, T | null>);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  },

  /**
   * Set multiple items in storage
   */
  multiSet: async (keyValuePairs: Array<[string, any]>): Promise<void> => {
    try {
      const pairs: Array<[string, string]> = keyValuePairs.map(
        ([key, value]) => [key, JSON.stringify(value)]
      );
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw new Error('Failed to set multiple items');
    }
  },

  /**
   * Remove multiple items from storage
   */
  multiRemove: async (keys: readonly string[]): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw new Error('Failed to remove multiple items');
    }
  },
}; 