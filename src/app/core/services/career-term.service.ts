import { Injectable, inject } from '@angular/core';
import { CharacterService } from './character.service';
import { DiceDisplayService } from './dice-display.service';
import { CareerDefinition, Assignment } from '../models/career.model';
import { NATIONALITIES } from '../../data/nationalities';

/**
 * Medical coverage buckets per 2300AD rules.
 */
const MILITARY_CAREERS = ['Army', 'Navy', 'Marine'];
const FRINGE_CAREERS = ['Scout', 'Rogue', 'Drifter', 'Spaceborne'];

/** Result returned from rollLeavingHome */
export interface LeavingHomeResult {
  roll: number;
  bonus: number;
  total: number;
  success: boolean;
}

/** Result from checkAging */
export interface AgingResult {
  roll: number;
  total: number;
  description: string;
  statDeltas: { stat: string; delta: number }[];
  endCareer: boolean;
}

/** Medical coverage calculation result */
export interface MedicalCoverageResult {
  coveragePercent: number;
  restorationCost: number;
  debtAmount: number;
}

/**
 * CareerTermService encapsulates all per-term game mechanics that were
 * previously embedded in the monolithic CareerComponent. This includes:
 *
 *  - Medical coverage & debt calculation
 *  - Aging checks (2300AD rules)
 *  - Leaving-home roll
 *  - Term finalisation (career history entry, benefit rolls, rank bonuses)
 *  - Social standing elite bonus
 *  - Foreign Legion citizenship grant
 *  - Neural Jack eligibility check
 */
@Injectable({ providedIn: 'root' })
export class CareerTermService {
  private readonly characterService = inject(CharacterService);
  private readonly diceDisplay = inject(DiceDisplayService);

  // -----------------------------------------------------------------------
  // Medical Coverage (2300AD rules, p.XX)
  // -----------------------------------------------------------------------

  /**
   * Calculates medical coverage percentage based on career type and a 2d6 roll
   * modified by the character's current rank.
   */
  async calculateMedicalCoverage(
    careerName: string,
    rank: number,
  ): Promise<number> {
    const roll = await this.diceDisplay.roll('Medical Coverage Check', 2, rank, 0, '', undefined, [], undefined, {
      phase: `MEDICAL COVERAGE · ${careerName.toUpperCase()}`,
      announcement: `After your term of service, the ${careerName} evaluates your entitlement to medical support. Roll 2D6 + Rank modifier to determine what fraction of your medical bills will be covered.`,
      successContext: `Medical coverage confirmed. Your injuries and treatments will be partially or fully reimbursed by the service.`,
      failureContext: `No medical coverage awarded. You are responsible for the full cost of any injuries or treatments this term.`
    });
    const total = roll + rank;

    if (MILITARY_CAREERS.includes(careerName)) {
      if (total >= 8) return 1.0;
      if (total >= 4) return 0.75;
      return 0;
    }

    if (FRINGE_CAREERS.includes(careerName)) {
      if (total >= 12) return 0.75;
      if (total >= 8) return 0.50;
      return 0;
    }

    // Others (Citizen, Merchant, Noble, etc.)
    if (total >= 12) return 1.0;
    if (total >= 8) return 0.75;
    if (total >= 4) return 0.50;
    return 0;
  }

  /**
   * Calculates restoration cost and resulting debt for an injury.
   * @param injurySeverity  1d6 roll result (1=Nearly Killed … 6=Light)
   * @param majorLoss       Characteristic points lost
   * @param coveragePercent Fraction covered by employer (0–1)
   */
  calculateMedicalDebt(
    injurySeverity: number,
    majorLoss: number,
    coveragePercent: number,
  ): MedicalCoverageResult {
    let restorationCost: number;

    if (injurySeverity === 3) {
      // Missing Eye or Limb – fixed cost
      restorationCost = 10_000;
    } else {
      restorationCost = majorLoss * 5_000;
    }

    const debtAmount = Math.floor(restorationCost * (1 - coveragePercent));
    return { coveragePercent, restorationCost, debtAmount };
  }

  // -----------------------------------------------------------------------
  // Aging (2300AD Book 1, p.10)
  // -----------------------------------------------------------------------

  /**
   * Performs an aging check. Returns stat deltas and whether the event ends
   * the current career term.
   */
  async checkAging(age: number, termsServed: number): Promise<AgingResult | null> {
    if (age < 50 || termsServed < 8) {
      return null; // No aging check required
    }

    const modifiers = [{ label: 'Terms Served', value: -termsServed }];
    const roll = await this.diceDisplay.roll(
      'Aging Check', 2, -termsServed, 0, '', undefined, modifiers, undefined,
      {
        phase: `AGING CHECK · AGE ${age}`,
        announcement: `You are ${age} years old with ${termsServed} terms served. Age takes its toll — roll 2D6 − ${termsServed} (terms served) to resist physical decline. Higher is better.`,
        successContext: `You weather the years well. Physical and mental faculties remain largely intact for another term.`,
        failureContext: `Age is catching up with you. One or more characteristics are reduced due to the wear of time.`
      }
    );
    const total = roll - termsServed;

    const statDeltas: { stat: string; delta: number }[] = [];

    if (total <= 0) {
      statDeltas.push(
        { stat: 'STR', delta: -2 }, { stat: 'DEX', delta: -2 },
        { stat: 'END', delta: -2 }, { stat: 'INT', delta: -1 },
      );
      this.applyStatDeltas(statDeltas);
      this.characterService.log('**Aging Crisis**: STR -2, DEX -2, END -2, INT -1.');
      return {
        roll, total,
        description: 'AGING_CRISIS: Significant physical and mental decline detected.',
        statDeltas,
        endCareer: true,
      };
    }

    if (total === 1) {
      statDeltas.push({ stat: 'STR', delta: -2 }, { stat: 'DEX', delta: -2 }, { stat: 'END', delta: -2 });
    } else if (total === 2) {
      statDeltas.push({ stat: 'STR', delta: -2 }, { stat: 'DEX', delta: -2 });
    } else if (total === 3) {
      statDeltas.push({ stat: 'STR', delta: -2 });
    } else if (total === 4) {
      statDeltas.push({ stat: 'STR', delta: -1 }, { stat: 'DEX', delta: -1 });
    } else if (total === 5) {
      statDeltas.push({ stat: 'STR', delta: -1 });
    }

    if (statDeltas.length > 0) {
      this.applyStatDeltas(statDeltas);
      const summary = statDeltas.map(d => `${d.stat} ${d.delta}`).join(', ');
      this.characterService.log(`**Aging Effect**: ${summary}.`);
    }

    return {
      roll, total,
      description: statDeltas.length > 0
        ? `AGING_EFFECT: ${statDeltas.map(d => `${d.stat} ${d.delta}`).join(', ')}.`
        : 'No aging effects detected.',
      statDeltas,
      endCareer: false,
    };
  }

