// IndexedDB schema for the app, opened through idb with a single versioned
// migration. New fields arrive via version bumps with explicit upgrade steps;
// records are validated by the repository layer before use.

import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { PackageReadiness } from '../scene/package';
import type { DockCompletionRecord, DockSettingsRecord, GuidedProgressRecord } from './dockRecords';
import type { KeepsakeRecord, PackageStateRecord, ProgressRecord, SettingsRecord } from './records';

export const DB_NAME = 'aby-little-book';
export const STORES = ['settings', 'progress', 'completion', 'packageState'] as const;

// Store values are unions while the dock world grows alongside the previous
// world. Every repository validates through its own Zod schema, so a record
// written by one world reads as calm null in the other; the dock cutover in
// a later phase retires the old shapes.
type AbySchema = DBSchema & {
  settings: { key: string; value: SettingsRecord | DockSettingsRecord };
  progress: { key: string; value: ProgressRecord | GuidedProgressRecord };
  completion: { key: string; value: KeepsakeRecord | DockCompletionRecord };
  packageState: { key: string; value: PackageStateRecord | PackageReadiness };
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
