import { Component, inject, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { NATIONALITIES } from '../../../../data/nationalities';
import { WORLDS, getWorldsByNation } from '../../../../data/worlds';
import { Nationality } from '../../../../core/models/nationality.model';
import { World } from '../../../../core/models/character.model';

import { DiceService } from '../../../../core/services/dice.service';
import { EventEngineService } from '../../../../core/services/event-engine.service';
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
  protected eventEngine = inject(EventEngineService);

  nationalities = NATIONALITIES;
  availableWorlds: World[] = [];

  selectedNationality: Nationality | null = null;
  selectedOriginType: 'Core' | 'Frontier' | 'Spacer' | null = null;
  selectedWorld: World | null = null;
  selectedPath: 'Hard' | 'Soft' = 'Soft';

  // Background Skills
  showSkillsSelection = false;
  backgroundSkillsCount = 0;
  isJapanBonusPrompt = false;
  selectedBackgroundSkills: string[] = [];

  coreSkills = [
    'Admin', 'Art', 'Athletics', 'Carouse', 'Drive', 'Electronics', 'Flyer',
    'Language', 'Mechanic', 'Medic', 'Profession', 'Science', 'Streetwise'
  ];
  frontierSkills = [
    'Admin', 'Animals', 'Art', 'Athletics', 'Carouse', 'Drive', 'Gun Combat', 'Mechanic',
    'Medic', 'Seafarer', 'Steward', 'Survival', 'Vacc Suit'
  ];
  spacerSkills = [
    'Admin', 'Art', 'Athletics', 'Carouse', 'Electronics', 'Engineer',
    'Mechanic', 'Medic', 'Pilot', 'Steward', 'Survival', 'Vacc Suit'
  ];

  get availableSkills() {
    let list: string[] = [];
    if (this.selectedOriginType === 'Spacer') list = [...this.spacerSkills];
    else if (this.selectedOriginType === 'Frontier') list = [...this.frontierSkills];
    else list = [...this.coreSkills];

    // Rule 239: SOC 9+ for Gun Combat in Manchurian, Incan, Argentinean colonies
    const char = this.characterService.character();
    const restrictedNations = ['Manchuria', 'Inca Republic', 'Argentina'];
    const isRestricted = restrictedNations.includes(char.nationality || '');
    const soc = char.characteristics.soc.value;

    if (isRestricted && soc < 9) {
        return list.filter(s => s !== 'Gun Combat');
    }

    return list;
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

    if (char.isSoftPath !== undefined) {
        this.selectedPath = char.isSoftPath ? 'Soft' : 'Hard';
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

    this.registerHandlers();
  }

  private registerHandlers() {
    this.eventEngine.registerCustomHandler('JAPAN_BONUS', () => {
       this.isJapanBonusPrompt = true;
    });

    this.eventEngine.registerCustomHandler('DNAM_KING_ULTRA', () => {
       const strRoll = Math.floor(Math.random() * 6) + 1;
       const endRoll = Math.floor(Math.random() * 6) + 1;
       const chars = { ...this.characterService.character().characteristics };
       chars.str.geneticMod = (chars.str.geneticMod || 0) + strRoll;
       chars.end.geneticMod = (chars.end.geneticMod || 0) + endRoll;
       
       this.characterService.updateCharacteristics(chars);
       this.characterService.log(`**DNAM King Ultra**: Gained STR +${strRoll}, END +${endRoll}.`);
       // Add gene mod entry if not exists
       const currentGenes = this.characterService.character().genes || [];
       if (!currentGenes.find(g => g.name === 'King Ultra')) {
           this.characterService.updateCharacter({ 
               genes: [...currentGenes, { name: 'King Ultra', description: `STR +${strRoll}, END +${endRoll}. Requires respirator.` }] 
           });
       }
    });

    this.eventEngine.registerCustomHandler('RESET_ORIGIN_MODS', () => {
        const char = this.characterService.character();
        const chars = { ...char.characteristics };
        ['str', 'dex', 'end'].forEach(k => {
            const key = k as 'str' | 'dex' | 'end';
            chars[key].gravityMod = 0;
            chars[key].geneticMod = 0;
        });
        this.characterService.updateCharacteristics(chars);
        this.characterService.updateCharacter({ genes: [] });
    });
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
    if (this.selectedWorld) {
        // Default to world's path, but allow override
        this.selectedPath = (this.selectedWorld.path as 'Hard' | 'Soft') || 'Soft';
    }
    this.save();
  }

  setPath(path: 'Hard' | 'Soft') {
      this.selectedPath = path;
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
      // 1. Reset previous mods to allow re-selection
      this.eventEngine.applyEffects([{ type: 'CUSTOM', customId: 'RESET_ORIGIN_MODS' }]);

      // 2. Determine Language
      const nativeLanguage = this.selectedNationality.languages[0] || 'English';

      // 3. Prepare Updates
      const charUpdate: any = {
        nationality: this.selectedNationality.name,
        originType: this.selectedOriginType,
        homeworld: this.selectedWorld,
        isSoftPath: this.selectedPath === 'Soft'
      };

      // 4. Update Character State first
      this.characterService.updateCharacter(charUpdate);

      // 5. Apply Data-Driven Effects
      // 5a. Nationality Effects
      if (this.selectedNationality.effects) {
        this.eventEngine.applyEffects(this.selectedNationality.effects);
      }

      // 5b. World Effects
      if (this.selectedWorld && this.selectedWorld.effects) {
        this.eventEngine.applyEffects(this.selectedWorld.effects);
      }

      // 5c. Native Language Level 2
      const langSkill = `Language (${nativeLanguage})`;
      this.characterService.ensureSkillLevel(langSkill, 2);
      this.characterService.log(`**Nationality Reward**: Gained ${langSkill} at Level 2`);

      // 6. Manual Gravity and Adaptation Logic (remaining for now as it's complex)
      this.applyPhysicalAdaptations();

      // 7. Recalculate Skills Metadata (Count)
      this.calculateBackgroundSkillCount();
      
      this.showSkillsSelection = true;
    }
  }

  private applyPhysicalAdaptations() {
      const char = this.characterService.character();
      const chars = { ...char.characteristics };

      // 1. PSA (Planetary Selection Adaptation) - Survival 0 for Soft Path
      if (char.isSoftPath && char.homeworld) {
        const psaSkill = `Survival (${char.homeworld.name})`;
        this.characterService.ensureSkillLevel(psaSkill, 0);
        this.characterService.log(`**Soft Path Benefit**: Gained ${psaSkill} 0 (PSA).`);
      }

      // 2. Gravity Mods (Rule 209)
      if (char.homeworld) {
        const code = char.homeworld.gravityCode; // Keep for Heavy-Worlder Reroll
        const g = char.homeworld.gravity;

        // Reset mods first (handled by RESET_ORIGIN_MODS in save(), but ensuring clean state here)
        chars.str.gravityMod = 0;
        chars.dex.gravityMod = 0;
        chars.end.gravityMod = 0;

        if (g < 0.1) {
          // Zero-gravity
          chars.str.gravityMod = -2;
          chars.dex.gravityMod = 2;
          chars.end.gravityMod = -2;
          this.characterService.log('**Gravity Mod (Zero-G)**: STR -2, DEX +2, END -2');
        } else if (g < 0.21) {
          // Light
          chars.str.gravityMod = -1;
          chars.dex.gravityMod = 1;
          chars.end.gravityMod = -1;
          this.characterService.log('**Gravity Mod (Light)**: STR -1, DEX +1, END -1');
        } else if (g >= 2.0 && g < 3.0) {
          // Heavy
          chars.str.gravityMod = 1;
          chars.dex.gravityMod = -1;
          chars.end.gravityMod = 1;
          this.characterService.log('**Gravity Mod (Heavy)**: STR +1, DEX -1, END +1');
        } else if (g >= 3.0) {
          // Extreme
          chars.str.gravityMod = 2;
          chars.dex.gravityMod = -2;
          chars.end.gravityMod = 2;
          this.characterService.log('**Gravity Mod (Extreme)**: STR +2, DEX -2, END +2');
        }

        // 3. Heavy-Worlder Reroll (STR/END if < 10)
        if (char.species === 'Human (Heavy-Worlder)' && (code === 'High' || code === 'Extreme')) {
          if (chars.str.value < 10) {
            const newStr = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
            if (newStr > chars.str.value) {
              this.characterService.log(`**Heavy-Worlder Reroll**: STR ${chars.str.value} -> ${newStr}`);
              chars.str.value = newStr;
            }
          }
          if (chars.end.value < 10) {
            const newEnd = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
            if (newEnd > chars.end.value) {
              this.characterService.log(`**Heavy-Worlder Reroll**: END ${chars.end.value} -> ${newEnd}`);
              chars.end.value = newEnd;
            }
          }
        }
      }

      // 4. Elite Nationality Bonus (Tier 1/Corp + SOC 9+)
      const nat = this.nationalities.find(n => n.name === char.nationality);
      if (nat && nat.tier === 1 && chars.soc.value >= 9) {
          this.characterService.ensureSkillLevel('Gun Combat (Slug)', 0);
          this.characterService.log('**Elite Nationality Bonus**: Gained Gun Combat (Slug) 0 (SOC 9+)');
      }

      this.characterService.updateCharacteristics(chars);
  }

  private calculateBackgroundSkillCount() {
      const char = this.characterService.character();
      const edu = char.characteristics.edu.value + char.characteristics.edu.modifier;
      const eduDm = this.diceService.getModifier(edu);

      if (this.selectedOriginType === 'Frontier') {
          // Rule 223: 3 + EDU DM
          this.backgroundSkillsCount = 3 + eduDm;
      } else if (this.selectedOriginType === 'Spacer') {
          // Rule 281: 4 + EDU DM
          this.backgroundSkillsCount = 4 + eduDm;
      } else {
          // Rule 176 (Implicit): Tier-based for Core
          const nat = this.nationalities.find(n => n.name === char.nationality);
          const tier = nat ? nat.tier : 3;
          let baseCount = 3;
          if (tier <= 2) baseCount = 4;
          else if (tier === 3) baseCount = 3;
          else if (tier === 4) baseCount = 2;
          else baseCount = 1;
          this.backgroundSkillsCount = baseCount + eduDm;
      }

      if (this.backgroundSkillsCount < 1) this.backgroundSkillsCount = 1;
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
