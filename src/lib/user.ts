// Deprecated. Gender now lives in Supabase profiles and is exposed via useAuth().
// Kept only to avoid breaking imports during the Phase 1 migration; all real reads
// should go through useAuth() instead.

export type Gender = "male" | "female";

/** @deprecated use useAuth().gender */
export const getUserGender = (): Gender => "male";

/** @deprecated no-op — gender is owned by Supabase */
export const setUserGender = (_g: Gender) => {
  /* no-op */
};
