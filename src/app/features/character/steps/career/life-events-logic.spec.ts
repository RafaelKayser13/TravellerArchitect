import { TestBed } from '@angular/core/testing';
import { CareerComponent } from './career.component';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { DiceService } from '../../../../core/services/dice.service';

describe('CareerComponent - Life Events Logic (2300AD)', () => {
    let component: CareerComponent;
    let characterService: any;

    beforeEach(async () => {
        characterService = {
            character: vi.fn().mockReturnValue({
                careerHistory: [],
                age: 18,
                characteristics: {
                    str: { value: 7, modifier: 0 },
                    dex: { value: 7, modifier: 0 },
                    end: { value: 7, modifier: 0 },
                    int: { value: 9, modifier: 1 },
                    edu: { value: 7, modifier: 0 },
                    soc: { value: 7, modifier: 0 },
                },
                npcs: [],
                history: [],
                finances: {
                    benefitRollMod: 0
                }
            }),
            log: vi.fn(),
            updateCharacter: vi.fn(),
            updateFinances: vi.fn(),
            setPsionicPotential: vi.fn(),
            setNextCareer: vi.fn(),
            addNpc: vi.fn(),
            addSkill: vi.fn(),
            getSkillLevel: vi.fn().mockReturnValue(-3)
        };

        const diceDisplayMock = {
            roll: vi.fn()
        };

        const diceServiceMock = {
            roll: vi.fn().mockReturnValue(7)
        };

        await TestBed.configureTestingModule({
            imports: [CareerComponent],
            providers: [
                { provide: CharacterService, useValue: characterService },
                { provide: DiceDisplayService, useValue: diceDisplayMock },
                { provide: DiceService, useValue: diceServiceMock }
            ]
        }).compileComponents();

        const fixture = TestBed.createComponent(CareerComponent);
        component = fixture.componentInstance;
        component.selectedCareer = { name: 'Agent' } as any;
    });

    it('should trigger Life Event choice for Crime (Roll 11)', async () => {
        const effect = {
            type: 'choice' as const,
            note: 'Crime choice',
            skills: ['Lose Benefit', 'Prison']
        };

        await component.applyEventEffect(effect);

        expect(component.isLifeEventChoice).toBe(true);
        expect(component.lifeEventChoiceOptions).toContain('Lose Benefit');
        expect(component.lifeEventChoiceOptions).toContain('Prison');
    });

    it('choice of Prison should force Prisoner career and eject character', () => {
        component.handleLifeEventChoice('Prison');

        expect(characterService.setNextCareer).toHaveBeenCalledWith('Prisoner');
        expect(component.forcedOut).toBe(true);
        expect(component.currentState()).toBe('MISHAP');
    });

    it('choice of Lose Benefit should add benefit debt', () => {
        component.handleLifeEventChoice('Lose Benefit');

        expect(characterService.updateFinances).toHaveBeenCalledWith(expect.objectContaining({
            benefitRollDebt: 1
        }));
    });

    it('Unusual Event (Roll 1) should set Psionic Potential', async () => {
        const diceDisplay = TestBed.inject(DiceDisplayService);
        vi.spyOn(diceDisplay, 'roll').mockResolvedValue(1);

        await component.handleSubRoll({ type: 'sub-roll', note: 'Unusual Event' });

        expect(characterService.setPsionicPotential).toHaveBeenCalledWith(true);
    });

    it('Good Fortune (Roll 10) should add benefit modifier', async () => {
        await component.applyEventEffect({ type: 'benefit-mod', value: 2 });

        expect(characterService.updateFinances).toHaveBeenCalledWith({ benefitRollMod: 2 });
    });

    it('Betrayal (Roll 8) should trigger NPC conversion choice', async () => {
        const effect = { type: 'choice' as const, note: 'Betrayal choice' };
        await component.applyEventEffect(effect);

        expect(component.isLifeEventChoice).toBe(true);
    });
});
