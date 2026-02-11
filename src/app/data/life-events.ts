import { LifeEvent, InjuryResult, MedicalBillsEntry } from '../core/models/career.model';

// --- LIFE EVENTS TABLE (2300AD) ---
// Triggered when a career event result is "Life Event" (usually roll 7)
// Input: 2D6

export const LIFE_EVENTS: LifeEvent[] = [
    {
        roll: 2,
        name: 'Sickness/Injury',
        description: 'You fall ill or are injured. Roll on the Injury Table.',
        effects: [{ type: 'injury' }]
    },
    {
        roll: 3,
        name: 'Birth/Death',
        description: 'A birth or death in your family or among close friends involves you personally.',
        effects: [{ type: 'narrative' }]
    },
    {
        roll: 4,
        name: 'Ending of Relationship',
        description: 'A key relationship ends badly.',
        effects: [{ type: 'npc', npcType: 'rival', note: 'Choose Rival or Enemy' }]
    },
    {
        roll: 5,
        name: 'Improved Relationship',
        description: 'A relationship improves significantly.',
        effects: [{ type: 'npc', npcType: 'ally' }]
    },
    {
        roll: 6,
        name: 'New Relationship',
        description: 'A new romantic attachment.',
        effects: [{ type: 'npc', npcType: 'ally' }]
    },
    {
        roll: 7,
        name: 'New Contact',
        description: 'You gain a new contact.',
        effects: [{ type: 'npc', npcType: 'contact' }]
    },
    {
        roll: 8,
        name: 'Betrayal',
        description: 'You are betrayed. A Contact or Ally becomes a Rival or Enemy. If you have none, gain a Rival.',
        effects: [{ type: 'choice', note: 'Select Ally/Contact to convert or gain new Rival' }]
    },
    {
        roll: 9,
        name: 'Travel',
        description: 'You move to another world. Gain DM+2 to your next Qualification roll.',
        effects: [{ type: 'qualification-dm', value: 2 }]
    },
    {
        roll: 10,
        name: 'Good Fortune',
        description: 'You come into unexpected money or luck. Gain DM+2 to one Benefit roll during Mustering Out.',
        effects: [{ type: 'benefit-mod', value: 2 }]
    },
    {
        roll: 11,
        name: 'Crime',
        description: 'You are the victim of a crime, or are accused of one.',
        effects: [{
            type: 'choice',
            note: 'Choice A: Lose a Benefit roll, Choice B: Mandatory transition to Prisoner',
            skills: ['Lose Benefit', 'Prison']
        }]
    },
    {
        roll: 12,
        name: 'Unusual Event',
        description: 'Something unusual happens. Roll 1D6 to determine the outcome.',
        effects: [{ type: 'sub-roll', note: 'Unusual Event sub-table' }]
    }
];

// --- INJURY TABLE ---
// Triggered when events/mishaps say "Roll on the Injury Table"
// Input: 1D6

export const INJURY_TABLE: InjuryResult[] = [
    {
        roll: 1,
        name: 'Nearly Killed',
        description: 'Roll 1D6: Reduce one physical characteristic (STR, DEX, or END) by that value. Reduce the other two physical characteristics by 2 each.',
        statLossFormula: '1D6 from one physical stat + 2 from each of the other two physical stats'
    },
    {
        roll: 2,
        name: 'Severely Injured',
        description: 'Roll 1D6: Reduce one physical characteristic (player choice) by that value.',
        statLossFormula: '1D6 from one physical stat (player choice)'
    },
    {
        roll: 3,
        name: 'Missing Eye or Limb',
        description: 'Lost an eye or limb. Reduce STR or DEX by 2 (permanent until cloning/cybernetics).',
        statLossFormula: 'STR or DEX -2 (permanent)'
    },
    {
        roll: 4,
        name: 'Scarred',
        description: 'Scars and lasting wounds. Reduce any one physical characteristic (STR, DEX, END) by 2.',
        statLossFormula: 'Any one physical stat -2'
    },
    {
        roll: 5,
        name: 'Injured',
        description: 'Moderate injury. Reduce any one physical characteristic by 1.',
        statLossFormula: 'Any one physical stat -1'
    },
    {
        roll: 6,
        name: 'Lightly Injured',
        description: 'No lasting mechanical effect. Narrative only.',
        statLossFormula: 'None'
    }
];

// --- MEDICAL BILLS TABLE ---
// Determines how much of medical costs the career organization covers.
// Input: 2D6 + current Rank

export const MEDICAL_BILLS: MedicalBillsEntry[] = [
    {
        category: 'military',
        careers: ['Army', 'Navy', 'Marine', 'Agent'],
        below4: 0,
        range4to7: 75,
        range8to11: 100,
        above12: 100
    },
    {
        category: 'independent',
        careers: ['Scout', 'Rogue', 'Drifter'],
        below4: 0,
        range4to7: 0,
        range8to11: 50,
        above12: 75
    },
    {
        category: 'other',
        careers: ['Citizen', 'Merchant', 'Entertainer', 'Noble', 'Scholar', 'Spaceborne'],
        below4: 0,
        range4to7: 50,
        range8to11: 75,
        above12: 100
    }
];

// --- MEDICAL COST CONSTANTS (2300AD) ---
export const MEDICAL_COSTS = {
    RESTORE_PER_POINT: 5000,  // Lv 5,000 per point of attribute restored
    LIMB_ORGAN_MAJOR: 10000,  // Lv 10,000 for lost limb/major organ (tank regen)
    ORGAN_CRITICAL: 30000,    // Lv 30,000 for critical organ
    FULL_CLONE: 100000        // Lv 100,000 for full body clone
};

// --- HELPER FUNCTIONS ---

/**
 * Returns the medical career category for a given career name.
 */
export function getCareerMedicalCategory(careerName: string): 'military' | 'independent' | 'other' {
    const entry = MEDICAL_BILLS.find(e => e.careers.includes(careerName));
    return entry ? entry.category : 'other';
}

/**
 * Returns the coverage percentage based on career category and 2D6+Rank roll.
 */
export function getMedicalCoverage(careerName: string, rollPlusRank: number): number {
    const entry = MEDICAL_BILLS.find(e => e.careers.includes(careerName));
    if (!entry) return 0;

    if (rollPlusRank < 4) return entry.below4;
    if (rollPlusRank <= 7) return entry.range4to7;
    if (rollPlusRank <= 11) return entry.range8to11;
    return entry.above12;
}

/**
 * Calculates the medical repair cost for stat points lost.
 */
export function calculateRepairCost(pointsLost: number): number {
    return pointsLost * MEDICAL_COSTS.RESTORE_PER_POINT;
}

/**
 * Calculates how much the character owes after medical coverage.
 */
export function calculateMedicalDebt(totalCost: number, coveragePercent: number): number {
    const covered = totalCost * (coveragePercent / 100);
    return Math.max(0, totalCost - covered);
}
