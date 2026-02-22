import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

type NavigationItem = 'dossier' | 'equipment' | 'vehicles' | 'vessels';

@Component({
  selector: 'app-navigation-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="nav-sidebar">
      <!-- Decorator lines -->
      <div class="sidebar-glint"></div>

      <div class="nav-branding">
        <div class="logo-box">
           <div class="bracket"></div>
           <div class="logo-text">
             <h1 class="title">TRAVELLER</h1>
             <h2 class="subtitle">ARCHITECT</h2>
           </div>
        </div>
        <div class="sys-version">OS_VER://3.2.1</div>
      </div>

      <div class="nav-sections scrollable">
        <div class="nav-section">
          <div class="section-title">
            <span class="title-text">// CORE_SYSTEM</span>
          </div>
          
          <button 
            class="nav-item" 
            [class.active]="currentRoute() === 'dossier'"
            (click)="selectRoute('dossier')"
            routerLink="/dossier"
          >
            <div class="btn-indicator" *ngIf="currentRoute() === 'dossier'"></div>
            <span class="nav-code">CHR</span>
            <span class="nav-name">CHARACTER</span>
          </button>
        </div>

        <div class="nav-section">
          <div class="section-divider"></div>
          <div class="section-title">
            <span class="title-text">// INVENTORY</span>
          </div>
          
          <button 
            class="nav-item" 
            [class.active]="currentRoute() === 'equipment'"
            (click)="selectRoute('equipment')"
            routerLink="/equipment"
          >
            <div class="btn-indicator" *ngIf="currentRoute() === 'equipment'"></div>
            <span class="nav-code">EQP</span>
            <span class="nav-name">EQUIPMENT</span>
          </button>

          <button 
            class="nav-item" 
            [class.active]="currentRoute() === 'vehicles'"
            (click)="selectRoute('vehicles')"
            routerLink="/vehicles"
          >
            <div class="btn-indicator" *ngIf="currentRoute() === 'vehicles'"></div>
            <span class="nav-code">VHC</span>
            <span class="nav-name">VEHICLES</span>
          </button>

          <button 
            class="nav-item" 
            [class.active]="currentRoute() === 'vessels'"
            (click)="selectRoute('vessels')"
            routerLink="/vessels"
          >
            <div class="btn-indicator" *ngIf="currentRoute() === 'vessels'"></div>
            <span class="nav-code">VSL</span>
            <span class="nav-name">VESSELS</span>
          </button>
        </div>
      </div>

      <div class="nav-footer">
        <div class="footer-data">
          <span class="footer-label">STATUS</span>
          <span class="status-indicator">ONLINE</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .nav-sidebar {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(8, 12, 18, 1) 0%, rgba(4, 6, 10, 1) 100%);
      position: relative;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    /* Cyberpunk Grid Overlay */
    .nav-sidebar::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
      z-index: 1;
    }

    .sidebar-glint {
      position: absolute;
      top: 0;
      right: -1px;
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 243, 255, 0.5) 20%, transparent 100%);
      z-index: 5;
    }

    .nav-branding {
      padding: 1.5rem 1.5rem 1rem;
      background: linear-gradient(180deg, rgba(0, 243, 255, 0.05) 0%, transparent 100%);
      border-bottom: 1px solid rgba(0, 243, 255, 0.1);
      position: relative;
      z-index: 2;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 40px;
        height: 2px;
        background: var(--neon-cyan, #00f3ff);
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.6);
      }
    }

    .logo-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;

      .bracket {
        width: 16px;
        height: 24px;
        border-left: 2px solid #00f3ff;
        border-top: 2px solid #00f3ff;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 6px;
          height: 6px;
          border-right: 2px solid #00f3ff;
          border-bottom: 2px solid #00f3ff;
        }
      }

      .logo-text {
        display: flex;
        flex-direction: column;

        .title {
          font-family: var(--font-accent, 'Rajdhani', sans-serif);
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 4px;
          margin: 0;
          line-height: 1;
        }

        .subtitle {
          font-family: var(--font-accent, 'Rajdhani', sans-serif);
          font-size: 1.1rem;
          font-weight: 900;
          color: #00f3ff;
          letter-spacing: 5px;
          margin: 0;
          line-height: 1;
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
        }
      }
    }

    .sys-version {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.55rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 2px;
      background: rgba(0, 243, 255, 0.1);
      padding: 0.2rem 0.5rem;
      border-left: 2px solid #00f3ff;
      display: inline-block;
    }

    .nav-sections {
      flex: 1;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: relative;
      z-index: 2;
      overflow-y: auto;
    }

    .section-title {
      margin-bottom: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      color: rgba(0, 243, 255, 0.6);
      letter-spacing: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      background: rgba(0, 10, 20, 0.6);
      border: 1px solid rgba(0, 243, 255, 0.15);
      color: rgba(255, 255, 255, 0.6);
      padding: 0.9rem 1.25rem;
      clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative;
      text-align: left;
      margin-bottom: 0.5rem;
      outline: none;
    }

    .btn-indicator {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: #00f3ff;
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.6);
    }

    .nav-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: rgba(0, 243, 255, 0.5);
      min-width: 35px;
      transition: all 0.2s ease;
    }

    .nav-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 1px;
      flex: 1;
      text-transform: uppercase;
    }

    .nav-item:hover {
      background: rgba(0, 243, 255, 0.08);
      border-color: rgba(0, 243, 255, 0.4);
      color: #fff;
      padding-left: 1.5rem;
    }

    .nav-item:hover .nav-code {
      color: #00f3ff;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(0, 243, 255, 0.2) 0%, rgba(0, 50, 100, 0.1) 100%);
      color: #fff;
      border-color: rgba(0, 243, 255, 0.5);
      box-shadow: inset 0 0 20px rgba(0, 243, 255, 0.1);
    }

    .nav-item.active .nav-code {
      color: #00f3ff;
      text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
    }

    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, rgba(0, 243, 255, 0.3) 0%, transparent 100%);
      margin-bottom: 1.5rem;
    }

    .nav-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid rgba(0, 243, 255, 0.1);
      background: rgba(0, 0, 0, 0.4);
      position: relative;
      z-index: 2;
    }

    .footer-data {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 1px;
    }

    .footer-label {
      color: rgba(255, 255, 255, 0.4);
    }

    .status-indicator {
      color: #00ff44;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-indicator::before {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      background: #00ff44;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0, 255, 68, 0.6);
      animation: status-pulse 2s infinite;
    }

    @keyframes status-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class NavigationSidebarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  currentRoute = signal<NavigationItem>('dossier');
  private sub?: Subscription;

  ngOnInit() {
    // Attempt to parse route from URL directly to guarantee accuracy
    this.updateRouteFromUrl(this.router.url);

    // Subscribe to router to catch all navigation ends
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateRouteFromUrl(event.urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateRouteFromUrl(url: string) {
    if (url.includes('dossier')) {
      this.currentRoute.set('dossier');
    } else if (url.includes('equipment')) {
      this.currentRoute.set('equipment');
    } else if (url.includes('vehicles')) {
      this.currentRoute.set('vehicles');
    } else if (url.includes('vessels')) {
      this.currentRoute.set('vessels');
    } else {
      // Fallback to localStorage if at root or unspecified
      const savedRoute = localStorage.getItem('mainNavSelectedRoute') as NavigationItem;
      if (savedRoute) {
        this.currentRoute.set(savedRoute);
      }
    }
  }

  selectRoute(route: NavigationItem) {
    this.currentRoute.set(route);
    localStorage.setItem('mainNavSelectedRoute', route);
  }
}

