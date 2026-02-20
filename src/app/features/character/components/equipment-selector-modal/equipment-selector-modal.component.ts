import { Component, ElementRef, ViewChild, inject, AfterViewInit, afterNextRender, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService, EquipmentFilter } from '../../../../core/services/equipment.service';
import { Equipment, EquipmentCategory } from '../../../../core/models/equipment.model';
import { BenefitChoiceService } from '../../../../core/services/benefit-choice.service';
import { EquipmentDetailPanelComponent } from '../equipment-detail-panel/equipment-detail-panel.component';

@Component({
  selector: 'app-equipment-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EquipmentDetailPanelComponent],
  template: `
    <dialog #modal class="equipment-modal">
      <div class="modal-overlay" *ngIf="isOpen$()"></div>

      <div class="modal-window" *ngIf="isOpen$()"  (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title$() }}</h2>
          <button class="close-btn" (click)="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <!-- Equipment List (shown when no item selected) -->
          @if (!selectedEquipment) {
            <!-- Search & Filter -->
            <div class="search-section">
              <input
                type="text"
                placeholder="Procure equipamento..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
                class="search-input"
              />

              <select [(ngModel)]="techLevelFilter" (change)="onFilterChange()" class="filter-select">
                <option [value]="null">Qualquer Nível Técnico</option>
                <option [value]="8">TL 8+</option>
                <option [value]="9">TL 9+</option>
                <option [value]="10">TL 10+</option>
                <option [value]="11">TL 11+</option>
                <option [value]="12">TL 12+</option>
              </select>
            </div>

            <!-- Equipment List -->
            <div class="equipment-list">
              @if (filteredEquipment.length === 0) {
                <div class="no-results">
                  Nenhum equipamento encontrado
                </div>
              } @else {
                @for (item of filteredEquipment; track item.id) {
                  <div
                    class="equipment-item"
                    [class.selected]="false"
                    (click)="selectEquipment(item)"
                  >
                    <div class="item-header">
                      <strong>{{ item.name }}</strong>
                      <span class="price">Lv{{ item.cost | number }}</span>
                    </div>
                    <p class="item-desc">{{ item.description }}</p>
                    <div class="item-badges">
                      <span class="badge">TL{{ item.techLevel }}</span>
                      @if (item.mass) {
                        <span class="badge">{{ item.mass }}kg</span>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          } @else {
            <!-- Detail Panel (shown when item selected) -->
            <app-equipment-detail-panel
              [equipment]="selectedEquipment"
              (onClose)="clearSelection()"
              (onAdd)="confirmSelection()">
            </app-equipment-detail-panel>
          }
        </div>

        <div class="modal-footer" *ngIf="!selectedEquipment">
          <button class="btn-cancel" (click)="closeModal()">CANCELAR</button>
          <button
            class="btn-select"
            [disabled]="!selectedEquipment"
            (click)="confirmSelection()"
          >
            SELECIONAR
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: [`
    dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 0;
      border: none;
      background: transparent;
      z-index: 1000;
    }

    dialog[open] {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: -1;
    }

    .modal-window {
      background: linear-gradient(135deg, #1a0033 0%, #2d1b4e 100%);
      border: 2px solid #00ff88;
      border-radius: 4px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
      color: #00ff88;
      font-family: 'Courier New', monospace;
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
      font-size: 1.3rem;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .close-btn {
      background: none;
      border: none;
      color: #00ff88;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      color: #ff0088;
      text-shadow: 0 0 10px rgba(255, 0, 136, 0.5);
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .search-section {
      display: flex;
      gap: 10px;
    }

    .search-input,
    .filter-select {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #00ff88;
      color: #00ff88;
      padding: 8px;
      font-family: 'Courier New', monospace;
      border-radius: 4px;
      flex: 1;
    }

    .search-input::placeholder {
      color: #00ff88;
      opacity: 0.5;
    }

    .search-input:focus,
    .filter-select:focus {
      outline: none;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .equipment-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: #ff0088;
    }

    .equipment-item {
      background: rgba(0, 255, 136, 0.05);
      border: 1px solid #00ff88;
      padding: 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .equipment-item:hover {
      background: rgba(0, 255, 136, 0.1);
      transform: translateX(5px);
    }

    .equipment-item.selected {
      background: rgba(0, 255, 136, 0.15);
      border-color: #ff0088;
      box-shadow: 0 0 15px rgba(255, 0, 136, 0.3);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 10px;
    }

    .price {
      color: #ffff00;
      font-weight: bold;
    }

    .item-desc {
      margin: 8px 0;
      font-size: 0.9rem;
      color: #cccccc;
      line-height: 1.3;
    }

    .item-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      background: rgba(0, 255, 136, 0.2);
      border: 1px solid #00ff88;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.8rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 15px;
      border-top: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.05);
    }

    button {
      padding: 8px 15px;
      font-family: 'Courier New', monospace;
      border-radius: 4px;
      border: 2px solid;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
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
  `],
})
export class EquipmentSelectorModalComponent implements AfterViewInit {
  @ViewChild('modal') modal!: ElementRef<HTMLDialogElement>;

  private benefitChoiceService = inject(BenefitChoiceService);
  private equipmentService = inject(EquipmentService);

  isOpen$ = this.benefitChoiceService.isEquipmentDialogOpen;
  title$ = this.benefitChoiceService.getEquipmentDialogTitle;

  selectedEquipment: Equipment | null = null;
  filteredEquipment: Equipment[] = [];
  searchTerm: string = '';
  techLevelFilter: number | null = null;
  currentCategories: EquipmentCategory[] = [];

  ngAfterViewInit(): void {
    // Watch for modal open state changes after ViewChild is initialized
    effect(() => {
      afterNextRender(() => {
        if (this.isOpen$() && this.modal?.nativeElement) {
          // Only call showModal if dialog is not already open
          if (!this.modal.nativeElement.open) {
            this.modal.nativeElement.showModal();
          }
        } else if (!this.isOpen$() && this.modal?.nativeElement) {
          // Close the dialog if signal is false
          if (this.modal.nativeElement.open) {
            this.modal.nativeElement.close();
          }
        }
      });
    });
  }

  setCategories(categories: EquipmentCategory[]): void {
    this.currentCategories = categories;
    this.selectedEquipment = null;
    this.filteredEquipment = this.equipmentService.getEquipmentByCategory(categories);
  }

  selectEquipment(item: Equipment): void {
    this.selectedEquipment = item;
  }

  clearSelection(): void {
    this.selectedEquipment = null;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.equipmentService.getEquipmentByCategory(this.currentCategories);

    // Apply tech level filter
    if (this.techLevelFilter !== null) {
      filtered = filtered.filter((item) => item.techLevel >= this.techLevelFilter!);
    }

    // Apply search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    this.filteredEquipment = filtered;
  }

  confirmSelection(): void {
    if (this.selectedEquipment) {
      this.benefitChoiceService.confirmEquipmentSelection(this.selectedEquipment);
      this.closeModal();
    }
  }

  closeModal(): void {
    this.benefitChoiceService.confirmEquipmentSelection(null);
    if (this.modal) {
      this.modal.nativeElement.close();
    }
  }
}
