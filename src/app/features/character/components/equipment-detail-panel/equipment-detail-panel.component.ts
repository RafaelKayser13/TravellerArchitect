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
  templateUrl: './equipment-detail-panel.component.html',
  styleUrls: ['./equipment-detail-panel.component.scss']
})
export class EquipmentDetailPanelComponent {
  @Input() equipment: Equipment | null = null;
  @Input() actionLabel: string = '✓ ADD TO CHARACTER';
  @Input() actionClass: string = 'btn-add';
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

  getProperty(prop: string): any {
    return this.equipment ? (this.equipment as any)[prop] : null;
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
