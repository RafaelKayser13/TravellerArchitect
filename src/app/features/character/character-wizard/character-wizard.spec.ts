import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterWizardComponent } from './character-wizard.component';
import { CharacterService } from '../../../core/services/character.service';
import { DiceService } from '../../../core/services/dice.service';

describe('CharacterWizardComponent', () => {
  let component: CharacterWizardComponent;
  let fixture: ComponentFixture<CharacterWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterWizardComponent],
      providers: [CharacterService, DiceService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
