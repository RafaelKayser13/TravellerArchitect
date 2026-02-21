import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

type NavigationItem = 'dossier' | 'equipment' | 'vehicles';

@Component({
  selector: 'app-navigation-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="nav-sidebar">
      <!-- Scanlines overlay -->
      <div class="scanlines"></div>

      <!-- Circuitry top -->
      <div class="circuit-overlay top"></div>

      <div class="nav-content">
        <div class="nav-header">
          <div class="header-corner-tl"></div>
          <div class="header-corner-br"></div>
          <div class="nav-title">NAVIGATION.SYS</div>
          <div class="header-divider"></div>
        </div>

        <div class="nav-sections">
          <!-- Main Section: Character -->
          <div class="nav-section main-section">
            <button 
              class="nav-item nav-dossier" 
              [class.active]="currentRoute() === 'dossier'"
              (click)="selectRoute('dossier')"
              routerLink="/dossier"
            >
              <span class="item-bracket">▷</span>
              <span class="label">CHARACTER</span>
              <span class="item-bracket">◁</span>
              <div class="item-glow"></div>
            </button>
          </div>

          <!-- Items Section -->
          <div class="nav-section items-section">
            <div class="section-divider"></div>
            <div class="section-title">
              <span class="title-bracket">[</span>
              INVENTORY
              <span class="title-bracket">]</span>
            </div>
            
            <button 
              class="nav-item" 
              [class.active]="currentRoute() === 'equipment'"
              (click)="selectRoute('equipment')"
              routerLink="/equipment"
            >
              <span class="item-bracket">▷</span>
              <span class="label">EQUIPMENT</span>
              <span class="item-bracket">◁</span>
              <div class="item-glow"></div>
            </button>

            <button 
              class="nav-item" 
              [class.active]="currentRoute() === 'vehicles'"
              (click)="selectRoute('vehicles')"
              routerLink="/vehicles"
            >
              <span class="item-bracket">▷</span>
              <span class="label">VESSELS</span>
              <span class="item-bracket">◁</span>
              <div class="item-glow"></div>
            </button>
          </div>
        </div>

        <div class="nav-footer">
          <div class="footer-divider"></div>
          <div class="version">v2.1.0</div>
          <div class="status-indicator">● ONLINE</div>
        </div>
      </div>

      <!-- Circuitry bottom -->
      <div class="circuit-overlay bottom"></div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .nav-sidebar {
      position: relative;
      width: 260px;
      height: 100%;
      background: linear-gradient(180deg, #0a0e27 0%, #050505 100%);
      background-image: 
        linear-gradient(180deg, #0a0e27 0%, #050505 100%),
        repeating-linear-gradient(0deg,
          rgba(0, 0, 0, 0.15),
          rgba(0, 0, 0, 0.15) 1px,
          transparent 1px,
          transparent 2px);
      border-right: 2px solid #00f3ff;
      border-right-width: 3px;
      box-shadow: 
        inset -1px 0 0 rgba(0, 243, 255, 0.2),
        -8px 0 24px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(0, 243, 255, 0.15);
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      z-index: 50;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, 
          transparent, 
          #00f3ff, 
          #ff8c00,
          transparent);
        z-index: 10;
      }

      &::after {
        content: "";
        position: absolute;
        top: 0;
        right: -1px;
        width: 1px;
        height: 100%;
        background: linear-gradient(180deg, 
          rgba(0, 243, 255, 0.5),
          rgba(0, 243, 255, 0.1),
          rgba(255, 140, 0, 0.1),
          transparent);
        z-index: 5;
      }
    }

    .scanlines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: repeating-linear-gradient(0deg,
        rgba(0, 0, 0, 0.1),
        rgba(0, 0, 0, 0.1) 1px,
        transparent 1px,
        transparent 2px);
      pointer-events: none;
      z-index: 2;
    }

    .circuit-overlay {
      position: absolute;
      left: 0;
      right: 0;
      height: 120px;
      background-image: 
        linear-gradient(90deg, 
          rgba(0, 243, 255, 0.1) 1px, 
          transparent 1px),
        linear-gradient(0deg, 
          rgba(0, 243, 255, 0.1) 1px, 
          transparent 1px),
        radial-gradient(circle at 50% 50%, 
          rgba(0, 243, 255, 0.15), 
          transparent 60%);
      background-size: 25px 25px;
      -webkit-mask-image: linear-gradient(to bottom, black, transparent);
      mask-image: linear-gradient(to bottom, black, transparent);
      pointer-events: none;
      z-index: 1;

      &.top {
        top: 0;
        animation: circuit-pulse-top 8s ease-in-out infinite;
      }

      &.bottom {
        bottom: 0;
        transform: scaleY(-1);
        animation: circuit-pulse-bottom 8s ease-in-out infinite;
      }
    }

    @keyframes circuit-pulse-top {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    @keyframes circuit-pulse-bottom {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    .nav-content {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      z-index: 3;
      overflow: hidden;
    }

    .nav-header {
      position: relative;
      padding: 16px 12px;
      border-bottom: 2px solid #00f3ff;
      background: linear-gradient(180deg, 
        rgba(0, 243, 255, 0.08) 0%, 
        rgba(0, 243, 255, 0.02) 100%);
      box-shadow: inset 0 1px 0 rgba(0, 243, 255, 0.2);

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg,
          transparent,
          #00f3ff,
          transparent);
      }
    }

    .header-corner-tl,
    .header-corner-br {
      position: absolute;
      width: 12px;
      height: 12px;
      border: 2px solid #ff8c00;
    }

    .header-corner-tl {
      top: 0;
      left: 0;
      border-right: none;
      border-bottom: none;
    }

    .header-corner-br {
      bottom: 0;
      right: 0;
      border-left: none;
      border-top: none;
    }

    .nav-title {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #00f3ff;
      text-transform: uppercase;
      font-family: 'Rajdhani', monospace;
      text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
      margin-bottom: 4px;
    }

    .header-divider {
      height: 1px;
      background: linear-gradient(90deg,
        transparent,
        #00f3ff,
        #ff8c00,
        transparent);
      opacity: 0.5;
    }

    .nav-sections {
      flex: 1;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }

    .nav-section {
      padding: 0;
    }

    .main-section {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 243, 255, 0.3);
    }

    .section-divider {
      height: 2px;
      background: linear-gradient(90deg,
        transparent,
        #ff8c00,
        rgba(255, 140, 0, 0.3),
        transparent);
      margin: 12px 0;
    }

    .section-title {
      padding: 0 12px;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #ff8c00;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-family: 'Rajdhani', monospace;
      text-shadow: 0 0 8px rgba(255, 140, 0, 0.4);
    }

    .title-bracket {
      color: #ff8c00;
      margin: 0 4px;
    }

    .nav-item {
      position: relative;
      width: 100%;
      padding: 12px 12px;
      margin: 4px 0;
      background: linear-gradient(135deg,
        rgba(0, 243, 255, 0.08) 0%,
        rgba(0, 243, 255, 0.02) 100%);
      border: 1px solid rgba(0, 243, 255, 0.3);
      border-left: 3px solid rgba(0, 243, 255, 0.5);
      color: #00f3ff;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      transition: all 0.2s ease;
      font-family: 'Rajdhani', monospace;
      overflow: hidden;
      outline: none;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg,
          rgba(0, 243, 255, 0),
          rgba(0, 243, 255, 0.5),
          rgba(0, 243, 255, 0));
      }

      &:hover {
        background: linear-gradient(135deg,
          rgba(0, 243, 255, 0.15) 0%,
          rgba(0, 243, 255, 0.08) 100%);
        border-color: rgba(0, 243, 255, 0.8);
        border-left-color: #00f3ff;
        transform: translateX(4px);
        box-shadow: 0 0 12px rgba(0, 243, 255, 0.2);
      }

      &.active {
        background: linear-gradient(135deg,
          rgba(0, 243, 255, 0.25) 0%,
          rgba(0, 243, 255, 0.12) 100%);
        border: 1px solid #00f3ff;
        border-left: 3px solid #00f3ff;
        box-shadow: 
          inset 0 0 12px rgba(0, 243, 255, 0.15),
          0 0 20px rgba(0, 243, 255, 0.3);
        color: #00f3ff;
        text-shadow: 0 0 8px rgba(0, 243, 255, 0.8);
      }

      &.nav-dossier {
        border-color: rgba(255, 140, 0, 0.3);
        border-left-color: rgba(255, 140, 0, 0.5);
        color: #ff8c00;

        &:hover {
          border-color: rgba(255, 140, 0, 0.8);
          border-left-color: #ff8c00;
          box-shadow: 0 0 12px rgba(255, 140, 0, 0.2);
        }

        &.active {
          background: linear-gradient(135deg,
            rgba(255, 140, 0, 0.25) 0%,
            rgba(255, 140, 0, 0.12) 100%);
          border: 1px solid #ff8c00;
          border-left: 3px solid #ff8c00;
          box-shadow: 
            inset 0 0 12px rgba(255, 140, 0, 0.15),
            0 0 20px rgba(255, 140, 0, 0.3);
          text-shadow: 0 0 8px rgba(255, 140, 0, 0.8);
        }
      }
    }

    .item-bracket {
      color: inherit;
      opacity: 0.6;
      font-weight: 900;
    }

    .icon {
      font-size: 14px;
      width: 20px;
      text-align: center;
      animation: icon-pulse 2s ease-in-out infinite;

      &.active {
        animation: icon-glow 1.5s ease-in-out infinite;
      }
    }

    .nav-item.active .icon {
      animation: icon-glow 1.5s ease-in-out infinite;
    }

    @keyframes icon-pulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    @keyframes icon-glow {
      0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
      50% { opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
    }

    .label {
      flex: 1;
      text-align: left;
    }

    .item-glow {
      position: absolute;
      bottom: -100%;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(0, 243, 255, 0.3), transparent);
      pointer-events: none;
      transition: bottom 0.3s ease;
    }

    .nav-item:hover .item-glow {
      bottom: 0;
    }

    .nav-footer {
      position: relative;
      padding: 12px;
      border-top: 2px solid rgba(0, 243, 255, 0.3);
      background: linear-gradient(180deg,
        rgba(0, 243, 255, 0.02) 0%,
        rgba(0, 0, 0, 0.1) 100%);
      text-align: center;
    }

    .footer-divider {
      height: 1px;
      background: linear-gradient(90deg,
        transparent,
        #00f3ff,
        #ff8c00,
        transparent);
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .version {
      font-size: 9px;
      color: #00f3ff;
      letter-spacing: 2px;
      font-family: 'Rajdhani', monospace;
      text-shadow: 0 0 4px rgba(0, 243, 255, 0.4);
    }

    .status-indicator {
      font-size: 8px;
      color: #39ff14;
      letter-spacing: 1px;
      margin-top: 4px;
      font-family: 'Rajdhani', monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      &::before {
        content: "●";
        font-size: 6px;
        animation: status-blink 1.5s ease-in-out infinite;
      }
    }

    @keyframes status-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Scrollbar */
    .nav-sections::-webkit-scrollbar {
      width: 6px;
    }

    .nav-sections::-webkit-scrollbar-track {
      background: rgba(0, 243, 255, 0.05);
    }

    .nav-sections::-webkit-scrollbar-thumb {
      background: rgba(0, 243, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 243, 255, 0.5);
      }
    }
  `]
})
export class NavigationSidebarComponent {
  private router = inject(Router);
  currentRoute = signal<NavigationItem>('dossier');

  selectRoute(route: NavigationItem) {
    this.currentRoute.set(route);
  }
}

