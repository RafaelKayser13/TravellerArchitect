import { Component, signal, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabletFrameComponent } from '../../../shared/components/tablet-frame/tablet-frame.component';
import { Equipment, EquipmentCategory } from '../../../core/models/equipment.model';
import { EquipmentService } from '../../../core/services/equipment.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

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
  templateUrl: './equipment-section.component.html',
  styleUrls: ['./equipment-section.component.scss']
})
export class EquipmentSectionComponent implements OnInit {
  private readonly equipmentService = inject(EquipmentService);
  private readonly route = inject(ActivatedRoute);

  mode = signal<'equipment'|'vehicles'|'vessels'>('equipment');

  brandingLabel = computed(() => {
    switch(this.mode()) {
      case 'vessels': return 'STARDRIVE_CATALOG_v1.2';
      case 'vehicles': return 'MOTORPOOL_CATALOG_v2.4';
      default: return 'ARMORY_CATALOG_v2.8';
    }
  });

  frameLabel = computed(() => {
    switch(this.mode()) {
      case 'vessels': return 'SPACEPORT.SYS';
      case 'vehicles': return 'MOTORPOOL.SYS';
      default: return 'QUARTERMASTER.SYS';
    }
  });
  
  selectedEquipment = signal<Equipment[]>([]);
  selectedCategory = signal<EquipmentCategory>('weapon_melee');
  detailItem = signal<Equipment | null>(null);
  isLoaded = toSignal(this.equipmentService.isLoaded$(), { initialValue: false });
  
  // New Signals for Search, Sort, and Cart Modal
  isCartModalOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  sortOption = signal<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'tl_asc' | 'tl_desc'>('name_asc');

  categoryGroups: CategoryGroup[] = [];
  expandedGroups = signal<{ [key: string]: boolean }>({
    'WEAPONS': true,
    'ARMOR': true,
    'CYBERNETICS': false,
    'GEAR': false,
    'VEHICLES': false
  });

