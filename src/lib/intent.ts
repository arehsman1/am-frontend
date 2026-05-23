// Match intent system. Female users are restricted to "serious" only.
export type Intent = "serious" | "situationship" | "friendship" | "ovn_st" | "marriage";

export const intentLabels: Record<Intent, string> = {
  serious: "Serious relationship",
  marriage: "Marriage minded",
  situationship: "Situationship / No strings attached",
  friendship: "Friendship",
  ovn_st: "ovn/st",
};

export const maleIntents: Intent[] = ["serious", "marriage", "situationship", "friendship", "ovn_st"];
export const femaleIntents: Intent[] = ["serious"];

// Anti-spam placeholders
export const REQUEST_COOLDOWN_SECONDS = 30; // {REQUEST_COOLDOWN}
export const DAILY_REQUEST_LIMIT = 20; // {DAILY_LIMIT}
