import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributesComponent } from './attributes.component';
import { DiceService } from '../../../../core/services/dice.service';
import { CharacterService } from '../../../../core/services/character.service';

describe('AttributesComponent', () => {
  let component: AttributesComponent;
  let fixture: ComponentFixture<AttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributesComponent],
      providers: [DiceService, CharacterService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
