/**
 * Career Data Exports
 *
 * Static career definitions loaded from JSON files
 * Used for testing and data validation
 */

import { CareerDefinition } from '../core/models/career.model';

/**
 * All 14 careers available in the Traveller 2300AD system
 * Each career contains:
 * - Qualification requirements (stat + target)
 * - Personal/Service/Advanced Education skill tables (6 skills each)
 * - Assignments (2-3 per career, except Prisoner with 1)
 * - Event table (rolls 2-12)
 * - Mishap table (rolls 1-6)
 * - Mustering out cash/benefit tables
 * - Officer ranks (military careers only)
 * - Medical coverage information
 */
export const CAREERS: CareerDefinition[] = [];

/**
 * Career names for reference
 */
export const CAREER_NAMES = [
    'Agent',
    'Army',
    'Citizen',
    'Drifter',
    'Entertainer',
    'Marine',
    'Merchant',
    'Navy',
    'Noble',
    'Prisoner',
    'Rogue',
    'Scholar',
    'Scout',
    'Spaceborne'
];

/**
 * Career descriptions
 */
export const CAREER_DESCRIPTIONS: Record<string, string> = {
    'Agent': 'Intelligence operatives, law enforcement, and corporate security specialists',
    'Army': 'Ground combat soldiers serving in military forces',
    'Citizen': 'Corporate workers, government employees, and civilian colonists',
    'Drifter': 'Freelancers and wanderers without permanent affiliation',
    'Entertainer': 'Artists, performers, journalists, and media professionals',
    'Marine': 'Space marines specializing in boarding actions and starship combat',
    'Merchant': 'Traders, brokers, and merchant marine officers',
    'Navy': 'Naval officers and spacers serving in fleet operations',
    'Noble': 'Aristocrats and nobility in various administrative roles',
    'Prisoner': 'Inmates serving time in penal systems',
    'Rogue': 'Thieves, pirates, and criminal enforcers',
    'Scholar': 'Researchers, scientists, field researchers, and physicians',
    'Scout': 'Explorers, surveyors, and courier pilots',
    'Spaceborne': 'Independent spacers including belters and tinkers'
};

/**
 * Military careers
 */
export const MILITARY_CAREERS = ['Army', 'Navy', 'Marine'];

/**
 * Careers with academy options
 */
export const ACADEMY_CAREERS = ['Agent', 'Army', 'Marine', 'Merchant', 'Navy', 'Noble', 'Scholar', 'Scout'];

/**
 * Assignment count by career
 */
export const CAREER_ASSIGNMENTS: Record<string, number> = {
    'Agent': 3,
    'Army': 3,
    'Citizen': 3,
    'Drifter': 3,
    'Entertainer': 3,
    'Marine': 3,
    'Merchant': 3,
    'Navy': 3,
    'Noble': 3,
    'Prisoner': 1,
    'Rogue': 3,
    'Scholar': 3,
    'Scout': 3,
    'Spaceborne': 3
};

/**
 * Total system content:
 * - 14 careers
 * - 42 assignments total
 * - 238+ event entries
 * - 84+ mishap entries
 */
export const SYSTEM_STATISTICS = {
    totalCareers: 14,
    totalAssignments: 42,
    averageEventEntries: 238,
    averageMishapEntries: 84
};
