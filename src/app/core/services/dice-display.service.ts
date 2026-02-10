import { Injectable, signal } from '@angular/core';

export interface Modifier {
  label: string;
  value: number;
}

export interface RollRequest {
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

  roll(
      reason: string, 
      diceCount: number = 2, 
      dm: number = 0, 
      target: number = 0, 
      statName: string = '',
      getResultDescription?: (result: number) => string,
      modifiers: Modifier[] = [],
      debugTableData?: any
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
        resolve 
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
