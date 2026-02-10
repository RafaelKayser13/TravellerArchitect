import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { NATIONALITIES } from '../../../../data/nationalities';
import { WORLDS, getWorldsByNation } from '../../../../data/worlds';
import { Nationality } from '../../../../core/models/nationality.model';
import { World } from '../../../../core/models/character.model';

import { DiceService } from '../../../../core/services/dice.service';

@Component({
  selector: 'app-origin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './origin.component.html',
  styleUrls: ['./origin.component.scss']
})
export class OriginComponent {
  @ViewChild('originTypeSection') originTypeSection!: ElementRef;
  @ViewChild('homeworldSection') homeworldSection!: ElementRef;
  @ViewChild('skillsSection') skillsSection!: ElementRef;

  protected characterService = inject(CharacterService);
  protected diceService = inject(DiceService);

  nationalities = NATIONALITIES;
  availableWorlds: World[] = [];

  selectedNationality: Nationality | null = null;
  selectedOriginType: 'Core' | 'Frontier' | 'Spacer' = 'Core';
  selectedWorld: World | null = null;

  // Background Skills
  showSkillsSelection = false;
  backgroundSkillsCount = 0;
  selectedBackgroundSkills: string[] = [];

  coreSkills = [
    'Admin', 'Art', 'Athletics', 'Carouse', 'Drive', 'Electronics', 'Flyer',
    'Language', 'Mechanics', 'Medic', 'Profession', 'Science', 'Streetwise'
  ];
  frontierSkills = [
    'Admin', 'Animals', 'Art', 'Athletics', 'Carouse', 'Drive', 'Mechanics',
    'Medic', 'Seafarer', 'Steward', 'Survival', 'Vacc Suit'
  ];
  spacerSkills = [
    'Admin', 'Art', 'Athletics', 'Carouse', 'Electronics', 'Engineer',
    'Mechanics', 'Medic', 'Pilot', 'Steward', 'Survival', 'Vacc Suit'
  ];

  get availableSkills() {
    if (this.selectedOriginType === 'Spacer') return this.spacerSkills;
    if (this.selectedOriginType === 'Frontier') return this.frontierSkills;
    return this.coreSkills;
  }

  constructor() {
    // Load existing state if any
    const char = this.characterService.character();

    if (char.nationality) {
      this.selectedNationality = this.nationalities.find(n => n.name === char.nationality) || null;
    }

    if (char.originType) {
      // Map 'Earth' (default in model) to 'Core' for UI consistency
      if (char.originType === 'Earth' || char.originType === 'Core') {
        this.selectedOriginType = 'Core';
      } else {
        // Cast to expected type (Frontier | Spacer)
        this.selectedOriginType = char.originType as 'Frontier' | 'Spacer';
      }
    }

    // Update worlds list based on restored selection
    this.updateWorlds();

    if (char.homeworld) {
      const found = this.availableWorlds.find(w => w.name === char.homeworld?.name);
      this.selectedWorld = found || char.homeworld;
    }

    // Restore Background Skills selection
    if (char.skills) {
      // Filter character skills to find ones that match the available background skills for this origin
      const relevantSkills = this.availableSkills;
      this.selectedBackgroundSkills = char.skills
        .filter(s => relevantSkills.includes(s.name))
        .map(s => s.name);

      // Recalculate if the section should be shown
      if (this.selectedNationality && this.selectedWorld) {
        // Re-run the count logic
        // We can't easily access the dice modifier here without the stat value, 
        // but 'showSkillsSelection' usually flips on save().
        // Let's force it true if we have specific data
        this.showSkillsSelection = true;

        // Recalculate count
        const edu = (char.characteristics as any).edu.value; // Approximate, might miss modifier from this step re-calc
        const eduDm = this.diceService.getModifier(edu);
        this.backgroundSkillsCount = (this.selectedOriginType === 'Spacer' ? 4 : 3) + eduDm;
        if (this.backgroundSkillsCount < 1) this.backgroundSkillsCount = 1;
      }
    }
  }

