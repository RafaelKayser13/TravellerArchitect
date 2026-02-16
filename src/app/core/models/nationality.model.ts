import { EventEffect } from './game-event.model';

export interface Nationality {
    code: string;
    name: string;
    tier: number; // Tier 1 (Superpower) to Tier 4 (Developing)
    description: string;
    languages: string[];
    adjectives: string[]; // e.g. "French", "American"
    effects?: EventEffect[];
  }
