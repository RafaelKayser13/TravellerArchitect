import { Component, inject, ChangeDetectorRef, ElementRef, OnInit, OnDestroy, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiceService } from '../../../../core/services/dice.service';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { CharacterService } from '../../../../core/services/character.service';
import { WizardFlowService } from '../../../../core/services/wizard-flow.service';
import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, StepHeaderComponent],
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent implements OnInit, OnDestroy {
  protected diceService = inject(DiceService);
  protected diceDisplay = inject(DiceDisplayService);
  protected characterService = inject(CharacterService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private wizardFlow = inject(WizardFlowService);
  private el = inject(ElementRef);
  characteristicsList = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'];

  // Data State
  scores: { [key: string]: number } = {}; // Final score
  diceValues: { [key: string]: [number, number] } = {}; // The 2 dice faces

  // UI State
  rollingState: { [key: string]: boolean } = {};
  editingState: { [key: string]: boolean } = {};
  glitchState: { [key: string]: boolean } = {};
  selectedStat: string | null = null;

  isRolling = false;
  readonly isCompleteSignal = signal(false);
  get isComplete(): boolean { return this.isCompleteSignal(); }
  set isComplete(v: boolean) { this.isCompleteSignal.set(v); }

  constructor() {
    this.initializeState();
  }

  ngOnInit(): void {
    this.wizardFlow.registerValidator(3, () => this.isComplete);
    this.wizardFlow.registerFinishAction(3, () => this.finish());
  }

  ngOnDestroy(): void {
    this.wizardFlow.unregisterStep(3);
  }

  initializeState() {
    this.characteristicsList.forEach(char => {
      this.scores[char] = 0;
      this.diceValues[char] = [1, 1]; // Default faces
      this.rollingState[char] = false;
      this.editingState[char] = false;
      this.glitchState[char] = false;
    });

    // Check if character already has data
    const char = this.characterService.character();
    if (char.characteristics.str.value > 0) {
      this.characteristicsList.forEach(key => {
        const val = (char.characteristics as any)[key.toLowerCase()].value;
        this.scores[key] = val;
        // Reverse engineer dice? Just randomized for visual
        this.diceValues[key] = [Math.floor(val / 2), Math.ceil(val / 2)];
      });
      this.isComplete = true;
    }
  }

  rollSequence() {
    if (this.isRolling) return;
    this.isRolling = true;
    this.isComplete = false;
    this.selectedStat = null;

    // 1. Start all rolling
    this.characteristicsList.forEach(char => this.rollingState[char] = true);

    // 2. Sequential Reveal using RxJS
    import('rxjs').then(({ from, concatMap, of, delay, tap, finalize }) => {
      from(this.characteristicsList).pipe(
        concatMap(char => of(char).pipe(delay(800))),
        tap(char => {
          // Check if debug mode is enabled and return 12 (6+6) for all rolls
          const isDebugMode = this.diceDisplay.debugMode();
          
          let d1: number, d2: number;
          if (isDebugMode) {
            d1 = 6;
            d2 = 6;
          } else {
            // Use 3d6 keep highest 2 for better probability of 8+
            const rollResult = this.diceService.roll3d6KeepHighest2();
            d1 = rollResult.dice[0];
            d2 = rollResult.dice[1];
          }

          this.diceValues[char] = [d1, d2];
          this.scores[char] = d1 + d2;
          this.rollingState[char] = false;
          
          // Trigger a brief glitch effect on reveal
          this.glitchState[char] = true;
          setTimeout(() => {
            this.glitchState[char] = false;
            this.cdr.detectChanges();
          }, 300);

          this.cdr.detectChanges(); // Trigger update per card
        }),
        finalize(() => {
          this.ngZone.run(() => {
            this.isRolling = false;
            this.isComplete = true;
            this.save();
            this.wizardFlow.notifyValidation(); // reactive: unblocks the Next button
          });
        })
      ).subscribe();
    });
  }

  finish() {
    if (this.isComplete) {
      this.wizardFlow.advance();
    }
  }

  selectCard(char: string) {
    if (!this.isComplete || this.isRolling) return;

    if (this.selectedStat === char) {
      this.selectedStat = null; // Deselect
    } else if (this.selectedStat) {
      // Swap
      this.swapScores(this.selectedStat, char);
      this.selectedStat = null;
    } else {
      this.selectedStat = char; // Select first
    }
  }

  swapScores(char1: string, char2: string) {
    // Swap scores
    const tempScore = this.scores[char1];
    this.scores[char1] = this.scores[char2];
    this.scores[char2] = tempScore;

    // Swap visuals too
    const tempDice = this.diceValues[char1];
    this.diceValues[char1] = this.diceValues[char2];
    this.diceValues[char2] = tempDice;

    this.save();
  }

  startEditing(char: string, event: Event) {
    event.stopPropagation(); // Prevent card selection
    this.editingState[char] = true;
    this.cdr.detectChanges();

    // Focus the input that just appeared in the DOM
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('input.hex-edit-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 30);
  }

  stopEditing(char: string) {
    this.editingState[char] = false;
    // ensure within bounds?
    if (this.scores[char] < 1) this.scores[char] = 1;
    if (this.scores[char] > 15) this.scores[char] = 15; // Reasonable cap

    // Update dice visual roughly to match new score
    const half = this.scores[char] / 2;
    this.diceValues[char] = [Math.floor(half), Math.ceil(half)];

    this.save();
  }

  updateScore(char: string, newVal: any) {
    this.scores[char] = Number(newVal);
  }

  getScore(char: string): number {
    return this.scores[char];
  }

  getDieValue(char: string, dieIndex: 1 | 2): number {
    return this.diceValues[char] ? this.diceValues[char][dieIndex - 1] : 1;
  }

  getModifier(char: string): number {
    return this.diceService.getModifier(this.scores[char]);
  }

  getStatPercentage(char: string): number {
    const score = this.scores[char];
    if (!score) return 0;
    // 2D6 max is 12, but 2300AD can have mods up to 15+ 
    // We'll normalize to 15 as the "full" bar for visual impact
    return Math.min((score / 15) * 100, 100);
  }

  save() {
    const newChars = { ...this.characterService.character().characteristics };

    this.characteristicsList.forEach(key => {
      const score = this.scores[key];
      const modelKey = key.toLowerCase();
      const existing = (newChars as any)[modelKey] || {};
      
      (newChars as any)[modelKey] = {
        ...existing,
        name: key,
        value: score,
        modifier: this.diceService.getModifier(score)
      };
    });

    this.characterService.updateCharacteristics(newChars);
  }
}
