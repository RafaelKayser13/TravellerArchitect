import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugFloater } from '../../../../app/features/shared/debug-floater/debug-floater';

describe('DebugFloater', () => {
  let component: DebugFloater;
  let fixture: ComponentFixture<DebugFloater>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugFloater]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugFloater);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
