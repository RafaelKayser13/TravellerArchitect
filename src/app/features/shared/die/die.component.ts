import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-die',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scene">
      <div class="cube" [ngClass]="['show-' + value, rolling ? 'rolling' : '']">
        <div class="face front">1</div>
        <div class="face back">6</div>
        <div class="face right">3</div>
        <div class="face left">4</div>
        <div class="face top">5</div>
        <div class="face bottom">2</div>
      </div>
    </div>
  `,
  styles: [`
    .scene {
      width: 60px;
      height: 60px;
      perspective: 1000px;
      display: inline-block;
      margin: 5px;
    }

    .cube {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
      will-change: transform; /* Hardware Acceleration */
    }

    .cube.rolling {
      animation: spin 0.4s infinite linear;
    }

    .face {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 2px solid var(--neon-cyan);
      background: var(--cyber-yellow); /* Pure solid Cyber Yellow */
      color: #000000;
      font-size: 2.1rem;
      font-family: var(--font-accent);
      font-weight: 800;
      display: flex;
      justify-content: center;
      align-items: center;
      text-shadow: none;
      box-shadow: none;
      
      background-image: none; /* Removed grid to keep color pure */

      &::before {
        content: "";
        position: absolute;
        top: -1px; left: -1px;
        border-top: 4px solid var(--neon-cyan);
        border-left: 4px solid var(--neon-cyan);
        width: 12px;
        height: 12px;
        pointer-events: none;
      }

      &::after {
        content: "DICE_UNIT";
        position: absolute;
        bottom: 2px;
        right: 4px;
        font-family: var(--font-mono);
        font-size: 0.45rem;
        color: #000000;
        font-weight: 900;
        letter-spacing: 1px;
      }
    }

    @keyframes scanline {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 0.4; }
      90% { opacity: 0.4; }
      100% { top: 100%; opacity: 0; }
    }

    /* Face positioning */
    .front  { transform: rotateY(  0deg) translateZ(30px); }
    .back   { transform: rotateY(180deg) translateZ(30px); }
    .right  { transform: rotateY( 90deg) translateZ(30px); }
    .left   { transform: rotateY(-90deg) translateZ(30px); }
    .top    { transform: rotateX( 90deg) translateZ(30px); }
    .bottom { transform: rotateX(-90deg) translateZ(30px); }

    @keyframes spin {
        0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
        100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg); }
    }

    /* Orientations */
    .show-1 { transform: rotateY(0deg); }
    .show-6 { transform: rotateY(180deg); }
    .show-3 { transform: rotateY(-90deg); }
    .show-4 { transform: rotateY(90deg); }
    .show-5 { transform: rotateX(-90deg); }
    .show-2 { transform: rotateX(90deg); }
  `]
})
export class DieComponent {
  @Input() value: number = 1;
  @Input() rolling: boolean = false;
}
