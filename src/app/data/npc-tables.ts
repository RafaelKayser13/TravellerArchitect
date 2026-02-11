import { NPC, NpcType } from '../core/models/career.model';

// --- D66 NPC Role Table ---
// Used when an event generates an NPC without specifying who they are.
// Roll D66 (first D6 = tens, second D6 = ones)

export const NPC_ROLES: { [key: number]: string } = {
    11: 'Naval Officer',
    12: 'Army Colonel',
    13: 'Crooked Trader',
    14: 'Free Trader Captain',
    15: 'Corporate Executive',
    16: 'Bounty Hunter',
    21: 'Starport Administrator',
    22: 'Local Politician',
    23: 'Journalist',
    24: 'Smuggler',
    25: 'Mercenary Leader',
    26: 'Doctor/Medic',
    31: 'Scout Pilot',
    32: 'Diplomat',
    33: 'Criminal Boss',
    34: 'Entertainer',
    35: 'Engineer',
    36: 'Scientist',
    41: 'Pirate Captain',
    42: 'Noble Heir',
    43: 'Spy/Intelligence Agent',
    44: 'Religious Leader',
    45: 'Rebel Leader',
    46: 'Alien Trader',
    51: 'Criminal Syndicate Member',
    52: 'Retired Marine',
    53: 'Weapons Dealer',
    54: 'Information Broker',
    55: 'Colonial Governor',
    56: 'Ship Mechanic',
    61: 'Drifter/Vagabond',
    62: 'University Professor',
    63: 'Police Inspector',
    64: 'Wealthy Investor',
    65: 'Underground Doctor',
    66: 'Former Prisoner',
};

// --- D66 NPC Quirk Table ---
export const NPC_QUIRKS: { [key: number]: string } = {
    11: 'Loyal beyond reason',
    12: 'Obsessed with revenge',
    13: 'Secretive, hides true motives',
    14: 'Boisterous and loud',
    15: 'Paranoid',
    16: 'Aggressive',
    21: 'Charming but untrustworthy',
    22: 'Fanatically devoted to a cause',
    23: 'Greedy, always looking for profit',
    24: 'Generous to a fault',
    25: 'Cowardly but clever',
    26: 'Honorable, keeps promises',
    31: 'Addicted (substance or gambling)',
    32: 'Highly educated, condescending',
    33: 'Reckless risk-taker',
    34: 'Patient and calculating',
    35: 'Haunted by past trauma',
    36: 'Deeply religious or spiritual',
    41: 'In debt, desperate for money',
    42: 'Connected to underworld',
    43: 'Former military, disciplined',
    44: 'Alien sympathizer',
    45: 'Technophobe',
    46: 'Loves exotic food and drink',
    51: 'Chronic liar',
    52: 'Spying on the Traveller',
    53: 'Secretly wealthy',
    54: 'Running from the law',
    55: 'Has a hidden identity',
    56: 'Collects ancient artifacts',
    61: 'Extremely superstitious',
    62: 'Never forgets a slight',
    63: 'Always helpful but clumsy',
    64: 'Speaks in riddles',
    65: 'Missing a limb (cybernetic)',
    66: 'Has a dark secret',
};

// --- Helper Functions ---

let npcCounter = 0;

/**
 * Generates a unique NPC ID.
 */
export function generateNpcId(): string {
    npcCounter++;
    return `npc-${Date.now()}-${npcCounter}`;
}

/**
 * Rolls a D66 value (tens digit * 10 + ones digit).
 */
export function rollD66(): number {
    const tens = Math.floor(Math.random() * 6) + 1;
    const ones = Math.floor(Math.random() * 6) + 1;
    return tens * 10 + ones;
}

/**
 * Gets a random NPC role from the D66 table.
 */
export function getRandomNpcRole(): string {
    return NPC_ROLES[rollD66()] || 'Unknown Individual';
}

/**
 * Gets a random NPC quirk from the D66 table.
 */
export function getRandomNpcQuirk(): string {
    return NPC_QUIRKS[rollD66()] || 'Unremarkable';
}

/**
 * Creates a new NPC object with a random role and quirk.
 */
export function createNpc(
    type: NpcType,
    origin: string,
    notes: string = '',
    name?: string
): NPC {
    const role = getRandomNpcRole();
    const quirk = getRandomNpcQuirk();
    return {
        id: generateNpcId(),
        name: name || `Unknown ${role}`,
        type,
        origin,
        notes: notes || `${type.charAt(0).toUpperCase() + type.slice(1)} from ${origin}`,
        quirk,
        role,
    };
}
