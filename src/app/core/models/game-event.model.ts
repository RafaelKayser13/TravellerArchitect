
import { Character } from './character.model';

export type GameEventTrigger = 'DURING_CAREER_TERM' | 'MUSTERING_OUT' | 'LIFE_EVENT' | 'MISHAP';

export type GameEventType = 'CHOICE' | 'CHECK' | 'REWARD' | 'DISASTER' | 'INFO' | 'MISHAP';

export interface GameEvent {
    id: string;
    type: GameEventType;
    trigger: GameEventTrigger;
    conditions?: EventCondition;
    ui: EventUI;
    nextEventId?: string; // Auto-chaining to the next event ID
}

export interface EventCondition {
    career?: string[];
    minAge?: number;
    stats?: { [key: string]: number }; // e.g. { str: 8 } to require STR 8+
    traits?: string[];
    nationTier?: number; // 2300AD specific
    term?: number; // e.g. "== 1" or ">= 2" logic handled by engine
    customCheck?: (char: Character) => boolean;
}

export interface EventUI {
    title: string;
    description: string;
    imageUrl?: string;
    options: EventOption[];
}

export interface EventOption {
    label: string;
    revealText?: string; // Hidden consequence text — player can reveal before confirming choice
    nextEventId?: string; // Chain to next event ID
    replaceNext?: boolean; // If true, the new event replaces the current one on the stack
    effects?: EventEffect[];
    color?: 'cyan' | 'red' | 'yellow' | 'green' | 'orange'; // Visual semantic coloring for options
}

export interface EventEffect {
    type: 'STAT_MOD' | 'SKILL_MOD' | 'ADD_ITEM' | 'ADD_NPC' | 'RESOURCE_MOD' | 'LOG_ENTRY' | 'LOSE_BENEFIT' | 'FORCE_CAREER' | 'EJECT_CAREER' | 'ROLL_CHECK' | 'ROLL_TABLE' | 'CUSTOM' | 'TRIGGER_EVENT' | 'TRAIT_GAIN' | 'PROMOTION';
    target?: string;
    career?: string;
    value?: any;
    duration?: 'permanent' | 'term';
    note?: string; // For logs
    
    // For ROLL_CHECK
    stat?: string;
    checkTarget?: number;
    onPass?: string;
    onFail?: string;
    isSurvivalCheck?: boolean; // Rule 245: Exact success on survival allows prosthetic choice

    // Optional briefing/feedback context passed through to DiceDisplayService
    phase?: string;           // e.g. "SURVIVAL • TERM 3"
    announcement?: string;    // Pre-roll briefing paragraph
    successContext?: string;   // Post-roll success narrative
    failureContext?: string;   // Post-roll failure narrative
    
    // For ROLL_TABLE
    table?: any[];
    dice?: string; // '1d6', '2d6', 'd66'
    
    // Generic modifiers
    dm?: number;
    dmLabel?: string;  // Optional label describing the source of dm (shown in dice roller breakdown)
    
    // For CUSTOM
    customId?: string;
    payload?: any;
}
