import { Component } from '@angular/core';
import { TabletFrameComponent } from '../../../shared/components/tablet-frame/tablet-frame.component';

@Component({
  selector: 'app-vehicles-section',
  standalone: true,
  imports: [TabletFrameComponent],
  template: `
    <app-tablet-frame 
      brandingLabel="VESSELS_CATALOG_v2.8"
      frameLabel="VESSELS.SYS"
      frameClass="vessels-frame">
      <!-- Vessels content goes here -->
    </app-tablet-frame>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class VehiclesSectionComponent {}
