import { EffectHandler, HandlerContext } from './effect-handler.interface';
import { EventEffect } from '../../models/game-event.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ResourceEffectHandler implements EffectHandler {
    private handledTypes = new Set(['ADD_ITEM', 'RESOURCE_MOD', 'ADD_NPC']);

    canHandle(type: string): boolean {
        return this.handledTypes.has(type);
    }

    async handle(effect: EventEffect, ctx: HandlerContext): Promise<void> {
        switch (effect.type) {
            case 'ADD_ITEM':
                if (effect.value) {
                    ctx.characterService.addItem(effect.value);
                }
                break;
            case 'RESOURCE_MOD':
                if (effect.target === 'benefit_rolls') {
                    if (effect.value > 0) {
                        ctx.characterService.addBenefitRoll('General', effect.value);
                    } else {
                        ctx.characterService.spendBenefitRoll(undefined, Math.abs(effect.value));
                    }
                } else if (effect.target === 'next_qualification_dm') {
                    ctx.characterService.updateDm('qualification', effect.value);
                } else if (effect.target === 'next_advancement_dm') {
                    ctx.characterService.updateDm('advancement', effect.value);
                } else if (effect.target === 'shipShares') {
                    const current = ctx.characterService.character().finances.shipShares || 0;
                    ctx.characterService.updateFinances({ shipShares: current + effect.value });
                    ctx.characterService.log(`**Benefit Gained**: +${effect.value} Ship Share(s).`);
                }
                break;
            case 'ADD_NPC':
                if (effect.value) {
                    const npcData = effect.value;
                    const countStr = npcData.count || '1';
                    // Handle "d3" or "1d3" which check supports
                    const count = ctx.eventEngine.rollValue(countStr);
                    
                    for (let i = 0; i < count; i++) {
                        // Prompt user for details for EACH NPC generated
                        const npc = await ctx.npcService.promptForNpc({
                             role: npcData.role || 'Contact',
                             name: npcData.name || undefined,
                             notes: npcData.notes || 'Gained via Event'
                        });

                        if (npc) {
                             ctx.characterService.addNpc(npc);
                             ctx.characterService.log(`**New Contact**: Added ${npc.role} named ${npc.name}.`);
                        }
                    }
                }
                break;
        }
    }
}
