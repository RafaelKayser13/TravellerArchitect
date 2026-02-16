import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type HudType = 'standard' | 'warning' | 'danger' | 'info';

@Component({
    selector: 'app-hud-window',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hud-window.component.html',
    styleUrls: ['./hud-window.component.scss']
})
export class HudWindowComponent {
    @Input() title: string = 'SYSTEM_WINDOW';
    @Input() type: HudType = 'standard';
    @Input() isOpen: boolean = true;
    @Input() useOverlay: boolean = true;
    @Input() width: string = 'auto';
    @Input() height: string = 'auto';
    @Input() hasFooter: boolean = false;
    
    // Optional readouts for the corners
    @Input() readoutTL: string = 'SYSTEM: ONLINE';
    @Input() readoutTR: string = '';
    @Input() readoutBL: string = '';
    @Input() readoutBR: string = '';

    @Output() close = new EventEmitter<void>();

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('hud-overlay')) {
            this.close.emit();
        }
    }
}
