import { Injectable, computed, signal } from '@angular/core';
import { Character, INITIAL_CHARACTER } from '../models/character.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  // Using Signals for reactive state
  private characterSignal = signal<Character>(JSON.parse(JSON.stringify(INITIAL_CHARACTER)));

  readonly character = this.characterSignal.asReadonly();

  readonly pension = computed(() => {
    const char = this.character();
    const terms = char.careerHistory.length;
    if (terms < 5) return 0;
    return (terms - 3) * 2000;
  });

  readonly totalRolls = computed(() => {
    const history = this.character().careerHistory;
    let rolls = history.length;
    const lastTerm = history[history.length - 1];
    if (lastTerm) {
      if (lastTerm.rank >= 1 && lastTerm.rank <= 2) rolls += 1;
      if (lastTerm.rank >= 3 && lastTerm.rank <= 4) rolls += 2;
      if (lastTerm.rank >= 5) rolls += 3;
    }
    return rolls;
  });

  constructor(private storage: StorageService) {
    // Try to load auto-save
    const saved = this.storage.load<Character>('autosave');
    if (saved) {
      this.characterSignal.set(saved);
    }
  }

  log(message: string) {
    this.characterSignal.update((current) => {
      const history = [...(current.history || []), message];
      const updated = { ...current, history };
      this.storage.save('autosave', updated);
      return updated;
    });
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
      // Detailed logging for stats
      const diffs: string[] = [];
      Object.keys(chars).forEach(k => {
        const key = k as keyof typeof chars;
        if (chars[key].value !== current.characteristics[key].value) {
          diffs.push(`${key.toUpperCase()} ${current.characteristics[key].value} -> ${chars[key].value}`);
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

  addSkill(skillName: string, levelToAdd: number = 1) {
    this.characterSignal.update((current: Character) => {
      const skills = [...current.skills];
      const existing = skills.find(s => s.name === skillName);

      let msg = '';

      if (existing) {
        if (levelToAdd === 0) {
          // Basic Training: If you already have it (even at 0), do nothing.
          return current;
        }
        // Upgrade: If has 0 and adds 1, becomes 1.
        const oldLevel = existing.level;
        let newLevel = oldLevel;

        if (existing.level === 0 && levelToAdd === 1) {
          existing.level = 1;
          newLevel = 1;
        } else {
          // Standard increase
          existing.level += levelToAdd;
          newLevel = existing.level;
        }
        msg = `Skill Increased: ${skillName} ${oldLevel} -> ${newLevel}`;
      } else {
        skills.push({ name: skillName, level: levelToAdd });
        msg = `Skill Added: ${skillName} ${levelToAdd}`;
      }

      const history = [...(current.history || []), msg];
      const updated = { ...current, skills, history };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  getSkillLevel(skillName: string): number {
    const s = this.character().skills.find(sk => sk.name === skillName);
    return s ? s.level : -3;
  }

  ensureSkillLevel(skillName: string, minLevel: number) {
    console.log(`[CharacterService] ensureSkillLevel: ${skillName} min ${minLevel}`);
    this.characterSignal.update((current) => {
      const skills = [...current.skills];
      const index = skills.findIndex(s => s.name === skillName);
      let msg = '';

      if (index !== -1) {
        const existing = skills[index];
        if (existing.level < minLevel) {
          const old = existing.level;
          // Clone to avoid mutation of previous state
          skills[index] = { ...existing, level: minLevel };
          msg = `Skill Raised (Rank Bonus): ${skillName} ${old} -> ${minLevel}`;
          console.log(msg);
        } else {
          console.log(`[CharacterService] Skill ${skillName} already at ${existing.level} >= ${minLevel}`);
          return current; // No change needed
        }
      } else {
        skills.push({ name: skillName, level: minLevel });
        msg = `Skill Added (Rank Bonus): ${skillName} ${minLevel}`;
        console.log(msg);
      }

      const history = [...(current.history || []), msg];
      const updated = { ...current, skills, history };
      this.storage.save('autosave', updated);
      return updated;
    });
  }

  reset() {
    this.characterSignal.set(JSON.parse(JSON.stringify(INITIAL_CHARACTER)));
    this.storage.remove('autosave');
  }
}
