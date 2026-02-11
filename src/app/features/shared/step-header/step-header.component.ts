import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-header.component.html',
  styleUrls: ['./step-header.component.scss']
})
export class StepHeaderComponent {
  @Input() stepSymbol: string = 'SEC';
  @Input() stepNumber: string = '01';
  @Input() superLabel: string = '';
  @Input() topLabel: string = '';
  @Input() title: string = 'ESTABLISHMENT_PROTOCOL';
  @Input() subtitle: string = 'ACCESSING_LEGAL_DATABASE... [ OK ]';
  @Input() decorationVisible: boolean = true;
}
