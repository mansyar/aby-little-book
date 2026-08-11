// IndexedDB schema for the app, opened through idb with a single versioned
// migration. New fields arrive via version bumps with explicit upgrade steps;
// records are validated by the repository layer before use.

import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { KeepsakeRecord, PackageStateRecord, ProgressRecord, SettingsRecord } from './records';

export const DB_NAME = 'aby-little-book';
export const STORES = ['settings', 'progress', 'completion', 'packageState'] as const;

type AbySchema = DBSchema & {
  settings: { key: string; value: SettingsRecord };
  progress: { key: string; value: ProgressRecord };
  completion: { key: string; value: KeepsakeRecord };
  packageState: { key: string; value: PackageStateRecord };
};

export type AbyDB = IDBPDatabase<AbySchema>;

const CURRENT_VERSION = 1;

export function openDatabase(name: string = DB_NAME): Promise<AbyDB> {
  return openDB<AbySchema>(name, CURRENT_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'storyId' });
      }
      if (!db.objectStoreNames.contains('completion')) {
        db.createObjectStore('completion', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('packageState')) {
        db.createObjectStore('packageState', { keyPath: 'packageId' });
      }
    },
  });
}
