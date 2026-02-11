
import { NPC } from './career.model';

export interface Characteristic {
  name: string;
  value: number;
  modifier: number;
  // 2300AD Tracking
  originalValue?: number;
  gravityMod?: number;
  geneticMod?: number;
  augmentsMod?: number;
}

export interface Skill {
  name: string;
  level: number;
  specialization?: string;
}

export interface World {
  name: string;
  uwp: string; // Universal World Profile
  gravity: number; // 0 to 2+
  gravityCode?: 'Zero-G' | 'Low' | 'Normal' | 'High' | 'Extreme'; // New
  survivalDm: number;
  path?: 'Hard' | 'Soft'; // New
  nation: string; // e.g. "French Empire"
  tier: string; // "Core", "Frontier", etc.
  system: string;
  notes?: string;
  techLevel?: number; // Added TL
}

// ... (skipping to INITIAL_CHARACTER)

// Helper to create empty character
export const INITIAL_CHARACTER: Character = {
  id: '',
  name: '',
  nickname: '',
  playerName: '',
  description: '',
  portraitUrl: '',
  species: '',
  nationality: '',
  originType: '',
  genes: [],
  backgroundSkillsSelected: false,
  characteristics: {
    str: { name: 'STR', value: 0, modifier: 0 },
    dex: { name: 'DEX', value: 0, modifier: 0 },
    end: { name: 'END', value: 0, modifier: 0 },
    int: { name: 'INT', value: 0, modifier: 0 },
    edu: { name: 'EDU', value: 0, modifier: 0 },
    soc: { name: 'SOC', value: 0, modifier: 0 },
  },
  skills: [],
  careerHistory: [],
  npcs: [],
  connectionsUsed: 0,
  age: 18,
  finances: { cash: 0, pension: 0, debt: 0, medicalDebt: 0, shipShares: 0 },
  education: { university: null, academy: null },
  equipment: [],
  notes: '',
  creationDate: new Date(),
  isFinished: false,
  gender: 'Male',
  psionicPotential: false,
  history: [],
  injuries: []
};

export interface CareerTerm {
  termNumber: number;
  careerName: string;
  rank: number;
  rankTitle?: string;
  assignment?: string;
  events: string[];
  benefits: string[];
  ageStart: number;
  ageEnd: number;
  survived: boolean;
  commissioned: boolean;
  advanced?: boolean;
  // 2300AD
  leavingHome?: boolean;
  leavingHomeRoll?: number;
  loseCashBenefits?: boolean; // Merchant Bankruptcy
  benefitRollsGained: number; // New: benefit rolls earned this term
}

export interface Finances {
  cash: number; // Livres (Lv)
  pension: number;
  debt: number; // General debt
  medicalDebt?: number; // 2300AD specific
  shipShares: number; // Worth Lv 500,000 each
  benefitRollMod?: number; // Good Fortune (Life Event) bonus
  benefitRollDebt?: number; // Used for Augment sacrifices
  benefitRollsSpent?: number; // 2300AD: Spent during career (e.g. Neural Jack)
  isGambler?: boolean; // Merchant gambling event active
  benefitRollsAllocated?: { [careerName: string]: number }; // New: track rolls by career source
}

export interface GeneMod {
  name: string;
  description: string;
  techLevel?: number;
  cost?: number;
}

export interface Character {
  id: string;
  name: string;
  nickname?: string;
  playerName?: string;
  description?: string;
  portraitUrl?: string;
  species: string;
  nationality: string;

  // 2300AD Specifics
  originType: 'Frontier' | 'Spacer' | 'Core' | 'Earth' | '';
  homeworld?: World;
  genes: GeneMod[];
  backgroundSkillsSelected: boolean;

  characteristics: {
    str: Characteristic;
    dex: Characteristic;
    end: Characteristic;
    int: Characteristic;
    edu: Characteristic;
    soc: Characteristic;
  };

  skills: Skill[];
  careerHistory: CareerTerm[];

  // NPC Relationships
  npcs: NPC[];
  connectionsUsed: number; // Max 2 per character creation (Connections Rule)

  age: number;
  finances: Finances;

  // Education
  education: {
    university?: boolean | null;
    academy?: boolean | null;
    honors?: boolean;
    graduated?: boolean; // New: Tracks successful completion vs expelled/war
    fail?: boolean;
    offworld?: boolean;
    major?: string;
    minor?: string;
  };

  equipment: string[];

  // Meta
  notes: string;
  creationDate: Date;
  isFinished: boolean;

  // 2300AD Logic
  // (moved to finances)

  // DM Tracking for cross-term effects
  nextQualificationDm?: number;
  nextAdvancementDm?: number;
  nextBenefitDm?: number;

  psionicPotential: boolean; // New: Tracks eligibility for Psion career

  gender: string;
  history: string[];
  injuries: {
    id: string;
    name: string;
    stat: string;
    reduction: number;
    cost: number;
    treated: boolean;
  }[];
}
