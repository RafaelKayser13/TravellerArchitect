import { Injectable, signal } from '@angular/core';
import { NPC, NpcType } from '../models/career.model';

export interface NpcRequest {
  npc: Partial<NPC>;
  resolve: (npc: NPC) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NpcInteractionService {
  request = signal<NpcRequest | null>(null);

  /**
   * Prompts the user to detail and name an NPC.
   * Returns a promise with the finalized NPC data.
   */
  promptForNpc(npcData: Partial<NPC>): Promise<NPC> {
    return new Promise(resolve => {
      this.request.set({
        npc: {
          id: crypto.randomUUID(),
          name: '',
          type: 'contact',
          origin: 'Event',
          notes: '',
          ...npcData
        },
        resolve
      });
    });
  }

  complete(finalNpc: NPC) {
    const req = this.request();
    if (req) {
      req.resolve(finalNpc);
      this.request.set(null);
    }
  }

  cancel() {
    this.request.set(null);
  }
}
