import { Component, inject, computed, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CAREERS } from '../../../../data/careers';

import { DiceDisplayService } from '../../../../core/services/dice-display.service';

@Component({
  selector: 'app-mustering-out',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mustering-out.component.html',
  styleUrls: ['./mustering-out.component.scss']
})
export class MusteringOutComponent {
  protected characterService = inject(CharacterService);
  protected diceService = inject(DiceService);
  protected diceDisplay = inject(DiceDisplayService);

  character = this.characterService.character;
  
  // Logic state
  totalRolls = computed(() => {
     const char = this.character();
     const history = char.careerHistory;
     let rolls = history.length; // 1 per term
     
     // Rank bonus?
     // Classic/Mongoose: 1 per term. +1 if Rank 1-2, +2 if Rank 3-4, +3 if Rank 5-6.
     // Let's implement that standard logic for now.
     // We need to check the HIGHEST rank achieved across careers? Or just current?
     // Usually per career, but for MVP let's assume one main career or sum.
     // Simplified: Just 1 per term for now + rank of last career.
     
     const lastTerm = history[history.length - 1];
     if (lastTerm) {
         if (lastTerm.rank >= 1 && lastTerm.rank <= 2) rolls += 1;
         if (lastTerm.rank >= 3 && lastTerm.rank <= 4) rolls += 2;
         if (lastTerm.rank >= 5) rolls += 3;
     }
     
     return rolls;
  });
  
  rollsUsed = signal(0);
  cashRolls = signal(0);
  maxCashRolls = 3;
  
  benefitsLog = signal<string[]>([]);
  
  @Output() complete = new EventEmitter<void>();

  // Pension Logic
  pension = computed(() => {
      const char = this.character();
      const terms = char.careerHistory.length;
      if (terms < 5) return 0;
      
      // Standard: 4000 at term 5, +2000 per term thereafter.
      // Formula: (Terms - 3) * 2000
      return (terms - 3) * 2000;
  });

  ngOnInit() {
      // Auto-save pension if not already set (or purely calculated? Better to save it)
      const p = this.pension();
      if (p > 0 && this.character().finances.pension !== p) {
          this.characterService.updateCharacter({
              finances: { ...this.character().finances, pension: p }
          });
      }
  }

  async rollBenefit(type: 'Cash' | 'Material') {
      if (this.rollsUsed() >= this.totalRolls()) return;
      if (type === 'Cash' && this.cashRolls() >= this.maxCashRolls) return;
      
      const char = this.character();
      const lastTerm = char.careerHistory[char.careerHistory.length - 1];
      const careerDef = CAREERS.find(c => c.name === lastTerm.careerName);
      
      if (!careerDef) return;
      
      const modifiers: { label: string, value: number }[] = [];
      let dm = 0;
      
      // 1. Path Modifier
      if (char.homeworld?.path === 'Hard') {
          dm += 1;
          modifiers.push({ label: 'Hard Path', value: 1 });
      } else if (char.homeworld?.path === 'Soft') {
          dm -= 1;
          modifiers.push({ label: 'Soft Path', value: -1 });
      }

      // 2. Off-World Education (Cash only)
      if (type === 'Cash' && char.education?.offworld) {
          dm -= 1;
          modifiers.push({ label: 'Off-World Edu', value: -1 });
      }

      // 3. Rank Bonus (Rank 5+ DM+1 on Material)
      // Check highest rank across careers or current? Usually current/last.
      if (type === 'Material' && lastTerm && lastTerm.rank >= 5) {
           dm += 1;
           modifiers.push({ label: 'Rank 5+ Bonus', value: 1 });
      }
      
      // 4. Gambler (Cash only)
      if (type === 'Cash') {
         const gambler = char.skills.find(s => s.name.includes('Gambler'));
         if (gambler && gambler.level >= 1) {
             dm += 1;
             modifiers.push({ label: 'Gambler Skill', value: 1 });
         }
      }
      
      // Table Data
      const tableData = type === 'Cash' ? careerDef.musteringOutCash : careerDef.musteringOutBenefits;

      const roll = await this.diceDisplay.roll(
           'Benefit: ' + type, 
           1,
           dm,
           0,
           '',
           (res) => {
               let r = res + dm;
               if (r < 1) r = 1;
               if (r > 7) r = 7;
               const idx = r - 1;
               if (type === 'Cash') return `Cash: Lv ${careerDef.musteringOutCash[idx]}`;
               return `Benefit: ${careerDef.musteringOutBenefits[idx]}`;
           },
           modifiers,
           tableData
       );

      let finalRoll = roll + dm;
      if (finalRoll > 7) finalRoll = 7;
      if (finalRoll < 1) finalRoll = 1;
       
      let result = '';
      const tableIndex = finalRoll - 1;

      if (type === 'Cash') {
          const cash = careerDef.musteringOutCash[tableIndex];
          result = `Cash: Lv ${cash}`;
          this.cashRolls.update((v: number) => v + 1);
          
          const currentCash = char.finances.cash;
           this.characterService.updateCharacter({
               finances: { ...char.finances, cash: currentCash + cash }
           });
           
      } else {
          const benefit = careerDef.musteringOutBenefits[tableIndex];
          result = `Benefit: ${benefit}`;
          
          if (benefit.includes('INT +')) {
             const int = char.characteristics.int;
             this.characterService.updateCharacteristics({
                 ...char.characteristics,
                 int: { ...int, value: int.value + 1, modifier: this.diceService.getModifier(int.value + 1) }
             });
          }
          else if (benefit.includes('EDU +')) {
             const edu = char.characteristics.edu;
             this.characterService.updateCharacteristics({
                 ...char.characteristics,
                 edu: { ...edu, value: edu.value + 1, modifier: this.diceService.getModifier(edu.value + 1) }
             });
          }
          else if (benefit.includes('SOC +')) {
             const soc = char.characteristics.soc;
             this.characterService.updateCharacteristics({
                 ...char.characteristics,
                 soc: { ...soc, value: soc.value + 1, modifier: this.diceService.getModifier(soc.value + 1) }
             });
          }
          else if (benefit.includes('Ship Share')) {
              this.characterService.updateCharacter({
                  finances: { ...char.finances, shipShares: char.finances.shipShares + 1 }
              });
          }
          else if (benefit === 'Weapon') {
               const equipment = [...char.equipment, 'Weapon (Select Later)'];
               this.characterService.updateCharacter({ equipment });
          }
          else {
               const equipment = [...char.equipment, benefit];
               this.characterService.updateCharacter({ equipment });
          }
      }
      
      this.rollsUsed.update((v: number) => v + 1);
      this.benefitsLog.update((l: string[]) => [...l, result]); // Store just the result content, not raw log
      console.log(`[MusteringOut] Rolled ${roll}${dm ? (dm > 0 ? '+'+dm : dm) : ''} (${type}): ${result}`);
  }
  
  finish() {
      // Mark character as finished
      this.characterService.updateCharacter({ isFinished: true });
      this.complete.emit();
  }
}
