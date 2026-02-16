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

    // Partial matches or defaults
    if (benefitName.includes('INT +')) return [{ type: 'STAT_MOD', target: 'INT', value: 1 }];
    if (benefitName.includes('EDU +')) return [{ type: 'STAT_MOD', target: 'EDU', value: 1 }];
    if (benefitName.includes('SOC +')) return [{ type: 'STAT_MOD', target: 'SOC', value: 1 }];
    if (benefitName.includes('Ship Share')) return [{ type: 'RESOURCE_MOD', target: 'shipShares', value: 1 }];

    return [{ type: 'LOG_ENTRY', note: `Benefit Gained: ${benefitName}` }, { type: 'ADD_ITEM', value: benefitName }];
}
