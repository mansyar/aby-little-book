import type { GuidedSession } from '../reader/guided';
import type { PackageReadiness } from '../scene/package';
import { packageReadinessSchema } from '../scene/package';
import type { Locale } from '../story/dock-contracts';
import type { AbyDB } from './db';
import {
  type DockSettingsRecord,
  dockCompletionSchema,
  dockSettingsSchema,
  guidedProgressSchema,
} from './dockRecords';

const SETTINGS_KEY = 'app';
const KEEPSAKE_KEY = 'keepsake';

export async function loadDockSettings(db: AbyDB): Promise<DockSettingsRecord | null> {
  const record = await db.get('settings', SETTINGS_KEY);
  if (record === undefined) {
    return null;
  }
  const parsed = dockSettingsSchema.safeParse(record);
  return parsed.success ? parsed.data : null;
}

export async function saveDockSettings(
  db: AbyDB,
  settings: { locale: Locale; soundEnabled?: boolean; textScale?: 'standard' | 'large' },
): Promise<void> {
  const parsed = dockSettingsSchema.safeParse({ id: SETTINGS_KEY, ...settings });
  if (!parsed.success) {
    throw new Error('Invalid dock settings record.');
  }
  await db.put('settings', parsed.data);
}

export async function loadDockProgress(db: AbyDB, storyId: string): Promise<GuidedSession | null> {
  const record = await db.get('progress', storyId);
  if (record === undefined) {
    return null;
  }
  const parsed = guidedProgressSchema.safeParse(record);
  if (!parsed.success || parsed.data.storyId !== storyId) {
    return null;
  }
  return parsed.data.session;
}

export async function saveDockProgress(db: AbyDB, session: GuidedSession): Promise<void> {
  const parsed = guidedProgressSchema.safeParse({
    storyId: session.storyId,
    session,
    savedAt: Date.now(),
  });
  if (!parsed.success) {
    throw new Error('Invalid guided progress snapshot.');
  }
  await db.put('progress', parsed.data);
}

export async function loadDockReadiness(
  db: AbyDB,
  packageId: string,
): Promise<PackageReadiness | null> {
  const record = await db.get('packageState', packageId);
  if (record === undefined) {
    return null;
  }
  const parsed = packageReadinessSchema.safeParse(record);
  if (!parsed.success || parsed.data.packageId !== packageId) {
    return null;
  }
  return parsed.data;
}

export async function saveDockReadiness(db: AbyDB, readiness: PackageReadiness): Promise<void> {
  const parsed = packageReadinessSchema.safeParse(readiness);
  if (!parsed.success) {
    throw new Error('Invalid package readiness record.');
  }
  await db.put('packageState', parsed.data);
}

export async function loadDockCompletion(
  db: AbyDB,
): Promise<{ storyId: string; routeId: string | null } | null> {
  const record = await db.get('completion', KEEPSAKE_KEY);
  if (record === undefined) {
    return null;
  }
  const parsed = dockCompletionSchema.safeParse(record);
  return parsed.success ? parsed.data : null;
}

export async function saveDockCompletion(
  db: AbyDB,
  completion: { storyId: string; routeId: string | null },
): Promise<void> {
  const parsed = dockCompletionSchema.safeParse({
    id: KEEPSAKE_KEY,
    ...completion,
    completedAt: Date.now(),
  });
  if (!parsed.success) {
    throw new Error('Invalid dock completion record.');
  }
  await db.put('completion', parsed.data);
}

// A replay reset clears the voyage but keeps caregiver settings, mirroring
// the existing reset semantics for the old world.
export async function resetDockStory(db: AbyDB): Promise<void> {
  await db.clear('progress');
  await db.clear('completion');
  await db.clear('packageState');
}
