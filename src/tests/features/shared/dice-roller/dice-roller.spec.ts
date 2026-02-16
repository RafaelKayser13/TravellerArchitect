import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceRoller } from '../../../../app/features/shared/dice-roller/dice-roller';

describe('DiceRoller', () => {
  let component: DiceRoller;
  let fixture: ComponentFixture<DiceRoller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiceRoller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiceRoller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
