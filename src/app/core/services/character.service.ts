import { Injectable, computed, signal } from '@angular/core';
import { Character, INITIAL_CHARACTER } from '../models/character.model';
import { NPC, NpcType } from '../models/career.model';
import { StorageService } from './storage.service';
import { SkillService } from './skill.service';
import { Skill } from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  // Using Signals for reactive state
  private characterSignal = signal<Character>(JSON.parse(JSON.stringify(INITIAL_CHARACTER)));

  readonly character = this.characterSignal.asReadonly();
  public currentCareer = signal<string | null>(null);

  private patch(partial: Partial<Character>, historyEntry?: string) {
    this.characterSignal.update(c => {
      const next = { ...c, ...partial };
      if (historyEntry) {
        next.history = [...(next.history || []), historyEntry];
      }
      this.storage.save('autosave', next);
      return next;
    });
  }


  readonly pension = computed(() => {
    const char = this.character();

    // Group history by career
    const careerTerms: { [name: string]: number } = {};
    char.careerHistory.forEach(term => {
      careerTerms[term.careerName] = (careerTerms[term.careerName] || 0) + 1;
    });

    let totalPension = 0;
    const EXCLUDED_CAREERS = ['scout', 'rogue', 'drifter', 'spaceborne', 'prisoner'];

    Object.keys(careerTerms).forEach(name => {
      // Normalize check
      if (EXCLUDED_CAREERS.includes(name.toLowerCase())) return;
      const terms = careerTerms[name];
      if (terms >= 5) {
        let amount = 0;
        if (terms === 5) amount = 10000;
        else if (terms === 6) amount = 12000;
        else if (terms === 7) amount = 14000;
        else if (terms >= 8) {
          amount = 16000 + (terms - 8) * 2000;
        }
        totalPension += amount;
      }
    });

    // 2300AD Spec: Ship Share Dividends (Lv 1,000 per year per share)
    const shares = char.finances.shipShares || 0;
    if (shares > 0) {
        totalPension += (shares * 1000);
    }

    return totalPension;
  });

  readonly totalRolls = computed(() => {
    const allocated = this.character().finances.benefitRollsAllocated || {};
    return Object.values(allocated).reduce((a, b) => a + b, 0);
  });

  constructor(
    private storage: StorageService,
    private skillService: SkillService
  ) {
    // Try to load auto-save
    const saved = this.storage.load<Character>('autosave');
    if (saved) {
      this.characterSignal.set(saved);
    }
  }

  updateCharacter(partial: Partial<Character>) {
    this.patch(partial);
  }

  updateCharacteristics(chars: Character['characteristics']) {
    const diffs: string[] = [];
    const currentChars = this.character().characteristics;
    Object.keys(chars).forEach(k => {
      const key = k as keyof typeof chars;
      if (chars[key].value !== currentChars[key].value) {
        const diff = chars[key].value - currentChars[key].value;
        const sign = diff > 0 ? '+' : '';
        diffs.push(`**Stat Change**: ${key.toUpperCase()} ${currentChars[key].value} → ${chars[key].value} (${sign}${diff})`);
      }
    });
    this.patch({ characteristics: chars }, diffs.length > 0 ? diffs.join(', ') : undefined);
  }

  modifyStat(stat: string, amount: number) {
    const char = this.character();
    const key = stat.toLowerCase() as keyof typeof char.characteristics;
    if (!char.characteristics[key]) {
      console.warn(`Stat ${stat} not found on character.`);
      return;
    }
    const current = char.characteristics[key];
    const newValue = Math.max(1, current.value + amount);
    const updatedChars = { 
      ...char.characteristics, 
      [key]: { ...current, value: newValue } 
    };
    
    const sign = amount >= 0 ? '+' : '';
    this.patch({ characteristics: updatedChars }, `**Stat Adjusted**: ${stat.toUpperCase()} ${current.value} → ${newValue} (${sign}${amount})`);
  }

