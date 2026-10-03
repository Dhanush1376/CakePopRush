const PROFILE_CACHE_KEY = 'cpr_user_profile';

export const loadCachedProfile = (): any | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveCachedProfile = (profile: any): void => {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch {
    // Ignore storage issues
  }
};

export const clearCachedProfile = (): void => {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // Ignore
  }
};
