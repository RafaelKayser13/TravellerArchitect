/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillService } from '../../../app/core/services/skill.service';
import { Skill } from '../../../app/core/models/character.model';

describe('SkillService Logic (MgT 2E 2022 / 2300AD)', () => {
    let service: SkillService;

    beforeEach(() => {
        service = new SkillService();
    });

    it('Scenario 1: Gain new skill (Name Only) -> Level 1', () => {
        const current: Skill[] = [];
        const result = service.processSkillAward(current, 'Vacc Suit');
        expect(result.skills[0].level).toBe(1);
        expect(result.message).toContain('Added');
    });

    it('Scenario 1: Gain new skill (Fixed Level 0) -> Level 0', () => {
        const current: Skill[] = [];
        const result = service.processSkillAward(current, 'Vacc Suit', 0);
        expect(result.skills[0].level).toBe(0);
    });

    it('Scenario 3: Level 0 + Name Only -> Level 1', () => {
        const current: Skill[] = [{ name: 'Vacc Suit', level: 0 }];
        const result = service.processSkillAward(current, 'Vacc Suit');
        expect(result.skills[0].level).toBe(1);
        expect(result.message).toContain('Increased');
    });

    it('Scenario 4: Accumulation (Level 1 + Name Only) -> Level 2', () => {
        const current: Skill[] = [{ name: 'Gun Combat', level: 1 }];
        const result = service.processSkillAward(current, 'Gun Combat');
        expect(result.skills[0].level).toBe(2);
    });

    it('Scenario 4: Fixed Level (Level 1 + Fixed 1) -> No Change', () => {
        const current: Skill[] = [{ name: 'Streetwise', level: 1 }];
        const result = service.processSkillAward(current, 'Streetwise', 1);
        expect(result.skills).toHaveLength(1);
        expect(result.skills[0].level).toBe(1);
        expect(result.message).toContain('already at level 1');
    });

    it('Scenario 4: Fixed Level (Level 1 + Fixed 2) -> Level 2', () => {
        const current: Skill[] = [{ name: 'Streetwise', level: 1 }];
        const result = service.processSkillAward(current, 'Streetwise', 2);
        expect(result.skills[0].level).toBe(2);
    });

    it('Rule 7: Basic Training does not stack if already known', () => {
        const current: Skill[] = [{ name: 'Mechanic', level: 1 }];
        const result = service.processSkillAward(current, 'Mechanic', 0, true); // true = isFirstTermBasicTraining
        expect(result.skills[0].level).toBe(1);
        expect(result.message).toContain('already known');
    });

    it('Max Level Check: Cannot exceed level 4', () => {
        const current: Skill[] = [{ name: 'Pilot', level: 4 }];
        const result = service.processSkillAward(current, 'Pilot');
        expect(result.skills[0].level).toBe(4);
        expect(result.message).toContain('Capped at 4');
    });

    it('Specialization Trigger: Generic skill reaching level 1 from 0 or null', () => {
        const current: Skill[] = [];
        const result = service.processSkillAward(current, 'Pilot'); // Name Only implies Level 1
        expect(result.choiceRequired).toBe(true);
    });

    it('Specialization Trigger: Generic skill level 0 -> 1', () => {
        const current: Skill[] = [{ name: 'Engineer', level: 0 }];
        const result = service.processSkillAward(current, 'Engineer');
        expect(result.choiceRequired).toBe(true);
    });

    it('Specialization Trigger: Generic skill already Level 1 -> 2 (No choice required, just increase)', () => {
        const current: Skill[] = [{ name: 'Electronics', level: 1 }];
        const result = service.processSkillAward(current, 'Electronics');
        expect(result.skills[0].level).toBe(2);
        expect(result.choiceRequired).toBe(false);
    });

    it('Global Skill Cap: (INT + EDU)', () => {
        const skills: Skill[] = [
            { name: 'S1', level: 2 },
            { name: 'S2', level: 2 }
        ]; // Total 4
        const int = 2; // Stat value, not mod
        const edu = 2; // Stat value
        // Cap = (2 + 2) = 4
        expect(service.calculateSkillCap(int, edu)).toBe(4);
        expect(service.isOverCap(skills, int, edu)).toBe(false);

        skills.push({ name: 'S4', level: 1 }); // Total 5
        expect(service.isOverCap(skills, int, edu)).toBe(true);
    });
});
