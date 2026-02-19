

import { NPC, NpcType } from './career.model';
import { EventEffect } from './game-event.model';

// --- Sub-Interfaces ---

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
  gravityCode?: 'Zero-G' | 'Low' | 'Normal' | 'High' | 'Extreme';
  survivalDm: number;
  path?: 'Hard' | 'Soft';
  nation: string; // e.g. "French Empire"
  tier: string; // "Core", "Frontier", etc.
  system: string;
  notes?: string;
  techLevel?: number;
  environment?: string[]; // e.g. ["Cold", "Dry", "High-G"]
  effects?: EventEffect[];
}

export interface CareerTerm {
  termNumber: number;
  
  // Career Info
  careerName: string; // ID e.g. 'marine'
  careerLabel?: string; // Display e.g. 'Imperial Marine'
  
  // Assignment Info
  assignment?: string; // ID e.g. 'star_marine'
  assignmentLabel?: string; // Display e.g. 'Star Marine'
  
  // Rank Info
  rank: number;
  rankTitle?: string; // Display e.g. 'Lance Corporal'
  
  // Status
  ageStart: number;
  ageEnd: number;
  survived: boolean;
  commissioned: boolean;
  advanced?: boolean;
  
  // Logs
  events: string[];
  benefits: string[]; // Text log of benefits gained this term
  
  // 2300AD Mechanics
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
  benefitRollsAllocated?: { [careerName: string]: number }; // Track rolls by career source
  cashRollsSpent?: number; // Global limit of 3 cash rolls
}

export interface GeneMod {
  name: string;
  description: string;
  techLevel?: number;
  cost?: number;
}

export interface Augment {
    name: string;
    type: 'Cybernetic' | 'DNAM' | 'Genetic' | 'Biotech';
    location?: string; // e.g. "Eye", "Arm"
    techLevel?: number;
    description?: string;
    effects?: string;
    cost: number;
    isNatural: boolean;
}

export interface Injury {
    id: string;
    name: string;
    stat: string;
    reduction: number;
    cost: number;
    treated: boolean;
}

export interface Metadata {
    version: string;
    userId?: string;
    creationDate: Date;
    lastModified: Date;
    campaign?: string; // Campaign Name
    referee?: string; // GM Name
    notes: string;
    isFinished: boolean;
}

export interface Bio {
    name: string;
    nickname?: string;
    playerName?: string;
    description?: string; // Physical description
    portraitUrl?: string; // Image
    species: string;
    gender: string;
    age: number;
    
    // Origin
    nationality: string;
    originType: 'Frontier' | 'Spacer' | 'Core' | 'Earth' | '';
    homeworld?: World;
}

// --- Main Character Interface ---

export interface Character {
  id: string;
  
  // Flattened Props for Backward Compatibility (will be mapped to Bio/Metadata)
  name: string;
  nickname?: string;
  playerName?: string;
  description?: string;
  portraitUrl?: string;
  species: string;
  nationality: string;
  originType: 'Frontier' | 'Spacer' | 'Core' | 'Earth' | '';
  homeworld?: World;
  age: number;
  gender: string;
  notes: string;
  creationDate: Date;
  isFinished: boolean;

  // Structured Data (New Organization)
  metadata?: Metadata;
  bio?: Bio;

  // Core Stats
  characteristics: {
    str: Characteristic;
    dex: Characteristic;
    end: Characteristic;
    int: Characteristic;
    edu: Characteristic;
    soc: Characteristic;
  };
  
  genes: GeneMod[];
  
  // Skills & Training
  skills: Skill[];
  backgroundSkillsSelected: boolean;
  
  // Education
  education: {
    university?: boolean | null;
    academy?: boolean | null;
    honors?: boolean;
    graduated?: boolean;
    fail?: boolean;
    offworld?: boolean;
    major?: string;
    minor?: string;
  };

  // Career
  careerHistory: CareerTerm[];
  
  // Economy & Assets
  finances: Finances;
  equipment: string[]; // Future: EquipmentItem[]
  
  // Social & Relations
  npcs: NPC[];
  connectionsUsed: number;
  
  // Status & Traits
  traits: string[];
  injuries: Injury[];
  augments: Augment[];
  history: string[]; // Global Log

  // 2300AD Mechanics Specifics
  nextQualificationDm?: number;
  nextSurvivalDm?: number;
  nextAdvancementDm?: number;
  nextBenefitDm?: number;
  psionicPotential: boolean;
  forcedCareer?: string;
  hasLeftHome: boolean;
  isSoftPath: boolean;
  ejectedCareers: string[];
  nextTermSkillBonus?: number;
  japaneseRankBonus?: boolean;
  hasNeuralJack: boolean;
}

// Helper to create empty character
export const INITIAL_CHARACTER: Character = {
  id: '',
  // Root Props
  name: '', nickname: '', playerName: '', description: '', portraitUrl: '',
  species: 'Human', nationality: '', originType: '', gender: 'Male',
  age: 18, notes: '', creationDate: new Date(), isFinished: false,
  homeworld: undefined,
  
  // Objects
  metadata: {
      version: '1.0.0',
      creationDate: new Date(),
      lastModified: new Date(),
      notes: '',
      isFinished: false
  },
  bio: {
      name: '', species: 'Human', gender: 'Male', age: 18,
      nationality: '', originType: ''
  },
  
  characteristics: {
    str: { name: 'STR', value: 0, modifier: 0 },
    dex: { name: 'DEX', value: 0, modifier: 0 },
    end: { name: 'END', value: 0, modifier: 0 },
    int: { name: 'INT', value: 0, modifier: 0 },
    edu: { name: 'EDU', value: 0, modifier: 0 },
    soc: { name: 'SOC', value: 0, modifier: 0 },
  },
  
  genes: [],
  skills: [],
  backgroundSkillsSelected: false,
  
  education: { university: null, academy: null },
  careerHistory: [],
  
  finances: { cash: 0, pension: 0, debt: 0, medicalDebt: 0, shipShares: 0, cashRollsSpent: 0 },
  equipment: [],
  
  npcs: [],
  connectionsUsed: 0,
  
  traits: [],
  injuries: [],
  augments: [],
  history: [],
  
  // Mechanics
  psionicPotential: false,
  forcedCareer: '',
  hasLeftHome: false,
  isSoftPath: false,
  ejectedCareers: [],
  japaneseRankBonus: false,
  hasNeuralJack: false
};

