// Focused repository functions over the app database. Every read validates
// the stored record (restore only validated stable state, recover calmly
// from unusable data); every write validates first so bad records never
// reach the database. Interfaces stay local-only — no cloud sync shape.

import type { ProgressSnapshot } from '../reader/types';
import type { AstronautId, Locale } from '../story/contracts';
import type { AbyDB } from './db';
import type { PackageStateRecord, SettingsRecord } from './records';
import {
  keepsakeRecordSchema,
  packageStateRecordSchema,
  progressRecordSchema,
  settingsRecordSchema,
} from './records';

const SETTINGS_KEY = 'app';
const KEEPSAKE_KEY = 'keepsake';

export async function loadSettings(db: AbyDB): Promise<SettingsRecord | null> {
  const record = await db.get('settings', SETTINGS_KEY);
  if (record === undefined) {
    return null;
  }
  const parsed = settingsRecordSchema.safeParse(record);
  return parsed.success ? parsed.data : null;
}

export async function saveSettings(
  db: AbyDB,
  settings: Partial<SettingsRecord> & { locale: Locale; astronautId: AstronautId },
): Promise<void> {
  const parsed = settingsRecordSchema.safeParse({ id: SETTINGS_KEY, ...settings });
  if (!parsed.success) {
    throw new Error('Invalid settings record.');
  }
  await db.put('settings', parsed.data);
}

export async function loadProgress(db: AbyDB, storyId: string): Promise<ProgressSnapshot | null> {
  const record = await db.get('progress', storyId);
  if (record === undefined) {
    return null;
  }
  const parsed = progressRecordSchema.safeParse(record);
  return parsed.success ? (parsed.data as ProgressSnapshot) : null;
}

export async function saveProgress(db: AbyDB, snapshot: ProgressSnapshot): Promise<void> {
  const parsed = progressRecordSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new Error('Invalid progress snapshot.');
  }
  await db.put('progress', parsed.data);
}

export async function loadKeepsake(db: AbyDB): Promise<boolean | null> {
  const record = await db.get('completion', KEEPSAKE_KEY);
  if (record === undefined) {
    return null;
  }
  const parsed = keepsakeRecordSchema.safeParse(record);
  return parsed.success ? parsed.data.lumiKeepsake : null;
}

export async function saveKeepsake(db: AbyDB, lumiKeepsake: boolean): Promise<void> {
  await db.put('completion', { id: KEEPSAKE_KEY, lumiKeepsake });
}

export async function loadPackageState(
  db: AbyDB,
  packageId: string,
): Promise<PackageStateRecord | null> {
  const record = await db.get('packageState', packageId);
  if (record === undefined) {
    return null;
  }
  const parsed = packageStateRecordSchema.safeParse(record);
  return parsed.success ? parsed.data : null;
}

export async function savePackageState(db: AbyDB, record: PackageStateRecord): Promise<void> {
  const parsed = packageStateRecordSchema.safeParse(record);
  if (!parsed.success) {
    throw new Error('Invalid package state record.');
  }
  await db.put('packageState', parsed.data);
}

// Caregiver reset: clears story state (progress, completion keepsake,
// package readiness) in one transaction while preserving settings.
export async function resetStoryState(db: AbyDB): Promise<void> {
  const tx = db.transaction(['progress', 'completion', 'packageState'], 'readwrite');
  await tx.objectStore('progress').clear();
  await tx.objectStore('completion').clear();
  await tx.objectStore('packageState').clear();
  await tx.done;
}
