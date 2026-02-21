import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabletFrameComponent } from '../../../shared/components/tablet-frame/tablet-frame.component';
import { Equipment, EquipmentCategory } from '../../../core/models/equipment.model';
import { EquipmentService } from '../../../core/services/equipment.service';

interface CategoryItem {
  name: string;
  code: string;
  category: EquipmentCategory;
}

interface CategoryGroup {
  name: string;
  code: string;
  items: CategoryItem[];
}

@Component({
  selector: 'app-equipment-section',
  standalone: true,
  imports: [CommonModule, TabletFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-tablet-frame 
      brandingLabel="ARMORY_CATALOG_v3.2"
      frameLabel="EQUIPMENT.SYS"
      frameClass="equipment-frame">
      
      <div class="equipment-container" *ngIf="isLoaded()">
        <!-- Categories Sidebar -->
        <div class="categories-sidebar">
          <div class="sidebar-header">
            <h3>◀ CATEGORIES</h3>
          </div>
          
          <div class="category-list">
            <div *ngFor="let group of categoryGroups" class="category-group">
              <button class="group-header" (click)="toggleGroup(group.code)">
                <span class="group-toggle">{{ expandedGroups()[group.code] ? '▼' : '▶' }}</span>
                <span class="group-name">{{ group.name }}</span>
              </button>
              
              <div *ngIf="expandedGroups()[group.code]" class="group-items">
                <button *ngFor="let item of group.items" 
                        class="category-btn"
                        [class.active]="selectedCategory() === item.category"
                        (click)="selectCategory(item.category)">
                  <span class="category-code">{{ item.code }}</span>
                  <span class="category-name">{{ item.name }}</span>
                  <span class="item-count">{{ getItemsInCategory(item.category).length }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Equipment Grid -->
        <div class="equipment-main">
          <div class="equipment-header">
            <h2>{{ getSelectedCategoryName() }}</h2>
            <span class="status">ITEMS: {{ getItemsInCategory(selectedCategory()).length }} / {{ getAllEquipment().length }}</span>
          </div>

          <div class="equipment-grid">
            <div *ngFor="let item of getItemsInCategory(selectedCategory())" 
                 class="equipment-item"
                 [class.selected]="isSelected(item)"
                 (click)="toggleEquipmentSelection($event, item)">
              
              <div class="item-card">
                <div class="selection-indicator" *ngIf="isSelected(item)">✓</div>
                <div class="item-title">{{ item.name }}</div>
                <div class="item-specs">
                  <span class="spec">TL{{ item.techLevel }}</span>
                  <span class="spec">{{ item.mass }}kg</span>
                </div>
                <div class="item-description">{{ item.description }}</div>
                <div class="item-footer">
                  <span class="item-cost">Lv{{ item.cost | number }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="empty-state" *ngIf="getItemsInCategory(selectedCategory()).length === 0">
            <span class="empty-icon">∅</span>
            <span class="empty-text">NO ITEMS IN THIS CATEGORY</span>
          </div>
        </div>

        <!-- Selection Panel -->
        <div class="selection-panel" *ngIf="selectedEquipment().length > 0">
          <div class="panel-header">SELECTED ({{ selectedEquipment().length }})</div>
          <div class="selected-list">
            <div *ngFor="let item of selectedEquipment()" class="selected-row">
              <span class="selected-name">{{ item.name }}</span>
              <span class="selected-cost">{{ item.cost }}Lv</span>
              <button class="btn-remove" (click)="removeSelection($event, item)">✕</button>
            </div>
          </div>
          <div class="panel-footer">
            <div class="total-line">
              <span>TOTAL</span>
              <span class="total-cost">{{ totalCost() | number }}Lv</span>
            </div>
            <button class="btn-clear" (click)="clearSelection()">CLEAR</button>
          </div>
        </div>
      </div>
    </app-tablet-frame>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .equipment-container {
      display: grid;
      grid-template-columns: 200px 1fr 250px;
      gap: 1rem;
      height: 100%;
      min-height: 0;
    }

    .categories-sidebar {
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(10, 20, 30, 0.8) 0%, rgba(5, 15, 20, 0.9) 100%);
      border-right: 2px solid rgba(0, 243, 255, 0.3);
      border-radius: 4px;
      overflow: hidden;
      min-height: 0;

      .sidebar-header {
        background: linear-gradient(90deg, rgba(0, 243, 255, 0.1) 0%, transparent 100%);
        border-bottom: 1px solid rgba(0, 243, 255, 0.2);
        padding: 0.75rem;

        h3 {
          margin: 0;
          font-size: 0.7rem;
          font-weight: 700;
          color: #00f3ff;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 2px;
        }
      }

      .category-list {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 243, 255, 0.4) transparent;

        &::-webkit-scrollbar {
          width: 5px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 243, 255, 0.4);
          border-radius: 3px;
        }
      }

      .category-group {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.5rem 0.5rem;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid rgba(0, 243, 255, 0.1);

        &:last-child {
          border-bottom: none;
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: #00f3ff;
          padding: 0.5rem 0.7rem;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 1px;

          .group-toggle {
            display: inline-block;
            width: 12px;
            text-align: center;
            font-size: 0.6rem;
            color: rgba(0, 243, 255, 0.6);
          }

          .group-name {
            flex: 1;
            font-weight: 700;
          }

          &:hover {
            background: rgba(0, 243, 255, 0.1);
            box-shadow: 0 0 6px rgba(0, 243, 255, 0.15);
          }
        }

        .group-items {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding-left: 0.8rem;

          .category-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: transparent;
            border: 1px solid rgba(0, 243, 255, 0.15);
            color: #999;
            padding: 0.5rem 0.6rem;
            border-radius: 3px;
            font-size: 0.62rem;
            font-family: 'JetBrains Mono', monospace;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            border-left: 2px solid rgba(0, 243, 255, 0.2);

            .category-code {
              color: #00f3ff;
              font-weight: 700;
              min-width: 28px;
            }

            .category-name {
              flex: 1;
              font-size: 0.6rem;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .item-count {
              font-size: 0.55rem;
              color: #666;
              font-weight: 600;
            }

            &:hover {
              background: rgba(0, 243, 255, 0.1);
              border-color: rgba(0, 243, 255, 0.3);
              border-left-color: rgba(0, 243, 255, 0.5);
              color: #00f3ff;
            }

            &.active {
              background: linear-gradient(90deg, rgba(0, 243, 255, 0.2) 0%, rgba(0, 243, 255, 0.05) 100%);
              border-color: rgba(0, 243, 255, 0.6);
              border-left-color: #00f3ff;
              color: #00f3ff;
              box-shadow: 0 0 10px rgba(0, 243, 255, 0.2), inset 0 0 10px rgba(0, 243, 255, 0.05);

              .item-count {
                color: #00f3ff;
              }
            }
          }
        }
      }
    }

    .equipment-main {
      display: flex;
      flex-direction: column;
      background: rgba(10, 10, 10, 0.6);
      border: 1px solid rgba(0, 243, 255, 0.2);
      border-radius: 4px;
      min-height: 0;

      .equipment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(90deg, rgba(0, 243, 255, 0.15) 0%, transparent 100%);
        border-bottom: 1px solid rgba(0, 243, 255, 0.2);
        padding: 0.75rem 1rem;

        h2 {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #00f3ff;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 2px;
        }

        .status {
          font-size: 0.65rem;
          color: #666;
          font-family: 'JetBrains Mono', monospace;
        }
      }

      .equipment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.75rem;
        padding: 1rem;
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }

      .equipment-item {
        cursor: pointer;

        &:hover .item-card {
          border-color: rgba(0, 243, 255, 0.7);
          background: linear-gradient(135deg, rgba(0, 243, 255, 0.12) 0%, rgba(0, 100, 100, 0.08) 100%);
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
        }

        &:hover .item-title {
          color: #00f3ff;
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.4);
        }

        &.selected .item-card {
          border-color: #00ff44;
          background: linear-gradient(135deg, rgba(0, 255, 68, 0.15) 0%, rgba(0, 100, 80, 0.1) 100%);
          box-shadow: 0 0 20px rgba(0, 255, 68, 0.3), inset 0 0 15px rgba(0, 255, 68, 0.05);
        }
      }

      .item-card {
        display: flex;
        flex-direction: column;
        background: linear-gradient(135deg, rgba(0, 243, 255, 0.08) 0%, rgba(0, 100, 100, 0.04) 100%);
        border: 1.5px solid rgba(0, 243, 255, 0.25);
        border-radius: 4px;
        padding: 0.7rem;
        height: 100%;
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.1);

        .selection-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: #00ff44;
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #000;
          font-size: 0.9rem;
          box-shadow: 0 0 12px rgba(0, 255, 68, 0.8);
          z-index: 10;
        }

        .item-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #e0e0e0;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 0.5rem;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .item-specs {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;

          .spec {
            font-size: 0.6rem;
            background: rgba(0, 243, 255, 0.1);
            color: #00f3ff;
            padding: 0.2rem 0.4rem;
            border-radius: 2px;
            border: 1px solid rgba(0, 243, 255, 0.2);
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
          }
        }

        .item-description {
          font-size: 0.6rem;
          color: #888;
          line-height: 1.3;
          margin-bottom: 0.5rem;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(0, 243, 255, 0.15);
          padding-top: 0.5rem;

          .item-cost {
            font-size: 0.7rem;
            font-weight: 700;
            color: #ffcc00;
            font-family: 'JetBrains Mono', monospace;
            text-shadow: 0 0 5px rgba(255, 200, 0, 0.3);
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        flex: 1;
        color: #666;

        .empty-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .empty-text {
          font-size: 0.7rem;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 1px;
        }
      }
    }

    .selection-panel {
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(10, 20, 30, 0.8) 0%, rgba(5, 15, 20, 0.9) 100%);
      border: 1px solid rgba(0, 243, 255, 0.3);
      border-radius: 4px;
      overflow: hidden;
      min-height: 0;

      .panel-header {
        background: linear-gradient(90deg, rgba(0, 243, 255, 0.15) 0%, transparent 100%);
        border-bottom: 1px solid rgba(0, 243, 255, 0.2);
        padding: 0.75rem;
        font-size: 0.7rem;
        font-weight: 700;
        color: #00f3ff;
        text-transform: uppercase;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 2px;
      }

      .selected-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        padding: 0.5rem;
        min-height: 0;
      }

      .selected-row {
        display: grid;
        grid-template-columns: 1fr 60px 24px;
        gap: 0.5rem;
        align-items: center;
        background: rgba(0, 50, 50, 0.3);
        border: 1px solid rgba(0, 243, 255, 0.2);
        border-radius: 3px;
        padding: 0.4rem;
        font-size: 0.65rem;
        font-family: 'JetBrains Mono', monospace;

        .selected-name {
          color: #e0e0e0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .selected-cost {
          color: #ffcc00;
          font-weight: 700;
          text-align: right;
          font-size: 0.6rem;
        }

        .btn-remove {
          background: rgba(255, 50, 50, 0.15);
          border: 1px solid rgba(255, 50, 50, 0.3);
          color: #ff6666;
          width: 24px;
          height: 24px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0;

          &:hover {
            background: rgba(255, 50, 50, 0.3);
            box-shadow: 0 0 8px rgba(255, 50, 50, 0.4);
          }
        }
      }

      .panel-footer {
        border-top: 1px solid rgba(0, 243, 255, 0.2);
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: #999;

          .total-cost {
            color: #ffcc00;
            text-shadow: 0 0 5px rgba(255, 200, 0, 0.3);
            font-size: 0.8rem;
          }
        }

        .btn-clear {
          background: rgba(255, 50, 50, 0.1);
          border: 1px solid rgba(255, 50, 50, 0.3);
          color: #ff6666;
          padding: 0.5rem;
          border-radius: 3px;
          font-size: 0.65rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;

          &:hover {
            background: rgba(255, 50, 50, 0.2);
            box-shadow: 0 0 10px rgba(255, 50, 50, 0.3);
          }
        }
      }
    }
  `]
})
export class EquipmentSectionComponent {
  selectedEquipment = signal<Equipment[]>([]);
  selectedCategory = signal<EquipmentCategory>('weapon_melee');
  isLoaded = signal<boolean>(false);
  expandedGroups = signal<{ [key: string]: boolean }>({
    'WEAPONS': true,
    'ARMOR': true,
    'CYBERNETICS': false,
    'GEAR': false
  });

  categoryGroups: CategoryGroup[] = [
    {
      name: 'ARMAS',
      code: 'WEAPONS',
      items: [
        { name: 'Melee', code: 'WPN', category: 'weapon_melee' },
        { name: 'Armas de Fogo', code: 'GUN', category: 'weapon_firearm' },
        { name: 'Laser', code: 'LSR', category: 'weapon_laser' },
        { name: 'Plasma', code: 'PLM', category: 'weapon_plasma' }
      ]
    },
    {
      name: 'ARMADURAS',
      code: 'ARMOR',
      items: [
        { name: 'Civil', code: 'ARM', category: 'armor_civilian' },
        { name: 'Militar', code: 'MIL', category: 'armor_military' },
        { name: 'Hardsuit', code: 'HRD', category: 'armor_hardsuit' },
        { name: 'Softsuit', code: 'SFT', category: 'armor_softsuit' }
      ]
    },
    {
      name: 'CYBERNÉTICA',
      code: 'CYBERNETICS',
      items: [
        { name: 'Sensorial', code: 'SNS', category: 'cybernetic_sensory' },
        { name: 'Membros', code: 'LMB', category: 'cybernetic_limb' },
        { name: 'Implantes', code: 'IMP', category: 'cybernetic_implant' }
      ]
    },
    {
      name: 'EQUIPAMENTO',
      code: 'GEAR',
      items: [
        { name: 'Sobrevivência', code: 'SRV', category: 'gear_survival' },
        { name: 'Ferramentas', code: 'TLS', category: 'gear_tools' },
        { name: 'Especial', code: 'SPC', category: 'gear_special' }
      ]
    }
  ];

  constructor(private equipmentService: EquipmentService) {
    this.equipmentService
      .isLoaded$()
      .subscribe((isLoaded) => {
        this.isLoaded.set(isLoaded);
      });
  }

  toggleGroup(groupCode: string): void {
    this.expandedGroups.update(current => ({
      ...current,
      [groupCode]: !current[groupCode]
    }));
  }

  selectCategory(category: EquipmentCategory): void {
    this.selectedCategory.set(category);
  }

  getSelectedCategoryName(): string {
    for (const group of this.categoryGroups) {
      for (const item of group.items) {
        if (item.category === this.selectedCategory()) {
          return item.name.toUpperCase();
        }
      }
    }
    return 'EQUIPMENT';
  }

  getItemsInCategory(category: EquipmentCategory): Equipment[] {
    return this.equipmentService.getAllEquipment().filter(eq => eq.category === category);
  }

  getAllEquipment(): Equipment[] {
    return this.equipmentService.getAllEquipment();
  }

  isSelected(item: Equipment): boolean {
    return this.selectedEquipment().some(e => e.id === item.id);
  }

  toggleEquipmentSelection(event: Event, item: Equipment): void {
    event.stopPropagation();
    if (this.isSelected(item)) {
      this.selectedEquipment.update(items => items.filter(e => e.id !== item.id));
    } else {
      this.selectedEquipment.update(items => [...items, item]);
    }
  }

  removeSelection(event: Event, item: Equipment): void {
    event.stopPropagation();
    this.selectedEquipment.update(items => items.filter(e => e.id !== item.id));
  }

  totalCost(): number {
    return this.selectedEquipment().reduce((sum, item) => sum + item.cost, 0);
  }

  clearSelection(): void {
    this.selectedEquipment.set([]);
  }
}
