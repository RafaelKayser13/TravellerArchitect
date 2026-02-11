import { describe, it, expect } from 'vitest';
import {
    LIFE_EVENTS,
    INJURY_TABLE,
    MEDICAL_BILLS,
    MEDICAL_COSTS,
    getCareerMedicalCategory,
    getMedicalCoverage,
    calculateRepairCost,
    calculateMedicalDebt
} from './life-events';
import { CAREERS } from './careers';

describe('Life Events Table', () => {
    it('should have 11 entries (2D6: 2-12)', () => {
        expect(LIFE_EVENTS.length).toBe(11);
    });

    it('should cover all 2D6 results from 2 to 12', () => {
        const rolls = LIFE_EVENTS.map(e => e.roll);
        for (let i = 2; i <= 12; i++) {
            expect(rolls).toContain(i);
        }
    });

    it('should have unique roll values', () => {
        const rolls = LIFE_EVENTS.map(e => e.roll);
        expect(new Set(rolls).size).toBe(rolls.length);
    });

    it('each entry should have name, description, and effects', () => {
        for (const event of LIFE_EVENTS) {
            expect(event.name).toBeTruthy();
            expect(event.description).toBeTruthy();
            expect(event.effects).toBeTruthy();
        }
    });

    it('roll 2 should be Sickness/Injury', () => {
        const event = LIFE_EVENTS.find(e => e.roll === 2);
        expect(event!.name).toBe('Sickness/Injury');
    });

    it('roll 7 should be New Contact', () => {
        const event = LIFE_EVENTS.find(e => e.roll === 7);
        expect(event!.name).toBe('New Contact');
    });

    it('roll 12 should be Unusual Event', () => {
        const event = LIFE_EVENTS.find(e => e.roll === 12);
        expect(event!.name).toBe('Unusual Event');
    });
});

describe('Injury Table', () => {
    it('should have 6 entries (1D6: 1-6)', () => {
        expect(INJURY_TABLE.length).toBe(6);
    });

    it('should cover all 1D6 results from 1 to 6', () => {
        const rolls = INJURY_TABLE.map(e => e.roll);
        for (let i = 1; i <= 6; i++) {
            expect(rolls).toContain(i);
        }
    });

    it('roll 1 should be Nearly Killed', () => {
        const injury = INJURY_TABLE.find(e => e.roll === 1);
        expect(injury!.name).toBe('Nearly Killed');
    });

    it('roll 6 should be Lightly Injured with no stat loss', () => {
        const injury = INJURY_TABLE.find(e => e.roll === 6);
        expect(injury!.name).toBe('Lightly Injured');
        expect(injury!.statLossFormula).toBe('None');
    });

    it('roll 3 should involve Missing Eye or Limb', () => {
        const injury = INJURY_TABLE.find(e => e.roll === 3);
        expect(injury!.name).toBe('Missing Eye or Limb');
    });

    it('each entry should have name, description, and statLossFormula', () => {
        for (const injury of INJURY_TABLE) {
            expect(injury.name).toBeTruthy();
            expect(injury.description).toBeTruthy();
            expect(injury.statLossFormula).toBeTruthy();
        }
    });
});

describe('Medical Bills Table', () => {
    it('should have 3 category entries', () => {
        expect(MEDICAL_BILLS.length).toBe(3);
    });

    it('should cover military, independent, and other categories', () => {
        const categories = MEDICAL_BILLS.map(e => e.category);
        expect(categories).toContain('military');
        expect(categories).toContain('independent');
        expect(categories).toContain('other');
    });

    it('all coverage percentages should be between 0 and 100', () => {
        for (const entry of MEDICAL_BILLS) {
            expect(entry.below4).toBeGreaterThanOrEqual(0);
            expect(entry.below4).toBeLessThanOrEqual(100);
            expect(entry.range4to7).toBeGreaterThanOrEqual(0);
            expect(entry.range4to7).toBeLessThanOrEqual(100);
            expect(entry.range8to11).toBeGreaterThanOrEqual(0);
            expect(entry.range8to11).toBeLessThanOrEqual(100);
            expect(entry.above12).toBeGreaterThanOrEqual(0);
            expect(entry.above12).toBeLessThanOrEqual(100);
        }
    });

    it('military careers should have 75% coverage for range 4-7', () => {
        const military = MEDICAL_BILLS.find(e => e.category === 'military');
        expect(military!.range4to7).toBe(75);
    });

    it('independent careers should have 0% coverage for range 4-7', () => {
        const independent = MEDICAL_BILLS.find(e => e.category === 'independent');
        expect(independent!.range4to7).toBe(0);
    });

    it('other careers should have 50% coverage for range 4-7', () => {
        const other = MEDICAL_BILLS.find(e => e.category === 'other');
        expect(other!.range4to7).toBe(50);
    });
});

