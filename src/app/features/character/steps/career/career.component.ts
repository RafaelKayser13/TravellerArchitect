import { Component, inject, computed, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CAREERS } from '../../../../data/careers';
import { CareerDefinition, Assignment } from '../../../../core/models/career.model';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';

type CareerState = 'CHOOSE_CAREER' | 'QUALIFICATION' | 'BASIC_TRAINING' | 'SKILL_TRAINING' | 'SURVIVAL' | 'EVENT' | 'MISHAP' | 'ADVANCEMENT' | 'CHANGE_ASSIGNMENT' | 'LEAVING_HOME' | 'TERM_END' | 'MUSTER_OUT';

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [CommonModule, FormsModule, StepHeaderComponent],
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss']
})
export class CareerComponent {
  protected characterService = inject(CharacterService);
  protected diceService = inject(DiceService);
  protected diceDisplay = inject(DiceDisplayService);

  careers = CAREERS;
  
  // State Signals
  currentState = signal<CareerState>('CHOOSE_CAREER');
  currentTerm = computed(() => this.characterService.character().careerHistory.length + 1);
  currentAge = computed(() => this.characterService.character().age);
  
  // Selection
  selectedCareer: CareerDefinition | null = null;
  selectedAssignment: Assignment | null = null;
  
  // Turn Data
  rollLog: string[] = [];
  lastRoll = 0;
  lastTarget = 0;
  lastDm = 0;
  success = false;
  leavingHomeSuccess = false;
  
  // Event Text
  currentEventText = '';
  showCyberneticOption = false;
  
  // Mustering Out State
  benefitRollsTotal = 0;
  benefitRollsRemaining = 0;
  cashRollsTaken = 0;
  benefitsLog: string[] = [];
  
  // New Advancement State
  bonusSkillRolls = signal(0);
  mandatoryContinue = false;
  forcedOut = false;
  isCommissionAttempt = false; 
  
  // Change Assignment
  nextAssignment: Assignment | null = null;

  constructor() {}

