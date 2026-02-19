import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';

interface SpeciesOption {
  id: string;
  name: string;
  description: string;
  bonuses: string[];
  penalties: string[];
  traits: string[];
  restrictions?: {
    originTypes?: string[];
    nationalities?: string[];
    environments?: string[];
  };
}

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-species',
  standalone: true,
  imports: [CommonModule, StepHeaderComponent],
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss']
})
export class SpeciesComponent {
  @Output() complete = new EventEmitter<void>();
  protected characterService = inject(CharacterService);
  protected diceService = inject(DiceService);

  speciesOptions: SpeciesOption[] = [
    {
      id: 'human-standard',
      name: 'Human (Standard)',
      description: 'The baseline human archetype, most common in Core Worlds and stable colonies.',
      bonuses: ['No characteristic penalties'],
      penalties: ['No specialized environmental bonuses'],
      traits: ['Standard Biology']
    },
    {
      id: 'human-spacer',
      name: 'Human (Spacer)',
      description: 'Humans born and raised in low-gravity stations or zero-G habitats.',
      bonuses: ['Dexterity +1', 'Vacc Suit skill level 0 guaranteed'],
      penalties: ['Strength -1', 'Endurance -1'],
      traits: ['Zero-G Adaptation', 'Zhargon Language +1'],
      restrictions: {
        originTypes: ['Spacer'],
        environments: ['Space', 'Low-G']
      }
    },
    {
      id: 'human-heavy',
      name: 'Human (Heavy-Worlder)',
      description: 'Genetically modified (King Ultra) or naturally adapted to high-gravity environments.',
      bonuses: ['Strength +1D6', 'Endurance +1D6'],
      penalties: ['Dexterity -2', 'Requires respirator in standard/thin atmospheres'],
      traits: ['King Ultra DNAM', 'Enhanced Muscle Density'],
      restrictions: {
        originTypes: ['Frontier'],
        environments: ['Heavy'],
        nationalities: ['United States', 'Australia', 'Manchuria', 'Texas', 'Inca Republic', 'Trilon Corp']
      }
    },
    {
      id: 'human-cold',
      name: 'Human (Cold-Adapted)',
      description: 'Adapted to arctic or sub-zero frontier worlds.',
      bonuses: ['Survival (Cold) +2'],
      penalties: ['Vulnerability to high heat'],
      traits: ['Cold Adaptation DNAM'],
      restrictions: {
        originTypes: ['Frontier'],
        environments: ['Cold']
      }
    },
    {
      id: 'human-dry',
      name: 'Human (Dry-Worlder)',
      description: 'Adapted to desert or water-scarce environments.',
      bonuses: ['Water Retention efficiency'],
      penalties: ['Lower humidity tolerance'],
      traits: ['Dry World DNAM'],
      restrictions: {
        originTypes: ['Frontier'],
        environments: ['Dry']
      }
    }
  ];

  selectedId: string | null = null;

  constructor() {
    const char = this.characterService.character();
    // Only restore selection if species was previously chosen
    if (char.species) {
      this.selectedId = char.species === 'Human' ? 'human-standard' :
        this.speciesOptions.find(o => o.name === char.species)?.id || null;
    }
  }

  select(option: SpeciesOption) {
    this.selectedId = option.id;
    this.save();
  }

  save() {
    const selected = this.speciesOptions.find(o => o.id === this.selectedId);
    if (selected) {
      this.characterService.updateCharacter({
        species: selected.name,
        isSoftPath: ['human-heavy', 'human-cold', 'human-dry'].includes(this.selectedId || '')
      });

      // Apply Stat Mods
      const char = this.characterService.character();
      const chars = { ...char.characteristics };

      // Reset existing genetic mods from species
      ['str', 'dex', 'end', 'int', 'edu', 'soc'].forEach(k => {
        const key = k as keyof typeof chars;
        chars[key].geneticMod = 0;
      });

      if (this.selectedId === 'human-spacer') {
        chars.dex.geneticMod = 1;
        chars.str.geneticMod = -1;
        chars.end.geneticMod = -1;
      } else if (this.selectedId === 'human-heavy') {
        // King Ultra: STR +1D, END +1D, DEX -2
        chars.str.geneticMod = Math.floor(Math.random() * 6) + 1;
        chars.end.geneticMod = Math.floor(Math.random() * 6) + 1;
        chars.dex.geneticMod = -2;
      }

      this.characterService.updateCharacteristics(chars);
    }
  }

  finish() {
    if (this.selectedId) {
      this.save();
      this.complete.emit();
    }
  }
}