describe('Career Medical Category Mapping', () => {
    it('should map all existing careers to a category', () => {
        for (const career of CAREERS) {
            const category = getCareerMedicalCategory(career.name);
            expect(['military', 'independent', 'other']).toContain(category);
        }
    });

    it('Army should be military', () => {
        expect(getCareerMedicalCategory('Army')).toBe('military');
    });

    it('Navy should be military', () => {
        expect(getCareerMedicalCategory('Navy')).toBe('military');
    });

    it('Scout should be independent', () => {
        expect(getCareerMedicalCategory('Scout')).toBe('independent');
    });

    it('Drifter should be independent', () => {
        expect(getCareerMedicalCategory('Drifter')).toBe('independent');
    });

    it('Merchant should be other', () => {
        expect(getCareerMedicalCategory('Merchant')).toBe('other');
    });

    it('unknown career should default to other', () => {
        expect(getCareerMedicalCategory('UnknownCareer')).toBe('other');
    });
});

describe('Medical Coverage Calculation', () => {
    it('Army with roll 3 (below 4) should get 0%', () => {
        expect(getMedicalCoverage('Army', 3)).toBe(0);
    });

    it('Army with roll 5 should get 75%', () => {
        expect(getMedicalCoverage('Army', 5)).toBe(75);
    });

    it('Army with roll 10 should get 100%', () => {
        expect(getMedicalCoverage('Army', 10)).toBe(100);
    });

    it('Scout with roll 5 should get 0%', () => {
        expect(getMedicalCoverage('Scout', 5)).toBe(0);
    });

    it('Scout with roll 9 should get 50%', () => {
        expect(getMedicalCoverage('Scout', 9)).toBe(50);
    });

    it('Citizen with roll 6 should get 50%', () => {
        expect(getMedicalCoverage('Citizen', 6)).toBe(50);
    });

    it('Citizen with roll 12 should get 100%', () => {
        expect(getMedicalCoverage('Citizen', 12)).toBe(100);
    });
});

describe('Medical Cost Calculations', () => {
    it('should calculate repair cost correctly', () => {
        expect(calculateRepairCost(1)).toBe(5000);
        expect(calculateRepairCost(3)).toBe(15000);
        expect(calculateRepairCost(6)).toBe(30000);
    });

    it('should calculate medical debt with full coverage', () => {
        expect(calculateMedicalDebt(10000, 100)).toBe(0);
    });

    it('should calculate medical debt with partial coverage', () => {
        expect(calculateMedicalDebt(10000, 75)).toBe(2500);
        expect(calculateMedicalDebt(10000, 50)).toBe(5000);
    });

    it('should calculate medical debt with no coverage', () => {
        expect(calculateMedicalDebt(10000, 0)).toBe(10000);
    });

    it('medical costs constants should have correct values', () => {
        expect(MEDICAL_COSTS.RESTORE_PER_POINT).toBe(5000);
        expect(MEDICAL_COSTS.LIMB_ORGAN_MAJOR).toBe(10000);
        expect(MEDICAL_COSTS.ORGAN_CRITICAL).toBe(30000);
        expect(MEDICAL_COSTS.FULL_CLONE).toBe(100000);
    });
});
