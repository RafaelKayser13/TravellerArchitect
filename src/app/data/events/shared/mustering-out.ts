import { EventEffect } from '../../../core/models/game-event.model';
import tableData from '../../../../assets/data/tables.json';

export interface MusteringOutBenefit {
    name: string;
    effects: EventEffect[];
}

export const BENEFIT_DEFINITIONS: Record<string, EventEffect[]> = tableData.musteringOutBenefits as any;

export function getBenefitEffects(benefitName: string): EventEffect[] {
    // Handle cases with variations or exact matches
    const exact = BENEFIT_DEFINITIONS[benefitName];
    if (exact) return exact;

    // Stat modifiers
    if (benefitName.includes('INT +')) return [{ type: 'STAT_MOD', target: 'INT', value: 1 }];
    if (benefitName.includes('EDU +')) return [{ type: 'STAT_MOD', target: 'EDU', value: 1 }];
    if (benefitName.includes('SOC +')) return [{ type: 'STAT_MOD', target: 'SOC', value: 1 }];
    if (benefitName.includes('STR +')) return [{ type: 'STAT_MOD', target: 'STR', value: 1 }];
    if (benefitName.includes('DEX +')) return [{ type: 'STAT_MOD', target: 'DEX', value: 1 }];
    if (benefitName.includes('END +')) return [{ type: 'STAT_MOD', target: 'END', value: 1 }];

    // Ship shares
    if (benefitName.includes('Two Ship Shares')) return [{ type: 'RESOURCE_MOD', target: 'shipShares', value: 2 }];
    if (benefitName.includes('Ship Share')) return [{ type: 'RESOURCE_MOD', target: 'shipShares', value: 1 }];

    // Skills (Prisoner and other choice options)
    const skillMappings: Record<string, string> = {
        'Deception': 'Deception',
        'Persuade': 'Persuade',
        'Stealth': 'Stealth',
        'Melee (unarmed)': 'Melee (unarmed)',
        'Recon': 'Recon',
        'Streetwise': 'Streetwise'
    };

    for (const [key, skillName] of Object.entries(skillMappings)) {
        if (benefitName === key) {
            return [{ type: 'SKILL_MOD', target: skillName, value: 1 }];
        }
    }

    // Default: log and add as item
    return [{ type: 'LOG_ENTRY', note: `Benefit Gained: ${benefitName}` }, { type: 'ADD_ITEM', value: benefitName }];
}