  // --- 1. CHOOSE CAREER ---
  selectCareer(career: CareerDefinition) {
      this.selectedCareer = career;
      this.selectedAssignment = null;
      setTimeout(() => {
          const el = document.getElementById('assignment-list');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
  }
  
  selectAssignment(assignment: Assignment) {
      this.selectedAssignment = assignment;
      setTimeout(() => {
          const el = document.getElementById('qualify-btn');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
  }
  
  async qualify() {
      const career = this.selectedCareer;
      if (!career) return;
      
      this.log(`Attempting to join ${career.name}...`);
      
      const char = this.characterService.character();
      const history = char.careerHistory || [];
      const numPrevCareers = new Set(history.map((c: any) => c.careerName)).size;
      const dm = -1 * numPrevCareers; 
      
      const stat = career.qualificationStat.toLowerCase();
      const charStat = (char.characteristics as any)[stat];
      const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
      const target = career.qualificationTarget;
      
      const modifiers: { label: string, value: number }[] = [];
      if (dm !== 0) modifiers.push({ label: 'Previous Careers', value: dm });
      if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });

      let universityMod = 0;
      if (char.education?.university === true) {
          const cName = career.name;
          const aName = this.selectedAssignment?.name || '';
          
          let eligible = ['Agent', 'Army', 'Marines', 'Navy', 'Scholar', 'Scout'].includes(cName);
          if (cName === 'Citizen' && aName === 'Corporate') eligible = true;
          if (cName === 'Entertainer' && aName === 'Journalist') eligible = true;
          
          if (eligible) {
              universityMod = char.education.honors ? 2 : 1;
              const label = char.education.honors ? 'University Honors' : 'University Grad';
              modifiers.push({ label: label, value: universityMod });
          }
      }

      const roll = await this.diceDisplay.roll(
        `Qualification: ${career.name}`, 2, statMod + dm + universityMod, target, stat.toUpperCase(), undefined, modifiers
      );
      
      const total = roll + statMod + dm + universityMod;
      this.log(`Rolled ${total} vs ${target}`);
      
      if (total >= target) {
          this.success = true;
          this.log('Qualified!');
          this.currentState.set('BASIC_TRAINING');
      } else {
           this.success = false;
           this.log('Failed Qualification. Entering the Draft...');
           await this.runDraft();
       }
  }

  // --- 2. TRAINING & SKILLS ---

  // SAFETY FLAG
  basicTrainingGrantedThisTerm = false;

  private grantBasicTrainingSkills() {
       const term = this.currentTerm();
       this.log(`grantBasicTrainingSkills: Term ${term}`);
       
       if (term === 1) {
           if (this.basicTrainingGrantedThisTerm) {
               this.log('Basic Training already granted this term. Skipping.');
               return;
           }
           
           const skills = this.selectedCareer?.serviceSkills || [];
           this.log(`grantBasicTrainingSkills: Service Skills found: ${skills.length} (${skills.join(', ')})`);
           
           if (skills.length > 0) {
               skills.forEach(s => {
                   this.log(`Adding Skill: ${s} at Level 0`);
                   this.characterService.ensureSkillLevel(s, 0);
               });
               this.log(`Basic Training: Acquired Service Skills at Level 0.`);
               this.basicTrainingGrantedThisTerm = true;
           }
       }
  }

  performBasicTraining() {
       this.grantBasicTrainingSkills();
       this.currentState.set('SKILL_TRAINING');
  }
  
  async attemptCommission() {
      if (!this.selectedCareer || !this.selectedAssignment) return;
      
      // Ensure basic training is granted if this is the first term
      this.grantBasicTrainingSkills();
      
      this.isCommissionAttempt = true;
      this.success = false; 
      
      const stat = this.selectedAssignment.advancementStat.toLowerCase();
      const target = this.selectedAssignment.advancementTarget; 
      const char = this.characterService.character();
      const charStat = (char.characteristics as any)[stat];
      const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
      
      const modifiers: { label: string, value: number }[] = [];
      if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });

      const roll = await this.diceDisplay.roll(
          'Commission Check', 2, statMod, target, stat.toUpperCase(), undefined, modifiers
      );
      
      const total = roll + statMod;
      this.log(`Commission Check: ${total} vs ${target}`);
      
       if (total >= target) {
           this.success = true;
           const rankTitle = this.getRankTitleFor(1);
           this.log(`Commissioned! You are now a ${rankTitle} (Officer Rank 1).`);
          this.bonusSkillRolls.update(v => v + 1); 
          this.log('Commission successful! Gain 1 Extra Skill Roll.');
          this.currentState.set('SKILL_TRAINING'); 
      } else {
          this.success = false;
          this.log('Commission failed.');
          this.currentState.set('SKILL_TRAINING');
      }
  }

  // --- Commission Helpers ---
  
  canAttemptCommission(): boolean {
      if (!this.selectedCareer) return false;
      // Only military careers usually have Commission (Army, Navy, Marines).
      // Check if career has officer ranks or implies commission.
      // Easiest check: does it have officerSkills?
      if (!this.selectedCareer.officerSkills) return false;
      
      // If already commissioned (Rank > 0), typically can't "attempt commission" again?
      // Or maybe you can if you want promotion? No, Commission is specifically Enlisted -> Officer.
      if (this.getRank() > 0) return false;
      if (this.isCommissionAttempt && this.success) return false; // Already succeeded this term

      // Rule: Term 1 OR SOC 9+ (Draft/Voluntary handled by Term 1 usually)
      // "Normally... first term... If SOC 9+... any term"
      const char = this.characterService.character();
      const soc = char.characteristics.soc.value;
      
      return this.currentTerm() === 1 || soc >= 9;
  }

  isCommissioned(): boolean {
      // Metric: Rank >= 1 OR we just got commissioned this term
      if (this.getRank() >= 1) return true;
      if (this.isCommissionAttempt && this.success) return true; 
      
      // Military Academy Graduation grants Commission
      const char = this.characterService.character();
      if (char.education?.academy === true) return true;
      
      return false;
  }

