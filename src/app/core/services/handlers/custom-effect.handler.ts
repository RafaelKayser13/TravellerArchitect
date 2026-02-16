import { EffectHandler, HandlerContext } from './effect-handler.interface';
import { EventEffect } from '../../models/game-event.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CustomEffectHandler implements EffectHandler {
    private handledTypes = new Set(['CUSTOM', 'TRIGGER_EVENT']);

    canHandle(type: string): boolean {
        return this.handledTypes.has(type);
    }

    async handle(effect: EventEffect, ctx: HandlerContext): Promise<void> {
        switch (effect.type) {
            case 'CUSTOM':
                if (effect.customId) {
                     // We need to access the private customHandlers map from EventEngineService
                     // But it is private. We should probably expose a public method to execute it.
                     ctx.eventEngine.executeCustomHandler(effect.customId, effect.payload);
                }
                break;
            case 'TRIGGER_EVENT':
                 if (effect.value) {
                     ctx.eventEngine.triggerEvent(effect.value);
                 }
                 break;
        }
    }
}
