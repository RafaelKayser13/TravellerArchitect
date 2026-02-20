import { GameEvent } from '../../../core/models/game-event.model';
import tableData from '../../../../assets/data/tables.json';

export const INJURY_TABLE = tableData.injuryTable;
export const UNUSUAL_EVENT_TABLE = tableData.unusualEventTable;
export const MEDICAL_BILLS = tableData.medicalBills;
export const MEDICAL_COSTS = tableData.medicalCosts;

// Patch references for Life Event Table
const rawLifeTable: any[] = JSON.parse(JSON.stringify(tableData.lifeEventTable));

// Find item 2 (Injury Roll)
const injuryItem = rawLifeTable.find((x: any) => x.roll === 2);
if (injuryItem && injuryItem.effects && injuryItem.effects[0]) {
    injuryItem.effects[0].table = INJURY_TABLE;
}

// Find item 12 (Unusual Event)
const unusualItem = rawLifeTable.find((x: any) => x.roll === 12);
if (unusualItem && unusualItem.effects && unusualItem.effects[0]) {
    unusualItem.effects[0].table = UNUSUAL_EVENT_TABLE;
}

export const LIFE_EVENT_TABLE = rawLifeTable;

export function createLifeEventRollEvent(): GameEvent {
    // Cast to any to assume structural compatibility with GameEvent
    // Validation is implicit via usage
    return {
        id: 'life_event_roll',
        type: 'INFO',
        trigger: 'LIFE_EVENT',
        ui: {
            title: 'Life Event Check',
            description: 'Significant events occurring outside of your professional life.',
            options: [
                {
                    label: 'Roll Life Event (2d6)',
                    effects: [
                        {
                            type: 'ROLL_TABLE',
                            dice: '2d6',
                            table: LIFE_EVENT_TABLE
                        }
                    ]
                }
            ]
        }
    };
}

export function createInjuryRollEvent(): GameEvent {
    return {
        id: 'injury_roll',
        type: 'INFO',
        trigger: 'LIFE_EVENT',
        ui: {
            title: 'Injury Check',
            description: 'Determine the severity of your injury.',
            options: [
                {
                    label: 'Roll Injury Table (1d6)',
                    effects: [{ type: 'ROLL_TABLE', dice: '1d6', table: INJURY_TABLE }]
                }
            ]
        }
    };
}

export function createInjuryRollWorstOf2Event(): GameEvent {
    return {
        id: 'injury_roll_worst_of_2',
        type: 'INFO',
        trigger: 'MISHAP',
        ui: {
            title: 'Severe Injury Check',
            description: 'You are severely injured. Roll the Injury table twice and take the lower (worse) result.',
            options: [
                {
                    label: 'Roll Injury Table Twice (1d6)',
                    effects: [{ type: 'ROLL_TABLE', dice: '1d6', table: INJURY_TABLE, rollCount: 2, takeWorst: true }]
                }
            ]
        }
    };
}

export function createInjuryEvent(severity: number, careerName: string): GameEvent {
    return {
        id: `injury_resolution_${Date.now()}`,
        type: 'CHOICE',
        trigger: 'MISHAP',
        ui: {
            title: 'Injury Resolution',
            description: `You have suffered an injury (Severity ${severity}). You must decide how to proceed.`,
            options: [
                {
                    label: 'Medical Care (Incur Debt)',
                    effects: [
                         { type: 'CUSTOM', customId: 'APPLY_INJURY_DAMAGE', payload: { severity, method: 'debt' } }
                    ]
                },
                {
                    label: 'Cybernetic Augmentation (Loss of Benefit Roll)',
                    effects: [
                        { type: 'CUSTOM', customId: 'APPLY_INJURY_DAMAGE', payload: { severity, method: 'augment' } }
                    ]
                }
            ]
        }
    };
}

export function getMedicalCoverage(careerName: string, rollPlusRank: number): number {
    const entry = MEDICAL_BILLS.find((e: any) => e.careers.includes(careerName));
    if (!entry) return 0;

    if (rollPlusRank < 4) return entry.below4;
    if (rollPlusRank <= 7) return entry.range4to7;
    if (rollPlusRank <= 11) return entry.range8to11;
    return entry.above12;
}

export function calculateMedicalDebt(totalCost: number, coveragePercent: number): number {
    const covered = totalCost * (coveragePercent / 100);
    return Math.max(0, totalCost - covered);
}

export function calculateRepairCost(pointsLost: number): number {
    return pointsLost * MEDICAL_COSTS.RESTORE_PER_POINT;
}

export function getCareerMedicalCategory(careerName: string): 'military' | 'independent' | 'other' {
    const entry = MEDICAL_BILLS.find((e: any) => e.careers.includes(careerName));
    return entry ? (entry.category as any) : 'other';
}
