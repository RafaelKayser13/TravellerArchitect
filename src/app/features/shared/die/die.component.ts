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
      perspective: 600px;
      display: inline-block;
    }

    .cube {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 1s ease-out;
    }

    .cube.rolling {
      animation: spin 0.5s infinite linear;
    }

    .face {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 2px solid var(--primary);
      background: #0b0c15; /* Dark background */
      color: #ffffff; /* White text */
      font-size: 2rem;
      font-family: var(--font-header);
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      text-shadow: 0 0 5px var(--primary);
      box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.2);
    }

    /* Face positioning */
    .front  { transform: rotateY(  0deg) translateZ(30px); }
    .back   { transform: rotateY(180deg) translateZ(30px); }
    .right  { transform: rotateY( 90deg) translateZ(30px); }
    .left   { transform: rotateY(-90deg) translateZ(30px); }
    .top    { transform: rotateX( 90deg) translateZ(30px); }
    .bottom { transform: rotateX(-90deg) translateZ(30px); }

    @keyframes spin {
        0% { transform: rotateX(0deg) rotateY(0deg); }
        100% { transform: rotateX(360deg) rotateY(360deg); }
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