addSkill(skillName: string, levelToAdd: number = 1, isFirstTermBasicTraining: boolean = false): boolean {
    let choiceRequired = false;

    this.characterSignal.update((current: Character) => {
        const { skills, message, choiceRequired: needsChoice } = this.skillService.processSkillAward(
            current.skills,
            skillName,
            levelToAdd === 1 ? undefined : levelToAdd, // 1 is default increase
            isFirstTermBasicTraining
        );

        choiceRequired = needsChoice;

        const history = [...(current.history || []), message];
        const updated = { ...current, skills, history };

        // Global Skill Cap Check (Informative log for now)
        if (this.skillService.isOverCap(updated.skills, updated.characteristics.int.value, updated.characteristics.edu.value)) {
            updated.history.push(`**WARNING**: Character has exceeded the global skill cap of ${this.skillService.calculateSkillCap(updated.characteristics.int.value, updated.characteristics.edu.value)} levels.`);
        }

        this.storage.save('autosave', updated);
        return updated;
    });

    return choiceRequired;
  }

  getSkillLevel(skillName: string): number {
    const s = this.character().skills.find(sk => sk.name === skillName);
    return s ? s.level : -3;
  }

  ensureSkillLevel(skillName: string, minLevel: number) {
    this.characterSignal.update((current) => {
        const { skills, message } = this.skillService.processSkillAward(
            current.skills,
            skillName,
            minLevel
        );

        const history = [...(current.history || []), message];
        const updated = { ...current, skills, history };

        this.storage.save('autosave', updated);
        return updated;
    });
}

  reset() {
    this.characterSignal.set(JSON.parse(JSON.stringify(INITIAL_CHARACTER)));
    this.storage.remove('autosave');
  }

  // --- NPC Management ---

  addNpc(npc: NPC) {
    this.patch({ npcs: [...this.character().npcs, npc] }, `**NPC Gained**: ${npc.name} (${npc.type}) - ${npc.origin}`);
  }

  convertNpc(fromId: string, toType: NpcType) {
    this.characterSignal.update(current => {
      const npcs = [...current.npcs];
      const index = npcs.findIndex(n => n.id === fromId);
      if (index === -1) return current;

      const npc = { ...npcs[index], type: toType };
      npcs[index] = npc;

      const updated = {
        ...current,
        npcs,
        history: [...(current.history || []), `**NPC Changed**: ${npc.name} is now a ${toType}`]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  convertNpcType(fromType: NpcType, toType: NpcType) {
    this.characterSignal.update(current => {
      const npcs = [...current.npcs];
      const index = npcs.findIndex(n => n.type === fromType);

      if (index === -1) {
        // If no NPC of fromType found, do nothing (or we could gain a new one of toType)
        return current;
      }

      const npc = { ...npcs[index], type: toType };
      npcs[index] = npc;

      const updated = {
        ...current,
        npcs,
        history: [...(current.history || []), `**NPC Betrayal**: ${npc.name} converted from ${fromType} to ${toType}`]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  removeNpc(id: string) {
    const npc = this.character().npcs.find(n => n.id === id);
    this.patch({ npcs: this.character().npcs.filter(n => n.id !== id) }, npc ? `**NPC Removed**: ${npc.name} (${npc.type})` : undefined);
  }

  // --- DM Tracking ---

  updateDm(type: 'qualification' | 'survival' | 'advancement' | 'benefit', value: number) {
    const updated: any = {};
    if (type === 'qualification') updated.nextQualificationDm = (this.character().nextQualificationDm || 0) + value;
    if (type === 'survival') updated.nextSurvivalDm = (this.character().nextSurvivalDm || 0) + value;
    if (type === 'advancement') updated.nextAdvancementDm = (this.character().nextAdvancementDm || 0) + value;
    if (type === 'benefit') updated.nextBenefitDm = (this.character().nextBenefitDm || 0) + value;

    this.patch(updated, `**DM Bonus**: ${value >= 0 ? '+' : ''}${value} to next ${type} roll`);
  }


  // --- Education & Special Flags ---

  setPsionicPotential(value: boolean) {
    this.patch({ psionicPotential: value }, value ? '**Psionic Potential Detected**: Character is now eligible for Psion career.' : 'Psionic potential removed.');
  }

  setEducationStatus(success: boolean, graduated: boolean = true) {
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        education: {
          ...current.education,
          fail: !success,
          graduated: graduated
        }
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  updateFinances(update: Partial<import('../models/character.model').Finances>) {
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        finances: { ...current.finances, ...update }
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  setNextCareer(careerName: string) {
    this.patch({ forcedCareer: careerName }, `**Next Career Forced**: ${careerName}`);
  }

  promote(careerName?: string) {
    const history = [...this.character().careerHistory];
    let index = -1;
    if (careerName) {
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].careerName === careerName) {
          index = i;
          break;
        }
      }
    } else {
      index = history.length - 1;
    }

    if (index !== -1) {
      const term = history[index];
      if (term.rank < 6) {
        history[index] = { ...term, rank: term.rank + 1 };
        this.patch({ careerHistory: history }, `**Promotion**: Promoted to rank ${term.rank + 1} in ${term.careerName}.`);
      }
    }
  }

  clearForcedCareer() {
    this.characterSignal.update(current => {
      const updated = { ...current, forcedCareer: '' };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  ejectCareer(careerName: string) {
    const ejected = [...(this.character().ejectedCareers || [])];
    if (!ejected.includes(careerName)) ejected.push(careerName);
    this.patch({ ejectedCareers: ejected }, `**EJECTED**: Character was ejected from the ${careerName} career.`);
  }

  clearEjectedCareers() {
    this.patch({ ejectedCareers: [] });
  }

  clearCareerCashHistory(careerName: string) {
    this.characterSignal.update(current => {
      const updatedHistory = current.careerHistory.map(term => {
        if (term.careerName === careerName) {
          return { ...term, loseCashBenefits: true };
        }
        return term;
      });
      const updated = { ...current, careerHistory: updatedHistory };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  setGambler(value: boolean) {
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        finances: {
          ...current.finances,
          isGambler: value
        }
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  // --- Logging ---

  log(message: string) {
    this.patch({}, message);
  }

  addInjury(injuryName: string, stat?: string, reduction: number = 0, cost: number = 0) {
    const injury = {
      id: Math.random().toString(36).substr(2, 9),
      name: injuryName,
      stat: stat || 'STR',
      reduction: reduction,
      cost: cost,
      treated: false
    };
    this.patch({ injuries: [...(this.character().injuries || []), injury] });
  }

  addBenefitRoll(careerName: string, count: number = 1) {
    const allocated = { ...(this.character().finances.benefitRollsAllocated || {}) };
    allocated[careerName] = (allocated[careerName] || 0) + count;
    this.patch({ finances: { ...this.character().finances, benefitRollsAllocated: allocated } });
  }

  spendBenefitRoll(careerName?: string, count: number = 1, isCash: boolean = false) {
    const finances = { ...this.character().finances };
    if (isCash) finances.cashRollsSpent = (finances.cashRollsSpent || 0) + count;

    if (careerName && finances.benefitRollsAllocated && finances.benefitRollsAllocated[careerName]) {
      finances.benefitRollsAllocated = { ...finances.benefitRollsAllocated };
      finances.benefitRollsAllocated[careerName] -= count;
      if (finances.benefitRollsAllocated[careerName] < 0) finances.benefitRollsAllocated[careerName] = 0;
    } else {
      finances.benefitRollsSpent = (finances.benefitRollsSpent || 0) + count;
    }
    this.patch({ finances });
  }

  finalizeCharacter() {
    const char = this.character();
    let pension = 0;
    
    // 2300AD: Standard Pension (Military Rank 4+ or 20+ years service)
    const careerHistory = char.careerHistory || [];
    const totalTerms = careerHistory.length;
    const militaryCareers = ['army', 'navy', 'marine', 'agent'];
    const highestMilitaryRank = Math.max(...careerHistory.filter(h => militaryCareers.includes(h.careerName.toLowerCase())).map(h => h.rank), 0);
    
    if (highestMilitaryRank >= 4 || totalTerms >= 5) {
        pension = 10000 + (totalTerms * 2000);
    }
    
    const shipShares = char.finances.shipShares || 0;
    const dividends = shipShares * 1000;
    const totalPension = pension + dividends;
    
    const history = [];
    history.push(`**Character Finalized**: Total Pension & Dividends: Lv ${totalPension.toLocaleString()} per year.`);
    if (pension > 0) history.push(`- Pension: Lv ${pension.toLocaleString()} / year`);
    if (dividends > 0) history.push(`- Ship Share Dividends: Lv ${dividends.toLocaleString()} / year`);

    this.patch({
      finances: { ...char.finances, pension: totalPension },
      isFinished: true
    }, history.join('\n'));
  }

  setNeuralJackInstalled(value: boolean) {
    this.patch({ hasNeuralJack: value }, value ? '**Neural Jack Installed**: Interface active.' : 'Neural Jack removed.');
  }

  addItem(item: string) {
    this.patch({ equipment: [...(this.character().equipment || []), item] }, `**Item Gained**: ${item}`);
  }

  addTrait(trait: string) {
    this.patch({ traits: [...(this.character().traits || []), trait] }, `**Trait Gained**: ${trait}`);
  }
}
