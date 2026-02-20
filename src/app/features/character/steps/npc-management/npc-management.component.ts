import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { NpcInteractionService } from '../../../../core/services/npc-interaction.service';
import { NPC } from '../../../../core/models/career.model';
import { WizardFlowService } from '../../../../core/services/wizard-flow.service';
import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-npc-management',
  standalone: true,
  imports: [CommonModule, FormsModule, StepHeaderComponent],
  templateUrl: './npc-management.component.html',
  styleUrls: ['./npc-management.component.scss']
})
export class NpcManagementComponent implements OnInit, OnDestroy {
  protected characterService = inject(CharacterService);
  protected npcService = inject(NpcInteractionService);
  private wizardFlow = inject(WizardFlowService);
  
  characters = this.characterService.character;

  ngOnInit(): void {
    this.wizardFlow.registerValidator(8, () => this.isValid());
    this.wizardFlow.registerFinishAction(8, () => this.finish());
  }

  ngOnDestroy(): void {
    this.wizardFlow.unregisterStep(8);
  }
  
  async editNpc(npc: NPC) {
    const updatedNpc = await this.npcService.promptForNpc(npc);
    if (updatedNpc) {
      const char = this.characterService.character();
      const updatedNpcs = char.npcs.map(n => 
        n.id === npc.id ? updatedNpc : n
      );
      this.characterService.updateCharacter({ npcs: updatedNpcs });
    }
  }

  removeNpc(id: string) {
    // We could add a confirmation dialog here too!
    this.characterService.removeNpc(id);
  }

  isValid() {
    return true; // Always valid to proceed, even with no NPCs
  }

  finish() {
    this.wizardFlow.advance();
  }
}