  viewportItems = computed(() => {
    let items = this.getItemsInCategory(this.selectedCategory());
    
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query)) ||
        (`tl${item.techLevel}`).includes(query)
      );
    }
    
    // Sort logic
    items = [...items]; // Clone for mutation
    const sort = this.sortOption();
    items.sort((a, b) => {
      if (sort.startsWith('name')) {
        return sort.endsWith('asc') ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sort.startsWith('price')) {
        return sort.endsWith('asc') ? a.cost - b.cost : b.cost - a.cost;
      } else if (sort.startsWith('tl')) {
        return sort.endsWith('asc') ? a.techLevel - b.techLevel : b.techLevel - a.techLevel;
      }
      return 0;
    });

    return items;
  });

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['mode']) {
        this.mode.set(data['mode']);
        this.updateGroupsForMode(data['mode']);
      }
    });
  }

  private updateGroupsForMode(mode: 'equipment' | 'vehicles' | 'vessels') {
    if (mode === 'vessels') {
      this.categoryGroups = [
        {
          name: 'VESSELS',
          code: 'VESSELS',
          items: [
            { name: 'Spacecraft', code: 'SPC', category: 'vehicle' } // Technically mapped as vehicle type in JSON
          ]
        }
      ];
      this.expandedGroups.set({ 'VESSELS': true });
      this.selectedCategory.set('vehicle');
      return;
    }

    if (mode === 'vehicles') {
      this.categoryGroups = [
        {
          name: 'VEHICLES',
          code: 'VEHICLES',
          items: [
            { name: 'Ground & Air', code: 'GND', category: 'vehicle' }
          ]
        }
      ];
      this.expandedGroups.set({ 'VEHICLES': true });
      this.selectedCategory.set('vehicle');
      return;
    }

    // Default Equipment Mode
    this.categoryGroups = [
      {
        name: 'WEAPONS',
        code: 'WEAPONS',
        items: [
          { name: 'Melee', code: 'CQC', category: 'weapon_melee' },
          { name: 'Firearms', code: 'GUN', category: 'weapon_firearm' },
          { name: 'Energy/Laser', code: 'LSR', category: 'weapon_laser' },
          { name: 'Plasma/Heavy', code: 'PLM', category: 'weapon_plasma' }
        ]
      },
      {
        name: 'ARMOR',
        code: 'ARMOR',
        items: [
          { name: 'Civilian', code: 'CVL', category: 'armor_civilian' },
          { name: 'Military', code: 'MIL', category: 'armor_military' },
          { name: 'Hardsuit', code: 'HRD', category: 'armor_hardsuit' },
          { name: 'Softsuit', code: 'SFT', category: 'armor_softsuit' }
        ]
      },
      {
        name: 'CYBERNETICS',
        code: 'CYBERNETICS',
        items: [
          { name: 'Sensory', code: 'SNS', category: 'cybernetic_sensory' },
          { name: 'Limbs', code: 'LMB', category: 'cybernetic_limb' },
          { name: 'Implants', code: 'IMP', category: 'cybernetic_implant' }
        ]
      },
      {
        name: 'GEAR',
        code: 'GEAR',
        items: [
          { name: 'Survival', code: 'SRV', category: 'gear_survival' },
          { name: 'Tools', code: 'TLS', category: 'gear_tools' },
          { name: 'Special', code: 'SPC', category: 'gear_special' }
        ]
      }
    ];

    const savedCategory = localStorage.getItem('equipmentSelectedCategory') as EquipmentCategory;
    const categoryExistsInMode = this.categoryGroups.some(g => g.items.some(i => i.category === savedCategory));

    if (savedCategory && categoryExistsInMode) {
      this.selectedCategory.set(savedCategory);
      for (const group of this.categoryGroups) {
        if (group.items.some((item: CategoryItem) => item.category === savedCategory)) {
          this.expandedGroups.update(current => ({
            ...current,
            [group.code]: true
          }));
        }
      }
    } else {
      if (this.categoryGroups.length > 0 && this.categoryGroups[0].items.length > 0) {
        const firstCategory = this.categoryGroups[0].items[0].category;
        this.selectedCategory.set(firstCategory);
        this.expandedGroups.update(current => ({
          ...current,
          [this.categoryGroups[0].code]: true
        }));
      }
    }
  }

  toggleGroup(groupCode: string): void {
    this.expandedGroups.update(current => ({
      ...current,
      [groupCode]: !current[groupCode]
    }));
  }

  selectCategory(category: EquipmentCategory): void {
    this.selectedCategory.set(category);
    localStorage.setItem('equipmentSelectedCategory', category);
  }

  updateSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setSortOption(option: string) {
    this.sortOption.set(option as any);
  }

  toggleCart() {
    this.isCartModalOpen.update(v => !v);
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
    let rawItems = this.equipmentService.getAllEquipment().filter(eq => eq.category === category);
    
    // We hack the vehicle filtering here for vehicles vs vessels
    if (category === 'vehicle') {
      if (this.mode() === 'vessels') {
        rawItems = rawItems.filter(eq => 'vehicleType' in eq && ((eq as any).vehicleType === 'spacecraft' || (eq as any).vehicleType === 'space_boat'));
      } else if (this.mode() === 'vehicles') {
        rawItems = rawItems.filter(eq => 'vehicleType' in eq && ((eq as any).vehicleType !== 'spacecraft' && (eq as any).vehicleType !== 'space_boat'));
      }
    }
    
    return rawItems;
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

  openDetail(event: Event, item: Equipment): void {
    event.stopPropagation();
    this.detailItem.set(item);
  }

  closeDetail(): void {
    this.detailItem.set(null);
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

  getCategoryDisplay(category: EquipmentCategory): string {
    for (const group of this.categoryGroups) {
      for (const item of group.items) {
        if (item.category === category) {
          return item.name;
        }
      }
    }
    return category;
  }
}