  async runDraft() {
      const draftTable = [
          { roll: 1, career: 'Army' }, { roll: 2, career: 'Army' },
          { roll: 3, career: 'Marine' }, { roll: 4, career: 'Navy' },
          { roll: 5, career: 'Navy' }, { roll: 6, career: 'Colonist' }
      ];

      const roll = await this.diceDisplay.roll('Draft', 1, 0, 0, '', undefined, [], draftTable);
      
      let draftedCareerName = '';
      if (roll <= 2) draftedCareerName = 'Army';
      else if (roll === 3) draftedCareerName = 'Marine'; 
      else if (roll <= 5) draftedCareerName = 'Navy';
      else draftedCareerName = 'Colonist'; 
      
      let draftTarget = this.careers.find(c => c.name.includes(draftedCareerName));
      if (!draftTarget && draftedCareerName === 'Colonist') draftTarget = this.careers.find(c => c.name === 'Scout') || this.careers.find(c => c.name === 'Citizen');
      if (!draftTarget && draftedCareerName === 'Marine') draftTarget = this.careers.find(c => c.name === 'Marines');
      
      if (draftTarget) {
           this.log(`Drafted into ${draftTarget.name}.`);
           this.selectedCareer = draftTarget;
           this.selectedAssignment = draftTarget.assignments[0];
           this.currentState.set('BASIC_TRAINING');
       } else {
            this.log('Draft failed. You are a Drifter.');
            const drifter = this.careers.find(c => c.name === 'Drifter');
            if (drifter) {
                this.selectedCareer = drifter;
                this.selectedAssignment = drifter.assignments[0];
                this.currentState.set('BASIC_TRAINING');
            }
       }
  }
  
  // --- Specialization Logic ---
  
  readonly GENERIC_SKILLS: {[key: string]: string[]} = {
      'Art': ['Holography', 'Instrument', 'Visual', 'Write', 'Perform'],
      'Drive': ['Mole', 'Track', 'Wheel', 'Walker'],
      'Electronics': ['Comms', 'Computers', 'Remote Ops', 'Sensors'],
      'Engineer': ['Life Support', 'M-Drive', 'Power', 'J-Drive'],
      'Flyer': ['Grav', 'Rotor', 'Wing'],
      'Gun Combat': ['Slug', 'Energy'], 
      'Heavy Weapons': ['Launcher', 'Ordnance', 'Portable'],
      'Language': ['French', 'German', 'Spanish', 'Zhargon', 'English', 'Japanese'],
      'Melee': ['Unarmed', 'Blade', 'Bludgeon'],
      'Pilot': ['Small Craft', 'Spacecraft', 'Capital Ships'],
      'Profession': ['Belter', 'Biologicals', 'Civil Engineering', 'Construction', 'Hydroponics', 'Polymers'],
      'Science': ['Biology', 'Chemistry', 'Geology', 'History', 'Physics', 'Psychology', 'Sophontology'],
      'Seafarer': ['Ocean Ships', 'Submarine'],
      'Animals': ['Handling', 'Veterinary', 'Training'],
      'Athletics': ['Dexterity', 'Endurance', 'Strength'],
      'Tactics': ['Military', 'Naval']
  };

  showSkillSelection = false;
  skillSelectionOptions: string[] = [];
  pendingSkillName = '';
  pendingSkillLevel = 1;

  async handleSkillReward(skillName: string, level: number) {
      if (this.GENERIC_SKILLS[skillName]) {
          this.pendingSkillName = skillName;
          this.pendingSkillLevel = level;
          this.skillSelectionOptions = this.GENERIC_SKILLS[skillName];
          this.showSkillSelection = true;
          this.log(`Select specialization for ${skillName}...`);
      } else {
          this.characterService.addSkill(skillName, level);
      }
  }

  confirmSpecialization(spec: string) {
      const fullName = `${this.pendingSkillName} (${spec})`;
      this.characterService.addSkill(fullName, this.pendingSkillLevel);
      this.showSkillSelection = false;
      this.log(`Selected info: ${fullName}`);
  }

  // --- Skill Roll ---
  
