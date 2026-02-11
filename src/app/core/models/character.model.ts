
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
  species: 'Human',
  nationality: '',
  originType: 'Earth',
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
  age: 18,
  finances: { cash: 0, pension: 0, debt: 0, shipShares: 0 },
  education: { university: null, academy: null },
  equipment: [],
  notes: '',
  creationDate: new Date(),
  isFinished: false,
  gender: 'Male',
  history: []
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
  advanced: boolean;
  // 2300AD
  leavingHome?: boolean;
  leavingHomeRoll?: number;
}

export interface Finances {
  cash: number; // Livres (Lv)
  pension: number;
  debt: number; // Medical or other
  shipShares: number; // Worth Lv 500,000 each
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
  species: string; // Typically 'Human' for 2300AD standard
  nationality: string;
  
  // 2300AD Specifics
  originType: 'Frontier' | 'Spacer' | 'Core' | 'Earth'; // Origin Logic
  homeworld?: World;
  genes: GeneMod[]; // DNAMs
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
  
  age: number;
  finances: Finances;
  
  // Education
  education: {
    university?: boolean | null; // null = not attempted, false = failed, true = graduated
    academy?: boolean | null;
    honors?: boolean;
    fail?: boolean; // kicked out
    offworld?: boolean; // 2300AD
    major?: string; // University Major (Level 1 logic)
    minor?: string; // University Minor (Level 0 logic)
  };

  equipment: string[]; // List of item names for now
  
  // Meta
  notes: string;
  creationDate: Date;
  isFinished: boolean;

  // New: 2300AD Logic
  benefitRollDebt?: number; // Tracks lost rolls due to Cybernetic Save
  
  gender: string;
  history: string[]; // Log of all events
}
