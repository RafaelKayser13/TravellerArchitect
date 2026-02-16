import { Injectable, inject, signal } from '@angular/core';
import { GameEvent, EventOption, EventEffect, EventCondition } from '../models/game-event.model';
import { CharacterService } from './character.service';
import { DiceService } from './dice.service';
import { DiceDisplayService } from './dice-display.service';
import { NpcInteractionService } from './npc-interaction.service';
import { LIFE_EVENT_TABLE, INJURY_TABLE } from '../../data/events/shared/life-events';
import { CAREERS } from '../../data/careers';

// Handlers
import { EffectHandler, HandlerContext } from './handlers/effect-handler.interface';
import { CharacterEffectHandler } from './handlers/character-effect.handler';
import { ResourceEffectHandler } from './handlers/resource-effect.handler';
import { CareerEffectHandler } from './handlers/career-effect.handler';
import { RollEffectHandler } from './handlers/roll-effect.handler';
import { CustomEffectHandler } from './handlers/custom-effect.handler';

@Injectable({
    providedIn: 'root'
})
export class EventEngineService {
    // Services exposed for Handlers via Context
    public characterService = inject(CharacterService);
    public diceService = inject(DiceService);
    public diceDisplay = inject(DiceDisplayService);
    public npcInteractionService = inject(NpcInteractionService);

    // Handlers
    private handlers: EffectHandler[] = [
        inject(CharacterEffectHandler),
        inject(ResourceEffectHandler),
        inject(CareerEffectHandler),
        inject(RollEffectHandler),
        inject(CustomEffectHandler)
    ];

    // Event Registry
    private eventRegistry = new Map<string, GameEvent>();

    // Current Event State
    currentEvent = signal<GameEvent | null>(null);
    eventStack = signal<string[]>([]); // Stack for chained events

    // Custom Callback Registry (for CustomEffectHandler)
    private customHandlers = new Map<string, (payload: any) => void>();

    constructor() { }

    // --- Registry Management ---
    registerEvent(event: GameEvent) {
        this.eventRegistry.set(event.id, event);
    }

    getEvent(eventId: string): GameEvent | undefined {
        return this.eventRegistry.get(eventId);
    }

    // --- Public Utilities for Handlers ---

    public registerCustomHandler(id: string, handler: (payload: any) => void) {
        this.customHandlers.set(id, handler);
    }

    public executeCustomHandler(id: string, payload: any) {
        const handler = this.customHandlers.get(id);
        if (handler) {
            handler(payload);
            console.log('Processed Custom Effect:', id);
        } else {
            console.warn(`Custom handler not found for: ${id}`);
        }
    }

    public checkRankBonuses(careerName: string, assignmentName: string, rank: number) {
        const career = CAREERS.find(c => c.name === careerName);
        if (!career) return;

        const assignment = career.assignments.find(a => a.name === assignmentName);
        if (!assignment) return;

        const rankData = assignment.ranks.find(r => r.level === rank);
        if (rankData && rankData.bonusSkill) {
            const val = typeof rankData.bonusValue === 'string' ? 1 : (rankData.bonusValue || 1);
            
            if (rankData.bonusSkill.includes('SOC')) {
                const amount = parseInt(String(rankData.bonusValue).replace('+', '')) || 1;
                this.characterService.modifyStat('SOC', amount);
                this.characterService.log(`**Rank Bonus**: Gained SOC +${amount} for reaching Level ${rank} (${rankData.title})`);
            } else {
                this.characterService.addSkill(rankData.bonusSkill, val);
                this.characterService.log(`**Rank Bonus**: Gained ${rankData.bonusSkill} ${val} for reaching Level ${rank} (${rankData.title})`);
            }
        }
    }


    // --- Event Execution Flow ---

