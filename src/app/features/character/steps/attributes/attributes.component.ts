import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiceService } from '../../../../core/services/dice.service';
import { CharacterService } from '../../../../core/services/character.service';
import { DieComponent } from '../../../../features/shared/die/die.component';

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, DieComponent],
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent {
  protected diceService = inject(DiceService);
  protected characterService = inject(CharacterService);
  private cdr = inject(ChangeDetectorRef);

  characteristicsList = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'];

  // Data State
  scores: { [key: string]: number } = {}; // Final score
  diceValues: { [key: string]: [number, number] } = {}; // The 2 dice faces

  // UI State
  rollingState: { [key: string]: boolean } = {};
  editingState: { [key: string]: boolean } = {};
  selectedStat: string | null = null;

  isRolling = false;
  isComplete = false;

  constructor() {
    this.initializeState();
  }

  initializeState() {
    this.characteristicsList.forEach(char => {
      this.scores[char] = 0;
      this.diceValues[char] = [1, 1]; // Default faces
      this.rollingState[char] = false;
      this.editingState[char] = false;
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
          const d1 = Math.floor(Math.random() * 6) + 1;
          const d2 = Math.floor(Math.random() * 6) + 1;

          this.diceValues[char] = [d1, d2];
          this.scores[char] = d1 + d2;
          this.rollingState[char] = false;
          this.cdr.detectChanges(); // Trigger update per card
        }),
        finalize(() => {
          this.isRolling = false;
          this.isComplete = true;
          this.save();
          this.cdr.detectChanges(); // Final update
        })
      ).subscribe();
    });
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

    // Auto-focus and auto-select
    setTimeout(() => {
      const input = document.querySelector(`.stat-card.selected input.edit-input, .stat-card:hover input.edit-input`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
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

  save() {
    const newChars = { ...this.characterService.character().characteristics };

    this.characteristicsList.forEach(key => {
      const score = this.scores[key];
      const modelKey = key.toLowerCase();
      (newChars as any)[modelKey] = {
        name: key,
        value: score,
        modifier: this.diceService.getModifier(score)
      };
    });

    this.characterService.updateCharacteristics(newChars);
  }
}
