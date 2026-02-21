import { Component } from '@angular/core';

@Component({
  selector: 'app-vehicles-section',
  standalone: true,
  template: `
    <div class="section-wrapper">
      <div class="section-header">
        <h2>VEÍCULOS</h2>
        <div class="divider"></div>
      </div>
      <div class="section-content">
        <div class="placeholder">
          <span class="icon">🚀</span>
          <p>Seção de Veículos</p>
          <p class="subtitle">Gerenciar naves, veículos e equipamentos de transporte</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0a0e27 0%, #0f1436 100%);
    }

    .section-header {
      padding: 20px;
      border-bottom: 2px solid #00ff41;
      background: rgba(0, 255, 65, 0.05);
    }

    .section-header h2 {
      margin: 0;
      color: #00ff41;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, #00ff41 0%, transparent 100%);
      margin-top: 8px;
    }

    .section-content {
      flex: 1;
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder {
      text-align: center;
      color: #00aa2c;
    }

    .icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
      opacity: 0.7;
    }

    p {
      margin: 8px 0;
      font-size: 14px;
      letter-spacing: 1px;
    }

    .subtitle {
      font-size: 12px;
      opacity: 0.6;
    }
  `]
})
export class VehiclesSectionComponent {}