  async rollSkill(tableType: 'Personal' | 'Service' | 'Specialist' | 'Advanced' | 'Officer') {
       if (!this.selectedCareer) return;

       const char = this.characterService.character();
       if (tableType === 'Advanced' && (char.characteristics.edu.value + char.characteristics.edu.modifier) < 8) {
           this.log('Education 8+ required for Advanced Education.');
           return;
       }
       if (tableType === 'Officer' && this.selectedCareer.officerSkills && this.getRank() <= 0) {
           this.log('Commission required for Officer skills.');
           return;
       }

       let table: string[] = [];
       if (tableType === 'Personal') table = this.selectedCareer.personalSkills;
       else if (tableType === 'Service') table = this.selectedCareer.serviceSkills;
       else if (tableType === 'Advanced') table = this.selectedCareer.advancedEducation;
       else if (tableType === 'Officer' && this.selectedCareer.officerSkills) table = this.selectedCareer.officerSkills;
       else if (tableType === 'Specialist' && this.selectedAssignment) table = this.selectedAssignment.skillTable;

       const roll = await this.diceDisplay.roll(
           `${tableType} Skill`, 1, 0, 0, '',
           (res) => { const idx = res - 1; return table[idx] || 'Unknown'; }, [], table
       );
       
       const reward = table[roll - 1];
       if (!reward) return;

       this.log(`Rolled ${roll} on ${tableType}: ${reward}`);
       
       if (reward.includes('+1') && (reward.includes('STR') || reward.includes('DEX') || reward.includes('END') || reward.includes('INT') || reward.includes('EDU') || reward.includes('SOC'))) {
            const stat = reward.split(' ')[0];
            this.increaseStat(stat, 1);
       } else {
           await this.handleSkillReward(reward, 1);
       }
       
       // Handle Flow
       // If it was a bonus roll (from Advancement or Commission)
       if (this.bonusSkillRolls() > 0) {
           this.bonusSkillRolls.update(v => v - 1);
           const remaining = this.bonusSkillRolls();
           this.log(`Bonus Roll Used. ${remaining} remaining.`);
           if (remaining > 0) return; // Stay for more rolls?
           
           // If no more bonus rolls, go to end term logic
           // But wait, if this was the INITIAL skill roll?
           // The "Standard" flow is Basic/Skill -> Survival.
           // The "Bonus" flow comes AFTER Advancement.
           
           // Check if we have passed Survival/Event checks (by checking currentEventText)
           if (this.currentEventText) {
               // Post-Event Bonus Roll done.
               this.checkPostTermFlow();
               return;
           }
       }

       // Standard Flow
       if (this.currentTerm() === 1 && this.currentState() === 'BASIC_TRAINING') {
            this.currentState.set('SURVIVAL');
       } else if (this.currentState() === 'SKILL_TRAINING') {
           // If we are here and have NOT done Event yet, go to Survival.
           if (!this.currentEventText) {
               this.currentState.set('SURVIVAL');
           } else {
               // If we HAVE done Event, this was likely a bonus roll that exhausted.
               this.checkPostTermFlow();
           }
       }
  }
  
  getRank(): number {
      const char = this.characterService.character();
      const term = [...char.careerHistory].reverse().find(t => t.careerName === this.selectedCareer?.name);
      return term ? term.rank : 0;
  }

  // --- 3. SURVIVAL & EVENT ---

