import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipment } from '../../../../core/models/equipment.model';

interface SpecItem {
  label: string;
  value: string | number;
  type?: 'stat' | 'trait' | 'feature' | 'cost' | 'requirement';
}

@Component({
  selector: 'app-equipment-detail-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-panel" *ngIf="equipment">
      <div class="panel-header">
        <div class="header-main">
          <h2 class="item-name">{{ equipment.name }}</h2>
          <span class="item-category" [class]="getCategoryClass()">
            {{ getCategoryDisplay() }}
          </span>
        </div>
        <button class="close-btn" (click)="onClose.emit()">✕</button>
      </div>

      <div class="panel-body">
        <!-- Description -->
        <div class="description-section">
          <p class="item-description">{{ equipment.description }}</p>
        </div>

        <!-- Basic Stats -->
        <div class="specs-section">
          <div class="specs-header">
            <h3>SPECIFICATIONS</h3>
          </div>
          <div class="specs-grid">
            <div class="spec-row">
              <span class="spec-label">TECH LEVEL:</span>
              <span class="spec-value">TL{{ equipment.techLevel }}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">COST:</span>
              <span class="spec-value cost">Lv{{ equipment.cost | number }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment.mass">
              <span class="spec-label">MASS:</span>
              <span class="spec-value">{{ equipment.mass }}kg</span>
            </div>
          </div>
        </div>

        <!-- Weapon Specs -->
        <div class="weapon-specs" *ngIf="isWeapon()">
          <div class="specs-header">
            <h3>WEAPON SPECS</h3>
          </div>
          <div class="specs-grid">
            <div class="spec-row" *ngIf="equipment['damage']">
              <span class="spec-label">DAMAGE:</span>
              <span class="spec-value">{{ equipment['damage'] }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['range']">
              <span class="spec-label">RANGE:</span>
              <span class="spec-value">{{ equipment['range'] }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['magazine']">
              <span class="spec-label">MAGAZINE:</span>
              <span class="spec-value">{{ equipment['magazine'] }} rounds</span>
            </div>
            <div class="spec-row" *ngIf="equipment['rateOfFire']">
              <span class="spec-label">RATE OF FIRE:</span>
              <span class="spec-value">{{ equipment['rateOfFire'] }}</span>
            </div>
          </div>

          <!-- Traits -->
          <div class="traits-section" *ngIf="equipment['traits'] && equipment['traits'].length > 0">
            <div class="traits-header">
              <h4>TRAITS</h4>
            </div>
            <div class="traits-list">
              <span *ngFor="let trait of equipment['traits']" class="trait-badge">
                {{ trait }}
              </span>
            </div>
          </div>
        </div>

        <!-- Armor Specs -->
        <div class="armor-specs" *ngIf="isArmor()">
          <div class="specs-header">
            <h3>ARMOR SPECS</h3>
          </div>
          <div class="specs-grid">
            <div class="spec-row" *ngIf="equipment['protection']">
              <span class="spec-label">PROTECTION:</span>
              <span class="spec-value">+{{ equipment['protection'] }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['armorType']">
              <span class="spec-label">TYPE:</span>
              <span class="spec-value">{{ formatText(equipment['armorType']) }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['encumbrance']">
              <span class="spec-label">ENCUMBRANCE:</span>
              <span class="spec-value">-{{ equipment['encumbrance'] }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['envRating']">
              <span class="spec-label">ENV RATING:</span>
              <span class="spec-value">{{ equipment['envRating'] }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['requiredSkill']">
              <span class="spec-label">REQUIRED:</span>
              <span class="spec-value">{{ equipment['requiredSkill'] }}</span>
            </div>
          </div>
        </div>

        <!-- Cybernetic Specs -->
        <div class="cyber-specs" *ngIf="isCybernetic()">
          <div class="specs-header">
            <h3>CYBERNETIC SPECS</h3>
          </div>
          <div class="specs-grid">
            <div class="spec-row" *ngIf="equipment['implantType']">
              <span class="spec-label">TYPE:</span>
              <span class="spec-value">{{ formatText(equipment['implantType']) }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['surgeryTime']">
              <span class="spec-label">SURGERY TIME:</span>
              <span class="spec-value">{{ equipment['surgeryTime'] }}h</span>
            </div>
            <div class="spec-row" *ngIf="equipment['maintenanceCostPerMonth']">
              <span class="spec-label">MAINTENANCE:</span>
              <span class="spec-value">Lv{{ equipment['maintenanceCostPerMonth'] }}/mo</span>
            </div>
            <div class="spec-row" *ngIf="equipment['yearlyMaintenanceCost']">
              <span class="spec-label">YEARLY COST:</span>
              <span class="spec-value">Lv{{ equipment['yearlyMaintenanceCost'] | number }}</span>
            </div>
            <div class="spec-row" *ngIf="equipment['batteryLife']">
              <span class="spec-label">BATTERY:</span>
              <span class="spec-value">{{ equipment['batteryLife'] }}</span>
            </div>
          </div>

          <!-- Features -->
          <div class="features-section" *ngIf="equipment['features'] && equipment['features'].length > 0">
            <div class="features-header">
              <h4>FEATURES</h4>
            </div>
            <div class="features-list">
              <div *ngFor="let feature of equipment['features']" class="feature-item">
                {{ feature }}
              </div>
            </div>
          </div>

          <!-- Effects/Side Effects -->
          <div class="effects-section" *ngIf="equipment['effects'] || equipment['sideEffects']">
            <div *ngIf="equipment['effects']" class="effects-subsection">
              <h4>EFFECTS</h4>
              <div class="effect-list">
                <div *ngFor="let effect of equipment['effects']" class="effect-item">
                  {{ effect }}
                </div>
              </div>
            </div>
            <div *ngIf="equipment['sideEffects']" class="effects-subsection">
              <h4>SIDE EFFECTS</h4>
              <div class="effect-list">
                <div *ngFor="let effect of equipment['sideEffects']" class="effect-item warning">
                  {{ effect }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Restrictions -->
        <div class="restrictions-section" *ngIf="equipment.restrictions && equipment.restrictions.length > 0">
          <div class="restrictions-header">
            <h3>RESTRICTIONS</h3>
          </div>
          <div class="restrictions-list">
            <span *ngFor="let restriction of equipment.restrictions" class="restriction-badge">
              {{ formatText(restriction) }}
            </span>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <button class="btn-close" (click)="onClose.emit()">
          ← BACK
        </button>
        <button class="btn-add" (click)="onAdd.emit()">
          ✓ ADD TO CHARACTER
        </button>
      </div>
    </div>
  `,
  styles: [`
    .detail-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 20, 40, 0.9), rgba(20, 10, 40, 0.9));
      color: #00ff88;
      font-family: 'Courier New', monospace;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 15px;
      border-bottom: 2px solid #00f3ff;
      background: rgba(0, 243, 255, 0.05);
      gap: 15px;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .item-name {
      margin: 0;
      font-size: 1.2rem;
      color: #00f3ff;
      text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
    }

    .item-category {
      display: inline-block;
      width: fit-content;
      padding: 4px 10px;
      border-radius: 3px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .item-category.weapon {
      background: rgba(255, 100, 0, 0.2);
      color: #ff6400;
      border: 1px solid #ff6400;
    }

    .item-category.armor {
      background: rgba(0, 200, 255, 0.2);
      color: #00c8ff;
      border: 1px solid #00c8ff;
    }

    .item-category.cybernetic {
      background: rgba(255, 0, 136, 0.2);
      color: #ff0088;
      border: 1px solid #ff0088;
    }

    .item-category.gear {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid #00ff88;
    }

    .close-btn {
      background: none;
      border: none;
      color: #ff0088;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .close-btn:hover {
      text-shadow: 0 0 10px rgba(255, 0, 136, 0.5);
      transform: scale(1.2);
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .description-section {
      background: rgba(0, 255, 136, 0.05);
      padding: 12px;
      border-left: 3px solid #00f3ff;
      border-radius: 3px;
    }

    .item-description {
      margin: 0;
      font-size: 0.9rem;
      color: #cccccc;
      line-height: 1.4;
    }

    .specs-section,
    .weapon-specs,
    .armor-specs,
    .cyber-specs {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #00ff88;
      border-radius: 3px;
      overflow: hidden;
    }

    .specs-header {
      background: rgba(0, 255, 136, 0.1);
      padding: 8px 12px;
      border-bottom: 1px solid #00ff88;
    }

    .specs-header h3,
    .specs-header h4 {
      margin: 0;
      font-size: 0.85rem;
      color: #00ff88;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .specs-grid {
      display: flex;
      flex-direction: column;
      padding: 10px;
      gap: 8px;
    }

    .spec-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      background: rgba(0, 255, 136, 0.03);
      border-left: 2px solid #00f3ff;
    }

    .spec-label {
      font-size: 0.8rem;
      color: #00ff88;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    .spec-value {
      font-size: 0.85rem;
      color: #cccccc;
      font-weight: bold;
    }

    .spec-value.cost {
      color: #ffff00;
      text-shadow: 0 0 5px rgba(255, 255, 0, 0.3);
    }

    .traits-section,
    .features-section {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #00ff88;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 10px;
    }

    .traits-header,
    .features-header {
      background: rgba(0, 255, 136, 0.1);
      padding: 8px 12px;
      border-bottom: 1px solid #00ff88;
    }

    .traits-header h4,
    .features-header h4 {
      margin: 0;
      font-size: 0.8rem;
      color: #00ff88;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .traits-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px;
    }

    .trait-badge {
      background: rgba(255, 100, 0, 0.2);
      border: 1px solid #ff6400;
      color: #ff6400;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: bold;
    }

    .features-list {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .feature-item {
      padding: 6px 8px;
      background: rgba(0, 200, 255, 0.08);
      border-left: 2px solid #00c8ff;
      font-size: 0.85rem;
      color: #cccccc;
    }

    .effects-section {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #00ff88;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 10px;
    }

    .effects-subsection {
      padding: 10px;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }

    .effects-subsection:last-child {
      border-bottom: none;
    }

    .effects-subsection h4 {
      margin: 0 0 8px 0;
      font-size: 0.8rem;
      color: #00ff88;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .effect-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .effect-item {
      padding: 4px 6px;
      background: rgba(0, 200, 255, 0.05);
      border-left: 2px solid #00c8ff;
      font-size: 0.8rem;
      color: #cccccc;
    }

    .effect-item.warning {
      background: rgba(255, 0, 136, 0.08);
      border-left-color: #ff0088;
      color: #ff0088;
    }

    .restrictions-section {
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid #ff0088;
      border-radius: 3px;
      overflow: hidden;
    }

    .restrictions-header {
      background: rgba(255, 0, 136, 0.1);
      padding: 8px 12px;
      border-bottom: 1px solid #ff0088;
    }

    .restrictions-header h3 {
      margin: 0;
      font-size: 0.85rem;
      color: #ff0088;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .restrictions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px;
    }

    .restriction-badge {
      background: rgba(255, 0, 136, 0.2);
      border: 1px solid #ff0088;
      color: #ff0088;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: bold;
    }

    .panel-footer {
      display: flex;
      gap: 10px;
      padding: 12px;
      border-top: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.05);
      flex-shrink: 0;
    }

    button {
      flex: 1;
      padding: 10px;
      font-family: 'Courier New', monospace;
      border-radius: 3px;
      border: 2px solid;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }

    .btn-close {
      background: rgba(255, 0, 136, 0.1);
      border-color: #ff0088;
      color: #ff0088;
    }

    .btn-close:hover {
      background: rgba(255, 0, 136, 0.2);
      box-shadow: 0 0 10px rgba(255, 0, 136, 0.3);
    }

    .btn-add {
      background: rgba(0, 243, 255, 0.2);
      border-color: #00f3ff;
      color: #00f3ff;
    }

    .btn-add:hover {
      background: rgba(0, 243, 255, 0.3);
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.4);
    }

    /* Scrollbar styling */
    .panel-body::-webkit-scrollbar {
      width: 8px;
    }

    .panel-body::-webkit-scrollbar-track {
      background: rgba(0, 255, 136, 0.05);
    }

    .panel-body::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 136, 0.2);
      border-radius: 4px;
    }

    .panel-body::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 255, 136, 0.4);
    }
  `]
})
export class EquipmentDetailPanelComponent {
  @Input() equipment: Equipment | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAdd = new EventEmitter<void>();

  isWeapon(): boolean {
    return this.equipment ? ('damage' in this.equipment && 'range' in this.equipment) : false;
  }

  isArmor(): boolean {
    return this.equipment ? ('protection' in this.equipment) : false;
  }

  isCybernetic(): boolean {
    return this.equipment ? ('surgeryTime' in this.equipment) : false;
  }

  getCategoryDisplay(): string {
    if (!this.equipment) return '';

    if (this.isWeapon()) return '🔫 WEAPON';
    if (this.isArmor()) return '🛡️ ARMOR';
    if (this.isCybernetic()) return '⚙️ CYBERNETIC';
    return '🎒 GEAR';
  }

  getCategoryClass(): string {
    if (!this.equipment) return '';

    if (this.isWeapon()) return 'weapon';
    if (this.isArmor()) return 'armor';
    if (this.isCybernetic()) return 'cybernetic';
    return 'gear';
  }

  formatText(text: string): string {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
