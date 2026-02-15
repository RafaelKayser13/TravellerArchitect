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

  readonly pension = computed(() => {
    const char = this.character();

    // Group history by career
    const careerTerms: { [name: string]: number } = {};
    char.careerHistory.forEach(term => {
      careerTerms[term.careerName] = (careerTerms[term.careerName] || 0) + 1;
    });

    let totalPension = 0;
    const EXCLUDED_CAREERS = ['Scout', 'Rogue', 'Drifter', 'Spaceborne', 'Prisoner'];

    Object.keys(careerTerms).forEach(name => {
      if (EXCLUDED_CAREERS.includes(name)) return;
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
    this.characterSignal.update((current: Character) => {
      const updated = { ...current, ...partial };
      // Auto-log specific changes if not explicitly logged? 
      // Ideally caller logs semantic events, but we can detect changes here if strictly needed.
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  updateCharacteristics(chars: Character['characteristics']) {
    this.characterSignal.update((current: Character) => {
      const updated = { ...current, characteristics: chars };
      // Log stat changes with descriptive markdown
      const diffs: string[] = [];
      Object.keys(chars).forEach(k => {
        const key = k as keyof typeof chars;
        if (chars[key].value !== current.characteristics[key].value) {
          const diff = chars[key].value - current.characteristics[key].value;
          const sign = diff > 0 ? '+' : '';
          diffs.push(`**Stat Change**: ${key.toUpperCase()} ${current.characteristics[key].value} → ${chars[key].value} (${sign}${diff})`);
        }
      });
      if (diffs.length > 0) {
        const history = [...(current.history || []), ...diffs];
        updated.history = history;
      }

      this.storage.save('autosave', updated);
      return updated;
    });
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
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        npcs: [...current.npcs, npc],
        history: [...(current.history || []), `**NPC Gained**: ${npc.name} (${npc.type}) - ${npc.origin}`]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
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
    this.characterSignal.update(current => {
      const npc = current.npcs.find(n => n.id === id);
      const updated = {
        ...current,
        npcs: current.npcs.filter(n => n.id !== id),
        history: npc ? [...(current.history || []), `**NPC Removed**: ${npc.name} (${npc.type})`] : current.history
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  // --- DM Tracking ---

  updateDm(type: 'qualification' | 'survival' | 'advancement' | 'benefit', value: number) {
    this.characterSignal.update(current => {
      const updated = { ...current };
      if (type === 'qualification') updated.nextQualificationDm = (updated.nextQualificationDm || 0) + value;
      if (type === 'survival') updated.nextSurvivalDm = (updated.nextSurvivalDm || 0) + value;
      if (type === 'advancement') updated.nextAdvancementDm = (updated.nextAdvancementDm || 0) + value;
      if (type === 'benefit') updated.nextBenefitDm = (updated.nextBenefitDm || 0) + value;

      const updatedWithHistory = {
        ...updated,
        history: [...(current.history || []), `**DM Bonus**: ${value >= 0 ? '+' : ''}${value} to next ${type} roll`]
      };
      this.storage.save('autosave', updatedWithHistory);
      return updatedWithHistory;
    });
  }

  // --- Education & Special Flags ---

  setPsionicPotential(value: boolean) {
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        psionicPotential: value,
        history: [...(current.history || []), value ? '**Psionic Potential Detected**: Character is now eligible for Psion career.' : 'Psionic potential removed.']
      };
      this.storage.save('autosave', updated);
      return updated;
    });
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
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        forcedCareer: careerName,
        history: [...(current.history || []), `**Next Career Forced**: ${careerName}`]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  clearForcedCareer() {
    this.characterSignal.update(current => {
      const updated = { ...current, forcedCareer: '' };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  ejectFromCareer(careerName: string) {
    this.characterSignal.update(current => {
      const ejected = [...(current.ejectedCareers || [])];
      if (!ejected.includes(careerName)) {
        ejected.push(careerName);
      }
      const updated = { 
        ...current, 
        ejectedCareers: ejected,
        history: [...(current.history || []), `**EJECTED**: Character was ejected from the ${careerName} career.`]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  clearEjectedCareers() {
    this.characterSignal.update(current => {
      const updated = { ...current, ejectedCareers: [] };
      this.storage.save('autosave', updated);
      return updated;
    });
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
    this.characterSignal.update(current => {
      const updated = {
        ...current,
        history: [...(current.history || []), message]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  addInjury(injuryName: string, stat?: string, reduction: number = 0, cost: number = 0) {
    this.characterSignal.update(current => {
      const injury = {
        id: Math.random().toString(36).substr(2, 9),
        name: injuryName,
        stat: stat || 'STR',
        reduction: reduction,
        cost: cost,
        treated: false
      };
      const updated = {
        ...current,
        injuries: [...(current.injuries || []), injury]
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  addBenefitRoll(careerName: string, count: number = 1) {
    this.characterSignal.update(current => {
      const allocated = { ...(current.finances.benefitRollsAllocated || {}) };
      allocated[careerName] = (allocated[careerName] || 0) + count;

      const updated = {
        ...current,
        finances: {
          ...current.finances,
          benefitRollsAllocated: allocated
        }
      };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  spendBenefitRoll(careerName?: string, count: number = 1, isCash: boolean = false) {
    this.characterSignal.update(current => {
      const finances = { ...current.finances };

      if (isCash) {
        finances.cashRollsSpent = (finances.cashRollsSpent || 0) + count;
      }

      if (careerName && finances.benefitRollsAllocated && finances.benefitRollsAllocated[careerName]) {
        finances.benefitRollsAllocated = { ...finances.benefitRollsAllocated };
        finances.benefitRollsAllocated[careerName] -= count;
        if (finances.benefitRollsAllocated[careerName] < 0) finances.benefitRollsAllocated[careerName] = 0;
      } else {
        // Fallback or general spend
        finances.benefitRollsSpent = (finances.benefitRollsSpent || 0) + count;
      }

      const updated = { ...current, finances };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  finalizeCharacter() {
    this.characterSignal.update(current => {
      const char = current;
      let pension = 0;
      
      // 2300AD: Standard Pension (Military Rank 4+ or 20+ years service)
      const careerHistory = char.careerHistory || [];
      const totalTerms = careerHistory.length;
      const highestMilitaryRank = Math.max(...careerHistory.filter(h => ['Army', 'Navy', 'Marine', 'Agent'].includes(h.careerName)).map(h => h.rank), 0);
      
      if (highestMilitaryRank >= 4 || totalTerms >= 5) {
          // Standard pension logic (simplified for 2300AD summary)
          pension = 10000 + (totalTerms * 2000);
      }
      
      // 2300AD: Ship Share Dividends - Lv 1,000 per year per share
      const shipShares = char.finances.shipShares || 0;
      const dividends = shipShares * 1000;
      
      const totalPension = pension + dividends;
      
      const updated = {
        ...current,
        finances: {
          ...current.finances,
          pension: totalPension
        },
        isFinished: true
      };
      
      this.log(`## character Finalized`);
      if (pension > 0) this.log(`- Pension: Lv ${pension.toLocaleString()} / year`);
      if (dividends > 0) this.log(`- Ship Share Dividends: Lv ${dividends.toLocaleString()} / year`);
      this.log(`- Total Annual Income: Lv ${totalPension.toLocaleString()}`);
      
      this.storage.save('autosave', updated);
      return updated;
    });
  }
}
