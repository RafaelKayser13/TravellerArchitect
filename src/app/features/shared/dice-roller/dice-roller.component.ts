import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceDisplayService, RollRequest } from '../../../core/services/dice-display.service';

@Component({
  selector: 'app-dice-roller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dice-roller.component.html',
  styleUrls: ['./dice-roller.component.scss']
})
export class DiceRollerComponent implements OnDestroy {
  diceService = inject(DiceDisplayService);
  private cdr = inject(ChangeDetectorRef);
  protected Math = Math;
  
  rolling = false;
  showResult = false;
  resultValues: number[] = [];
  total = 0;
  resultDescription = '';
  private timer: any;
  
  get request() { return this.diceService.request(); }

  constructor() {
      // React to request changes. This handles both "Initial Load" and "Sequential Updates".
      effect(() => {
          const req = this.diceService.request();
          if (req) {
              // Untracked to ensure we don't create loops if startRoll read signals (it doesn't, but safety first)
              // Actually startRoll is safe.
              this.startRoll();
          }
      });
  }

  ngOnDestroy() {
      if (this.timer) clearTimeout(this.timer);
  }

  startRoll() {
    if (this.timer) clearTimeout(this.timer);
    
    this.rolling = true;
    this.showResult = false;
    this.resultValues = [];
    this.cdr.detectChanges(); // Force update state
    
    // Animation duration
    this.timer = setTimeout(() => {
        this.finalizeRoll();
    }, 1500);
  }
  
  finalizeRoll() {
    try {
        const req = this.request;
        const count = req?.diceCount || 2;
        this.resultValues = [];
        this.total = 0;
        
        for(let i=0; i<count; i++) {
            const val = Math.floor(Math.random() * 6) + 1;
            this.resultValues.push(val);
            this.total += val;
        }
        
        this.rolling = false;
        this.showResult = true;
        
        // Check for result description (e.g. Event text)
        this.updateResultDescription();

        this.cdr.detectChanges(); // FORCE view update
    } catch (e) {
        console.error("Error finalizing roll:", e);
        this.rolling = false;
        this.showResult = true; // Fallback to show whatever we have
        this.cdr.detectChanges();
    }
  }

  updateManualTotal(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value)) {
      this.total = value;
      this.updateResultDescription();
      this.cdr.detectChanges();
    }
  }

  private updateResultDescription() {
    if (this.request?.getResultDescription) {
      this.resultDescription = this.request.getResultDescription(this.total);
    } else {
      this.resultDescription = '';
    }
  }

  continue() {
      if (this.request) {
          this.diceService.complete(this.total);
          this.showResult = false; // Reset state
      }
  }

  get isSuccess(): boolean {
      if (!this.request || !this.request.target) return false;
      const totalScore = this.total + this.request.dm;
      return totalScore >= this.request.target;
  }

  get effectiveTotal(): number {
      return this.total + (this.request?.dm || 0);
  }

  get tableRows(): { roll: string, value: string, active: boolean }[] {
      const data = this.request?.debugTableData;
      if (!data || !Array.isArray(data)) return [];

      const currentTotal = this.showResult ? this.effectiveTotal : -999;

      return data.map((item, index) => {
          let roll = (index + 1).toString();
          let value = '';
          let isActive = false;

          if (typeof item === 'string') {
              value = item;
          } else if (typeof item === 'number') {
              value = item.toLocaleString();
          } else if (typeof item === 'object' && item !== null) {
              if (item.roll !== undefined) {
                  roll = item.roll.toString();
                  value = item.description || item.name || item.desc || item.career || item.outcome || '';
              } else {
                  value = JSON.stringify(item);
              }
          }

          // Check if this row is the result of the current roll (accounting for DMs)
          isActive = this.showResult && roll === currentTotal.toString();

          return { roll, value, active: isActive };
      });
  }
}
