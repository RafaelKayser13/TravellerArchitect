
import { GameEvent } from '../../../core/models/game-event.model';

export function createSurvivalCheckEvent(careerName: string, stat: string, target: number): GameEvent {
    return {
        id: `survival_${careerName}_${Date.now()}`,
        type: 'CHECK',
        trigger: 'DURING_CAREER_TERM',
        ui: {
            title: `Survival Check: ${careerName}`,
            description: `You must make a ${stat} check (${target}+) to survive this term. Roll the dice to continue.`,
            options: [
                {
                    label: `Roll ${stat} ${target}+`,
                    effects: [
                        {
                            type: 'ROLL_CHECK',
                            stat: stat,
                            checkTarget: target,
                            isSurvivalCheck: true, // Rule 245
                            onPass: 'term_event_roll',
                            onFail: 'mishap_roll',
                            // Briefing context shown in dice roller
                            phase: `SURVIVAL CHECK · ${careerName.toUpperCase()}`,
                            announcement: `This term as a ${careerName} puts your life at risk. You must roll ${stat} ${target}+ (2D6 + ${stat} modifier) to come through unscathed.`,
                            successContext: `You survive the term. A Life Event occurred during your service — roll the Event table next.`,
                            failureContext: `Mishap! You suffered an accident or injury. You must consult the Mishap table and may be forced out of the service.`
                        }
                    ]
                }
            ]
        }
    };
}

export function createMishapRollEvent(careerName: string, table: any[], eject: boolean = true): GameEvent {
    const effects: any[] = [
        {
            type: 'ROLL_TABLE',
            table: table,
            dice: '1d6'
        }
    ];

    if (eject) {
        effects.push({ type: 'EJECT_CAREER', value: careerName });
    }

    return {
        id: 'mishap_roll',
        type: 'DISASTER',
        trigger: 'MISHAP',
        ui: {
            title: 'Mishap!',
            description: 'You have failed your survival check. You will lose your position in this career. Roll on the Mishap table.',
            options: [
                {
                    label: 'Roll Mishap Table (1d6)',
                    effects: effects
                }
            ]
        }
    };
}

export function createEventRollEvent(careerName: string, table: any[]): GameEvent {
    return {
        id: 'term_event_roll',
        type: 'INFO',
        trigger: 'DURING_CAREER_TERM',
        ui: {
            title: 'Term Event',
            description: 'You have survived the term. Roll to see what significant event occurs.',
            options: [
                {
                    label: 'Roll Event Table (2d6)',
                    effects: [
                        {
                            type: 'ROLL_TABLE',
                            table: table,
                            dice: '2d6'
                        }
                    ]
                }
            ]
        }
    };
}

export const PROSTHETIC_CHOICE_EVENT: GameEvent = {
    id: 'prosthetic_choice',
    type: 'CHOICE',
    trigger: 'DURING_CAREER_TERM',
    ui: {
        title: 'Rule 245: Survival Close Call',
        description: 'Your survival check was exactly equal to the target. In 2300AD, this indicates a close call where you may have lost a limb or eye, which has been replaced by a cosmetic prosthetic. Do you wish to gain a prosthetic?',
        options: [
            {
                label: 'Gain Prosthetic Limb',
                revealText: 'A cosmetic prosthetic arm or leg is fitted. You gain the item \'Prosthetic Limb (Cosmetic)\' on your equipment list. No stat penalties.',
                effects: [{ type: 'ADD_ITEM', value: 'Prosthetic Limb (Cosmetic)' }, { type: 'LOG_ENTRY', note: '**Rule 245**: Gained prosthetic limb after close call.' }]
            },
            {
                label: 'Gain Prosthetic Eye(s)',
                revealText: 'A cosmetic prosthetic eye is fitted. You gain the item \'Prosthetic Eye(s) (Cosmetic)\'. No stat penalties.',
                effects: [{ type: 'ADD_ITEM', value: 'Prosthetic Eye(s) (Cosmetic)' }, { type: 'LOG_ENTRY', note: '**Rule 245**: Gained prosthetic eye(s) after close call.' }]
            },
            {
                label: 'Decline',
                revealText: 'You decline the prosthetic. No item is added, but your record notes the close call.',
                effects: [{ type: 'LOG_ENTRY', note: '**Rule 245**: Declined prosthetic after close call.' }]
            }
        ]
    }
};
