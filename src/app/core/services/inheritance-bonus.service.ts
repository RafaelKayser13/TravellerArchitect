import { Injectable, inject, signal } from '@angular/core';
import { CharacterService } from './character.service';

/**
 * Manages Noble career "Inheritance" event bonuses
 * Each inheritance event grants a +1 DM to any one benefit roll
 * Can be received multiple times but only one +1 can be used per roll
 */
@Injectable({
    providedIn: 'root'
})
export class InheritanceBonusService {
    private characterService = inject(CharacterService);
    private showInheritanceChoice = signal(false);

    /**
     * Add a new inheritance bonus when event is triggered
     * Called when Noble career's "Inheritance" event occurs
     */
    addInheritanceBonus(careerName: string): void {
        const char = this.characterService.character();
        const currentTerm = char.careerHistory.length;

        const bonus = {
            careerName,
            termReceived: currentTerm,
            used: false
        };

        const updated = {
            ...char,
            inheritanceBonuses: [...(char.inheritanceBonuses || []), bonus]
        };

        this.characterService.updateCharacter(updated);
        console.log(`✅ Inheritance Bonus Added for ${careerName}. Total available: ${this.getAvailableCount(careerName)}`);
    }

    /**
     * Get count of unused inheritance bonuses for a career
     */
    getAvailableCount(careerName: string): number {
        const char = this.characterService.character();
        return (char.inheritanceBonuses || []).filter(
            bonus => bonus.careerName === careerName && !bonus.used
        ).length;
    }

    /**
     * Get all inheritance bonuses (used and unused)
     */
    getAllBonuses() {
        return this.characterService.character().inheritanceBonuses || [];
    }

    /**
     * Use one inheritance bonus (mark it as used)
     */
    useBonusForRoll(careerName: string): boolean {
        const char = this.characterService.character();
        const bonuses = char.inheritanceBonuses || [];

        // Find first unused bonus for this career
        const bonusIndex = bonuses.findIndex(
            b => b.careerName === careerName && !b.used
        );

        if (bonusIndex === -1) {
            console.warn(`No available inheritance bonus for ${careerName}`);
            return false;
        }

        // Mark as used
        const updated = { ...char };
        updated.inheritanceBonuses = bonuses.map((b, idx) =>
            idx === bonusIndex ? { ...b, used: true } : b
        );

        this.characterService.updateCharacter(updated);
        console.log(`✅ Inheritance Bonus Used. Remaining for ${careerName}: ${this.getAvailableCount(careerName)}`);
        return true;
    }

    /**
     * Check if player should be offered inheritance bonus for current benefit roll
     */
    canUseInheritanceBonus(careerName: string): boolean {
        return this.getAvailableCount(careerName) > 0;
    }

    /**
     * Show/hide the inheritance choice checkbox
     */
    setShowChoice(show: boolean) {
        this.showInheritanceChoice.set(show);
    }

    getShowChoice = this.showInheritanceChoice;
}
