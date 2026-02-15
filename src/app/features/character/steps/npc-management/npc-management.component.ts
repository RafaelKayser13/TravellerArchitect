import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { NPC } from '../../../../core/models/career.model';
import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-npc-management',
  standalone: true,
  imports: [CommonModule, FormsModule, StepHeaderComponent],
  templateUrl: './npc-management.component.html',
  styleUrls: ['./npc-management.component.scss']
})
export class NpcManagementComponent {
  protected characterService = inject(CharacterService);
  
  characters = this.characterService.character;
  
  editingNpcId = signal<string | null>(null);
  editName = '';
  editNotes = '';

  startEdit(npc: NPC) {
    this.editingNpcId.set(npc.id);
    this.editName = npc.name;
    this.editNotes = npc.notes || '';
  }

  saveEdit() {
    const id = this.editingNpcId();
    if (!id) return;

    const char = this.characterService.character();
    const updatedNpcs = char.npcs.map(n => 
      n.id === id ? { ...n, name: this.editName, notes: this.editNotes } : n
    );

    this.characterService.updateCharacter({ npcs: updatedNpcs });
    this.editingNpcId.set(null);
  }

  cancelEdit() {
    this.editingNpcId.set(null);
  }

  removeNpc(id: string) {
    this.characterService.removeNpc(id);
  }

  isValid() {
    return true; // Always valid to proceed, even with no NPCs
  }

  finish() {
    // No specific logic needed, wizard will advance
  }
}
