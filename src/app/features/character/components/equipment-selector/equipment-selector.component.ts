import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService, EquipmentFilter } from '../../../../core/services/equipment.service';
import { Equipment, EquipmentCategory } from '../../../../core/models/equipment.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-equipment-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [EquipmentService],
  template: `
    <div class="equipment-selector">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-btn" (click)="onCancel()">✕</button>
      </div>

      <div class="modal-body">
        <!-- Search & Filter Section -->
        <div class="search-section">
          <input
            type="text"
            placeholder="Search equipment..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            class="search-input"
          />
          
          <div class="filter-row">
            <div class="filter-group">
              <label>Tech Level:</label>
              <select [(ngModel)]="minTechLevel" (change)="onFilterChange()">
                <option [value]="null">Any</option>
                <option [value]="8">TL 8+</option>
                <option [value]="9">TL 9+</option>
                <option [value]="10">TL 10+</option>
                <option [value]="11">TL 11+</option>
                <option [value]="12">TL 12+</option>
              </select>
            </div>

            <div class="filter-group" *ngIf="selectedCategory">
              <label>Sort by:</label>
              <select [(ngModel)]="sortBy" (change)="onSortChange()">
                <option value="name">Name</option>
                <option value="cost">Cost (Low to High)</option>
                <option value="cost_desc">Cost (High to Low)</option>
                <option value="tech_level">Tech Level</option>
                <option value="mass">Mass</option>
              </select>
            </div>
          </div>

          <div class="equipment-count">
            Showing {{ filteredEquipment.length }} items
          </div>
        </div>

        <!-- Equipment List -->
        <div class="equipment-list">
          <div *ngIf="filteredEquipment.length === 0" class="no-results">
            No equipment found matching your criteria.
          </div>

          <div
            *ngFor="let item of filteredEquipment"
            class="equipment-item"
            [class.selected]="selectedEquipment?.id === item.id"
            (click)="selectEquipment(item)"
          >
            <div class="item-header">
              <h3>{{ item.name }}</h3>
              <span class="item-price">Lv{{ item.cost | number }}</span>
            </div>

            <div class="item-details">
              <span class="detail-badge">TL{{ item.techLevel }}</span>
              <span class="detail-badge">{{ item.mass }}kg</span>
              <span class="detail-badge">{{ getCategoryDisplay(item.category) }}</span>
            </div>

            <p class="item-description">{{ item.description }}</p>

            <div class="item-specs" *ngIf="getItemSpecs(item)">
              <div class="specs-grid">
                <ng-container *ngFor="let spec of getItemSpecs(item)">
                  <div class="spec-item">
                    <strong>{{ spec.label }}:</strong> {{ spec.value }}
                  </div>
                </ng-container>
              </div>
            </div>

            <div class="item-restrictions" *ngIf="item.restrictions && item.restrictions.length > 0">
              <strong>Restrictions:</strong>
              <div class="restriction-list">
                <span *ngFor="let restriction of item.restrictions" class="restriction-tag">
                  {{ formatRestriction(restriction) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" (click)="onCancel()">Cancel</button>
        <button
          class="btn-select"
          [disabled]="!selectedEquipment"
          (click)="onConfirm()"
        >
          Select Equipment
        </button>
      </div>
    </div>
  `,
  styles: [`
    .equipment-selector {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(135deg, #1a0033 0%, #2d1b4e 100%);
      color: #00ff88;
      font-family: 'Courier New', monospace;
      border: 2px solid #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.1);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .close-btn {
      background: none;
      border: none;
      color: #00ff88;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn:hover {
      color: #ff0088;
      text-shadow: 0 0 10px rgba(255, 0, 136, 0.5);
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .search-section {
      background: rgba(0, 255, 136, 0.05);
      padding: 15px;
      border: 1px solid #00ff88;
      border-radius: 4px;
    }

    .search-input {
      width: 100%;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #00ff88;
      color: #00ff88;
      font-family: 'Courier New', monospace;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    .search-input::placeholder {
      color: #00ff88;
      opacity: 0.5;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-size: 0.9rem;
      color: #00ff88;
    }

    .filter-group select {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #00ff88;
      color: #00ff88;
      padding: 8px;
      font-family: 'Courier New', monospace;
      border-radius: 4px;
    }

    .filter-group select option {
      background: #1a0033;
      color: #00ff88;
    }

    .equipment-count {
      font-size: 0.9rem;
      color: #00ff88;
      opacity: 0.7;
      margin-top: 10px;
    }

    .equipment-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: #ff0088;
      font-size: 1.1rem;
    }

    .equipment-item {
      background: rgba(0, 255, 136, 0.05);
      border: 2px solid #00ff88;
      padding: 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .equipment-item:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
      transform: translateX(5px);
    }

    .equipment-item.selected {
      background: rgba(0, 255, 136, 0.15);
      border-color: #ff0088;
      box-shadow: 0 0 20px rgba(255, 0, 136, 0.3);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .item-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #00ff88;
    }

    .item-price {
      color: #ffff00;
      font-weight: bold;
      font-size: 1rem;
    }

    .item-details {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .detail-badge {
      background: rgba(0, 255, 136, 0.2);
      border: 1px solid #00ff88;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.85rem;
      color: #00ff88;
    }

    .item-description {
      margin: 10px 0;
      color: #cccccc;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .item-specs {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #00ff88;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 0.85rem;
    }

    .spec-item {
      color: #cccccc;
    }

    .spec-item strong {
      color: #00ff88;
    }

    .item-restrictions {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #00ff88;
      font-size: 0.9rem;
    }

    .item-restrictions strong {
      color: #ff0088;
    }

    .restriction-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }

    .restriction-tag {
      background: rgba(255, 0, 136, 0.2);
      border: 1px solid #ff0088;
      padding: 3px 8px;
      border-radius: 3px;
      color: #ff0088;
      font-size: 0.8rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.05);
    }

    button {
      padding: 10px 20px;
      font-family: 'Courier New', monospace;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: bold;
      border: 2px solid;
    }

    .btn-cancel {
      background: rgba(255, 0, 136, 0.1);
      border-color: #ff0088;
      color: #ff0088;
    }

    .btn-cancel:hover {
      background: rgba(255, 0, 136, 0.2);
      box-shadow: 0 0 10px rgba(255, 0, 136, 0.3);
    }

    .btn-select {
      background: rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
      color: #00ff88;
    }

    .btn-select:hover:not(:disabled) {
      background: rgba(0, 255, 136, 0.3);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
    }

    .btn-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }

      .specs-grid {
        grid-template-columns: 1fr;
      }

      .item-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .item-price {
        margin-top: 5px;
      }
    }
  `],
})
export class EquipmentSelectorComponent implements OnInit, OnDestroy {
  private equipmentService = inject(EquipmentService);

