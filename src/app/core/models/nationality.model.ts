
export interface Nationality {
    code: string;
    name: string;
    tier: number; // Tier 1 (Superpower) to Tier 3 (Developing)
    description: string;
    languages: string[];
    adjectives: string[]; // e.g. "French", "American"
  }
