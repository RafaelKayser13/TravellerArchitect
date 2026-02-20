import { EffectHandler, HandlerContext } from './effect-handler.interface';
import { EventEffect } from '../../models/game-event.model';
import { Injectable } from '@angular/core';
import { PROSTHETIC_CHOICE_EVENT } from '../../../data/events/shared/career-events';

@Injectable({
    providedIn: 'root'
})
export class RollEffectHandler implements EffectHandler {
    private handledTypes = new Set(['ROLL_CHECK', 'ROLL_TABLE']);

    canHandle(type: string): boolean {
        return this.handledTypes.has(type);
    }

    async handle(effect: EventEffect, ctx: HandlerContext): Promise<void> {
        switch (effect.type) {
            case 'ROLL_CHECK':
                if (effect.stat && effect.checkTarget) {
                    const char = ctx.characterService.character();
                    const statKey = effect.stat.toLowerCase() as keyof typeof char.characteristics;
                    let diceMod = 0;
                    let diceTitle = `${effect.stat} Check ${effect.checkTarget}+`;

                    // Check if it's a characteristic
                    if (char.characteristics[statKey]) {
                        const characteristic = char.characteristics[statKey];
                        diceMod = characteristic.modifier ?? ctx.eventEngine.diceService.getModifier(characteristic.value);
                    } else {
                        // Assume it's a skill check
                        const skillLevel = ctx.characterService.getSkillLevel(effect.stat);
                        diceMod = skillLevel;
                        diceTitle = `${effect.stat} Skill Check ${effect.checkTarget}+`;
                    }

                    const effectDm = effect.dm || 0;
                    const rollContext = {
                        phase: effect.phase,
                        announcement: effect.announcement,
                        successContext: effect.successContext,
                        failureContext: effect.failureContext
                    };

                    // Build individual modifier breakdown for display
                    const modifiersArr: any[] = [];
                    if (diceMod !== 0) modifiersArr.push({ label: `${effect.stat} Modifier`, value: diceMod });
                    if (effectDm !== 0) modifiersArr.push({ label: effect.dmLabel || 'Path/Event DM', value: effectDm });

                    const total = await ctx.diceDisplay.roll(
                        diceTitle, 2, diceMod + effectDm, effect.checkTarget, undefined, undefined, modifiersArr, undefined, rollContext
                    );
                    
                    if (total >= effect.checkTarget) {
                        if (effect.isSurvivalCheck && total === effect.checkTarget) {
                            // Rule 245: Exact success on survival allows prosthetic choice
                            // We intercept the normal flow to insert this choice
                            const choiceEvent = { ...PROSTHETIC_CHOICE_EVENT };
                            choiceEvent.id = `prosthetic_choice_${Date.now()}`;
                            
                            // Deep clone UI options to modify them effectively
                            if (choiceEvent.ui.options) {
                                choiceEvent.ui.options = choiceEvent.ui.options.map(opt => ({ ...opt }));
                            }

                            // Chain to the original onPass event (usually term_event_roll)
                            if (typeof effect.onPass === 'string') {
                                const nextId = effect.onPass;
                                choiceEvent.ui.options.forEach(opt => {
                                    opt.nextEventId = nextId;
                                    opt.replaceNext = true; // IMPORTANT: Prevent loop by replacing this event
                                });
                            }
                            
                            ctx.eventEngine.registerEvent(choiceEvent);
                            ctx.eventEngine.triggerEvent(choiceEvent.id, true); // Replace current event
                        } else if (effect.onPass) {
                            if (Array.isArray(effect.onPass)) ctx.eventEngine.applyEffects(effect.onPass);
                            else ctx.eventEngine.triggerEvent(effect.onPass, true);
                        }
                    } else {
                        if (effect.onFail) {
                            if (Array.isArray(effect.onFail)) ctx.eventEngine.applyEffects(effect.onFail);
                            else ctx.eventEngine.triggerEvent(effect.onFail, true);
                        }
                    }
                }
                break;
            case 'ROLL_TABLE':
                 if (effect.table) {
                     const diceStr = effect.dice || '2d6';
                     const quantity = diceStr.startsWith('1') ? 1 : 2;
                     const isD66 = diceStr === 'd66';
                     const tableDm = effect.dm || 0;
                     const rollCount = effect.rollCount || 1;
                     const takeWorst = effect.takeWorst || false;

                     let finalResult = 0;

                     if (rollCount > 1 && takeWorst) {
                         // Roll multiple times and take worst (lowest)
                         const rolls = [];
                         for (let i = 0; i < rollCount; i++) {
                             const roll = await ctx.diceDisplay.roll(
                                 isD66 ? 'D66 Event Roll' : `Event Roll (${diceStr}) - Roll ${i + 1} of ${rollCount}`,
                                 quantity,
                                 tableDm, 0, undefined, undefined, [], effect.table
                             );
                             rolls.push(isD66 ? roll : roll + tableDm);
                         }
                         // Take the worst (lowest) result
                         finalResult = Math.min(...rolls);
                     } else {
                         // Single roll
                         const roll = await ctx.diceDisplay.roll(
                             isD66 ? 'D66 Event Roll' : `Event Roll (${diceStr})`,
                             quantity,
                             tableDm, 0, undefined, undefined, [], effect.table
                         );
                         finalResult = isD66 ? roll : roll + tableDm;
                     }

                     const entry = effect.table.find((row) => row.roll === finalResult);
                     if (entry) {
                         console.log('Table Result:', entry);
                         
                         // Check for PROPER GameEvent definition
                         if (entry.gameEvent) {
                             // Register sub-events first if any
                             if (entry.subEvents) {
                                 entry.subEvents.forEach((sub: any) => ctx.eventEngine.registerEvent(sub));
                             }
                             
                             // Register and trigger main event
                             ctx.eventEngine.registerEvent(entry.gameEvent);
                             ctx.eventEngine.triggerEvent(entry.gameEvent.id, true);
                         } else {
                             // Fallback: Dynamic Event from Result (Legacy)
                             const dynamicId = ctx.eventEngine.createDynamicEvent(
                                 'Event Result',
                                 entry.description || 'Event occurring...',
                                 entry.effects 
                             );
                             
                             ctx.eventEngine.triggerEvent(dynamicId, true);
                         }
                     } else {
                         console.warn('Roll result not found in table:', roll);
                     }
                 }
                 break;
        }
    }
}
