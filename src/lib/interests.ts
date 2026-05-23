// Single source of truth for intent/interest options. Must match the DB enum.
export type Interest = "serious" | "marriage" | "situationship" | "friendship" | "ovn_st";

export const INTERESTS: { value: Interest; label: string }[] = [
  { value: "serious", label: "Serious relationship" },
  { value: "marriage", label: "Marriage minded" },
  { value: "situationship", label: "Situationship / No strings attached" },
  { value: "friendship", label: "Friendship" },
  { value: "ovn_st", label: "ovn/st" },
];

// Intents that require the conditional fields (occupation, religion, genotype, etc.)
export const SERIOUS_INTENTS: Interest[] = ["serious", "marriage"];

export const interestLabel = (v: string) =>
  INTERESTS.find((i) => i.value === v)?.label ?? v;
