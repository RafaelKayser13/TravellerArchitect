
export interface CareerEvent {
    roll: number;
    description: string;
    effect?: (char: any) => void;
    label?: string;
    effects?: CareerEventEffect[];
}

export interface CareerMishap {
    roll: number;
    description: string;
    effects?: CareerEventEffect[];
}

// --- Typed Event Effect System ---

export type NpcType = 'ally' | 'contact' | 'rival' | 'enemy';

export interface CareerEventEffect {
    type: 'life-event'       // Redirect to Life Events table
    | 'mishap'           // Roll on Mishap table (but don't eject)
    | 'skill-choice'     // Player chooses one skill from a list
    | 'skill-gain'       // Grant a specific skill
    | 'stat-bonus'       // Grant stat +1
    | 'benefit-dm'       // DM bonus to a Benefit roll
    | 'advancement-dm'   // DM bonus to next Advancement
    | 'qualification-dm' // DM bonus to next Qualification
    | 'auto-promotion'   // Automatic promotion (or commission for military)
    | 'npc'              // Generate NPC relationship
    | 'injury'           // Roll on Injury Table
    | 'skill-check'      // Conditional on a skill check
    | 'lose-benefit'     // Lose 1 Benefit roll
    | 'any-skill-up'     // Increase any known skill +1
    | 'extra-roll'       // Gain extra skill roll this term
    | 'benefit-mod'      // DM+1 or DM+2 to a single Benefit Roll
    | 'choice'           // Generic choice (narrative or mechanical)
    | 'sub-roll'         // Triggers a 1D6/2D6 sub-table
    | 'career-force'     // Force next career (e.g. 'Prisoner')
    | 'forced-out'       // Ejected from career
    | 'lose-cash-benefits'
    | 'stat-reduction-choice'
    | 'bet-benefit-rolls'
    | 'parole-mod'
    | 'trait-gain'       // Add permanent note/trait to history
    | 'npc-note'         // Add status/note to an NPC
    | 'narrative';       // Pure narrative event with history log
    // Conditional fields based on type
    skills?: string[];       // For 'skill-choice': list of options
    skill?: string;          // For 'skill-gain': specific skill name
    stat?: string;           // For 'stat-bonus': e.g. 'SOC'
    value?: number;          // DM value for dm types, stat bonus amount, NPC count
    npcType?: NpcType;       // For 'npc': type of NPC to generate
    npcCount?: number;       // For 'npc': number of NPCs (default 1, or '1d3')
    npcCountDice?: string;   // For 'npc': dice expression e.g. '1d3'
    target?: number;         // For 'skill-check': target number
    checkSkills?: string[];  // For 'skill-check': skills that can be used
    onSuccess?: CareerEventEffect[];  // For 'skill-check': effects on success
    onFailure?: CareerEventEffect[];  // For 'skill-check': effects on failure
    note?: string;           // Descriptive note for the effect
}

export interface Rank {
    level: number;
    title: string;
    bonus?: string;
    bonusSkill?: string;
    bonusValue?: number | string; // number for skill level, string like 'SOC +1' for stat bonuses
}

export interface Assignment {
    name: string;
    survivalStat: string;
    survivalTarget: number;
    advancementStat: string;
    advancementTarget: number;
    skillTable: string[];
    ranks: Rank[];
}

export interface CareerDefinition {
    name: string;
    description: string;
    qualificationStat: string;
    qualificationTarget: number;
    eventTable: CareerEvent[];
    mishapTable: CareerMishap[];
    assignments: Assignment[];
    personalSkills: string[];
    serviceSkills: string[];
    advancedEducation: string[];
    advancedEducationMinEdu?: number; // Default 8, some careers require 10
    officerSkills?: string[];
    officerRanks?: Rank[];
    musteringOutCash: number[];
    musteringOutBenefits: string[];
}

// --- Life Events & Injury Models ---

export interface LifeEvent {
    roll: number; // 2D6 result (2-12)
    name: string;
    description: string;
    effect?: string; // Structured effect description
    effects?: CareerEventEffect[];
}

export interface InjuryResult {
    roll: number; // 1D6 result (1-6)
    name: string;
    description: string;
    statLossFormula: string; // e.g. '1D6 from one + 2 from others', 'STR or DEX -2', etc.
}

export interface MedicalBillsEntry {
    category: 'military' | 'independent' | 'other';
    careers: string[];
    below4: number;   // % coverage for 2D6+Rank < 4
    range4to7: number; // % coverage for 2D6+Rank 4-7
    range8to11: number; // % coverage for 2D6+Rank 8-11
    above12: number;  // % coverage for 2D6+Rank 12+
}

// --- NPC Model ---

export interface NPC {
    id: string;
    name: string;
    type: NpcType;
    origin: string;       // e.g. "Navy Term 2 Event"
    notes: string;        // e.g. "Foiled their smuggling ring"
    quirk?: string;       // From D66 quirk table
    role?: string;        // From D66 role table
}

