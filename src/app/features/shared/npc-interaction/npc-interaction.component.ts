import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NpcInteractionService } from '../../../core/services/npc-interaction.service';
import { NPC } from '../../../core/models/career.model';
import { getRandomName } from '../../../data/random-names';
import { getRandomNpcRole, getRandomNpcQuirk, NPC_NATURES } from '../../../data/npc-tables';
import { HudWindowComponent } from '../hud-window/hud-window.component';

@Component({
  selector: 'app-npc-interaction',
  standalone: true,
  imports: [CommonModule, FormsModule, HudWindowComponent],
  templateUrl: './npc-interaction.component.html',
  styleUrls: ['./npc-interaction.component.scss']
})
export class NpcInteractionComponent {
  protected npcService = inject(NpcInteractionService);
  
  request = computed(() => this.npcService.request());
  Math = Math;

  tempNpc: Partial<NPC> = {};

  constructor() {
    // Sync temp NPC when request changes
    effect(() => {
      const req = this.npcService.request();
      if (req) {
        // Untracked so we execute only when req changes, not internally
        this.tempNpc = { ...req.npc };
        if (!this.tempNpc.name) {
          this.tempNpc.name = getRandomName();
        }
      }
    });
  }

  randomizeName() {
    this.tempNpc.name = getRandomName();
  }

  randomizeDetails() {
    this.tempNpc.role = getRandomNpcRole();
    this.tempNpc.quirk = getRandomNpcQuirk();
    const natureRoll = Math.floor(Math.random() * 6) + 1;
    this.tempNpc.nature = NPC_NATURES[natureRoll];
    
    // Append to notes if they are empty
    if (!this.tempNpc.notes) {
      this.tempNpc.notes = `A ${this.tempNpc.role} who is ${this.tempNpc.quirk}.`;
    }
  }

  save() {
    if (this.tempNpc.name) {
      this.npcService.complete(this.tempNpc as NPC);
    }
  }

  cancel() {
    this.npcService.cancel();
  }
}
