import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OriginComponent } from './origin.component';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { EventEngineService } from '../../../../core/services/event-engine.service';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('OriginComponent', () => {
  let component: OriginComponent;
  let fixture: ComponentFixture<OriginComponent>;
  let mockCharacterService: any;
  let mockDiceService: any;
  let mockEventEngine: any;

  beforeEach(async () => {
    mockCharacterService = {
      character: signal({
          species: 'Human',
          characteristics: {
              str: { value: 7, modifier: 0 },
              dex: { value: 7, modifier: 0 },
              end: { value: 7, modifier: 0 },
              int: { value: 7, modifier: 0 },
              edu: { value: 7, modifier: 0 },
              soc: { value: 7, modifier: 0 },
          },
          skills: [],
          nationality: 'United States', // Default for tests
          originType: 'Core',
          homeworld: { name: 'Earth', gravity: 1.0, gravityCode: 'Normal' }
      }),
      updateCharacter: (val: any) => {}, 
      updateCharacteristics: (val: any) => {},
      ensureSkillLevel: (skill: string, level: number) => {},
      addSkill: (skill: string, level: number) => {},
      log: (msg: string) => {}
    };

    mockDiceService = {
      getModifier: (val: number) => 0
    };

    mockEventEngine = {
      registerCustomHandler: (id: string, handler: any) => {},
      applyEffects: (effects: any) => {}
    };

    await TestBed.configureTestingModule({
      imports: [OriginComponent, CommonModule, FormsModule],
      providers: [
        { provide: CharacterService, useValue: mockCharacterService },
        { provide: DiceService, useValue: mockDiceService },
        { provide: EventEngineService, useValue: mockEventEngine }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(OriginComponent, {
        set: { 
            imports: [CommonModule, FormsModule],
            template: '<div>Mock Origin</div>',
            styles: []
        }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Gravity Modifications (Rule 209)', () => {
      beforeEach(() => {
          vi.spyOn(mockCharacterService, 'updateCharacteristics');
          vi.spyOn(mockCharacterService, 'log');
      });

      it('should apply Zero-G modifiers (S-2, D+2, E-2)', () => {
          mockCharacterService.character.set({
              ...mockCharacterService.character(),
              homeworld: { name: 'ZeroG', gravity: 0.0, gravityCode: 'Low' }
          });
          
          // Access private method or use a public trigger if available. 
          // applyPhysicalAdaptations is private but called in save().
          // We can cast to any to call private method for testing
          (component as any).applyPhysicalAdaptations();

          const args = mockCharacterService.updateCharacteristics.calls.mostRecent().args[0];
          expect(args.str.gravityMod).toBe(-2);
          expect(args.dex.gravityMod).toBe(2);
          expect(args.end.gravityMod).toBe(-2);
      });

      it('should apply Light gravity modifiers (S-1, D+1, E-1)', () => {
          mockCharacterService.character.set({
              ...mockCharacterService.character(),
              homeworld: { name: 'Mars-like', gravity: 0.15, gravityCode: 'Light' }
          });
          
          (component as any).applyPhysicalAdaptations();

          const args = mockCharacterService.updateCharacteristics.calls.mostRecent().args[0];
          expect(args.str.gravityMod).toBe(-1);
          expect(args.dex.gravityMod).toBe(1);
          expect(args.end.gravityMod).toBe(-1);
      });

      it('should apply Low/Normal gravity modifiers (None)', () => {
          mockCharacterService.character.set({
              ...mockCharacterService.character(),
              homeworld: { name: 'Earth-like', gravity: 0.5, gravityCode: 'Low' }
          });
          
          (component as any).applyPhysicalAdaptations();

          const args = mockCharacterService.updateCharacteristics.calls.mostRecent().args[0];
          expect(args.str.gravityMod).toBe(0);
          expect(args.dex.gravityMod).toBe(0);
          expect(args.end.gravityMod).toBe(0);
      });

      it('should apply Heavy gravity modifiers (S+1, D-1, E+1)', () => {
          mockCharacterService.character.set({
              ...mockCharacterService.character(),
              homeworld: { name: 'Heavy World', gravity: 2.5, gravityCode: 'Heavy' }
          });
          
          (component as any).applyPhysicalAdaptations();

          const args = mockCharacterService.updateCharacteristics.calls.mostRecent().args[0];
          expect(args.str.gravityMod).toBe(1);
          expect(args.dex.gravityMod).toBe(-1);
          expect(args.end.gravityMod).toBe(1);
      });

      it('should apply Extreme gravity modifiers (S+2, D-2, E+2)', () => {
          mockCharacterService.character.set({
              ...mockCharacterService.character(),
              homeworld: { name: 'King', gravity: 3.1, gravityCode: 'Extreme' }
          });
          
          (component as any).applyPhysicalAdaptations();

          const args = mockCharacterService.updateCharacteristics.calls.mostRecent().args[0];
          expect(args.str.gravityMod).toBe(2);
          expect(args.dex.gravityMod).toBe(-2);
          expect(args.end.gravityMod).toBe(2);
      });
  });
});
