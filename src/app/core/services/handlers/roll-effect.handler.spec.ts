import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollEffectHandler } from './roll-effect.handler';
import { PROSTHETIC_CHOICE_EVENT } from '../../../data/events/shared/career-events';

describe('RollEffectHandler', () => {
    let handler: RollEffectHandler;
    let mockCtx: any;

    beforeEach(() => {
        handler = new RollEffectHandler();
        mockCtx = {
            characterService: {
                character: () => ({
                    characteristics: {
                        end: { value: 7, modifier: 0 }
                    }
                }),
                getSkillLevel: () => 0
            },
            diceDisplay: {
                roll: vi.fn()
            },
            eventEngine: {
                diceService: { getModifier: () => 0 }, // Add diceService to eventEngine mock
                registerEvent: vi.fn(),
                triggerEvent: vi.fn(),
                applyEffects: vi.fn(), 
                createDynamicEvent: vi.fn()
            }
        };
    });

    it('should trigger PROSTHETIC_CHOICE_EVENT on exact survival success (Rule 245)', async () => {
        const effect = {
            type: 'ROLL_CHECK',
            stat: 'END',
            checkTarget: 8,
            isSurvivalCheck: true,
            onPass: 'next_event'
        };

        // Mock roll to return exactly 8 (target)
        mockCtx.diceDisplay.roll.mockResolvedValue(8);

        await handler.handle(effect as any, mockCtx);

        // Expect registerEvent to be called with a prosthetic choice event
        expect(mockCtx.eventEngine.registerEvent).toHaveBeenCalled();
        const registeredEvent = mockCtx.eventEngine.registerEvent.mock.calls[0][0];
        expect(registeredEvent.id).toContain('prosthetic_choice');
        expect(registeredEvent.ui.title).toContain('Rule 245');
        
        // Expect triggerEvent to be called for this new event
        expect(mockCtx.eventEngine.triggerEvent).toHaveBeenCalledWith(registeredEvent.id, true);
    });

    it('should NOT trigger prosthetic choice if roll > target', async () => {
        const effect = {
            type: 'ROLL_CHECK',
            stat: 'END',
            checkTarget: 8,
            isSurvivalCheck: true,
            onPass: 'next_event'
        };

        // Mock roll to return 9 (pass but not exact)
        mockCtx.diceDisplay.roll.mockResolvedValue(9);

        await handler.handle(effect as any, mockCtx);

        // Expect normal flow (trigger onPass)
        expect(mockCtx.eventEngine.triggerEvent).toHaveBeenCalledWith('next_event', true);
        // Should NOT register prosthetic event
        expect(mockCtx.eventEngine.registerEvent).not.toHaveBeenCalled();
    });

    it('should NOT trigger prosthetic choice if not survival check', async () => {
        const effect = {
            type: 'ROLL_CHECK',
            stat: 'END',
            checkTarget: 8,
            isSurvivalCheck: false, // Normal check
            onPass: 'next_event'
        };

        // Mock roll to return 8 (exact match)
        mockCtx.diceDisplay.roll.mockResolvedValue(8);

        await handler.handle(effect as any, mockCtx);

        // Expect normal flow
        expect(mockCtx.eventEngine.triggerEvent).toHaveBeenCalledWith('next_event', true);
        expect(mockCtx.eventEngine.registerEvent).not.toHaveBeenCalled();
    });
});