  async rollSurvival() {
      if (!this.selectedAssignment || !this.selectedCareer) return;
      
      const stat = this.selectedAssignment.survivalStat.toLowerCase();
      const target = this.selectedAssignment.survivalTarget;
      const char = this.characterService.character();
      const charStat = (char.characteristics as any)[stat];
      const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
      
      let hwDm = 0;
      const hasLeftHome = char.careerHistory.some(t => t.leavingHome);
      const modifiers: { label: string, value: number }[] = [];
      
      if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });

      if (!hasLeftHome && char.homeworld && char.homeworld.survivalDm < 0) {
          hwDm = char.homeworld.survivalDm;
          modifiers.push({ label: 'Homeworld Gravity', value: hwDm });
      }
      
      const roll = await this.diceDisplay.roll('Survival Check', 2, statMod + hwDm, target, stat.toUpperCase(), undefined, modifiers);
      const total = roll + statMod + hwDm;
      this.log(`Survival Check: ${total} vs ${target}`);
      
      if (total >= target) {
          this.success = true;
          this.log('Survived the term.');
          this.currentState.set('EVENT');
          setTimeout(() => {
              const el = document.getElementById('event-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          this.generateEvent();
      } else {
          this.success = false;
          this.showCyberneticOption = true;
          this.log('Survival Check Failed!');
      }
  }

  resolveSurvivalFailure(acceptCybernetic: boolean) {
      this.showCyberneticOption = false;
      if (acceptCybernetic) {
          this.success = true; 
          this.log('Accepted Cybernetic Implant. Avoided Mishap. Debt: -1 Benefit Roll.');
          const char = this.characterService.character();
          this.characterService.updateCharacter({ equipment: [...char.equipment, 'Cybernetic Limb (Benefit Debt)'] });
          this.currentState.set('EVENT');
          this.generateEvent();
      } else {
          this.log('Mishap! You are injured and ejected from the career.');
          this.currentState.set('MISHAP');
          this.generateMishap();
      }
  }
  
  async generateEvent() {
      if (!this.selectedCareer) return;
      const table = this.selectedCareer.eventTable;
      const roll = await this.diceDisplay.roll('Term Event', 2, 0, 0, '', (result) => {
             const e = table.find(ev => ev.roll === result);
             return e ? e.description : 'Something happened.';
          }, [], table
      );
      
      const event = table.find(e => e.roll === roll);
      this.currentEventText = event ? event.description : 'Something happened.';
      this.log(`Event Roll ${roll}: ${this.currentEventText}`);
      this.applyEventEffect(roll);
  }
  
  applyEventEffect(roll: number) {
     if (!this.selectedCareer) return;
     if (roll === 8 && this.selectedCareer.name === 'Army') {
         this.success = true; 
     }
  }
  
  async generateMishap() {
      if (!this.selectedCareer) return;
      const table = this.selectedCareer.mishapTable;
      const roll = await this.diceDisplay.roll('Mishap', 1, 0, 0, '', (result) => {
              const m = table.find(mi => mi.roll === result);
              return m ? m.description : 'Discharged.';
          }, [], table
      );
      const mishap = table.find(m => m.roll === roll);
      this.currentEventText = mishap ? mishap.description : 'Discharged.';
      this.log(`Mishap Roll ${roll}: ${this.currentEventText}`);
  }

  // --- 4. ADVANCEMENT & POST-TERM ---
  
  proceedToAdvancement() {
      if (this.isCommissionAttempt) {
          this.log('Commission attempted this term. Skipping Advancement Roll.');
          this.checkPostTermFlow();
      } else {
          this.currentState.set('ADVANCEMENT');
      }
  }

  async rollAdvancement() {
      if (!this.selectedAssignment || !this.selectedCareer) return;

      const stat = this.selectedAssignment.advancementStat.toLowerCase();
      const target = this.selectedAssignment.advancementTarget;
      const char = this.characterService.character();
      const charStat = (char.characteristics as any)[stat];
      const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
      
      const modifiers: { label: string, value: number }[] = [];
      if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });

      const roll = await this.diceDisplay.roll('Advancement Check', 2, statMod, target, stat.toUpperCase(), undefined, modifiers);
      const total = roll + statMod;
      this.log(`Advancement Check: ${total} vs ${target}`);
      
       if (total >= target) {
           this.success = true;
           const newRank = this.getRank() + 1;
           const rankTitle = this.getRankTitleFor(newRank);
           this.log(`Promoted to ${rankTitle} (Rank ${newRank})!`);
          
          if (roll === 12) {
              this.mandatoryContinue = true;
              this.log('Natural 12! You are indispensable and MUST continue this career.');
          }
          
          this.bonusSkillRolls.update(v => v + 1);
          this.log('Gain 1 Bonus Skill Roll. You must take this now.');
          
          // CRITICAL CHANGE: Go to SKILL_TRAINING immediately for the bonus roll
          // We do NOT go to TERM_END yet.
          // The user must deplete bonusSkillRolls before being allowed to finish term.
          this.currentState.set('SKILL_TRAINING');
      } else {
          this.success = false;
          this.log('No motion this term.');
          
          const terms = this.currentTerm();
          if (total <= terms) {
              this.forcedOut = true;
              this.log(`Forced Out! (Result ${total} <= Terms ${terms}). Must Muster Out.`);
          }
          
          this.checkPostTermFlow();
      }
  }

  // Centralized Post-Term Checks
  async checkPostTermFlow() {
      const age = this.currentAge() + 4;
      this.checkAging(age);
  }

  // --- 5. AGING & LEAVING HOME ---
  
  async checkAging(age: number) {
      const terms = this.currentTerm();
      if (age < 50) {
          this.rollLeavingHome();
          return;
      }
      this.log(`Aging Check (Age ${age}).`);
      const roll = await this.diceDisplay.roll('Aging Check', 2, -1 * terms, 0, '', undefined, [{ label: 'Terms', value: -1 * terms }]);
      const total = roll - terms;
      this.log(`Aging Check Result: ${total}`);
      
      if (total <= -6) {
           this.log('Aging Crisis! Reduce 3 stats by 1.');
           this.increaseStat('STR', -1); this.increaseStat('DEX', -1); this.increaseStat('END', -1);
           this.currentState.set('MISHAP'); // Crisis forces out
      } else if (total <= -2) {
           this.log('Aging Effect: Reduce 1 physical stat by 1.');
           this.increaseStat('STR', -1);
      }
      
      if (this.currentState() !== 'MISHAP') {
          this.rollLeavingHome();
      }
  }
  
  async rollLeavingHome() {
      const char = this.characterService.character();
      if (char.careerHistory.some(t => t.leavingHome)) {
          this.leavingHomeSuccess = true;
          this.currentState.set('TERM_END'); 
          return;
      }
      
      const terms = this.currentTerm();
      const modifiers: { label: string, value: number }[] = [];
      let bonuses = terms;
      modifiers.push({ label: 'Terms Served', value: terms });

      if (char.originType === 'Spacer') { bonuses += 2; modifiers.push({ label: 'Spacer Origin', value: 2 }); }
      if (this.selectedCareer?.name.includes('Scout')) { bonuses += 2; modifiers.push({ label: 'Scout Career', value: 2 }); }
      
      const roll = await this.diceDisplay.roll('Leaving Home Check', 2, bonuses, 8, '', undefined, modifiers); 
      const total = roll + bonuses;
      this.log(`Leaving Home Check: ${total} vs 8`);
      
      if (total >= 8) {
          this.leavingHomeSuccess = true;
          this.log('You successfully left home!');
      } else {
          this.leavingHomeSuccess = false;
          this.log('Still tied to homeworld.');
      }
      
      this.currentState.set('TERM_END');
  }

  // --- 6. CHANGE ASSIGNMENT ---
  
  startChangeAssignment() {
      this.currentState.set('CHANGE_ASSIGNMENT');
  }
  
  async verifyAssignmentChange(newAssign: Assignment) {
       this.log(`Attempting to change assignment to ${newAssign.name}...`);
       // Roll Qualification for new assignment
       const char = this.characterService.character();
       const stat = this.selectedCareer?.qualificationStat.toLowerCase() || 'int';
       const target = this.selectedCareer?.qualificationTarget || 7;
       const charStat = (char.characteristics as any)[stat];
       const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
       
       const roll = await this.diceDisplay.roll(
           `Qualify: ${newAssign.name}`, 2, statMod, target, stat.toUpperCase()
       );
       const total = roll + statMod;
       
       if (total >= target) {
           this.log('Assignment change successful!');
           this.nextAssignment = newAssign;
           this.finishTerm('CONTINUE');
       } else {
           this.log('Assignment change failed. Must remain in current assignment.');
           // Go back to Option? or just finish term with same assignment?
           // "Se falhar, mantém a designação anterior."
           this.nextAssignment = null; 
           this.finishTerm('CONTINUE');
       }
  }

  // --- 7. FINISH TERM ---

  finishTerm(destination: 'CONTINUE' | 'MUSTER' = 'CONTINUE') {
      const char = this.characterService.character();
      const careerName = this.selectedCareer?.name || 'Unknown';
      
      // Use getRank() for current rank, which accounts for the current term's advancement
      let currentRank = this.getRank(); 
      
      const isMishap = this.currentState() === 'MISHAP';

      if (this.success && !isMishap) { // Success implies Advancement or Commission Success
          if (this.isCommissionAttempt) {
              if (currentRank < 1) currentRank = 1;
          } else {
              currentRank++;
          }
          
          if (this.selectedAssignment) {
              const rankData = this.selectedAssignment.ranks.find(r => r.level === currentRank);
              if (rankData && rankData.bonus) {
                   this.log(`Rank Bonus: ${rankData.bonus}`);
                   const parts = rankData.bonus.split(' ');
                   const level = parseInt(parts[parts.length - 1]);
                   if (!isNaN(level)) {
                       const skillName = parts.slice(0, parts.length - 1).join(' ');
                       // Use ensureSkillLevel here!
                       this.characterService.ensureSkillLevel(skillName, level); 
                   } else {
                       this.characterService.ensureSkillLevel(rankData.bonus, 1);
                   }
              }
          }
      }
      
      const newAge = char.age + 4;
      
      this.characterService.updateCharacter({
          age: newAge,
          careerHistory: [
              ...char.careerHistory,
              {
                  termNumber: this.currentTerm(),
                  careerName: careerName,
                  rank: currentRank,
                  events: [this.currentEventText],
                  benefits: [],
                  ageStart: char.age,
                  ageEnd: newAge,
                  survived: !isMishap,
                  commissioned: this.isCommissionAttempt && this.success,
                  advanced: this.success && !isMishap && !this.isCommissionAttempt,
                  leavingHome: this.leavingHomeSuccess
              }
          ]
      });
      
      // Reset logic
      this.success = false;
      this.leavingHomeSuccess = false;
      this.currentEventText = '';
      this.bonusSkillRolls.set(0); 
      this.isCommissionAttempt = false;
      this.basicTrainingGrantedThisTerm = false;

      if (destination === 'MUSTER' || isMishap || this.forcedOut) { 
           this.selectedCareer = null;
           this.selectedAssignment = null;
           this.currentState.set('CHOOSE_CAREER');
           this.forcedOut = false; 
           this.log('Mustered out of career. You may choose a new career or Finalize.');
      } else {
          // Continue Logic
          if (this.nextAssignment) {
              this.selectedAssignment = this.nextAssignment;
              this.nextAssignment = null;
          }
           this.currentState.set('SKILL_TRAINING');
      }
      this.mandatoryContinue = false;
  }
  
  continueCareer() {
      this.finishTerm('CONTINUE');
  }

  // --- MUSTERING OUT ---
  canProceedToNext(): boolean {
      return this.currentState() === 'CHOOSE_CAREER' && this.characterService.character().careerHistory.length > 0;
  }

  startMusteringOut() {
      this.log('Finalizing Career Phase...');
      // Emit complete to Wizard to move to Step 5 (Mustering Out Component)
      this.complete.emit();
  }

  // --- HELPER METHODS ---

  getRankTitle(): string {
       if (!this.selectedAssignment) return 'Rank 0';
       const r = this.getRank();
       return this.getRankTitleFor(r);
  }

  getRankTitleFor(rank: number): string {
      if (!this.selectedAssignment) return `Rank ${rank}`;
      const r = this.selectedAssignment.ranks.find(data => data.level === rank);
      return r ? r.title : `Rank ${rank}`;
  }
  
  log(msg: string) {
      console.log(`[CareerComponent] ${msg}`);
  }

  increaseStat(stat: string, val: number) {
      const char = this.characterService.character();
      const chars = { ...char.characteristics };
      const key = stat.toLowerCase() as keyof typeof chars;
      if (chars[key]) {
          chars[key].value += val;
          chars[key].modifier = this.diceService.getModifier(chars[key].value);
          this.characterService.updateCharacteristics(chars);
          this.log(`Stat ${stat} adjusted by ${val}. New Value: ${chars[key].value}`);
      }
  }
  
  @Output() complete = new EventEmitter<void>();
}
