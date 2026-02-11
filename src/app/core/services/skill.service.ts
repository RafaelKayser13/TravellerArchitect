import { Injectable } from '@angular/core';
import { Skill } from '../models/character.model';

@Injectable({
    providedIn: 'root'
})
export class SkillService {
    constructor() { }

    /**
     * Logical summary for skills:
     * 1. If award is "Name Only" (e.g. "Pilot"): CurrentLevel += 1.
     * 2. If award is "Fixed Level" (e.g. "Pilot 1"): Level = Max(Current, Award).
     * 3. Max level during creation is 4.
     * 4. Specializations: Level 0 is generic. Level 1+ requires specific selection.
     */

    processSkillAward(
        currentSkills: Skill[],
        awardName: string,
        awardLevel?: number,
        isFirstTermBasicTraining: boolean = false
    ): { skills: Skill[]; message: string; choiceRequired: boolean } {
        const skills = [...currentSkills];
        const index = skills.findIndex(s => s.name === awardName);
        const existing = index !== -1 ? skills[index] : null;

        // Rule 7: Basic Training doesn't stack if you already have the skill
        if (isFirstTermBasicTraining && awardLevel === 0 && existing) {
            return { skills, message: `Basic Training: ${awardName} already known.`, choiceRequired: false };
        }

        let newLevel = 0;
        let message = '';

        if (awardLevel === undefined) {
            // Case: Name Only (e.g. "Pilot") -> Accumulation +1
            if (existing) {
                newLevel = existing.level + 1;
                message = `**Skill Increased**: ${awardName} ${existing.level} → ${newLevel}`;
            } else {
                newLevel = 1;
                message = `**Skill Added**: ${awardName} 1`;
            }
        } else {
            // Case: Fixed Level (e.g. "Pilot 1" or "Pilot 0")
            if (existing) {
                if (awardLevel > existing.level) {
                    newLevel = awardLevel;
                    message = `**Skill Improved**: ${awardName} ${existing.level} → ${newLevel}`;
                } else {
                    return { skills, message: `${awardName} already at level ${existing.level}.`, choiceRequired: false };
                }
            } else {
                newLevel = awardLevel;
                message = `**Skill Added**: ${awardName} ${newLevel}`;
            }
        }

        // Global Cap: Max 4 during character creation
        if (newLevel > 4) {
            newLevel = 4;
            message += ` (Capped at 4)`;
        }

        // Specialization Logic: If it's a generic skill and reaching level 1, choice required
        // (Note: This logic often happens in the UI component, but we signal it here)
        const isGeneric = [
            'Art', 'Drive', 'Electronics', 'Engineer', 'Flyer',
            'Gun Combat', 'Gunner', 'Heavy Weapons', 'Language', 'Melee',
            'Pilot', 'Profession', 'Science', 'Seafarer', 'Animals',
            'Athletics', 'Tactics'
        ].includes(awardName);

        const choiceRequired = isGeneric && newLevel >= 1 && (!existing || existing.level === 0);

        if (!choiceRequired) {
            if (existing) {
                skills[index] = { ...existing, level: newLevel };
            } else {
                skills.push({ name: awardName, level: newLevel });
            }
        }

        return { skills, message, choiceRequired };
    }

    calculateSkillCap(int: number, edu: number): number {
        return 3 * (int + edu);
    }

    isOverCap(skills: Skill[], int: number, edu: number): boolean {
        const total = skills.reduce((sum, s) => sum + s.level, 0);
        return total > this.calculateSkillCap(int, edu);
    }
}
