/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { CAREERS } from '../../app/data/careers';
import { LIFE_EVENTS } from '../../app/data/life-events';

describe('Career Events Data Structure', () => {

    const targetCareers = ['Agent', 'Army', 'Citizen', 'Drifter', 'Spaceborne', 'Marine', 'Navy', 'Scout', 'Prisoner'];

    it('all 14 careers should have an eventTable with 11 entries', () => {
        expect(CAREERS).toHaveLength(14);
        CAREERS.forEach(career => {
            expect(career.eventTable, `${career.name} missing eventTable`).toBeDefined();
            expect(career.eventTable).toHaveLength(11);

            // Verify rolls 2-12 are present
            for (let i = 2; i <= 12; i++) {
                const event = career.eventTable.find(e => e.roll === i);
                expect(event, `${career.name} missing event for roll ${i}`).toBeDefined();
            }
        });
    });

    it('rewritten careers should have typed effects arrays', () => {
        targetCareers.forEach(name => {
            const career = CAREERS.find(c => c.name === name)!;
            career.eventTable.forEach(event => {
                expect(event.effects, `${career.name} roll ${event.roll} missing effects`).toBeDefined();
                expect(Array.isArray(event.effects)).toBe(true);
            });
        });
    });

    it('Life Events table should have 11 entries with typed effects', () => {
        expect(LIFE_EVENTS).toHaveLength(11);
        LIFE_EVENTS.forEach(event => {
            expect(event.roll).toBeGreaterThanOrEqual(2);
            expect(event.roll).toBeLessThanOrEqual(12);
            expect(event.effects, `Life Event ${event.name} missing effects`).toBeDefined();
        });
    });

    describe('Specific Event Effect Validations', () => {
        it('Army roll 12 should have auto-promotion effect', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            const event12 = army.eventTable.find(e => e.roll === 12)!;
            expect(event12.effects).toContainEqual(expect.objectContaining({ type: 'auto-promotion' }));
        });

        it('Navy roll 7 should have life-event effect', () => {
            const navy = CAREERS.find(c => c.name === 'Navy')!;
            const event7 = navy.eventTable.find(e => e.roll === 7)!;
            expect(event7.effects).toContainEqual(expect.objectContaining({ type: 'life-event' }));
        });

        it('Citizen roll 11 should have npc ally effect', () => {
            const citizen = CAREERS.find(c => c.name === 'Citizen')!;
            const event11 = citizen.eventTable.find(e => e.roll === 11)!;
            expect(event11.effects).toContainEqual(expect.objectContaining({ type: 'npc', npcType: 'ally' }));
        });
    });
});
