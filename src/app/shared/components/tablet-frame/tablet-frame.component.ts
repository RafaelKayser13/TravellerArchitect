import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tablet-frame',
  standalone: true,
  template: `
    <div class="tablet-container">
      <div class="tablet-hardware">
        <!-- Screen Glare Overlay -->
        <div class="screen-glare"></div>
        
        <!-- Circuitry Overlays -->
        <div class="hw-circuits top"></div>
        <div class="hw-circuits bottom"></div>

        <!-- Physical Hardware Details -->
        <div class="hw-bezel-detail top">
          <div class="sensor-eye"></div>
          <div class="branding">{{ brandingLabel }}</div>
          <div class="status-leds">
            <div class="led power-on"></div>
            <div class="led data-link pulse"></div>
            <div class="led sync-blink"></div>
          </div>
          <div class="battery-meter">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar dim"></div>
          </div>
        </div>

        <!-- Corner Reinforcements -->
        <div class="hw-corner top-left"></div>
        <div class="hw-corner top-right"></div>
        <div class="hw-corner bottom-left"></div>
        <div class="hw-corner bottom-right"></div>
        
        <div class="hw-bezel-detail left">
          <div class="grip-strip"></div>
          <div class="vent-grill"></div>
          <div class="comm-link"></div>
        </div>
        
        <div class="hw-bezel-detail right">
          <div class="fingerprint-sensor"></div>
          <div class="vent-grill"></div>
          <div class="hw-button"></div>
          <div class="hw-button long"></div>
          <div class="hw-button"></div>
        </div>

        <div [class]="frameClass">
          <div class="frame-header">
            <h2>{{ frameLabel }}</h2>
            <div class="header-divider"></div>
          </div>
          <div class="frame-content">
            <ng-content></ng-content>
          </div>
        </div>

        <div class="hw-bezel-detail bottom">
          <div class="io-port"></div>
          <div class="speaker-slits"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .tablet-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.8rem 1rem 1.8rem;
      box-sizing: border-box;
      flex: 1;
      height: 100%;
      min-height: 0;
      background: radial-gradient(circle at center, #1a1a1a 0%, #050505 100%);
      overflow: hidden;
      position: relative;
    }

    .tablet-hardware {
      position: relative;
      background: 
        repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 2px),
        linear-gradient(135deg, #444 0%, #1a1a1a 100%);
      padding: 0.8rem 2.2rem;
      max-width: 1600px;
      width: 100%;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      
      clip-path: polygon(
        45px 0, calc(100% - 45px) 0, 100% 45px, 
        100% calc(100% - 45px), calc(100% - 45px) 100%, 45px 100%, 
        0 calc(100% - 45px), 0 45px
      );

      box-shadow: 
        0 40px 100px rgba(0,0,0,0.9),
        inset 0 2px 3px rgba(255,255,255,0.1),
        inset 0 -2px 5px rgba(0,0,0,0.8),
        0 0 0 1px rgba(255,255,255,0.05);
      border: 1px solid #000;

      .frame-base {
        background: var(--bg-panel, rgba(16, 16, 16, 0.85));
        border: 2px solid #000;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
        overflow: hidden;
        position: relative;
        box-shadow: 
          inset 0 0 30px rgba(0,0,0,0.9),
          0 0 0 1px rgba(255,255,255,0.03);
        border-radius: 4px;
        z-index: 5;
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 15%, transparent 85%, rgba(255,255,255,0.05) 100%);
        pointer-events: none;
        z-index: 10;
      }
    }

    .hw-circuits {
      position: absolute;
      left: 10%;
      right: 10%;
      height: 100px;
      background-image: 
        linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px),
        linear-gradient(0deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      -webkit-mask-image: linear-gradient(to bottom, black, transparent);
      mask-image: linear-gradient(to bottom, black, transparent);
      z-index: 1;
      pointer-events: none;

      &.top { top: 0; }
      &.bottom { bottom: 0; transform: scaleY(-1); }
      
      &::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.1), transparent 70%);
        animation: circuit-flow 10s infinite linear;
      }
    }

    @keyframes circuit-flow {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    .hw-corner {
      position: absolute;
      width: 60px;
      height: 60px;
      background: #000;
      z-index: 2;
      border: 1px solid rgba(255,255,255,0.05);
      box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.05);

      &.top-left { top: 0; left: 0; clip-path: polygon(0 0, 100% 0, 0 100%); }
      &.top-right { top: 0; right: 0; clip-path: polygon(0 0, 100% 0, 100% 100%); }
      &.bottom-left { bottom: 0; left: 0; clip-path: polygon(0 0, 0 100%, 100% 100%); }
      &.bottom-right { bottom: 0; right: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%); }

      &::after {
        content: "";
        position: absolute;
        width: 4px;
        height: 4px;
        background: #222;
        border-radius: 50%;
        box-shadow: inset 0 1px 2px #000;
        top: 15px;
        left: 15px;
      }
    }

    .screen-glare {
      position: absolute;
      top: 2.2rem;
      left: 2.2rem;
      right: 2.2rem;
      bottom: 2.2rem;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%);
      pointer-events: none;
      z-index: 10;
      border-radius: 4px;
    }

    .vent-grill {
      width: 6px;
      height: 100px;
      background: repeating-linear-gradient(0deg, #000, #000 2px, #222 2px, #222 4px);
      border: 1px solid #111;
      opacity: 0.6;
      animation: vent-glow 4s infinite;
    }

    @keyframes vent-glow {
      0%, 100% { opacity: 0.4; filter: brightness(1); }
      50% { opacity: 0.8; filter: brightness(1.5); }
    }

    @keyframes flash-sync {
      0%, 80%, 100% { opacity: 0.1; }
      90% { opacity: 1; box-shadow: 0 0 10px #ffee00; }
    }

    @keyframes led-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; box-shadow: 0 0 10px #00f3ff; }
    }

    .hw-bezel-detail {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;

      &.top {
        top: 0.9rem;
        left: 0;
        right: 0;
        gap: 3rem;

        .sensor-eye {
          width: 10px;
          height: 10px;
          background: radial-gradient(circle at 30% 30%, #222, #000);
          border-radius: 50%;
          border: 1px solid #444;
          box-shadow: 0 0 5px rgba(0, 243, 255, 0.2);
        }

        .branding {
          font-size: 0.55rem;
          font-family: 'JetBrains Mono', monospace;
          color: #555;
          letter-spacing: 5px;
          font-weight: 900;
          text-shadow: 0 1px 0 #000;
        }

        .status-leds {
          display: flex;
          gap: 10px;
          .led {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #111;
            &.power-on { background: #00ff44; box-shadow: 0 0 8px rgba(0, 255, 68, 0.5); }
            &.data-link { background: #00f3ff; animation: led-pulse 2.5s infinite; }
            &.sync-blink { background: #ffee00; animation: flash-sync 3s infinite; }
          }
        }

        .battery-meter {
          display: flex;
          gap: 3px;
          padding: 4px;
          background: #000;
          border: 1px solid #333;
          border-radius: 2px;
          .bar {
            width: 4px;
            height: 8px;
            background: #00ff44;
            box-shadow: 0 0 5px rgba(0,255,68,0.3);
            &.dim { background: #111; box-shadow: none; }
          }
        }
      }

      &.left {
        left: 0.7rem;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
        gap: 2rem;

        .grip-strip {
          width: 8px;
          height: 150px;
          background: repeating-linear-gradient(0deg, #000, #000 3px, #1a1a1a 3px, #1a1a1a 6px);
          border: 1px solid #111;
          border-radius: 4px;
        }

        .comm-link {
          width: 12px;
          height: 20px;
          background: #111;
          border: 1px solid #333;
          border-radius: 2px;
          position: relative;
          &::after {
            content: "";
            position: absolute;
            inset: 3px;
            background: #00f3ff;
            box-shadow: 0 0 5px #00f3ff;
            animation: led-pulse 1s infinite;
          }
        }
      }

      &.right {
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        flex-direction: column;
        gap: 1.5rem;

        .fingerprint-sensor {
          width: 26px;
          height: 36px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(0, 243, 255, 0.2);
          border-radius: 40% 40% 35% 35% / 30% 30% 40% 40%;
          margin-right: 6px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 6px rgba(0, 243, 255, 0.08), inset 0 0 4px rgba(0, 0, 0, 0.6);

          &::before {
            content: "";
            position: absolute;
            inset: 3px;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 243, 255, 0.18) 2px,
              rgba(0, 243, 255, 0.18) 3px
            );
            border-radius: inherit;
            clip-path: ellipse(50% 50% at 50% 50%);
          }

          &::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(180deg,
              transparent,
              rgba(0, 243, 255, 0.35) 50%,
              transparent);
            animation: fp-scan 3s ease-in-out infinite;
            pointer-events: none;
          }
        }

        @keyframes fp-scan {
          0%   { top: -6px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% + 6px); opacity: 0; }
        }

        .hw-button {
          width: 5px;
          height: 35px;
          background: linear-gradient(to right, #222, #111);
          border: 1px solid #000;
          border-radius: 0 3px 3px 0;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
          &.long { height: 70px; }
        }
      }
    }

    .frame-base,
    .equipment-frame, 
    .vessels-frame {
      background: var(--bg-panel, rgba(16, 16, 16, 0.85));
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      overflow: hidden;
      position: relative;
      box-shadow: 
        inset 0 0 30px rgba(0,0,0,0.9),
        0 0 0 1px rgba(255,255,255,0.03);
      border-radius: 4px;
      z-index: 5;
    }

    /* Generic frame class for any custom frameClass value */
    [class*="frame"] {
      background: var(--bg-panel, rgba(16, 16, 16, 0.85));
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      overflow: hidden;
      position: relative;
      box-shadow: 
        inset 0 0 30px rgba(0,0,0,0.9),
        0 0 0 1px rgba(255,255,255,0.03);
      border-radius: 4px;
      z-index: 5;
    }

    .frame-header {
      padding: 0.4rem 1.5rem;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
      border-bottom: 1px solid rgba(0, 243, 255, 0.1);
      position: relative;
      flex: none;
      height: auto;
      min-height: auto;
    }

    .frame-header h2 {
      margin: 0;
      color: var(--text-main, #e0e0e0);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      opacity: 0.9;
    }

    .header-divider {
      height: 1px;
      background: var(--neon-cyan, #00f3ff);
      box-shadow: 0 0 10px var(--neon-cyan, #00f3ff);
      margin-top: 3px;
      opacity: 0.3;
    }

    .frame-content {
      flex: 1;
      padding: 1rem 1.5rem;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      scrollbar-width: thin;
      scrollbar-color: var(--neon-cyan, #00f3ff) transparent;
      display: flex;
      flex-direction: column;
      min-height: 0;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--neon-cyan, #00f3ff);
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;

        &:hover {
          background: rgba(0, 243, 255, 0.8);
          background-clip: padding-box;
        }
      }
    }
  `]
})
export class TabletFrameComponent {
  @Input() brandingLabel: string = 'SYSTEM_DEFAULT_v1.0';
  @Input() frameLabel: string = 'FRAME.SYS';
  @Input() frameClass: string = 'frame-base';
}
