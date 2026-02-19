import { Component, inject, signal, ViewChild, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DiceRollerComponent } from './features/shared/dice-roller/dice-roller.component';
import { NpcInteractionComponent } from './features/shared/npc-interaction/npc-interaction.component';
import { DiceDisplayService } from './core/services/dice-display.service';
import { NpcInteractionService } from './core/services/npc-interaction.service';
import { DebugFloaterComponent } from './features/shared/debug-floater/debug-floater.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DiceRollerComponent, NpcInteractionComponent, DebugFloaterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  diceService = inject(DiceDisplayService);
  npcService = inject(NpcInteractionService);
  showSystemMenu = signal(false);

  @ViewChild(DebugFloaterComponent) debugFloater?: DebugFloaterComponent;

  ngOnInit() {
    // Load debug mode from localStorage
    const savedDebugMode = localStorage.getItem('traveller-debug-mode');
    if (savedDebugMode === 'true') {
      this.diceService.debugMode.set(true);
    }
  }

  toggleSystemMenu() {
    this.showSystemMenu.update(v => !v);
  }

  toggleDebugMode() {
    this.diceService.debugMode.update(v => !v);
    // Persist to localStorage
    localStorage.setItem('traveller-debug-mode', String(this.diceService.debugMode()));
  }

  openDebug() {
    this.debugFloater?.toggleDebug();
    this.showSystemMenu.set(false);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const header = document.querySelector('.app-header');
    if (header && !header.contains(target)) {
      this.showSystemMenu.set(false);
    }
  }
}
