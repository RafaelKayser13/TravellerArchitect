import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentSelection } from '../../../../core/models/character.model';
import { EquipmentService } from '../../../../core/services/equipment.service';

@Component({
  selector: 'app-equipment-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="equipment-display">
      <div class="equipment-section" *ngIf="weapons.length > 0">
        <h3 class="section-title">Weapons</h3>
        <div class="equipment-list">
          <div *ngFor="let item of weapons" class="equipment-card">
            <div class="card-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="equipped-badge" *ngIf="item.equipped">EQUIPPED</span>
            </div>
            <div class="card-details">
              <span class="detail">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="detail">Lv{{ getEquipmentData(item)?.cost | number }}</span>
              <span class="detail">{{ getEquipmentData(item)?.mass }}kg</span>
            </div>
            <p class="item-description">{{ getEquipmentData(item)?.description }}</p>
            <div class="card-actions">
              <button (click)="toggleEquipped(item)" class="btn-small">
                {{ item.equipped ? 'Unequip' : 'Equip' }}
              </button>
              <button (click)="removeItem(item)" class="btn-small btn-remove">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div class="equipment-section" *ngIf="armor.length > 0">
        <h3 class="section-title">Armor</h3>
        <div class="equipment-list">
          <div *ngFor="let item of armor" class="equipment-card">
            <div class="card-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="equipped-badge" *ngIf="item.equipped">WORN</span>
            </div>
            <div class="card-details">
              <span class="detail">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="detail">Lv{{ getEquipmentData(item)?.cost | number }}</span>
              <span class="detail">{{ getEquipmentData(item)?.mass }}kg</span>
            </div>
            <p class="item-description">{{ getEquipmentData(item)?.description }}</p>
            <div class="card-actions">
              <button (click)="toggleEquipped(item)" class="btn-small">
                {{ item.equipped ? 'Remove' : 'Wear' }}
              </button>
              <button (click)="removeItem(item)" class="btn-small btn-remove">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="equipment-section" *ngIf="cybernetics.length > 0">
        <h3 class="section-title">Cybernetics</h3>
        <div class="equipment-list">
          <div *ngFor="let item of cybernetics" class="equipment-card cyber-card">
            <div class="card-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="equipped-badge">INSTALLED</span>
            </div>
            <div class="card-details">
              <span class="detail">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="detail">Lv{{ getEquipmentData(item)?.cost | number }}</span>
            </div>
            <p class="item-description">{{ getEquipmentData(item)?.description }}</p>
            <div class="card-actions">
              <button (click)="removeItem(item)" class="btn-small btn-remove">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div class="equipment-section" *ngIf="otherEquipment.length > 0">
        <h3 class="section-title">Other Equipment</h3>
        <div class="equipment-list">
          <div *ngFor="let item of otherEquipment" class="equipment-card">
            <div class="card-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="quantity" *ngIf="item.quantity > 1">x{{ item.quantity }}</span>
            </div>
            <div class="card-details">
              <span class="detail">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="detail">Lv{{ getEquipmentData(item)?.cost | number }}</span>
              <span class="detail" *ngIf="getEquipmentData(item)?.mass">
                {{ getEquipmentData(item)?.mass }}kg
              </span>
            </div>
            <p class="item-description">{{ getEquipmentData(item)?.description }}</p>
            <div class="card-actions">
              <button (click)="removeItem(item)" class="btn-small btn-remove">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-section" *ngIf="equippedItems.length > 0">
        <div class="summary-item">
          <strong>Total Items:</strong> {{ equippedItems.length }}
        </div>
        <div class="summary-item">
          <strong>Total Cost:</strong> Lv{{ calculateTotalCost() | number }}
        </div>
        <div class="summary-item">
          <strong>Total Mass:</strong> {{ calculateTotalMass() | number }}kg
        </div>
      </div>

      <div class="empty-state" *ngIf="equippedItems.length === 0">
        <p>No equipment selected yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .equipment-display {
      width: 100%;
      color: #00ff88;
      font-family: 'Courier New', monospace;
    }

    .equipment-section {
      margin-bottom: 30px;
      border: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.05);
      padding: 15px;
      border-radius: 4px;
    }

    .section-title {
      margin: 0 0 15px 0;
      font-size: 1.2rem;
      color: #00ff88;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 1px solid #00ff88;
      padding-bottom: 10px;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .equipment-list {
      display: grid;
      gap: 15px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .equipment-card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #00ff88;
      padding: 12px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .equipment-card:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
    }

    .cyber-card {
      border-color: #ff0088;
      background: rgba(255, 0, 136, 0.05);
    }

    .cyber-card:hover {
      background: rgba(255, 0, 136, 0.1);
      box-shadow: 0 0 15px rgba(255, 0, 136, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      gap: 10px;
    }

    .item-name {
      font-weight: bold;
      color: #00ff88;
      flex: 1;
    }

    .equipped-badge {
      background: rgba(0, 255, 136, 0.2);
      border: 1px solid #00ff88;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.75rem;
      color: #00ff88;
      text-transform: uppercase;
      font-weight: bold;
    }

    .cyber-card .equipped-badge {
      background: rgba(255, 0, 136, 0.2);
      border-color: #ff0088;
      color: #ff0088;
    }

    .quantity {
      background: rgba(255, 255, 0, 0.2);
      border: 1px solid #ffff00;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.85rem;
      color: #ffff00;
    }

    .card-details {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;
      font-size: 0.9rem;
    }

    .detail {
      background: rgba(0, 255, 136, 0.1);
      padding: 3px 8px;
      border-radius: 3px;
      color: #cccccc;
    }

    .item-description {
      margin: 8px 0;
      font-size: 0.85rem;
      color: #cccccc;
      line-height: 1.3;
    }

    .card-actions {
      display: flex;
      gap: 5px;
      margin-top: 10px;
    }

    .btn-small {
      flex: 1;
      padding: 6px 10px;
      font-size: 0.8rem;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid #00ff88;
      color: #00ff88;
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.2s;
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }

    .btn-small:hover {
      background: rgba(0, 255, 136, 0.2);
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
    }

    .btn-remove {
      background: rgba(255, 0, 136, 0.1);
      border-color: #ff0088;
      color: #ff0088;
    }

    .btn-remove:hover {
      background: rgba(255, 0, 136, 0.2);
      box-shadow: 0 0 8px rgba(255, 0, 136, 0.3);
    }

    .summary-section {
      background: rgba(0, 255, 136, 0.1);
      border: 2px solid #00ff88;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }

    .summary-item {
      padding: 8px 0;
      color: #00ff88;
      border-bottom: 1px solid #00ff88;
      font-size: 0.95rem;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item strong {
      color: #ffff00;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #00ff88;
      opacity: 0.5;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .equipment-list {
        grid-template-columns: 1fr;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .card-actions {
        flex-direction: column;
      }
    }
  `],
})
export class EquipmentDisplayComponent implements OnInit, OnChanges {
  @Input() equippedItems: EquipmentSelection[] = [];

  weapons: EquipmentSelection[] = [];
  armor: EquipmentSelection[] = [];
  cybernetics: EquipmentSelection[] = [];
  otherEquipment: EquipmentSelection[] = [];

  private equipmentCache: Map<string, any> = new Map();

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.organizeEquipment();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['equippedItems']) {
      this.organizeEquipment();
    }
  }

  private organizeEquipment(): void {
    this.weapons = this.equippedItems.filter(
      (item) => item.category?.includes('weapon') ?? false
    );
    this.armor = this.equippedItems.filter(
      (item) => item.category?.includes('armor') ?? false
    );
    this.cybernetics = this.equippedItems.filter(
      (item) => item.category?.includes('cybernetic') ?? false
    );
    this.otherEquipment = this.equippedItems.filter(
      (item) =>
        !(item.category?.includes('weapon') ?? false) &&
        !(item.category?.includes('armor') ?? false) &&
        !(item.category?.includes('cybernetic') ?? false)
    );
  }

  getEquipmentData(item: EquipmentSelection): any {
    if (!this.equipmentCache.has(item.id)) {
      const data = this.equipmentService.getEquipmentById(item.id);
      if (data) {
        this.equipmentCache.set(item.id, data);
      }
    }
    return this.equipmentCache.get(item.id);
  }

  toggleEquipped(item: EquipmentSelection): void {
    item.equipped = !item.equipped;
  }

  removeItem(item: EquipmentSelection): void {
    const index = this.equippedItems.indexOf(item);
    if (index > -1) {
      this.equippedItems.splice(index, 1);
      this.organizeEquipment();
    }
  }

  calculateTotalCost(): number {
    return this.equippedItems.reduce((total, item) => {
      const data = this.getEquipmentData(item);
      return total + (data?.cost || 0) * item.quantity;
    }, 0);
  }

  calculateTotalMass(): number {
    return this.equippedItems.reduce((total, item) => {
      const data = this.getEquipmentData(item);
      return total + (data?.mass || 0) * item.quantity;
    }, 0);
  }
}
