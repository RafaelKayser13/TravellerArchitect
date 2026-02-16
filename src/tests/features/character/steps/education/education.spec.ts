import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Education } from '../../../../../app/features/character/steps/education/education';

describe('Education', () => {
  let component: Education;
  let fixture: ComponentFixture<Education>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Education]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Education);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
