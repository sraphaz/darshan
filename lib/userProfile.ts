const STORAGE_KEY = "darshan_user_profile";

export type UserProfile = {
  fullName?: string;
  birthDate?: string;   // YYYY-MM-DD
  birthPlace?: string;
  birthTime?: string;  // HH:mm
};

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UserProfile;
    return {
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : undefined,
      birthDate: typeof parsed.birthDate === "string" ? parsed.birthDate : undefined,
      birthPlace: typeof parsed.birthPlace === "string" ? parsed.birthPlace : undefined,
      birthTime: typeof parsed.birthTime === "string" ? parsed.birthTime : undefined,
    };
  } catch {
    return {};
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function hasProfileData(profile: UserProfile): boolean {
  return !!(
    (profile.fullName?.trim()) ||
    (profile.birthDate?.trim()) ||
    (profile.birthPlace?.trim()) ||
    (profile.birthTime?.trim())
  );
}

export function clearUserProfile(): void {
  saveUserProfile({});
}
