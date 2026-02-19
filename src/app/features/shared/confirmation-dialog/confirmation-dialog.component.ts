
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HudWindowComponent, HudType } from '../hud-window/hud-window.component';

export type DialogType = 'success' | 'warning' | 'error' | 'info';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule, HudWindowComponent],
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
    @Input() isOpen = false;
    @Input() type: DialogType = 'warning';
    @Input() title = 'SECURITY PROTOCOL';
    @Input() message = 'Execute command?';
    @Input() confirmLabel = 'INITIALIZE';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    get hudType(): HudType {
        switch (this.type) {
            case 'error': return 'danger';
            case 'success': return 'standard'; // specific success style can be added later
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'standard';
        }
    }

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
