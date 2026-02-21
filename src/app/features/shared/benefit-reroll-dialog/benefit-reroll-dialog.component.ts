import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenefitRerollService } from '../../../core/services/benefit-reroll.service';

@Component({
    selector: 'app-benefit-reroll-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div *ngIf="isOpen()" class="reroll-modal-overlay fade-in">
            <div class="reroll-modal hud-module warning">
                <div class="hud-box-header">
                    <span class="index">REROLL</span>
                    <h3>DUPLICATE_BENEFIT_DETECTION</h3>
                </div>

                <div class="hud-content">
                    <p class="instruction">
                        You have rolled the <span class="highlight">same benefit</span> previously.
                        What would you like to do?
                    </p>

                    <div class="choice-options">
                        <!-- Double Option -->
                        <div class="choice-card double-card" (click)="selectDouble()">
                            <div class="choice-icon">2×</div>
                            <div class="choice-title">TAKE DOUBLE VALUE</div>
                            <div class="choice-desc">
                                {{ rule()?.doubleDescription || 'Take the benefit twice' }}
                            </div>
                            <button class="btn-choice">
                                DOUBLE
                                <span class="arrow">→</span>
                            </button>
                        </div>

                        <!-- Alternative Option (if available) -->
                        <div *ngIf="rule()?.hasAlternative" class="choice-card alternative-card" (click)="selectAlternative()">
                            <div class="choice-icon">⊕</div>
                            <div class="choice-title">TAKE ALTERNATIVE</div>
                            <div class="choice-desc">
                                {{ rule()?.alternativeDescription || 'Take a different benefit instead' }}
                            </div>
                            <button class="btn-choice alt">
                                ALTERNATIVE
                                <span class="arrow">→</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="hud-footer">
                    <p class="note">Rulebook: If you roll a benefit again, take it at twice the normal value OR take the alternative.</p>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .reroll-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .reroll-modal {
            width: 90%;
            max-width: 700px;
            border: 2px solid #ffaa00;
            background: linear-gradient(135deg, #2a1a0a 0%, #3a2a1a 100%);
            box-shadow: 0 0 30px rgba(255, 170, 0, 0.4),
                        inset 0 0 20px rgba(255, 170, 0, 0.1);
        }

        .hud-box-header {
            padding: 15px 20px;
            border-bottom: 2px solid #ffaa00;
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 170, 0, 0.08);

            .index {
                font-size: 12px;
                color: #ffaa00;
                font-weight: bold;
                letter-spacing: 2px;
            }

            h3 {
                flex: 1;
                margin: 0;
                color: #ffaa00;
                font-size: 16px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
        }

        .hud-content {
            padding: 25px 30px;

            .instruction {
                font-size: 14px;
                color: #aaaaaa;
                margin-bottom: 20px;
                line-height: 1.6;

                .highlight {
                    color: #ffaa00;
                    font-weight: bold;
                }
            }
        }

        .choice-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;

            @media (max-width: 600px) {
                grid-template-columns: 1fr;
            }
        }

        .choice-card {
            border: 2px solid #ff8800;
            padding: 20px;
            background: rgba(255, 136, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;

            &:hover {
                border-color: #ffaa00;
                background: rgba(255, 170, 0, 0.15);
                box-shadow: 0 0 15px rgba(255, 170, 0, 0.2);
                transform: translateY(-2px);
            }

            &.alternative-card {
                border-color: #88ff00;

                &:hover {
                    border-color: #aaff00;
                    background: rgba(170, 255, 0, 0.15);
                    box-shadow: 0 0 15px rgba(170, 255, 0, 0.2);
                }

                .choice-icon {
                    color: #aaff00;
                }

                .choice-title {
                    color: #aaff00;
                }

                .btn-choice {
                    border-color: #88ff00;
                    color: #aaff00;

                    &:hover {
                        background: rgba(136, 255, 0, 0.2);
                        box-shadow: 0 0 10px rgba(136, 255, 0, 0.3);
                    }
                }
            }

            .choice-icon {
                font-size: 40px;
                color: #ffaa00;
                margin-bottom: 10px;
                font-weight: bold;
            }

            .choice-title {
                font-size: 14px;
                color: #ffaa00;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }

            .choice-desc {
                font-size: 12px;
                color: #999999;
                margin-bottom: 15px;
                line-height: 1.5;
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .btn-choice {
                background: rgba(255, 136, 0, 0.2);
                border: 1px solid #ff8800;
                color: #ffaa00;
                padding: 10px 20px;
                cursor: pointer;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-radius: 4px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                justify-content: center;

                &:hover {
                    background: rgba(255, 136, 0, 0.3);
                    border-color: #ffaa00;
                    box-shadow: 0 0 10px rgba(255, 136, 0, 0.3);
                }

                .arrow {
                    font-size: 12px;
                }
            }
        }

        .hud-footer {
            padding: 15px 30px;
            border-top: 2px solid #ffaa00;
            background: rgba(255, 170, 0, 0.05);
            text-align: center;

            .note {
                font-size: 11px;
                color: #888888;
                margin: 0;
                font-style: italic;
            }
        }
    `]
})
export class BenefitRerollDialogComponent {
    private rerollService = inject(BenefitRerollService);

    isOpen = this.rerollService.isRerollDialogOpen;
    rule = this.rerollService.getPendingRerollRule;

    selectDouble() {
        this.rerollService.confirmDouble();
    }

    selectAlternative() {
        this.rerollService.confirmAlternative();
    }
}