    triggerEvent(eventId: string, replace: boolean = false) {
        const event = this.eventRegistry.get(eventId);
        if (event) {
            // Check conditions
            if (this.checkConditions(event.conditions)) {
                if (replace) {
                    this.popEvent();
                }
                this.pushEvent(eventId);
                this.currentEvent.set(event);
                console.log(`Event triggered: ${event.ui.title} (${eventId})`);
            } else {
                console.warn(`Condition check failed for event: ${eventId}`);
            }
        } else {
            console.error(`Event not found: ${eventId}`);
        }
    }

    async selectOption(optionIndex: number) {
        const originalEventId = this.currentEvent()?.id;
        const event = this.currentEvent();
        if (!event) return;

        const option = event.ui.options[optionIndex];
        if (!option) return;

        console.log(`Option selected: ${option.label}`);

        // 1. Apply Effects
        if (option.effects) {
            await this.applyEffects(option.effects);
        }

        // Check if navigation happened during effects
        if (this.currentEvent()?.id !== originalEventId) {
            return;
        }

        // 2. Handle Chaining
        if (option.nextEventId) {
            this.triggerEvent(option.nextEventId, !!option.replaceNext);
        } else if (event.nextEventId) {
             this.triggerEvent(event.nextEventId);
        } else {
            // Leaf node reached. This event is done.
            this.popEvent();
            
            // Check stack for previous event
            const stack = this.eventStack();
            if (stack.length > 0) {
                const prevId = stack[stack.length - 1];
                const prevEvent = this.eventRegistry.get(prevId);
                if (prevEvent) {
                    this.currentEvent.set(prevEvent);
                    console.log(`Returning to event: ${prevEvent.ui.title}`);
                } else {
                    this.currentEvent.set(null);
                }
            } else {
                this.currentEvent.set(null);
            }
        }
    }

    private pushEvent(eventId: string) {
        this.eventStack.update(stack => [...stack, eventId]);
    }

    private popEvent() {
        this.eventStack.update(stack => {
            const newStack = [...stack];
            newStack.pop(); 
            return newStack;
        });
    }

    private checkConditions(cond?: EventCondition): boolean {
        if (!cond) return true;
        const char = this.characterService.character();

        if (cond.minAge && char.age < cond.minAge) return false;
        
        if (cond.stats) {
            for (const [stat, value] of Object.entries(cond.stats)) {
                 const charStat = (char.characteristics as any)[stat.toLowerCase()]?.value;
                 if (charStat < value) return false;
            }
        }

        if (cond.customCheck) {
            if (!cond.customCheck(char)) return false;
        }

        return true;
    }

    // --- Effect Application (Strategy Pattern) ---

    public async applyEffects(effects: EventEffect[]) {
        console.log('Applying effects (Strategy):', effects);
        
        const context: HandlerContext = {
            characterService: this.characterService,
            diceDisplay: this.diceDisplay,
            eventEngine: this,
            npcService: this.npcInteractionService
        };

        for (const eff of effects) {
            let handled = false;
            for (const handler of this.handlers) {
                if (handler.canHandle(eff.type)) {
                    await handler.handle(eff, context);
                    handled = true;
                    // We assume one handler per effect type for now. 
                    // Use break to avoid multiple handlers triggering for same effect if scopes overlap.
                    break; 
                }
            }
            if (!handled) {
                console.warn(`No handler found for effect type: ${eff.type}`, eff);
            }
        }
    }

