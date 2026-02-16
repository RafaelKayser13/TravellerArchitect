
import { GameEvent } from '../../../core/models/game-event.model';
import { LIFE_EVENT_TABLE } from './life-events';
import tableData from '../../../../assets/data/tables.json';

export const EDUCATION_EVENT_TABLE: any[] = tableData.educationEventTable;

export function createEducationEvent(roll: number): GameEvent {
    const entry = EDUCATION_EVENT_TABLE.find(e => e.roll === roll);
    if (!entry) {
        return {
            id: 'edu_event_default',
            type: 'INFO',
            trigger: 'DURING_CAREER_TERM',
            ui: { title: 'Education Event', description: 'Nothing significant happened.', options: [{ label: 'Continue' }] }
        };
    }

    if (entry.isLifeEvent) {
        return {
            id: 'edu_life_event',
            type: 'CHOICE',
            trigger: 'LIFE_EVENT',
            ui: {
                title: 'Life Event',
                description: 'Something significant happened during your studies. Roll on the Life Events table.',
                options: [
                    {
                        label: 'Roll Life Event (2d6)',
                        effects: [{ type: 'ROLL_TABLE', table: LIFE_EVENT_TABLE, dice: '2d6' }]
                    }
                ]
            }
        };
    }

    // Default reward/info event for most entries
    const effects: any[] = [];
    if (entry.effectId) {
        effects.push({ type: 'CUSTOM', customId: entry.effectId, payload: entry.payload });
    }
    if (entry.stat) {
        if (entry.stat === 'SOC') {
            effects.push({ type: 'STAT_MOD', target: 'SOC', value: entry.value });
        } else {
            effects.push({ type: 'SKILL_MOD', target: entry.stat, value: entry.value });
        }
    }

    return {
        id: `edu_event_${roll}`,
        type: 'INFO',
        trigger: 'DURING_CAREER_TERM',
        ui: {
            title: 'Education Event',
            description: entry.desc,
            options: [
                {
                    label: 'Continue',
                    effects: effects
                }
            ]
        }
    };
}
