import { EffectHandler, HandlerContext } from './effect-handler.interface';
import { EventEffect } from '../../models/game-event.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ResourceEffectHandler implements EffectHandler {
    private handledTypes = new Set(['ADD_ITEM', 'RESOURCE_MOD', 'ADD_NPC', 'LOSE_BENEFIT']);

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
                    const careerName = ctx.characterService.currentCareer() || 'General';
                    if (effect.value > 0) {
                        ctx.characterService.addBenefitRoll(careerName, effect.value);
                    } else {
                        ctx.characterService.spendBenefitRoll(careerName, Math.abs(effect.value));
                    }
                } else if (effect.target === 'next_qualification_dm') {
                    ctx.characterService.updateDm('qualification', effect.value);
                } else if (effect.target === 'next_advancement_dm' || effect.target === 'nextAdvancementModifier') {
                    ctx.characterService.updateDm('advancement', effect.value);
                } else if (effect.target === 'shipShares') {
                    const current = ctx.characterService.character().finances.shipShares || 0;
                    ctx.characterService.updateFinances({ shipShares: current + effect.value });
                    ctx.characterService.log(`**Benefit Gained**: +${effect.value} Ship Share(s).`);
                } else if (effect.target === 'next_benefit_dm') {
                    ctx.characterService.updateDm('benefit', effect.value);
                    ctx.characterService.log(`**Bonus**: +${effect.value} DM to next Benefit Roll.`);
                } else if (effect.target === 'paroleThreshold') {
                    ctx.characterService.updateParoleThreshold(effect.value);
                }
                break;
            case 'LOSE_BENEFIT': {
                const careerName = ctx.characterService.currentCareer() || 'General';
                const amount = (effect as any).value ?? 1;
                ctx.characterService.spendBenefitRoll(careerName, Math.abs(amount));
                ctx.characterService.log(`**Penalty**: Lost ${Math.abs(amount)} Benefit Roll(s).`);
                break;
            }
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
