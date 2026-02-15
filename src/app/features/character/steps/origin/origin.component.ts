import { Component, inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { NATIONALITIES } from '../../../../data/nationalities';
import { WORLDS, getWorldsByNation } from '../../../../data/worlds';
import { Nationality } from '../../../../core/models/nationality.model';
import { World } from '../../../../core/models/character.model';

import { DiceService } from '../../../../core/services/dice.service';

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-origin',
  standalone: true,
  imports: [CommonModule, FormsModule, StepHeaderComponent],
  templateUrl: './origin.component.html',
  styleUrls: ['./origin.component.scss']
})
export class OriginComponent {
  @ViewChild('originTypeSection') originTypeSection!: ElementRef;
  @ViewChild('homeworldSection') homeworldSection!: ElementRef;
  @ViewChild('skillsSection') skillsSection!: ElementRef;

  @Output() complete = new EventEmitter<void>();
  protected characterService = inject(CharacterService);
  protected diceService = inject(DiceService);

  nationalities = NATIONALITIES;
  availableWorlds: World[] = [];

  selectedNationality: Nationality | null = null;
  selectedOriginType: 'Core' | 'Frontier' | 'Spacer' | null = null;
  selectedWorld: World | null = null;

  // Background Skills
  showSkillsSelection = false;
  backgroundSkillsCount = 0;
  isJapanBonusPrompt = false;
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
    // Load existing state if any — skip hydration on reset (empty values)
    const char = this.characterService.character();

    if (char.nationality) {
      this.selectedNationality = this.nationalities.find(n => n.name === char.nationality) || null;
    }

    if (char.originType) {
      // Validate current originType against species
      if (this.isOriginTypeAvailable(char.originType as any)) {
        if (char.originType === 'Earth' || char.originType === 'Core') {
          this.selectedOriginType = 'Core';
        } else {
          this.selectedOriginType = char.originType as 'Frontier' | 'Spacer';
        }
      } else {
        this.selectedOriginType = null;
        this.characterService.updateCharacter({ originType: '', homeworld: undefined });
      }
    } else {
      this.selectedOriginType = null;
    }

    // Update worlds list based on restored selection
    this.updateWorlds();

    if (char.homeworld) {
      // Validate homeworld against species
      const found = this.availableWorlds.find(w => w.name === char.homeworld?.name);
      if (found) {
        this.selectedWorld = found;
      } else {
        this.selectedWorld = null;
        this.characterService.updateCharacter({ homeworld: undefined });
      }
    }

