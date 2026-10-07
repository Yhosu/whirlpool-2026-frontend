const STORAGE_KEY_SOUND = 'whirlpool_special_days_sound_muted';

export function getStoredSoundMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SOUND) === 'true';
  } catch {
    return false;
  }
}

export function saveStoredSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, muted ? 'true' : 'false');
  } catch {
    // Ignore
  }
}
