import { CharacterService } from '../character.service';
import { DiceDisplayService } from '../dice-display.service';
import { EventEffect } from '../../models/game-event.model';
import { EventEngineService } from '../event-engine.service';
import { NpcInteractionService } from '../npc-interaction.service';

/**
 * Interface for handling a specific type of EventEffect.
 * This strategy pattern allows us to separate the logic for each effect
 * from the monolithic EventEngineService.
 */
export interface EffectHandler {
    /**
     * The effect types this handler is responsible for.
     */
    canHandle(effectType: string): boolean;

    /**
     * Executes the effect logic.
     * @param effect The effect object containing parameters.
     * @param services A context object providing access to necessary services.
     */
    handle(effect: EventEffect, services: HandlerContext): Promise<void>;
}

/**
 * Context passed to handlers so they can interact with the system.
 */
export interface HandlerContext {
    characterService: CharacterService;
    diceDisplay: DiceDisplayService;
    eventEngine: EventEngineService;
    npcService: NpcInteractionService;
}
