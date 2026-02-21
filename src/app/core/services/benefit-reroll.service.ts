import { Injectable, signal } from '@angular/core';
import { getRerollRule, BenefitRerollRule } from '../../data/benefit-reroll-rules';

export interface BenefitRoll {
    careerName: string;
    benefitName: string;
    diceResult: number;
    timestamp: number;
    rollCount: number; // How many times has this been rolled (1 = first time, 2+ = duplicate)
}

/**
 * Tracks benefits rolled during mustering out
 * Handles re-roll logic (when same benefit rolled twice)
 */
@Injectable({
    providedIn: 'root'
})
export class BenefitRerollService {
    private benefitRollHistory = signal<BenefitRoll[]>([]);
    private showRerollDialog = signal(false);
    private pendingReroll: BenefitRoll | null = null;
    private rerollRule: BenefitRerollRule | null = null;
    private userChoice: 'double' | 'alternative' | null = null;
    private resolveRerollPromise: ((choice: 'double' | 'alternative' | null) => void) | null = null;

    // Public accessors
    benefitHistory = this.benefitRollHistory;
    isRerollDialogOpen = this.showRerollDialog;

    /**
     * Record a benefit roll and check for duplicates
     * Returns:
     *   - null if first roll (no duplicate)
     *   - 'double' | 'alternative' if user needs to choose
     */
    async checkForReroll(careerName: string, benefitName: string, diceResult: number): Promise<'double' | 'alternative' | null> {
        // Count previous rolls of this benefit
        const previousRolls = this.benefitRollHistory().filter(
            roll => roll.benefitName === benefitName && roll.careerName === careerName
        );

        const rollNumber = previousRolls.length + 1;

        // Record this roll
        const newRoll: BenefitRoll = {
            careerName,
            benefitName,
            diceResult,
            timestamp: Date.now(),
            rollCount: rollNumber
        };

        this.benefitRollHistory.update(history => [...history, newRoll]);

        // If first roll, no re-roll logic needed
        if (rollNumber === 1) {
            return null;
        }

        // Check if this benefit has re-roll rules
        const rule = getRerollRule(benefitName, careerName);
        if (!rule || !rule.canDouble) {
            // No re-roll rule, just apply benefit normally
            return null;
        }

        // If has alternative, show choice dialog
        if (rule.hasAlternative) {
            this.pendingReroll = newRoll;
            this.rerollRule = rule;
            return this.showRerollChoiceDialog(rule);
        } else {
            // Auto-double without choice
            return 'double';
        }
    }

    /**
     * Show dialog asking user to choose double or alternative
     */
    private async showRerollChoiceDialog(rule: BenefitRerollRule): Promise<'double' | 'alternative'> {
        return new Promise((resolve: (value: 'double' | 'alternative') => void) => {
            this.showRerollDialog.set(true);
            this.resolveRerollPromise = (choice: 'double' | 'alternative' | null) => {
                if (choice) resolve(choice);
            };
        });
    }

    /**
     * User confirms double on re-roll
     */
    confirmDouble() {
        this.showRerollDialog.set(false);
        if (this.resolveRerollPromise) {
            this.resolveRerollPromise('double');
            this.resolveRerollPromise = null;
        }
    }

    /**
     * User confirms alternative on re-roll
     */
    confirmAlternative() {
        this.showRerollDialog.set(false);
        if (this.resolveRerollPromise) {
            this.resolveRerollPromise('alternative');
            this.resolveRerollPromise = null;
        }
    }

    /**
     * Get current pending re-roll rule
     */
    getPendingRerollRule(): BenefitRerollRule | null {
        return this.rerollRule;
    }

    /**
     * Get re-roll rule for a specific benefit
     */
    getRerollRule(benefitName: string, careerName?: string): BenefitRerollRule | null {
        return getRerollRule(benefitName, careerName);
    }

    /**
     * Get all rolls of a specific benefit
     */
    getBenefitRolls(benefitName: string, careerName?: string): BenefitRoll[] {
        return this.benefitRollHistory().filter(roll =>
            roll.benefitName === benefitName &&
            (!careerName || roll.careerName === careerName)
        );
    }

    /**
     * Count how many times a benefit has been rolled
     */
    countBenefitRolls(benefitName: string, careerName: string): number {
        return this.getBenefitRolls(benefitName, careerName).length;
    }

    /**
     * Clear history (typically between career terms or full character reset)
     */
    clearHistory() {
        this.benefitRollHistory.set([]);
        this.showRerollDialog.set(false);
        this.pendingReroll = null;
        this.rerollRule = null;
    }

    /**
     * Get full roll history for debugging/display
     */
    getHistory(): BenefitRoll[] {
        return this.benefitRollHistory();
    }
}