    // Restore Background Skills selection only if we have valid origin data
    if (char.skills && char.nationality && char.originType) {
      const relevantSkills = this.availableSkills;
      this.selectedBackgroundSkills = char.skills
        .filter(s => relevantSkills.includes(s.name))
        .map(s => s.name);

      if (this.selectedNationality && this.selectedWorld) {
        this.showSkillsSelection = true;
        const edu = (char.characteristics as any).edu.value;
        const eduDm = this.diceService.getModifier(edu);
        this.backgroundSkillsCount = (this.selectedOriginType === 'Spacer' ? 4 : 3) + eduDm;
        if (this.backgroundSkillsCount < 1) this.backgroundSkillsCount = 1;
      }
    }
  }

  selectNationality(nat: Nationality) {
    this.selectedNationality = nat;
    this.onNationalityChange();
    this.processAutoSelections();
    this.scrollToFirstMissingStep();
  }

  setOriginType(type: 'Core' | 'Frontier' | 'Spacer') {
    this.selectedOriginType = type;
    this.onOriginTypeChange();
    this.processAutoSelections();
    this.scrollToFirstMissingStep();
  }

  selectWorld(world: World) {
    this.selectedWorld = world;
    this.onWorldChange();
    this.scrollToFirstMissingStep();
  }

  private processAutoSelections() {
    let changed = true;
    while (changed) {
      changed = false;

      // 1. Auto-select Origin Type if only one is available
      if (this.selectedNationality && !this.selectedOriginType) {
        const availableTypes: ('Core' | 'Frontier' | 'Spacer')[] = ['Core', 'Frontier', 'Spacer'];
        const validTypes = availableTypes.filter(t => this.isOriginTypeAvailable(t));
        if (validTypes.length === 1) {
          this.selectedOriginType = validTypes[0];
          this.onOriginTypeChange();
          changed = true;
        }
      }

      // 2. Auto-select Homeworld if only one is available
      if (this.selectedNationality && this.selectedOriginType && !this.selectedWorld) {
        this.updateWorlds();
        if (this.availableWorlds.length === 1) {
          this.selectedWorld = this.availableWorlds[0];
          this.onWorldChange();
          changed = true;
        }
      }
    }
  }

  private scrollToFirstMissingStep() {
    setTimeout(() => {
      let targetId = '';

      if (!this.selectedNationality) {
        return; 
      } else if (!this.selectedOriginType) {
        targetId = '.origin-type-section';
      } else if (!this.selectedWorld) {
        targetId = '.homeworld-section';
      } else if (!this.canProceed()) {
        targetId = '.skills-section';
      }

      if (targetId) {
        const element = document.querySelector(targetId);
        const content = document.querySelector('.wizard-content');
        if (element && content) {
          const top = (element as HTMLElement).offsetTop - 20;
          content.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }, 150);
  }

  // ... imports remain the same, ensuring World is imported from model ...

  onNationalityChange() {
    this.updateWorlds();
    this.save();
  }

  isNationalityAvailable(nat: Nationality): boolean {
    const species = this.characterService.character().species;
    
    // In 2300AD, Heavy-Worlders are primarily from USA, Australia, Manchuria, Texas, Inca, or Trilon
    if (species === 'Human (Heavy-Worlder)') {
      const allowedNations = ['United States', 'Australia', 'Manchuria', 'Texas', 'Inca Republic', 'Trilon Corp'];
      return allowedNations.includes(nat.name);
    }
    
    // Spacers are everywhere, but especially Tier 1-2 and Trilon/Life Foundation
    return true;
  }

  isOriginTypeAvailable(type: 'Core' | 'Frontier' | 'Spacer'): boolean {
    const species = this.characterService.character().species;
    if (species === 'Human (Spacer)') {
      return type === 'Spacer';
    }
    if (['Human (Heavy-Worlder)', 'Human (Cold-Adapted)', 'Human (Dry-Worlder)'].includes(species)) {
      return type === 'Frontier';
    }
    return true;
  }

  getIncompatibilityReason(type: 'Nationality' | 'OriginType', value: any): string | null {
    const species = this.characterService.character().species;
    
    if (type === 'Nationality') {
      if (species === 'Human (Heavy-Worlder)') {
        const allowedNations = ['United States', 'Australia', 'Manchuria', 'Texas', 'Inca Republic', 'Trilon Corp'];
        if (!allowedNations.includes(value.name)) {
          return 'Heavy-Worlders lack colonies in this nation.';
        }
      }
    }

    if (type === 'OriginType') {
      if (species === 'Human (Spacer)' && value !== 'Spacer') {
        return 'Spacer biology requires orbital environments.';
      }
      if (['Human (Heavy-Worlder)', 'Human (Cold-Adapted)', 'Human (Dry-Worlder)'].includes(species) && value !== 'Frontier') {
        return 'Adapted species requires specific colonial environments.';
      }
    }

    return null;
  }

  onOriginTypeChange() {
    // If Spacer is selected, we have fixed stats (usually) or a generic 'Space' world
    this.selectedBackgroundSkills = []; // Reset selections as list changes
    if (this.selectedOriginType === 'Spacer') {
      this.selectedBackgroundSkills.push('Vacc Suit');
      this.characterService.ensureSkillLevel('Vacc Suit', 0);

      // 2300AD: Spacers gain Language (Zhargon) 1
      this.characterService.ensureSkillLevel('Language (Zhargon)', 1);
      this.characterService.log('**Spacer Origin**: Gained Language (Zhargon) 1');
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

    const species = this.characterService.character().species;

    // Filter available worlds by species requirements
    let allWorlds = WORLDS;
    
    if (species === 'Human (Heavy-Worlder)') {
      allWorlds = allWorlds.filter(w => w.gravityCode === 'High' || w.gravityCode === 'Extreme' || (w.environment && w.environment.includes('Heavy')));
    } else if (species === 'Human (Cold-Adapted)') {
      allWorlds = allWorlds.filter(w => w.environment && w.environment.includes('Cold'));
    } else if (species === 'Human (Dry-Worlder)') {
      allWorlds = allWorlds.filter(w => w.environment && w.environment.includes('Dry'));
    }

    if (this.selectedOriginType === 'Core') {
      // Human (Spacer) or adapted humans cannot be Core origin unless standard human
      if (['Human (Spacer)', 'Human (Heavy-Worlder)', 'Human (Cold-Adapted)', 'Human (Dry-Worlder)'].includes(species)) {
        this.availableWorlds = [];
      } else {
        this.availableWorlds = allWorlds.filter(w => w.tier === 'Core');
      }
    } else if (this.selectedOriginType === 'Spacer') {
      // 2300AD: Spacer species MUST be Spacer origin. Standard humans can also be spacers.
      this.availableWorlds = [{
        name: `${this.selectedNationality.name} Orbital/Station`,
        uwp: 'Zero-G Habitat',
        gravity: 0,
        gravityCode: 'Low',
        survivalDm: -1,
        path: 'Hard',
        nation: this.selectedNationality.name,
        tier: 'Spacer',
        system: 'Various',
        environment: ['Space', 'Low-G']
      }];
      this.selectedWorld = this.availableWorlds[0];
    } else {
      // Frontier
      this.availableWorlds = allWorlds.filter(w => 
        (w.nation === this.selectedNationality?.name || w.nation === 'Independent') && 
        (w.tier === 'Frontier' || w.tier === 'Core')
      );
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
        homeworld: this.selectedWorld,
        isSoftPath: this.selectedWorld?.path === 'Soft'
      };

      // 2b. PSA (Planetary Selection Adaptation) - Survival 0 for Soft Path
      if (charUpdate.isSoftPath && this.selectedWorld) {
        const psaSkill = `Survival (${this.selectedWorld.name})`;
        this.characterService.ensureSkillLevel(psaSkill, 0);
        this.characterService.log(`**Soft Path Benefit**: Gained ${psaSkill} 0 (PSA).`);
      }

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

        // 2300AD Spec: Low-G worlds give permanent -1 STR & END
        if (code === 'Low') {
          chars.str.gravityMod = -1;
          chars.end.gravityMod = -1;
          console.log('Applying Low-G Penalty: STR -1, END -1');
        } 
        else if (g > 2.0 && g < 3.0) {
          chars.str.gravityMod = 1; chars.dex.gravityMod = -1; chars.end.gravityMod = 1;
        } else if (g >= 3.0) {
          chars.str.gravityMod = 2; chars.dex.gravityMod = -2; chars.end.gravityMod = 2;
        }

        // 3a-ii. Heavy-Worlder Reroll (STR/END if < 10)
        if (char.species === 'Human (Heavy-Worlder)' && (code === 'High' || code === 'Extreme')) {
          if (chars.str.value < 10) {
            const r1 = Math.floor(Math.random() * 6) + 1;
            const r2 = Math.floor(Math.random() * 6) + 1;
            const newStr = r1 + r2;
            if (newStr > chars.str.value) {
              this.characterService.log(`**Heavy-Worlder Reroll**: STR ${chars.str.value} -> ${newStr}`);
              chars.str.value = newStr;
            }
          }
          if (chars.end.value < 10) {
            const r1 = Math.floor(Math.random() * 6) + 1;
            const r2 = Math.floor(Math.random() * 6) + 1;
            const newEnd = r1 + r2;
            if (newEnd > chars.end.value) {
              this.characterService.log(`**Heavy-Worlder Reroll**: END ${chars.end.value} -> ${newEnd}`);
              chars.end.value = newEnd;
            }
          }
        }
      }

      // 3b. DNAM Logic
      const dnamList: any[] = [];
      if (this.selectedWorld && ['King', 'Huntsland', 'New Columbia'].includes(this.selectedWorld.name)) {
        // King Ultra: STR +1D, END +1D (average +3 used for simplicity, but could be a roll)
        const strRoll = Math.floor(Math.random() * 6) + 1;
        const endRoll = Math.floor(Math.random() * 6) + 1;
        chars.str.geneticMod = strRoll;
        chars.end.geneticMod = endRoll;
        dnamList.push({ name: 'King Ultra', description: `STR +${strRoll}, END +${endRoll}. Requires respirator.` });
        this.characterService.log(`**DNAM King Ultra**: Gained STR +${strRoll}, END +${endRoll}.`);
      }

      // Spacer
      if (this.selectedOriginType === 'Spacer') {
        dnamList.push({ name: 'Zero-G Adaptation', description: 'Adapted to microgravity.' });
        // Recalculate Gravity Mod to be 0 for Spacers (no penalty in low-g)
        chars.str.gravityMod = 0; chars.dex.gravityMod = 0; chars.end.gravityMod = 0;
      }

      charUpdate.characteristics = chars;
      charUpdate.genes = dnamList;

      // 5. Skills Metadata (Count) - 2300AD Tier Based
      const tier = this.selectedNationality ? this.selectedNationality.tier : 3;
      let baseCount = 3;
      if (tier <= 2) baseCount = 4;
      else if (tier === 3) baseCount = 3;
      else if (tier === 4) baseCount = 2;
      else baseCount = 1; // Tier 5+

      const edu = chars.edu.value + chars.edu.modifier;
      const eduDm = this.diceService.getModifier(edu);
      this.backgroundSkillsCount = baseCount + eduDm + (this.selectedOriginType === 'Spacer' ? 1 : 0);
      if (this.backgroundSkillsCount < 1) this.backgroundSkillsCount = 1;

      this.showSkillsSelection = true;

      // 4. Background Rewards (Languages & Nationality Bonus)
      if (this.selectedNationality) {
        // Native Language Level 2
        const nativeLang = this.selectedNationality.languages[0];
        if (nativeLang) {
          const langSkill = `Language (${nativeLang})`;
          this.characterService.ensureSkillLevel(langSkill, 2);
          this.characterService.log(`**Nationality Reward**: Gained ${langSkill} at Level 2`);
        }

        // 2300AD Specification Nationality Bonuses:
        const n = this.selectedNationality.name;
        if (n === 'United States' || n === 'America') {
          this.characterService.ensureSkillLevel('Recon', 0);
          this.characterService.log('**American Bonus**: Gained Recon 0');
        } else if (n === 'Inca Republic') {
          this.characterService.ensureSkillLevel('Melee (Blade)', 0);
          this.characterService.log('**Inca Bonus**: Gained Melee (Blade) 0');
        } else if (n === 'Australia') {
          this.characterService.ensureSkillLevel('Survival', 0);
          this.characterService.log('**Australian Bonus**: Gained Survival 0');
        } else if (n === 'France') {
          this.characterService.addSkill('Diplomat', 1);
          this.characterService.log('**French Bonus**: Gained Diplomat 1');
        } else if (n === 'Manchuria') {
          this.characterService.addSkill('Science', 1);
          this.characterService.log('**Manchurian Bonus**: Gained Science 1');
        } else if (n === 'Germany') {
          this.characterService.addSkill('Engineer', 1);
          this.characterService.log('**German Bonus**: Gained Engineer 1');
        } else if (n === 'Japan') {
          this.isJapanBonusPrompt = true;
        } else if (n === 'Argentina') {
          this.characterService.addSkill('Pilot (any)', 1);
          this.characterService.log('**Argentine Bonus**: Gained Pilot (any) 1');
        } else if (n === 'Azania') {
          this.characterService.addSkill('Persuade', 1);
          this.characterService.log('**Azanian Bonus**: Gained Persuade 1');
        } else if (n === 'Brazil') {
          this.characterService.addSkill('Athletics (any)', 1);
          this.characterService.log('**Brazilian Bonus**: Gained Athletics (any) 1');
        } else if (n === 'United Kingdom' || n === 'UK') {
          this.characterService.addSkill('Gun Combat (Slug)', 1);
          this.characterService.log('**British Bonus**: Gained Gun Combat (Slug) 1');
        } else if (n === 'Mexico') {
          this.characterService.addSkill('Drive (any)', 1);
          this.characterService.log('**Mexican Bonus**: Gained Drive (any) 1');
        } else if (n === 'Russia') {
          this.characterService.addSkill('Heavy Weapons (any)', 1);
          this.characterService.log('**Russian Bonus**: Gained Heavy Weapons (any) 1');
        } else if (n === 'Texas') {
          this.characterService.addSkill('Gun Combat (Slug)', 1);
          this.characterService.log('**Texan Bonus**: Gained Gun Combat (Slug) 1');
        } else if (n === 'Ukraine') {
          this.characterService.addSkill('Streetwise', 1);
          this.characterService.log('**Ukrainian Bonus**: Gained Streetwise 1');
        }

        // Tier 1 / Corporate Bonus (SOC 9+)
        if (this.selectedNationality.tier === 1 && chars.soc.value >= 9) {
          this.characterService.ensureSkillLevel('Gun Combat (Slug)', 0);
          this.characterService.log('**Elite Nationality Bonus**: Gained Gun Combat (Slug) 0 (SOC 9+)');
        }
      }

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

  canProceed(): boolean {
    return this.selectedBackgroundSkills.length === this.backgroundSkillsCount;
  }

  increaseStat(stat: string, val: number) {
    const char = this.characterService.character();
    const statKey = stat.toLowerCase() as keyof typeof char.characteristics;
    const currentValue = char.characteristics[statKey].value;

    const updatedChars = { ...char.characteristics };
    updatedChars[statKey] = {
      ...updatedChars[statKey],
      value: currentValue + val
    };

    this.characterService.updateCharacteristics(updatedChars);
  }

  selectJapanBonus(type: 'EDU' | 'Rank') {
    this.isJapanBonusPrompt = false;
    if (type === 'EDU') {
      this.increaseStat('EDU', 1);
      this.characterService.updateCharacter({ japaneseRankBonus: false });
      this.characterService.log('**Japanese Bonus**: Chosen EDU +1');
    } else {
      this.characterService.updateCharacter({ japaneseRankBonus: true });
      this.characterService.log('**Japanese Bonus**: Chosen +1 Rank (Commission)');
    }
  }

  finish() {
    this.complete.emit();
  }

}
