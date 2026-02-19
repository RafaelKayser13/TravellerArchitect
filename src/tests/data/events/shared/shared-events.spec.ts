import { describe, it, expect } from 'vitest';
import { 
    LIFE_EVENT_TABLE, 
    INJURY_TABLE, 
    getMedicalCoverage,
    calculateMedicalDebt,
    MEDICAL_COSTS
} from '../../../../app/data/events/shared/life-events';
import { 
    createSurvivalCheckEvent, 
    createMishapRollEvent, 
    createEventRollEvent 
} from '../../../../app/data/events/shared/career-events';
import { createEducationEvent } from '../../../../app/data/events/shared/education-events';
import { NEURAL_JACK_INSTALL_EVENT } from '../../../../app/data/events/shared/neural-jack-install.event';
import { getBenefitEffects } from '../../../../app/data/events/shared/mustering-out';

describe('Mustering Out Benefits', () => {
    it('should return correct effects for INT +1', () => {
        const effects = getBenefitEffects('INT +1');
        expect(effects).toContainEqual(expect.objectContaining({ type: 'STAT_MOD', target: 'INT', value: 1 }));
    });

    it('should return correct effects for Ship Share', () => {
        const effects = getBenefitEffects('Ship Share');
        expect(effects).toContainEqual(expect.objectContaining({ type: 'RESOURCE_MOD', target: 'shipShares', value: 1 }));
    });

    it('should return custom handler for Weapon', () => {
        const effects = getBenefitEffects('Weapon');
        expect(effects).toContainEqual(expect.objectContaining({ type: 'CUSTOM', customId: 'AWARD_WEAPON' }));
    });
});

describe('Shared Life Events', () => {
    it('LIFE_EVENT_TABLE should have 11 entries (2-12)', () => {
        expect(LIFE_EVENT_TABLE).toHaveLength(11);
        const rolls = LIFE_EVENT_TABLE.map((e: any) => e.roll);
        for (let i = 2; i <= 12; i++) {
            expect(rolls).toContain(i);
        }
    });

    it('INJURY_TABLE should have 6 entries (1-6)', () => {
        expect(INJURY_TABLE).toHaveLength(6);
        const rolls = INJURY_TABLE.map((e: any) => e.roll);
        for (let i = 1; i <= 6; i++) {
            expect(rolls).toContain(i);
        }
    });

    describe('Medical Logic', () => {
        it('should calculate coverage correctly for military', () => {
             expect(getMedicalCoverage('Army', 12)).toBe(100);
             expect(getMedicalCoverage('Army', 8)).toBe(100);
             expect(getMedicalCoverage('Army', 5)).toBe(75);
             expect(getMedicalCoverage('Army', 2)).toBe(0);
        });

        it('should calculate coverage correctly for independent', () => {
            expect(getMedicalCoverage('Scout', 12)).toBe(75);
            expect(getMedicalCoverage('Scout', 8)).toBe(50);
            expect(getMedicalCoverage('Scout', 5)).toBe(0);
        });

        it('should calculate debt correctly', () => {
            expect(calculateMedicalDebt(10000, 75)).toBe(2500);
            expect(calculateMedicalDebt(5000, 100)).toBe(0);
            expect(calculateMedicalDebt(5000, 0)).toBe(5000);
        });

        it('should have correct costs', () => {
            expect(MEDICAL_COSTS.RESTORE_PER_POINT).toBe(5000);
        });
    });
});

describe('Shared Career Event Factories', () => {
    it('createSurvivalCheckEvent should create a valid GameEvent', () => {
        const event = createSurvivalCheckEvent('Agent', 'INT', 7);
        expect(event.id).toContain('survival_Agent');
        expect(event.ui.title).toContain('Survival Check');
        expect(event.ui.options[0].effects[0].type).toBe('ROLL_CHECK');
        expect(event.ui.options[0].effects[0].stat).toBe('INT');
        expect(event.ui.options[0].effects[0].checkTarget).toBe(7);
    });

    it('createMishapRollEvent should create a valid GameEvent', () => {
        const table = [{ roll: 1, description: 'Test', gameEvent: { id: 'test', type: 'INFO', trigger: 'MISHAP', ui: { title: 'Test', options: [] } } }];
        const event = createMishapRollEvent('Agent', table as any);
        expect(event.id).toBe('mishap_roll');
        expect(event.ui.options[0].effects[0].type).toBe('ROLL_TABLE');
    });

    it('createEventRollEvent should create a valid GameEvent', () => {
        const table = [{ roll: 2, description: 'Test', gameEvent: { id: 'test', type: 'INFO', trigger: 'EVENT', ui: { title: 'Test', options: [] } } }];
        const event = createEventRollEvent('Agent', table as any);
        expect(event.id).toBe('term_event_roll');
    });
});

describe('Neural Jack Event', () => {
    it('should be defined with correct options', () => {
        expect(NEURAL_JACK_INSTALL_EVENT).toBeDefined();
        expect(NEURAL_JACK_INSTALL_EVENT.id).toBe('neural_jack_install');
        expect(NEURAL_JACK_INSTALL_EVENT.ui.options).toHaveLength(2);
    });
});
describe('Education Event Factories', () => {
    it('should create valid reward event for Partying (Roll 5)', () => {
        const event = createEducationEvent(5);
        expect(event.id).toBe('edu_event_5');
        expect(event.ui.options[0].effects!).toContainEqual(expect.objectContaining({ type: 'SKILL_MOD', target: 'Carouse', value: 1 }));
    });

    it('should create custom event for Tragedy (Roll 3)', () => {
        const event = createEducationEvent(3);
        expect(event.ui.options[0].effects![0].customId).toBe('TRAGEDY');
    });

    it('should return default event for invalid roll', () => {
        const event = createEducationEvent(99);
        expect(event.id).toBe('edu_event_default');
    });
});
