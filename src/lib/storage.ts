/**
 * @file Global storage
 */

import {Drivers, Storage} from "@ionic/storage";
import {StateStorage as IStageStorage} from "zustand/middleware";

// Initialize the storage
const storage = new Storage({
  name: "global-storage",
  driverOrder: [
    Drivers.IndexedDB,
    Drivers.LocalStorage,
  ],
});

/**
 * Zustand state storage implementation
 */
class StateStorage implements IStageStorage {
  /**
   * Uninitialized backing storage
   */
  private uninitializedStorage: Storage;

  /**
   * Initialized backing storage
   */
  private initializedStorage?: Storage;

  /**
   * Initialize the state storage
   * @param storage Uninitialized backing storage
   */
  constructor(storage: Storage) {
    this.uninitializedStorage = storage;
  }

  /**
   * Get the backing storage
   * @returns Backing storage
   */
  private async getStorage() {
    if (this.initializedStorage !== undefined) {
      return this.initializedStorage;
    }

    // Initialize the storage
    this.initializedStorage = await this.uninitializedStorage.create();

    return this.initializedStorage;
  }

  /**
   * Get an item from storage
   * @param key Item key
   * @returns Item value
   */
  async getItem(key: string): Promise<string | null> {
    const storage = await this.getStorage();

    return await storage.get(key);
  }

  /**
   * Set an item in storage
   * @param key Item key
   * @param value Item value
   */
  async setItem(key: string, value: unknown): Promise<void> {
    const storage = await this.getStorage();

    await storage.set(key, value);
  }

  /**
   * Remove an item from storage
   * @param key Item key
   */
  async removeItem(key: string): Promise<void> {
    const storage = await this.getStorage();

    await storage.remove(key);
  }
}

/**
 * Zustand state storage singleton
 */
export const stateStorage = new StateStorage(storage);
