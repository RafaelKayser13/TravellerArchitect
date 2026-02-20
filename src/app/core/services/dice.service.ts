import { Injectable, signal } from '@angular/core';

export interface RollResult {
  total: number;
  rolls: number[];
  effect?: number; // For checks with target numbers
}

@Injectable({
  providedIn: 'root'
})
export class DiceService {
  lastRoll = signal<RollResult | null>(null);

  constructor() { }

  /**
   * Rolls a number of dice with a given number of sides.
   * @param count Number of dice to roll (default 2).
   * @param sides Number of sides per die (default 6).
   * @returns Result identifying total and individual rolls.
   */
  roll(count: number = 2, sides: number = 6): RollResult {
    const rolls: number[] = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
        // Use crypto.getRandomValues if available, or Math.random
        const val = Math.floor(Math.random() * sides) + 1;
        rolls.push(val);
        total += val;
    }
    const result = { total, rolls };
    this.lastRoll.set(result);
    return result;
  }

  /**
   * Rolls a D66 (two distinct D6, one as tens, one as units).
   * Example: Rolls 3 and 5 -> 35 (or 53? Traveller usually specifies 1st die is tens).
   * In Mongoose Traveller: "Roll two dice, read them as tens and units". 
   * Usually 11 to 66.
   */
  rollD66(): number {
    const d1 = this.roll(1).total;
    const d2 = this.roll(1).total;
    return (d1 * 10) + d2;
  }

  /**
   * Calculates the DM (Dice Modifier) for a characteristic score.
   * Based on Traveller Core Rulebook.
   * 0: -3
   * 1-2: -2
   * 3-5: -1
   * 6-8: 0
   * 9-11: +1
   * 12-14: +2
   * 15+: +3
   */
  getModifier(score: number): number {
    if (score === 0) return -3;
    if (score >= 1 && score <= 2) return -2;
    if (score >= 3 && score <= 5) return -1;
    if (score >= 6 && score <= 8) return 0;
    if (score >= 9 && score <= 11) return 1;
    if (score >= 12 && score <= 14) return 2;
    if (score >= 15) return 3;
    return 0; // Negative values? Usually impossible for stats, but just in case.
  }

  /**
   * Rolls 3d6 and returns the two highest dice + their sum.
   * This improves the probability of scoring 8+ compared to standard 2d6.
   * Used for attribute generation to create more balanced, capable characters.
   * @returns { dice: [number, number], sum: number } - Two highest dice and their sum
   */
  roll3d6KeepHighest2(): { dice: [number, number]; sum: number } {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;

    // Sort in descending order and take the two highest
    const sorted = [d1, d2, d3].sort((a, b) => b - a);
    const highest1 = sorted[0];
    const highest2 = sorted[1];

    return {
      dice: [highest1, highest2],
      sum: highest1 + highest2
    };
  }
}
