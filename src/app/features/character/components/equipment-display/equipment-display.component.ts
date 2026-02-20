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
      <!-- Summary Header -->
      <div class="equipment-header" *ngIf="equippedItems.length > 0">
        <div class="header-stat">
          <span class="stat-label">📦 ITEMS</span>
          <span class="stat-value">{{ equippedItems.length }}</span>
        </div>
        <div class="header-stat">
          <span class="stat-label">💰 COST</span>
          <span class="stat-value">Lv{{ calculateTotalCost() | number }}</span>
        </div>
        <div class="header-stat">
          <span class="stat-label">⚖️ MASS</span>
          <span class="stat-value">{{ calculateTotalMass() | number }}kg</span>
        </div>
      </div>

      <!-- Weapons Section -->
      <div class="equipment-section" *ngIf="weapons.length > 0">
        <div class="section-header">
          <h3 class="section-title">🔫 WEAPONS</h3>
          <span class="section-count">{{ weapons.length }}</span>
        </div>
        <div class="equipment-table">
          <div class="table-row header-row">
            <div class="col-name">Name</div>
            <div class="col-specs">TL / Cost / Mass</div>
            <div class="col-status">Status</div>
            <div class="col-actions">Actions</div>
          </div>
          <div *ngFor="let item of weapons" class="table-row item-row">
            <div class="col-name">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-desc">{{ getEquipmentData(item)?.description }}</span>
            </div>
            <div class="col-specs">
              <span class="spec">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="spec">Lv{{ getEquipmentData(item)?.cost | number }}</span>
              <span class="spec">{{ getEquipmentData(item)?.mass }}kg</span>
            </div>
            <div class="col-status">
              <span class="status-badge" [ngClass]="{ equipped: item.equipped }">
                {{ item.equipped ? '✓ EQUIPPED' : '○ NOT EQUIPPED' }}
              </span>
            </div>
            <div class="col-actions">
              <button (click)="toggleEquipped(item)" class="btn-action btn-toggle" [title]="item.equipped ? 'Unequip' : 'Equip'">
                {{ item.equipped ? '✕' : '✓' }}
              </button>
              <button (click)="removeItem(item)" class="btn-action btn-remove" title="Remove">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Armor Section -->
      <div class="equipment-section" *ngIf="armor.length > 0">
        <div class="section-header">
          <h3 class="section-title">🛡️ ARMOR</h3>
          <span class="section-count">{{ armor.length }}</span>
        </div>
        <div class="equipment-table">
          <div class="table-row header-row">
            <div class="col-name">Name</div>
            <div class="col-specs">TL / Cost / Mass</div>
            <div class="col-status">Status</div>
            <div class="col-actions">Actions</div>
          </div>
          <div *ngFor="let item of armor" class="table-row item-row">
            <div class="col-name">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-desc">{{ getEquipmentData(item)?.description }}</span>
            </div>
            <div class="col-specs">
              <span class="spec">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="spec">Lv{{ getEquipmentData(item)?.cost | number }}</span>
              <span class="spec">{{ getEquipmentData(item)?.mass }}kg</span>
            </div>
            <div class="col-status">
              <span class="status-badge armor-badge" [ngClass]="{ equipped: item.equipped }">
                {{ item.equipped ? '✓ WORN' : '○ NOT WORN' }}
              </span>
            </div>
            <div class="col-actions">
              <button (click)="toggleEquipped(item)" class="btn-action btn-toggle" [title]="item.equipped ? 'Remove' : 'Wear'">
                {{ item.equipped ? '✕' : '✓' }}
              </button>
              <button (click)="removeItem(item)" class="btn-action btn-remove" title="Remove">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cybernetics Section -->
      <div class="equipment-section" *ngIf="cybernetics.length > 0">
        <div class="section-header">
          <h3 class="section-title">⚙️ CYBERNETICS</h3>
          <span class="section-count">{{ cybernetics.length }}</span>
        </div>
        <div class="equipment-table cyber">
          <div class="table-row header-row">
            <div class="col-name">Name</div>
            <div class="col-specs">TL / Cost</div>
            <div class="col-status">Status</div>
            <div class="col-actions">Actions</div>
          </div>
          <div *ngFor="let item of cybernetics" class="table-row item-row">
            <div class="col-name">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-desc">{{ getEquipmentData(item)?.description }}</span>
            </div>
            <div class="col-specs">
              <span class="spec">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="spec">Lv{{ getEquipmentData(item)?.cost | number }}</span>
            </div>
            <div class="col-status">
              <span class="status-badge cyber-badge">✓ INSTALLED</span>
            </div>
            <div class="col-actions">
              <button (click)="removeItem(item)" class="btn-action btn-remove" title="Remove">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Equipment Section -->
      <div class="equipment-section" *ngIf="otherEquipment.length > 0">
        <div class="section-header">
          <h3 class="section-title">🎒 GEAR</h3>
          <span class="section-count">{{ otherEquipment.length }}</span>
        </div>
        <div class="equipment-table">
          <div class="table-row header-row">
            <div class="col-name">Name</div>
            <div class="col-specs">TL / Cost / Mass</div>
            <div class="col-status">Qty</div>
            <div class="col-actions">Actions</div>
          </div>
          <div *ngFor="let item of otherEquipment" class="table-row item-row">
            <div class="col-name">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-desc">{{ getEquipmentData(item)?.description }}</span>
            </div>
            <div class="col-specs">
              <span class="spec">TL{{ getEquipmentData(item)?.techLevel }}</span>
              <span class="spec">Lv{{ getEquipmentData(item)?.cost | number }}</span>
              <span class="spec" *ngIf="getEquipmentData(item)?.mass">{{ getEquipmentData(item)?.mass }}kg</span>
            </div>
            <div class="col-status">
              <span class="qty-badge" *ngIf="item.quantity > 1">x{{ item.quantity }}</span>
              <span class="qty-badge" *ngIf="item.quantity === 1">×1</span>
            </div>
            <div class="col-actions">
              <button (click)="removeItem(item)" class="btn-action btn-remove" title="Remove">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="equippedItems.length === 0">
        <div class="empty-icon">📭</div>
        <p>No equipment selected yet</p>
        <p class="empty-hint">Equipment will appear here as you select items during Mustering Out</p>
      </div>
    </div>
  `,
  styles: [`
    .equipment-display {
      width: 100%;
      color: #00ff88;
      font-family: 'Courier New', monospace;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .equipment-header {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      padding: 15px;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05));
      border: 2px solid #00ff88;
      border-radius: 4px;
      box-shadow: inset 0 0 10px rgba(0, 255, 136, 0.1);
    }

    .header-stat {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #00ff88;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-value {
      font-size: 1.4rem;
      font-weight: bold;
      color: #ffff00;
      text-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
    }

    .equipment-section {
      border: 2px solid #00ff88;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: rgba(0, 255, 136, 0.1);
      border-bottom: 1px solid #00ff88;
    }

    .section-title {
      margin: 0;
      font-size: 1.1rem;
      color: #00ff88;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
    }

    .section-count {
      background: rgba(0, 255, 136, 0.2);
      padding: 3px 10px;
      border-radius: 3px;
      font-size: 0.9rem;
      color: #ffff00;
      font-weight: bold;
    }

    .equipment-table {
      display: flex;
      flex-direction: column;
    }

    .equipment-table.cyber {
      --cyber-color: #ff0088;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1.2fr 0.6fr;
      gap: 12px;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }

    .table-row.header-row {
      background: rgba(0, 255, 136, 0.05);
      font-weight: bold;
      font-size: 0.9rem;
      color: #00ff88;
      border-bottom: 2px solid #00ff88;
      padding: 10px 15px;
    }

    .equipment-table.cyber .table-row.header-row {
      background: rgba(255, 0, 136, 0.05);
      color: #ff0088;
      border-bottom-color: #ff0088;
    }

    .table-row.item-row {
      transition: all 0.2s;
    }

    .table-row.item-row:hover {
      background: rgba(0, 255, 136, 0.08);
    }

    .equipment-table.cyber .table-row.item-row:hover {
      background: rgba(255, 0, 136, 0.08);
    }

    .col-name {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .item-name {
      font-weight: bold;
      color: #00ff88;
      font-size: 0.95rem;
    }

    .equipment-table.cyber .item-name {
      color: #ff0088;
    }

    .item-desc {
      font-size: 0.75rem;
      color: #cccccc;
      opacity: 0.7;
      line-height: 1.2;
    }

    .col-specs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .spec {
      background: rgba(0, 255, 136, 0.1);
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 0.85rem;
      color: #cccccc;
      white-space: nowrap;
    }

    .equipment-table.cyber .spec {
      background: rgba(255, 0, 136, 0.1);
    }

    .col-status {
      display: flex;
      justify-content: center;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 3px;
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 1px;
      background: rgba(0, 255, 136, 0.1);
      color: #00ff88;
      border: 1px solid #00ff88;
      min-width: 120px;
      text-align: center;
    }

    .status-badge.equipped {
      background: rgba(0, 255, 136, 0.2);
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
    }

    .status-badge.armor-badge {
      background: rgba(0, 200, 255, 0.1);
      color: #00c8ff;
      border-color: #00c8ff;
    }

    .status-badge.armor-badge.equipped {
      background: rgba(0, 200, 255, 0.2);
      box-shadow: 0 0 8px rgba(0, 200, 255, 0.3);
    }

    .status-badge.cyber-badge {
      background: rgba(255, 0, 136, 0.2);
      color: #ff0088;
      border-color: #ff0088;
      box-shadow: 0 0 8px rgba(255, 0, 136, 0.3);
    }

    .qty-badge {
      background: rgba(255, 255, 0, 0.2);
      padding: 4px 10px;
      border-radius: 3px;
      color: #ffff00;
      font-weight: bold;
      border: 1px solid #ffff00;
      font-size: 0.85rem;
    }

    .col-actions {
      display: flex;
      gap: 5px;
      justify-content: flex-end;
    }

    .btn-action {
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid #00ff88;
      color: #00ff88;
      cursor: pointer;
      border-radius: 3px;
      font-size: 1rem;
      font-weight: bold;
      transition: all 0.2s;
      font-family: monospace;
    }

    .btn-action:hover {
      background: rgba(0, 255, 136, 0.2);
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
    }

    .btn-toggle {
      background: rgba(0, 255, 136, 0.1);
      border-color: #00ff88;
      color: #00ff88;
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #00ff88;
      opacity: 0.6;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .empty-state p {
      margin: 5px 0;
      font-size: 0.95rem;
    }

    .empty-hint {
      font-size: 0.85rem;
      opacity: 0.7;
      margin-top: 10px;
    }

    @media (max-width: 1024px) {
      .table-row {
        grid-template-columns: 1.5fr 1fr 1fr 0.5fr;
      }

      .col-specs {
        flex-direction: column;
      }
    }

    @media (max-width: 768px) {
      .equipment-display {
        gap: 15px;
      }

      .equipment-header {
        grid-template-columns: 1fr;
      }

      .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 12px;
      }

      .table-row.header-row {
        display: none;
      }

      .table-row.item-row {
        border: 1px solid rgba(0, 255, 136, 0.2);
        padding: 12px;
        gap: 8px;
      }

      .col-specs {
        order: 2;
      }

      .col-status {
        order: 3;
      }

      .col-actions {
        order: 4;
      }

      .col-name::before {
        content: 'Item: ';
        font-weight: bold;
        color: #00ff88;
      }

      .col-specs::before {
        content: 'Specs: ';
        font-weight: bold;
        color: #00ff88;
      }

      .col-status::before {
        content: 'Status: ';
        font-weight: bold;
        color: #00ff88;
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
