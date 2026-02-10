import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusteringOut } from './mustering-out';

describe('MusteringOut', () => {
  let component: MusteringOut;
  let fixture: ComponentFixture<MusteringOut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusteringOut]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusteringOut);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