  selectNationality(nat: Nationality) {
    this.selectedNationality = nat;
    this.onNationalityChange();

    // Scroll to next section
    setTimeout(() => {
      if (this.originTypeSection) {
        this.originTypeSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  setOriginType(type: 'Core' | 'Frontier' | 'Spacer') {
    this.selectedOriginType = type;
    this.onOriginTypeChange();

    // Scroll to next section
    setTimeout(() => {
      if (this.homeworldSection) {
        this.homeworldSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  selectWorld(world: World) {
    this.selectedWorld = world;
    this.onWorldChange();

    // Scroll to next section
    setTimeout(() => {
      if (this.skillsSection) {
        this.skillsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // ... imports remain the same, ensuring World is imported from model ...

  onNationalityChange() {
    this.updateWorlds();
    this.save();
  }

  onOriginTypeChange() {
    // If Spacer is selected, we have fixed stats (usually) or a generic 'Space' world
    this.selectedBackgroundSkills = []; // Reset selections as list changes
    if (this.selectedOriginType === 'Spacer') {
      this.selectedBackgroundSkills.push('Vacc Suit');
      this.characterService.addSkill('Vacc Suit', 0);
    }
    this.updateWorlds();
    this.save();
  }

  onWorldChange() {
    this.save();
  }

  isGravityExtreme(world: World): boolean {
    return world.gravityCode === 'High' || world.gravityCode === 'Extreme' || world.gravityCode === 'Low';
  }

  updateWorlds() {
    if (!this.selectedNationality) {
      this.availableWorlds = [];
      return;
    }

    if (this.selectedOriginType === 'Core') {
      this.availableWorlds = WORLDS.filter(w => w.tier === 'Core');
    } else if (this.selectedOriginType === 'Spacer') {
      // Spacer Logic: They don't pick a 'Planet' usually, but a habitat.
      // The spec says: Homeworld = "Space/Station"
      // We can either create a dummy world or let them pick a "Base" system.
      // For visual consistency, let's create a virtual 'Space Station' world option associated with the nation?
      // OR simply hide the world selector and auto-set a 'Space Station' world.

      // Let's create a virtual world for the UI to display
      this.availableWorlds = [{
        name: `${this.selectedNationality.name} Orbital/Station`,
        uwp: 'Zero-G Habitat',
        gravity: 0,
        gravityCode: 'Low',
        survivalDm: -1,
        path: 'Hard', // Usually High Tech
        nation: this.selectedNationality.name,
        tier: 'Spacer',
        system: 'Various'
      }];
      this.selectedWorld = this.availableWorlds[0];
    } else {
      // Frontier
      this.availableWorlds = getWorldsByNation(this.selectedNationality.name)
        .filter(w => w.tier === 'Frontier' || w.tier === 'Core'); // Some definitions might blur, but strictly Frontier usually
    }
  }

  save() {
    if (this.selectedNationality) {
      // 1. Determine Language
      const nativeLanguage = this.selectedNationality.languages[0] || 'English';

      // 2. Prepare Updates
      const charUpdate: any = {
        nationality: this.selectedNationality.name,
        originType: this.selectedOriginType,
        homeworld: this.selectedWorld
      };

      // 3. Apply Gravity & DNAM logic here
      // We need to fetch current characteristics to modify them
      const char = this.characterService.character();
      const chars = { ...char.characteristics };

      // Reset mods first to avoid double application if user switches back and forth
      ['str', 'dex', 'end'].forEach(k => {
        const key = k as 'str' | 'dex' | 'end';
        chars[key].gravityMod = 0;
        chars[key].geneticMod = 0;
      });

      // 3a. Gravity Mods
      if (this.selectedWorld) {
        const code = this.selectedWorld.gravityCode;
        const g = this.selectedWorld.gravity;

        if (code === 'Zero-G') { /* Handled by Spacer DNAM usually */ }
        else if (g < 0.1) {
          chars.str.gravityMod = -2; chars.dex.gravityMod = 2; chars.end.gravityMod = -2;
        } else if (g < 0.21) {
          chars.str.gravityMod = -1; chars.dex.gravityMod = 1; chars.end.gravityMod = -1;
        } else if (g > 2.0 && g < 3.0) {
          chars.str.gravityMod = 1; chars.dex.gravityMod = -1; chars.end.gravityMod = 1;
        } else if (g >= 3.0) {
          chars.str.gravityMod = 2; chars.dex.gravityMod = -2; chars.end.gravityMod = 2;
        }
      }

      // 3b. DNAM Logic
      const dnamList: any[] = [];
      if (this.selectedWorld && ['King', 'Huntsland', 'New Columbia'].includes(this.selectedWorld.name)) {
        chars.str.geneticMod = 3;
        chars.end.geneticMod = 3;
        dnamList.push({ name: 'King Ultra', description: 'STR +1D, END +1D. Requires respirator.' });
      }

      // Spacer
      if (this.selectedOriginType === 'Spacer') {
        dnamList.push({ name: 'Zero-G Adaptation', description: 'Adapted to microgravity.' });
        // Recalculate Gravity Mod to be 0 (Light/Low) instead of penalty
        chars.str.gravityMod = 0; chars.dex.gravityMod = 0; chars.end.gravityMod = 0;
      }

      charUpdate.characteristics = chars;
      charUpdate.genes = dnamList;

      // 5. Skills Metadata (Count)
      const edu = chars.edu.value + chars.edu.modifier;
      const eduDm = this.diceService.getModifier(edu);
      this.backgroundSkillsCount = (this.selectedOriginType === 'Spacer' ? 4 : 3) + eduDm;
      if (this.backgroundSkillsCount < 1) this.backgroundSkillsCount = 1;

      this.showSkillsSelection = true;

      this.characterService.updateCharacter(charUpdate);

      // Note: We do NOT wipe/reset skills here anymore to prevent data loss.
      // Skill toggling is handled in toggleSkill() or relies on the user making selections.
    }
  }

  toggleSkill(skill: string) {
    if (this.selectedOriginType === 'Spacer' && skill === 'Vacc Suit') {
      return; // Cannot deselect mandatory skill
    }

    if (this.selectedBackgroundSkills.includes(skill)) {
      // Deselecting
      this.selectedBackgroundSkills = this.selectedBackgroundSkills.filter(s => s !== skill);
      // Manually remove skill from service for now (custom logic since removeSkill doesn't exist)
      // We filter it out if level is 0. If >0, we assume it was gained elsewhere and keep it? 
      // Risky. For Background skills (Level 0), we should probably remove it.
      const char = this.characterService.character();
      const newSkills = char.skills.filter(s => s.name !== skill);
      this.characterService.updateCharacter({ skills: newSkills });
    } else {
      // Selecting
      if (this.selectedBackgroundSkills.length < this.backgroundSkillsCount) {
        this.selectedBackgroundSkills.push(skill);
        this.characterService.addSkill(skill, 0);
      }
    }
    // Note: We don't call save() here anymore because save() just does bio/stats, which haven't changed.
    // But we might want to check for side effects? No.
  }

}
