/**
 * @file Global storage
 */

import {Drivers, Storage} from "@ionic/storage";
import {StateStorage} from "zustand/middleware";

// Initialize the storage
const storage = new Storage({
  name: "global-storage",
  driverOrder: [
    Drivers.IndexedDB,
    Drivers.LocalStorage,
  ],
});

await storage.create();

/**
 * Zustand state storage
 */
export const stateStorage: StateStorage = {
  /**
   * Get an item from storage
   * @param key Item key
   * @returns Item value
   */
  getItem: async key => await storage.get(key),
  /**
   * Set an item in storage
   * @param key Item key
   * @param value Item value
   * @returns When the item has been set
   */
  setItem: async (key, value) => await storage.set(key, value),
  /**
   * Remove an item from storage
   * @param key Item key
   * @returns When the item has been removed
   */
  removeItem: async key => await storage.remove(key),
};
