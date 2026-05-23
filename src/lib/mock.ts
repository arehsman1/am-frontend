import type { Intent } from "./intent";

export type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  image: string;
  city?: string;
  /** Profile's stated match intent — drives female-user request restriction. */
  intent?: Intent;
  online?: boolean;
  lastSeen?: string; // {USER_LAST_SEEN}
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80`;

// All female profiles are restricted to "serious" intent by platform rule.
export const womenProfiles: Profile[] = [
  { id: "w1", name: "Sophia", age: 27, city: "Lagos / Nigeria", bio: "Architect by day, ceramicist by weekend. Looking for kind & curious.", interests: ["Art", "Travel", "Coffee"], image: img("1494790108377-be9c29b29330"), intent: "serious", online: true, lastSeen: "now" },
  { id: "w2", name: "Amara", age: 29, city: "Abuja / Nigeria", bio: "Doctor who runs marathons and reads too much.", interests: ["Running", "Books", "Wine"], image: img("1531746020798-e6953c6e8e04"), intent: "serious", online: false, lastSeen: "1h ago" },
  { id: "w3", name: "Isabella", age: 26, city: "Milan / Italy", bio: "Designer. Loves pasta, plants and slow Sundays.", interests: ["Design", "Cooking", "Yoga"], image: img("1438761681033-6461ffad8d80"), intent: "serious", online: true, lastSeen: "now" },
  { id: "w4", name: "Aiko", age: 28, city: "Tokyo / Japan", bio: "Product manager. Tea connoisseur. Mountain hiker.", interests: ["Hiking", "Tea", "Photography"], image: img("1544005313-94ddf0286df2"), intent: "serious", online: false, lastSeen: "3h ago" },
  { id: "w5", name: "Camille", age: 30, city: "Paris / France", bio: "Filmmaker telling small human stories.", interests: ["Cinema", "Jazz", "Cycling"], image: img("1487412720507-e7ab37603c6f"), intent: "serious", online: true, lastSeen: "now" },
  { id: "w6", name: "Priya", age: 25, city: "Mumbai / India", bio: "PhD candidate in neuroscience. Big laugh, bigger ideas.", interests: ["Science", "Dance", "Travel"], image: img("1517841905240-472988babdf9"), intent: "serious", online: false, lastSeen: "yesterday" },
  { id: "w7", name: "Elena", age: 31, city: "Madrid / Spain", bio: "Lawyer who paints on weekends.", interests: ["Painting", "Tennis", "Theatre"], image: img("1502823403499-6ccfcf4fb453"), intent: "serious", online: true, lastSeen: "now" },
  { id: "w8", name: "Maya", age: 27, city: "Berlin / Germany", bio: "Indie musician and amateur baker.", interests: ["Music", "Baking", "Vinyl"], image: img("1524504388940-b1c1722653e1"), intent: "serious", online: false, lastSeen: "5h ago" },
];

export const menProfiles: Profile[] = [
  { id: "m1", name: "Daniel", age: 30, city: "Lagos / Nigeria", bio: "Software engineer who surfs on weekends.", interests: ["Surfing", "Tech", "Coffee"], image: img("1500648767791-00dcc994a43e"), intent: "serious", online: true, lastSeen: "now" },
  { id: "m2", name: "Marcus", age: 32, city: "London / UK", bio: "Chef. Believes in long dinners.", interests: ["Cooking", "Wine", "Travel"], image: img("1531427186611-ecfd6d936c79"), intent: "situationship", online: false, lastSeen: "2h ago" },
  { id: "m3", name: "Lucas", age: 28, city: "Lisbon / Portugal", bio: "Architect & runner.", interests: ["Running", "Architecture", "Books"], image: img("1492562080023-ab3db95bfbce"), intent: "marriage", online: true, lastSeen: "now" },
  { id: "m4", name: "Ethan", age: 29, city: "Sydney / Australia", bio: "Photographer chasing golden hour.", interests: ["Photography", "Hiking", "Jazz"], image: img("1506794778202-cad84cf45f1d"), intent: "friendship", online: false, lastSeen: "30m ago" },
];

export type RequestItem = {
  id: string;
  profile: Profile;
  message: string;
  expiresIn: string;
  status: "new" | "accepted" | "expired";
  intent: Intent;
};

export const requests: RequestItem[] = [
  { id: "r1", profile: menProfiles[0], message: "Loved your travel photos — would be great to chat.", expiresIn: "23h", status: "new", intent: "serious" },
  { id: "r2", profile: menProfiles[1], message: "We share a love of slow dinners.", expiresIn: "21h", status: "new", intent: "marriage" },
  { id: "r3", profile: menProfiles[2], message: "Fellow runner here — coffee after a run?", expiresIn: "18h", status: "new", intent: "serious" },
  { id: "r4", profile: menProfiles[3], message: "Your jazz playlist suggestion?", expiresIn: "—", status: "accepted", intent: "serious" },
  { id: "r5", profile: menProfiles[0], message: "Hi from Brooklyn.", expiresIn: "—", status: "expired", intent: "situationship" },
];

export const matches: Profile[] = [menProfiles[3], menProfiles[1], womenProfiles[2]];

export const notifications = [
  { id: "n1", title: "New match request", desc: "Daniel sent you a request", time: "2m" },
  { id: "n2", title: "Request accepted", desc: "Amara accepted your request", time: "1h" },
  { id: "n3", title: "Profile boost ended", desc: "Your visibility is back to normal", time: "5h" },
];

export const testimonials = [
  { name: "Hannah & Liam", quote: "We met through Lumière and got engaged a year later. The matchmaking quality is unreal.", role: "Matched in 2024" },
  { name: "Sofia", quote: "The boost feature actually works — I went on three thoughtful dates the week I activated it.", role: "Member, NYC" },
  { name: "James", quote: "Finally a platform that treats dating like it matters. Profiles feel curated, not random.", role: "Member, London" },
];
