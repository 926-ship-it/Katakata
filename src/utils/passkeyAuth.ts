// Passkey authentication utility for custom word upload channels
export const UPLOAD_PASSKEY = "QQBCJ";
const STORAGE_KEY = "katakata_upload_passkey_unlocked";

export function isUploadPasskeyUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function verifyUploadPasskey(input: string): boolean {
  if (!input) return false;
  const normalized = input.trim().toUpperCase();
  if (normalized === UPLOAD_PASSKEY) {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(new CustomEvent("katakata_passkey_unlocked"));
    } catch (e) {
      console.warn("Failed to save passkey unlock state", e);
    }
    return true;
  }
  return false;
}

export function lockUploadPasskey(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("katakata_passkey_locked"));
  } catch (e) {
    console.warn("Failed to clear passkey unlock state", e);
  }
}