  title: string = 'Select Equipment';
  selectedCategory: EquipmentCategory | null = null;
  selectedEquipment: Equipment | null = null;

  searchTerm: string = '';
  minTechLevel: number | null = null;
  sortBy: string = 'name';

  filteredEquipment: Equipment[] = [];
  allEquipment: Equipment[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadEquipment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEquipment(): void {
    // Load all equipment and filter based on category
    this.equipmentService.isLoaded$().pipe(
      takeUntil(this.destroy$)
    ).subscribe((loaded: boolean) => {
      if (loaded) {
        this.allEquipment = this.equipmentService.getAllEquipment();
        this.applyFiltersAndSort();
      }
    });
  }

  setCategory(category: EquipmentCategory, title: string): void {
    this.selectedCategory = category;
    this.title = title;
    this.allEquipment = this.equipmentService.getEquipmentByCategory([category]);
    this.applyFiltersAndSort();
  }

  setCategories(categories: EquipmentCategory[], title: string): void {
    this.title = title;
    this.allEquipment = this.equipmentService.getEquipmentByCategory(categories);
    this.applyFiltersAndSort();
  }

  selectEquipment(equipment: Equipment): void {
    this.selectedEquipment = this.selectedEquipment?.id === equipment.id ? null : equipment;
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let filtered = this.allEquipment;

    // Apply tech level filter
    if (this.minTechLevel !== null) {
      filtered = filtered.filter((item) => item.techLevel >= this.minTechLevel!);
    }

    // Apply search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered = this.sortEquipment(filtered);

    this.filteredEquipment = filtered;
  }

  private sortEquipment(equipment: Equipment[]): Equipment[] {
    const sorted = [...equipment];

    switch (this.sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'cost':
        sorted.sort((a, b) => (a.cost || 0) - (b.cost || 0));
        break;
      case 'cost_desc':
        sorted.sort((a, b) => (b.cost || 0) - (a.cost || 0));
        break;
      case 'tech_level':
        sorted.sort((a, b) => a.techLevel - b.techLevel);
        break;
      case 'mass':
        sorted.sort((a, b) => (a.mass || 0) - (b.mass || 0));
        break;
    }

    return sorted;
  }

  getCategoryDisplay(category: EquipmentCategory): string {
    const categories = this.equipmentService.getEquipmentCategories();
    const found = categories.find((c: { value: EquipmentCategory; display: string }) => c.value === category);
    return found?.display || category;
  }

  getItemSpecs(item: Equipment): { label: string; value: string }[] {
    const specs: { label: string; value: string }[] = [];

    // Weapon specs
    if ('damage' in item && item.damage) {
      specs.push({ label: 'Damage', value: String(item.damage) });
    }
    if ('range' in item && item.range) {
      specs.push({ label: 'Range', value: String(item.range) });
    }
    if ('magazine' in item && item.magazine) {
      specs.push({ label: 'Magazine', value: String(item.magazine) });
    }

    // Armor specs
    if ('protection' in item && item.protection) {
      specs.push({ label: 'Protection', value: `+${item.protection}` });
    }

    // Cybernetic specs
    if ('surgeryTime' in item && item.surgeryTime) {
      specs.push({ label: 'Surgery Time', value: String(item.surgeryTime) });
    }

    // DNAM specs
    if ('modType' in item && item.modType) {
      specs.push({ label: 'Type', value: String(item.modType) });
    }

    return specs;
  }

  formatRestriction(restriction: string): string {
    return restriction
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onConfirm(): void {
    if (this.selectedEquipment) {
      // Emit or return the selected equipment
      // This should be handled by the parent component using ViewChild
    }
  }

  onCancel(): void {
    this.selectedEquipment = null;
    // This should be handled by the parent component
  }
}
