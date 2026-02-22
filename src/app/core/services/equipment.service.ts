import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  Equipment,
  EquipmentCategory,
  MeleeWeapon,
  Firearm,
  LaserWeapon,
  PlasmaWeapon,
  Armor,
  ArmorAddon,
  CyberneticSensory,
  CyberneticLimb,
  CyberneticImplant,
  SubdermalImplant,
  DnaModification,
  Symbiont,
  Gear,
} from '../models/equipment.model';

export interface EquipmentFilter {
  minTechLevel?: number;
  maxTechLevel?: number;
  career?: string;
  lawLevel?: number;
  searchTerm?: string;
  category?: EquipmentCategory;
}

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {
  private weaponsCache: Equipment[] = [];
  private armorCache: Equipment[] = [];
  private cyberneticsCache: Equipment[] = [];
  private dnaModificationsCache: Equipment[] = [];
  private symbiontsCache: Equipment[] = [];
  private gearCache: Equipment[] = [];
  private drugsCache: Equipment[] = [];
  private computersRobotsCache: Equipment[] = [];
  private vehiclesCache: Equipment[] = [];
  private spaceshipsCache: Equipment[] = [];

  private allEquipmentLoaded$ = new BehaviorSubject<boolean>(false);
  private equipmentLoadError$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadAllEquipment();
  }

  /**
   * Load all equipment data from JSON files
   */
  private loadAllEquipment(): void {
    const paths = [
      { path: 'assets/data/equipment/weapons.json', cache: 'weapons' },
      { path: 'assets/data/equipment/armor.json', cache: 'armor' },
      { path: 'assets/data/equipment/cybernetics.json', cache: 'cybernetics' },
      { path: 'assets/data/equipment/dnams.json', cache: 'dnams' },
      {
        path: 'assets/data/equipment/symbionts.json',
        cache: 'symbionts',
      },
      { path: 'assets/data/equipment/gear.json', cache: 'gear' },
      { path: 'assets/data/equipment/drugs.json', cache: 'drugs' },
      {
        path: 'assets/data/equipment/computers-robots.json',
        cache: 'computersRobots',
      },
      { path: 'assets/data/equipment/vehicles.json', cache: 'vehicles' },
      { path: 'assets/data/equipment/spaceships.json', cache: 'spaceships' },
    ];

    let loadedCount = 0;

    paths.forEach((item) => {
      this.http
        .get<Equipment[]>(item.path)
        .pipe(
          catchError((error) => {
            console.warn(
              `Failed to load ${item.path}:`,
              error
            );
            this.equipmentLoadError$.next(
              `Failed to load ${item.cache} equipment`
            );
            return of([]);
          })
        )
        .subscribe((data) => {
          this.setCacheForType(item.cache, data);
          loadedCount++;

          if (loadedCount === paths.length) {
            this.allEquipmentLoaded$.next(true);
          }
        });
    });
  }

  /**
   * Set cache for a specific equipment type
   */
  private setCacheForType(type: string, data: Equipment[]): void {
    switch (type) {
      case 'weapons':
        this.weaponsCache = data;
        break;
      case 'armor':
        this.armorCache = data;
        break;
      case 'cybernetics':
        this.cyberneticsCache = data;
        break;
      case 'dnams':
        this.dnaModificationsCache = data;
        break;
      case 'symbionts':
        this.symbiontsCache = data;
        break;
      case 'gear':
        this.gearCache = data;
        break;
      case 'drugs':
        this.drugsCache = data;
        break;
      case 'computersRobots':
        this.computersRobotsCache = data;
        break;
      case 'vehicles':
        this.vehiclesCache = data;
        break;
      case 'spaceships':
        this.spaceshipsCache = data;
        break;
    }
  }

  /**
   * Get all equipment data combined
   */
  getAllEquipment(): Equipment[] {
    return [
      ...this.weaponsCache,
      ...this.armorCache,
      ...this.cyberneticsCache,
      ...this.dnaModificationsCache,
      ...this.symbiontsCache,
      ...this.gearCache,
      ...this.drugsCache,
      ...this.computersRobotsCache,
      ...this.vehiclesCache,
      ...this.spaceshipsCache,
    ];
  }

  /**
   * Get weapons filtered by criteria
   */
  getWeapons(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.weaponsCache, filter);
  }

  /**
   * Get armor filtered by criteria
   */
  getArmor(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.armorCache, filter);
  }

  /**
   * Get cybernetics filtered by criteria
   */
  getCybernetics(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.cyberneticsCache, filter);
  }

  /**
   * Get DNA modifications filtered by criteria
   */
  getDNAModifications(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.dnaModificationsCache, filter);
  }

  /**
   * Get symbionts filtered by criteria
   */
  getSymbionts(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.symbiontsCache, filter);
  }

  /**
   * Get gear filtered by criteria
   */
  getGear(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.gearCache, filter);
  }

  /**
   * Get drugs filtered by criteria
   */
  getDrugs(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.drugsCache, filter);
  }

  /**
   * Get computers and robots filtered by criteria
   */
  getComputersAndRobots(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.computersRobotsCache, filter);
  }

  /**
   * Get vehicles filtering by criteria
   */
  getVehicles(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.vehiclesCache, filter);
  }

  /**
   * Get spaceships filtered by criteria
   */
  getSpaceships(filter?: EquipmentFilter): Equipment[] {
    return this.filterEquipment(this.spaceshipsCache, filter);
  }

  /**
   * Get equipment by category (single or multiple)
   */
  getEquipmentByCategory(
    categories: EquipmentCategory[],
    filter?: EquipmentFilter
  ): Equipment[] {
    let result = this.getAllEquipment().filter((item) =>
      categories.includes(item.category as EquipmentCategory)
    );

    if (filter) {
      result = this.applyFilter(result, filter);
    }

    return result;
  }

  /**
   * Get equipment by ID
   */
  getEquipmentById(id: string): Equipment | undefined {
    return this.getAllEquipment().find((item) => item.id === id);
  }

  /**
   * Search equipment by name or description
   */
  searchEquipment(searchTerm: string, filter?: EquipmentFilter): Equipment[] {
    const allEquipment = this.getAllEquipment();
    const lowerSearchTerm = searchTerm.toLowerCase();

    let results = allEquipment.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        item.description.toLowerCase().includes(lowerSearchTerm)
    );

    if (filter) {
      results = this.applyFilter(results, filter);
    }

    return results;
  }

  /**
   * Filter equipment based on criteria
   */
  private filterEquipment(
    equipment: Equipment[],
    filter?: EquipmentFilter
  ): Equipment[] {
    if (!filter) {
      return equipment;
    }

    return this.applyFilter(equipment, filter);
  }

  /**
   * Apply filter criteria to equipment array
   */
  private applyFilter(
    equipment: Equipment[],
    filter: EquipmentFilter
  ): Equipment[] {
    return equipment.filter((item) => {
      // Tech level filter
      if (filter.minTechLevel && item.techLevel < filter.minTechLevel) {
        return false;
      }
      if (filter.maxTechLevel && item.techLevel > filter.maxTechLevel) {
        return false;
      }

      // Career restrictions
      if (filter.career && item.restrictions) {
        if (item.restrictions.includes('military_only') && filter.career !== 'military') {
          return false;
        }
        if (
          item.restrictions.includes('military_or_corporate') &&
          (filter.career !== 'military' && filter.career !== 'corporate')
        ) {
          return false;
        }
      }

      // Law level filter
      if (filter.lawLevel !== undefined && item.restrictions) {
        for (const restriction of item.restrictions) {
          // Check for law level restrictions like "law_level_2plus" or "law_level_8plus"
          if (restriction.startsWith('law_level_')) {
            const lawLevelStr = restriction.replace('law_level_', '').replace('plus', '');
            const requiredLawLevel = parseInt(lawLevelStr, 10);
            if (filter.lawLevel < requiredLawLevel) {
              return false;
            }
          }
        }
      }

      // Category filter
      if (
        filter.category &&
        item.category !== filter.category
      ) {
        return false;
      }

      // Search term filter
      if (filter.searchTerm) {
        const lowerSearchTerm = filter.searchTerm.toLowerCase();
        if (
          !item.name.toLowerCase().includes(lowerSearchTerm) &&
          !item.description.toLowerCase().includes(lowerSearchTerm)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get available equipment for a specific career at mustering out
   */
  getCareerMusteringOutEquipment(career: string, worlds: number, techLevel: number): Equipment[] {
    const filter: EquipmentFilter = {
      maxTechLevel: techLevel + 2, // Typically can get up to +2 from world TL
      career: career,
    };

    // Return a mix of appropriate equipment based on career
    let equipment: Equipment[] = [];

    switch (career.toLowerCase()) {
      case 'military':
      case 'army':
      case 'marine':
      case 'navy':
        equipment.push(
          ...this.getWeapons(filter),
          ...this.getArmor(filter),
          ...this.getCybernetics(filter)
        );
        break;

      case 'merchant':
      case 'trader':
        equipment.push(
          ...this.getGear(filter),
          ...this.getComputersAndRobots(filter)
        );
        break;

      case 'nobility':
      case 'noble':
        equipment.push(
          ...this.getGear(filter),
          ...this.getCybernetics(filter)
        );
        break;

      default:
        // General career - mixed equipment
        equipment.push(
          ...this.getWeapons(filter),
          ...this.getGear(filter),
          ...this.getComputersAndRobots(filter)
        );
    }

    return equipment;
  }

  /**
   * Get equipment affected by law level (weapons, armaments)
   */
  getWeaponsByLawLevel(lawLevel: number, filter?: EquipmentFilter): Equipment[] {
    const baseFilter: EquipmentFilter = {
      ...filter,
      lawLevel: lawLevel,
    };

    return this.getWeapons(baseFilter);
  }

  /**
   * Check if equipment is legal for a given location
   */
  isEquipmentLegal(equipment: Equipment, lawLevel: number): boolean {
    if (!equipment.restrictions) {
      return true;
    }

    for (const restriction of equipment.restrictions) {
      if (restriction.startsWith('law_level_')) {
        const levelStr = restriction.replace('law_level_', '').replace('plus', '');
        const requiredLevel = parseInt(levelStr, 10);
        if (lawLevel < requiredLevel) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get all equipment categories with their display names
   */
  getEquipmentCategories(): {
    value: EquipmentCategory;
    display: string;
  }[] {
    return [
      { value: 'weapon_melee', display: 'Melee Weapons' },
      { value: 'weapon_firearm', display: 'Firearms' },
      { value: 'weapon_laser', display: 'Laser Weapons' },
      { value: 'weapon_plasma', display: 'Plasma Weapons' },
      { value: 'weapon_heavy', display: 'Heavy Weapons' },
      { value: 'weapon_thrown', display: 'Thrown Weapons' },
      { value: 'weapon_exotic', display: 'Exotic Weapons' },
      { value: 'armor_civilian', display: 'Civilian Armor' },
      { value: 'armor_military', display: 'Military Armor' },
      { value: 'armor_hardsuit', display: 'Hardsuits' },
      { value: 'armor_softsuit', display: 'Softsuits' },
      { value: 'armor_helmet', display: 'Helmets' },
      { value: 'armor_addon', display: 'Armor Add-ons' },
      { value: 'cybernetic_sensory', display: 'Sensory Cybernetics' },
      { value: 'cybernetic_limb', display: 'Cybernetic Limbs' },
      { value: 'cybernetic_implant', display: 'Neural Implants' },
      { value: 'cybernetic_subdermal', display: 'Subdermal Implants' },
      { value: 'cybernetic_weapon', display: 'Weapon Implants' },
      { value: 'dnam', display: 'DNA Modifications' },
      { value: 'symbiont', display: 'Symbionts' },
      { value: 'gear_survival', display: 'Survival Gear' },
      { value: 'gear_tools', display: 'Tools' },
      { value: 'gear_sensor', display: 'Sensors' },
      { value: 'gear_science', display: 'Scientific Equipment' },
      { value: 'gear_medical', display: 'Medical Equipment' },
      { value: 'gear_comm', display: 'Communications' },
      { value: 'gear_drug', display: 'Pharmaceuticals' },
      { value: 'gear_special', display: 'Special Equipment' },
      { value: 'gear_computer', display: 'Computers' },
      { value: 'gear_software', display: 'Software' },
      { value: 'gear_power', display: 'Power Systems' },
      { value: 'gear_industrial', display: 'Industrial Equipment' },
      { value: 'gear_pentapod', display: 'Pentapod Equipment' },
      { value: 'gear_robot', display: 'Robots & Drones' },
      { value: 'vehicle', display: 'Vehicles & Spaceships' },
    ];
  }

  /**
   * Estimate total cost of equipment
   */
  calculateTotalCost(equipment: Equipment[]): number {
    return equipment.reduce((total, item) => total + (item.cost || 0), 0);
  }

  /**
   * Estimate total mass of equipment
   */
  calculateTotalMass(equipment: Equipment[]): number {
    return equipment.reduce((total, item) => total + (item.mass || 0), 0);
  }

  /**
   * Check loading status
   */
  isLoaded$(): Observable<boolean> {
    return this.allEquipmentLoaded$.asObservable();
  }

  /**
   * Get loading errors
   */
  getLoadError$(): Observable<string | null> {
    return this.equipmentLoadError$.asObservable();
  }
}
