import { Component, inject, OnDestroy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceDisplayService } from '../../../core/services/dice-display.service';
import { HudWindowComponent } from '../hud-window/hud-window.component';

/**
 * 3-phase dice roll flow:
 *  1. 'briefing' — shown when request.announcement is set; player reads context then clicks ROLL
 *  2. 'rolling'  — animated dice, resolves automatically after ~1.5 s
 *  3. 'result'   — shows raw result + success/failure with contextual outcome text
 */
export type RollPhase = 'briefing' | 'rolling' | 'result';

@Component({
  selector: 'app-dice-roller',
  standalone: true,
  imports: [CommonModule, HudWindowComponent],
  templateUrl: './dice-roller.component.html',
  styleUrls: ['./dice-roller.component.scss']
})
export class DiceRollerComponent implements OnDestroy {
  diceService = inject(DiceDisplayService);
  private cdr = inject(ChangeDetectorRef);
  protected Math = Math;

  // ── phase state ───────────────────────────────────────────────────────────
  rollPhase: RollPhase = 'rolling';

  // ── rolling/result state ──────────────────────────────────────────────────
  resultValues: number[] = [];
  total = 0;
  resultDescription = '';
  private timer: any;

  get request() { return this.diceService.request(); }

  // ── phase shorthand helpers used by the template ──────────────────────────
  get isBriefing() { return this.rollPhase === 'briefing'; }
  get isRolling()  { return this.rollPhase === 'rolling'; }
  get isResult()   { return this.rollPhase === 'result'; }

  constructor() {
    effect(() => {
      const req = this.diceService.request();
      if (req) {
        if (req.announcement) {
          // Pre-roll announcement provided — show briefing first.
          this.rollPhase = 'briefing';
          this.resultValues = [];
          this.total = 0;
          this.cdr.detectChanges();
        } else {
          // No announcement — roll immediately (backward-compatible).
          this.startRoll();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  // ── phase transitions ─────────────────────────────────────────────────────

  /** Called when the player clicks "INITIATE ROLL" in the briefing phase. */
  initiateRoll() {
    this.startRoll();
  }

  startRoll() {
    if (this.timer) clearTimeout(this.timer);
    this.rollPhase = 'rolling';
    this.resultValues = [];
    this.cdr.detectChanges();
    this.timer = setTimeout(() => this.finalizeRoll(), 1500);
  }

  finalizeRoll() {
    try {
      const req = this.request;
      const count = req?.diceCount || 2;
      this.resultValues = [];
      this.total = 0;

      for (let i = 0; i < count; i++) {
        const val = Math.floor(Math.random() * 6) + 1;
        this.resultValues.push(val);
        this.total += val;
      }

      this.rollPhase = 'result';
      this.updateResultDescription();
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error finalizing roll:', e);
      this.rollPhase = 'result';
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

  /** Called by the PROCEED button when the player acknowledges the result. */
  continue() {
    if (this.request) {
      this.diceService.complete(this.total);
      this.rollPhase = 'rolling'; // reset for next request
    }
  }

  // ── computed helpers ──────────────────────────────────────────────────────

  get isSuccess(): boolean {
    if (!this.request || !this.request.target) return false;
    return this.effectiveTotal >= this.request.target;
  }

  get effectiveTotal(): number {
    return this.total + (this.request?.dm || 0);
  }

  /** Outcome narrative text shown after the result — success or failure context. */
  get outcomeContext(): string {
    if (!this.request) return '';
    if (this.request.target && this.request.successContext && this.request.failureContext) {
      return this.isSuccess ? this.request.successContext : this.request.failureContext;
    }
    if (this.request.successContext && this.isSuccess) return this.request.successContext;
    if (this.request.failureContext && !this.isSuccess) return this.request.failureContext;
    return '';
  }

  get tableRows(): { roll: string, value: string, active: boolean }[] {
    const data = this.request?.debugTableData;
    if (!data || !Array.isArray(data)) return [];

    const currentTotal = this.isResult ? this.effectiveTotal : -999;

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

      isActive = this.isResult && roll === currentTotal.toString();
      return { roll, value, active: isActive };
    });
  }
}