  // -----------------------------------------------------------------------
  // Leaving Home (2300AD Rule 320)
  // -----------------------------------------------------------------------

  /**
   * Rolls the Leaving Home check if the character has not yet left home.
   * Returns null if not applicable.
   */
  async rollLeavingHome(
    careerName: string,
    termsServed: number,
  ): Promise<LeavingHomeResult | null> {
    const char = this.characterService.character();
    if (char.hasLeftHome) {
      return null; // Already left, skip
    }

    const modifiers: { label: string; value: number }[] = [];
    let bonus = 0;

    if (char.originType === 'Spacer') {
      bonus += 2;
      modifiers.push({ label: 'Spacer Origin', value: 2 });
    }

    if (['Navy', 'Marine', 'Merchant'].includes(careerName)) {
      bonus += termsServed;
      modifiers.push({ label: `${careerName} Career (+1/term)`, value: termsServed });
    } else if (careerName === 'Scout') {
      bonus += termsServed * 2;
      modifiers.push({ label: 'Scout Career (+2/term)', value: termsServed * 2 });
    }

    const roll = await this.diceDisplay.roll(
      'Leaving Home Check', 2, bonus, 8, '',
      (res) => (res + bonus >= 8 ? 'SUCCESS' : 'NO MOTION'),
      modifiers, undefined,
      {
        phase: `HOMEWORLD TIES · TERM ${termsServed}`,
        announcement: `After ${termsServed} term(s) as a ${careerName}, the call of the wider universe beckons. Roll 2D6 + ${bonus} to see if you successfully leave your homeworld behind.`,
        successContext: `You leave your homeworld. New opportunities and adventures await across the stars.`,
        failureContext: `You remain tied to your homeworld this term. Perhaps next time the stars will align in your favor.`
      }
    );
    const total = roll + bonus;
    const success = total >= 8;

    if (success) {
      this.characterService.updateCharacter({ hasLeftHome: true });
      this.characterService.log('**Left Home**: Character successfully left homeworld.');
    }

    return { roll, bonus, total, success };
  }

  // -----------------------------------------------------------------------
  // Neural Jack Eligibility (2300AD)
  // -----------------------------------------------------------------------

  /**
   * Returns true if the character is eligible for a Neural Jack installation
   * opportunity this term.
   */
  isNeuralJackEligible(careerName: string, termNumber: number): boolean {
    const char = this.characterService.character();
    if (char.equipment.some(e => e.includes('Neural Jack'))) return false;

    const nation = NATIONALITIES.find(n => n.name === char.nationality);
    const tier = nation?.tier ?? 3;

    const eligibleCareers = ['Navy', 'Marine', 'Scout'];
    return termNumber <= 3 && eligibleCareers.includes(careerName) && tier <= 3;
  }

  // -----------------------------------------------------------------------
  // Term Finalisation
  // -----------------------------------------------------------------------

  /**
   * Computes and adds rank-based bonus benefit rolls for mustering out.
   * Returns the number of bonus rolls granted.
   */
  applyRankBonusRolls(careerName: string, rank: number): number {
    let bonusRolls = 0;
    if (rank >= 5) bonusRolls = 3;
    else if (rank >= 3) bonusRolls = 2;
    else if (rank >= 1) bonusRolls = 1;

    if (bonusRolls > 0) {
      this.characterService.addBenefitRoll(careerName, bonusRolls);
      this.characterService.log(`**Rank Bonus Benefits**: Gained +${bonusRolls} rolls for Rank ${rank}.`);
    }
    return bonusRolls;
  }

  /**
   * Applies the 2300AD Social Standing elite bonus (+1 SOC per term if SOC 10+).
   */
  applyEliteSocBonus(): void {
    const char = this.characterService.character();
    if (char.characteristics.soc.value >= 10) {
      this.characterService.modifyStat('SOC', 1);
      this.characterService.log('**Elite Status**: SOC increased by 1 (SOC 10+ bonus).');
    }
  }

  /**
   * Applies French Foreign Legion end-of-term benefits:
   * Language (French) 0 + French citizenship.
   */
  applyForeignLegionBenefits(): void {
    this.characterService.ensureSkillLevel('Language (French)', 0);
    this.characterService.updateCharacter({ nationality: 'French Empire' });
    this.characterService.log('**Foreign Legion Completion**: Granted French Citizenship and Language (French) 0.');
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private applyStatDeltas(deltas: { stat: string; delta: number }[]): void {
    for (const { stat, delta } of deltas) {
      this.characterService.modifyStat(stat, delta);
    }
  }
}