    private mapLegacyEffects(legacyEffects: any[]): EventEffect[] {
        if (!legacyEffects) return [];
        const mapped: EventEffect[] = [];
        
        legacyEffects.forEach(curr => {
            switch (curr.type) {
                case 'benefit-mod':
                    mapped.push({ type: 'RESOURCE_MOD', target: 'benefit_rolls', value: curr.value || 1 });
                    break;
                case 'advancement-dm':
                    mapped.push({ type: 'RESOURCE_MOD', target: 'next_advancement_dm', value: curr.value || 1 });
                    break;
                case 'qualification-dm':
                    mapped.push({ type: 'RESOURCE_MOD', target: 'next_qualification_dm', value: curr.value || 1 });
                    break;
                case 'mishap':
                    mapped.push({ type: 'TRIGGER_EVENT', value: 'mishap_roll' });
                    break;
                case 'injury':
                    mapped.push({ type: 'ROLL_TABLE', dice: '1d6', table: INJURY_TABLE, note: 'Injury Table Roll' });
                    break;
                case 'life-event':
                    mapped.push({ type: 'ROLL_TABLE', dice: '2d6', table: LIFE_EVENT_TABLE, note: 'Life Event Table Roll' });
                    break;
                case 'stat-bonus':
                    mapped.push({ type: 'STAT_MOD', target: curr.stat, value: curr.value });
                    break;
                case 'trait-gain':
                    mapped.push({ type: 'TRAIT_GAIN', value: curr.note || 'New Trait' });
                    break;
                case 'skill-gain':
                    mapped.push({ type: 'SKILL_MOD', target: curr.skill, value: curr.value || 1 });
                    break;
                case 'neural-jack':
                     mapped.push({ type: 'TRIGGER_EVENT', value: 'neural_jack_install' });
                     break;
                case 'skill-choice':
                     // Map to triggered choice event
                     const evtId = `dyn_skill_choice_${Date.now()}_${Math.random()}`;
                     this.registerEvent({
                         id: evtId,
                         type: 'CHOICE',
                         trigger: 'DURING_CAREER_TERM',
                         ui: {
                             title: 'Skill Choice',
                             description: 'Choose a skill to gain:',
                             options: (curr.skills || []).map((s: string) => ({
                                 label: s,
                                 effects: [{ type: 'SKILL_MOD', target: s, value: 1 }]
                             }))
                         }
                     });
                     mapped.push({ type: 'TRIGGER_EVENT', value: evtId });
                     break;
                case 'skill-check':
                     const passId = this.createDynamicEvent('Success', 'Checks Passed!', curr.onSuccess);
                     const failId = this.createDynamicEvent('Failure', 'Checks Failed.', curr.onFailure);
                     const stat = curr.checkSkills && curr.checkSkills[0] ? curr.checkSkills[0] : 'INT';
                     
                     mapped.push({ 
                         type: 'ROLL_CHECK', 
                         stat: stat,
                         checkTarget: curr.target, 
                         onPass: passId, 
                         onFail: failId 
                     });
                     break;
                case 'choice':
                     mapped.push({ type: 'LOG_ENTRY', note: `Manual Choice Required: ${curr.note}` });
                     break;
                default:
                     mapped.push({ type: 'LOG_ENTRY', note: `Legacy Effect: ${curr.type} (${curr.note || ''})` });
            }
        });
        return mapped;
    }

    public createDynamicEvent(title: string, description: string, legacyEffects?: any[], explicitOptions?: EventOption[]): string {
        const id = `dyn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        // If explicit options are provided, use them. 
        // Otherwise, map legacy effects to a default "Continue" option.
        let options = explicitOptions;
        
        if (!options) {
             const effects = legacyEffects ? this.mapLegacyEffects(legacyEffects) : [];
             options = [{ label: 'Continue', effects }];
        }
        
        const event: GameEvent = {
            id,
            type: options.length > 1 ? 'CHOICE' : 'INFO',
            trigger: 'DURING_CAREER_TERM', // Default
            ui: {
                title,
                description,
                options
            }
        };
        this.registerEvent(event);
        return id;
    }

    public rollValue(value: string | number): number {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        
        // Simple D parsing if not handled by generic DiceService
        if (String(value).toLowerCase().includes('d')) {
             const diceExpr = String(value).toLowerCase().match(/(\d*)d(\d+)([+-]\d+)?/);
             if (diceExpr) {
                const qty = diceExpr[1] ? parseInt(diceExpr[1]) : 1;
                const sides = parseInt(diceExpr[2]);
                const mod = diceExpr[3] ? parseInt(diceExpr[3]) : 0;
                return this.diceService.roll(qty, sides).total + mod;
             }
        }
        return parseInt(String(value)) || 0;
    }
}
