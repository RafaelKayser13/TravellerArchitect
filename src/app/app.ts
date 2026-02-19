import { Component, inject, signal, ViewChild } from '@angular/core';
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
export class App {
  diceService = inject(DiceDisplayService);
  npcService = inject(NpcInteractionService);
  showSystemMenu = signal(false);

  @ViewChild(DebugFloaterComponent) debugFloater?: DebugFloaterComponent;

  toggleSystemMenu() {
    this.showSystemMenu.update(v => !v);
  }

  toggleDebugMode() {
    this.diceService.debugMode.update(v => !v);
  }

  openDebug() {
    this.debugFloater?.toggleDebug();
    this.showSystemMenu.set(false);
  }
}
