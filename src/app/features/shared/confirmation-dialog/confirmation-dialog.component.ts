
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" [class.visible]="isOpen">
        <div class="dialog-box warning-theme">
            <h2 class="dialog-title">
                <i class="icon-warning"></i> 
                {{ title }}
            </h2>
            <div class="dialog-content">
                <p>{{ message }}</p>
            </div>
            <div class="dialog-actions">
                <button class="btn-cancel" (click)="onCancel()">CANCEL</button>
                <button class="btn-confirm" (click)="onConfirm()">CONFIRM RESET</button>
            </div>
        </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;

        &.visible {
            opacity: 1;
            pointer-events: all;
        }
    }

    .dialog-box {
        background: rgba(20, 0, 0, 0.95);
        border: 1px solid #ff4444;
        box-shadow: 0 0 30px rgba(255, 68, 68, 0.3);
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        position: relative;
        clip-path: polygon(
            0 0, 
            100% 0, 
            100% 85%, 
            95% 100%, 
            5% 100%, 
            0 85%
        );

        .dialog-title {
            color: #ff4444;
            font-family: 'Orbitron', sans-serif;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .dialog-content {
            color: #ccc;
            font-family: 'Inter', sans-serif;
            font-size: 1.1rem;
            margin-bottom: 2rem;
            line-height: 1.5;
        }

        .dialog-actions {
            display: flex;
            justify-content: center;
            gap: 20px;

            button {
                padding: 0.8rem 2rem;
                border: none;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                
                &.btn-cancel {
                    background: transparent;
                    border: 1px solid #666;
                    color: #888;
                    
                    &:hover {
                        border-color: #fff;
                        color: #fff;
                    }
                }

                &.btn-confirm {
                    background: rgba(255, 68, 68, 0.2);
                    border: 1px solid #ff4444;
                    color: #ff4444;
                    box-shadow: 0 0 10px rgba(255, 68, 68, 0.2);

                    &:hover {
                        background: #ff4444;
                        color: #000;
                        box-shadow: 0 0 20px #ff4444;
                    }
                }
            }
        }
    }
  `]
})
export class ConfirmationDialogComponent {
    @Input() isOpen = false;
    @Input() title = 'SYSTEM ALERT';
    @Input() message = 'Are you sure?';
    
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
