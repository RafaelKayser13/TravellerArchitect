import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../core/services/character.service';
import { DiceService } from '../../../core/services/dice.service';

@Component({
  selector: 'app-debug-floater',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container">
      <button class="debug-fab" (click)="toggleDebug()">
        🐞
      </button>

      <div *ngIf="isOpen()" class="debug-overlay fade-in">
        <div class="debug-header">
           <h3>Debug Console</h3>
           <button class="close-btn" (click)="toggleDebug()">×</button>
        </div>
            <div class="debug-content">            
            <section>
                <h4>Character Log</h4>
                <div class="log-list">
                    <div *ngFor="let item of characterService.character().history" class="log-item">
                        {{ item }}
                    </div>
                </div>
            </section>
            
            <section>
                <h4>Character Data</h4>
                <pre>{{ characterService.character() | json }}</pre>
            </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #ff0055;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        transition: transform 0.2s;
    }
    .debug-fab:hover { transform: scale(1.1); }

    .debug-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.85);
        z-index: 9998;
        display: flex;
        flex-direction: column;
        padding: 2rem;
        box-sizing: border-box;
        color: #00ffcc;
        font-family: monospace;
    }

    .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #00ffcc;
        margin-bottom: 1rem;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: #ff0055;
        font-size: 2rem;
        cursor: pointer;
    }

    .debug-content {
        flex: 1;
        overflow-y: auto;
        display: flex;
        gap: 2rem;
    }

    section {
        flex: 1;
        background: rgba(255,255,255,0.05);
        padding: 1rem;
        border-radius: 8px;
        overflow: auto;
    }
    
    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 0.85rem;
    }
    
    .log-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-height: 500px; /* Scrollable if needed */
    }
    .log-item {
        font-size: 0.8rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 2px;
    }
  `]
})
export class DebugFloaterComponent {
  characterService = inject(CharacterService);
  diceService = inject(DiceService);
  
  isOpen = signal(false);

  toggleDebug() {
    this.isOpen.update(v => !v);
  }
}
