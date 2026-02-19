
import { GameEvent } from '../../../core/models/game-event.model';

export const NEURAL_JACK_INSTALL_EVENT: GameEvent = {
    id: 'neural_jack_install',
    type: 'CHOICE',
    trigger: 'DURING_CAREER_TERM',
    conditions: {
        nationTier: 3,
        career: ['Navy', 'Marine', 'Scout'], // Allowed careers?
        customCheck: (char) => {
            return !char.hasNeuralJack;
        }
    },
    ui: {
        title: 'Service Offer: Neural Interface',
        description: 'Due to the high technological tier of your nation (Tier 3+), command offers the surgical installation of a Neural Jack to enhance your combat and piloting efficiency. This procedure is expensive and will cost you one future Mustering Out Benefit roll.',
        options: [
            {
                label: 'Accept Installation',
                effects: [
                    { 
                        type: 'RESOURCE_MOD', 
                        target: 'benefit_rolls', 
                        value: -1, 
                        note: 'Sacrificed 1 Benefit Roll for Neural Jack.' 
                    },
                    { 
                        type: 'ADD_ITEM', 
                        value: 'Neural Jack (TL12)', 
                        note: 'Neural Jack installed.' 
                    },
                    {
                        type: 'LOG_ENTRY',
                        note: ' underwent voluntary surgery for Neural Jack installation.'
                    },
                    {
                        type: 'CUSTOM',
                        customId: 'SET_NEURAL_JACK'
                    }
                ]
            },
            {
                label: 'Refuse',
                effects: [
                    { type: 'LOG_ENTRY', note: 'Refused Neural Jack installation offer.' }
                ]
            }
        ]
    }
};
