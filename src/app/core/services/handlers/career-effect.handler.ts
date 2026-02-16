import { EffectHandler, HandlerContext } from './effect-handler.interface';
import { EventEffect } from '../../models/game-event.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CareerEffectHandler implements EffectHandler {
    private handledTypes = new Set(['FORCE_CAREER', 'EJECT_CAREER', 'PROMOTION']);

    canHandle(type: string): boolean {
        return this.handledTypes.has(type);
    }

    async handle(effect: EventEffect, ctx: HandlerContext): Promise<void> {
        switch (effect.type) {
            case 'FORCE_CAREER':
                if (effect.value) { 
                    ctx.characterService.setNextCareer(effect.value);
                    ctx.characterService.log(`**Forced Career**: Next career must be ${effect.value}.`);
                }
                break;
            case 'EJECT_CAREER':
                 if (effect.value) {
                     ctx.characterService.ejectCareer(effect.value);
                 } else {
                     const current = ctx.characterService.currentCareer();
                     if (current) ctx.characterService.ejectCareer(current);
                 }
                 break;
            case 'PROMOTION':
                 const currentCareer = effect.career || ctx.characterService.character().careerHistory[ctx.characterService.character().careerHistory.length-1]?.careerName;
                 if (currentCareer) {
                     ctx.characterService.promote(currentCareer);
                     ctx.characterService.log(`**Automatic Promotion**: Elevated to higher rank in ${currentCareer}.`);
                     
                     const char = ctx.characterService.character();
                     const currentTerm = char.careerHistory[char.careerHistory.length-1];
                     if (currentTerm) {
                         ctx.eventEngine.checkRankBonuses(currentCareer, currentTerm.assignment || '', currentTerm.rank);
                     }
                 }
                 break;
        }
    }
}
