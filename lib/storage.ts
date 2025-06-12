import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the storage interface that mimics AsyncStorage
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// In-memory storage for server-side rendering and non-web platforms
class InMemoryStorage implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

// Create a conditional storage adapter
function createStorageAdapter(): StorageAdapter {
  // Check if we're in a browser environment
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Use AsyncStorage for web (which uses localStorage under the hood)
    return AsyncStorage;
  }
  
  // For server-side rendering or other platforms, use in-memory storage
  return new InMemoryStorage();
}

// Export the storage adapter
export const storage = createStorageAdapter();