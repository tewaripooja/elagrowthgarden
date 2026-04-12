/** True when Supabase env vars are set — real email/password auth is used. */
export const hasSupabaseAuth =
  typeof import.meta.env.VITE_SUPABASE_URL === "string" &&
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  typeof import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === "string" &&
  Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const LOCAL_EMAIL_KEY = "ela-auth-email";

export function getLocalAuthEmail(): string | null {
  return localStorage.getItem(LOCAL_EMAIL_KEY);
}

export function setLocalAuthEmail(email: string) {
  localStorage.setItem(LOCAL_EMAIL_KEY, email.trim());
}

export function clearLocalAuthEmail() {
  localStorage.removeItem(LOCAL_EMAIL_KEY);
}
