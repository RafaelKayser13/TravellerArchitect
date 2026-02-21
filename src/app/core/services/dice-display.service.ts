import { Injectable, signal } from '@angular/core';

export interface Modifier {
  label: string;
  value: number;
}

/**
 * Optional context shown in the dice roller's briefing and result phases.
 * Providing these fields enables the 3-phase announcement flow:
 *   1. Briefing  — shows announcement, success/failure preview, then player clicks ROLL
 *   2. Rolling   — 3D dice animation
 *   3. Result    — shows success/failure with contextual narrative before PROCEED
 */
export interface RollContext {
  /** Short label for the current phase, e.g. "SURVIVAL • TERM 3" */
  phase?: string;
  /** Paragraph explaining WHY this roll is happening. Shown BEFORE dice are thrown. */
  announcement?: string;
  /** What success means for the character in plain language. */
  successContext?: string;
  /** What failure means for the character in plain language. */
  failureContext?: string;
  /** Debug table data to display in the modal (e.g. Education Events table) */
  debugTableData?: any;
}

export interface RollRequest extends RollContext {
  reason: string;
  diceCount: number;
  dm: number;
  modifiers?: Modifier[]; // Detailed breakdown
  target: number;
  statName?: string;
  // Optional: Function to get a text description for a specific result (e.g. Event table)
  getResultDescription?: (result: number) => string; 
  debugTableData?: any; // For debug logging of table contents
  resolve: (value: number) => void;
}

@Injectable({
  providedIn: 'root'
})
export class DiceDisplayService {
  request = signal<RollRequest | null>(null);
  debugMode = signal<boolean>(false);

  /**
   * Show a dice roll overlay.
   * If `context.announcement` is provided, the overlay first shows a briefing
   * card asking the player to confirm before the dice animate.
   */
  roll(
      reason: string, 
      diceCount: number = 2, 
      dm: number = 0, 
      target: number = 0, 
      statName: string = '',
      getResultDescription?: (result: number) => string,
      modifiers: Modifier[] = [],
      debugTableData?: any,
      context: RollContext = {}
  ): Promise<number> {
    return new Promise(resolve => {
      this.request.set({ 
        reason, 
        diceCount, 
        dm, 
        target, 
        statName, 
        getResultDescription, 
        modifiers, 
        debugTableData,
        resolve,
        ...context
      });
    });
  }

  complete(total: number) {
    const req = this.request();
    if (req) {
      // Log debug data if present
      if (req.debugTableData) {
        console.group(`[Dice Roll Debug] ${req.reason}`);
        console.log('Result:', total);
        console.log('Table Data:', req.debugTableData);
        if (req.getResultDescription) {
           console.log('Result Description:', req.getResultDescription(total));
        }
        console.groupEnd();
      }

      req.resolve(total);
      this.request.set(null);
    }
  }
}
