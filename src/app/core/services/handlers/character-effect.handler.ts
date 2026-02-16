import { EffectHandler, HandlerContext } from './effect-handler.interface';
import { EventEffect } from '../../models/game-event.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CharacterEffectHandler implements EffectHandler {
    private handledTypes = new Set(['STAT_MOD', 'SKILL_MOD', 'TRAIT_GAIN', 'LOG_ENTRY']);

    canHandle(type: string): boolean {
        return this.handledTypes.has(type);
    }

    async handle(effect: EventEffect, ctx: HandlerContext): Promise<void> {
        switch (effect.type) {
            case 'STAT_MOD':
                if (effect.target && effect.value) {
                    ctx.characterService.modifyStat(effect.target, effect.value);
                }
                break;
            case 'SKILL_MOD':
                if (effect.target && effect.value) {
                    ctx.characterService.addSkill(effect.target, effect.value);
                }
                break;
            case 'TRAIT_GAIN':
                if (effect.note || effect.value) {
                    const trait = effect.value || effect.note;
                    ctx.characterService.addTrait(trait);
                }
                break;
            case 'LOG_ENTRY':
                if (effect.note) {
                    ctx.characterService.log(effect.note);
                    console.log('Logged entry:', effect.note);
                }
                break;
        }
    }
}
