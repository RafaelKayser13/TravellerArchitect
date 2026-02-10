
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DialogType = 'success' | 'warning' | 'error' | 'info';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dialog-overlay" [class.visible]="isOpen">
        <div class="dialog-box" [ngClass]="type">
            <div class="dialog-header">
                <div class="hdr-label">SECURE_DIALOG // TYPE: {{ type.toUpperCase() }}</div>
                <h2 class="dialog-title">
                    <span class="corner-marker"></span>
                    {{ title }}
                </h2>
            </div>
            
            <div class="dialog-content">
                <p>{{ message }}</p>
                <div class="status-readout">> SYSTEM_WAITING_FOR_USER_INPUT...</div>
            </div>

            <div class="dialog-actions">
                <button class="btn-cancel" (click)="onCancel()">
                    [ ABORT ]
                </button>
                <button class="btn-confirm" (click)="onConfirm()">
                    [ {{ confirmLabel }} ]
                </button>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .dialog-overlay {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 20px;

        &.visible {
            opacity: 1;
            pointer-events: all;
            .dialog-box { transform: scale(1) translateY(0); }
        }
    }

    .dialog-box {
        background: var(--bg-panel);
        border: 1px solid var(--neon-cyan);
        box-shadow: 0 0 30px var(--neon-cyan-glow);
        padding: 0;
        max-width: 480px;
        width: 100%;
        position: relative;
        transform: scale(0.9) translateY(20px);
        transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        clip-path: polygon(
            0 0, 
            calc(100% - 30px) 0, 
            100% 30px, 
            100% 100%, 
            30px 100%, 
            0 calc(100% - 30px)
        );

        /* Type Variations */
        &.success {
            border-color: #00ff9d;
            box-shadow: 0 0 30px rgba(0, 255, 157, 0.2);
            .dialog-title, .hdr-label { color: #00ff9d; }
            .btn-confirm { border-color: #00ff9d; color: #00ff9d; &:hover { background: #00ff9d; color: #000; box-shadow: 0 0 20px #00ff9d; } }
        }
        &.warning {
            border-color: var(--vivid-orange);
            box-shadow: 0 0 30px var(--vivid-orange-glow);
            .dialog-title, .hdr-label { color: var(--vivid-orange); }
            .btn-confirm { border-color: var(--vivid-orange); color: var(--vivid-orange); &:hover { background: var(--vivid-orange); color: #000; box-shadow: 0 0 20px var(--vivid-orange-glow); } }
        }
        &.error {
            border-color: var(--power-red);
            box-shadow: 0 0 30px var(--power-red-glow);
            .dialog-title, .hdr-label { color: var(--power-red); }
            .btn-confirm { border-color: var(--power-red); color: var(--power-red); &:hover { background: var(--power-red); color: #000; box-shadow: 0 0 20px var(--power-red-glow); } }
        }
        &.info {
            border-color: var(--neon-cyan);
            box-shadow: 0 0 30px var(--neon-cyan-glow);
            .dialog-title, .hdr-label { color: var(--neon-cyan); }
            .btn-confirm { border-color: var(--neon-cyan); color: var(--neon-cyan); &:hover { background: var(--neon-cyan); color: #000; box-shadow: 0 0 20px var(--neon-cyan-glow); } }
        }

        .dialog-header {
            padding: 1.5rem 2rem 1rem;
            background: rgba(255,255,255,0.03);
            border-bottom: 1px solid rgba(255,255,255,0.05);

            .hdr-label {
                font-family: var(--font-mono);
                font-size: 0.6rem;
                letter-spacing: 2px;
                margin-bottom: 0.5rem;
                opacity: 0.7;
            }

            .dialog-title {
                font-family: var(--font-accent);
                font-size: 1.4rem;
                margin: 0;
                letter-spacing: 2px;
                position: relative;
            }
        }

        .dialog-content {
            padding: 2rem;
            color: var(--text-main);
            font-family: var(--font-body);
            font-size: 1rem;
            line-height: 1.6;

            p { margin: 0; }

            .status-readout {
                margin-top: 1.5rem;
                font-family: var(--font-mono);
                font-size: 0.65rem;
                color: var(--text-dim);
                opacity: 0.5;
            }
        }

        .dialog-actions {
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            background: rgba(0,0,0,0.3);

            button {
                padding: 0.7rem 1.5rem;
                background: transparent;
                border: 1px solid var(--text-dim);
                color: var(--text-dim);
                font-family: var(--font-header);
                font-weight: 700;
                font-size: 1rem;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s;
                clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
                
                &:hover {
                    border-color: #fff;
                    color: #fff;
                    background: rgba(255,255,255,0.05);
                }
            }
        }
    }
  `]
})
export class ConfirmationDialogComponent {
    @Input() isOpen = false;
    @Input() type: DialogType = 'warning';
    @Input() title = 'SECURITY PROTOCOL';
    @Input() message = 'Execute command?';
    @Input() confirmLabel = 'INITIALIZE';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
