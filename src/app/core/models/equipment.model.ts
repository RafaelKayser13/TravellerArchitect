/**
 * Equipment Models for 2300AD Character Equipment System
 * Comprehensive models for all equipment categories
 */

/**
 * Base equipment interface - all items inherit from this
 */
export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  techLevel: number;
  mass: number; // in kilograms
  cost: number; // in Livres (Lv)
  restricted?: boolean; // True if restricted by law level or career
  restrictions?: string[]; // E.g., ["military_only", "law_level_10+"]
  acquiredFrom?: string; // How it was acquired (career, benefit, purchase, etc)
  acquiredDate?: Date;
}

export type EquipmentCategory =
  | 'weapon_melee'
  | 'weapon_firearm'
  | 'weapon_laser'
  | 'weapon_plasma'
  | 'weapon_explosive'
  | 'weapon_heavy'
  | 'weapon_thrown'
  | 'weapon_exotic'
  | 'armor_civilian'
  | 'armor_military'
  | 'armor_hardsuit'
  | 'armor_softsuit'
  | 'armor_helmet'
  | 'armor_addon'
  | 'cybernetic_sensory'
  | 'cybernetic_limb'
  | 'cybernetic_implant'
  | 'cybernetic_subdermal'
  | 'cybernetic_weapon'
  | 'dnam'
  | 'symbiont'
  | 'gear_survival'
  | 'gear_tools'
  | 'gear_special'
  | 'gear_sensor'
  | 'gear_science'
  | 'gear_medical'
  | 'gear_comm'
  | 'gear_computer'
  | 'gear_software'
  | 'gear_power'
  | 'gear_drug'
  | 'gear_industrial'
  | 'gear_pentapod'
  | 'gear_robot'
  | 'vehicle'
  | 'robot_drone'
  | 'pentapod_gear';

/**
 * Melee Weapons
 */
export interface MeleeWeapon extends Equipment {
  category: 'weapon_melee';
  damage: string; // E.g., "3D" or "2D+1"
  range: 'melee';
  traits?: WeaponTrait[];
}

/**
 * Firearm/Conventional Weapons
 */
export interface Firearm extends Equipment {
  category: 'weapon_firearm';
  damage: string; // E.g., "3D+2"
  range: number; // Range in meters
  magazine: number;
  magazineCost: number; // Cost per magazine
  rateOfFire: string; // E.g., "single", "burst", "auto"
  ammunition: string;
  traits?: WeaponTrait[];
}

/**
 * Laser Weapons
 */
export interface LaserWeapon extends Equipment {
  category: 'weapon_laser';
  damage: string;
  range: number;
  pulseEnergy: string; // E.g., "0.7 megajoules"
  magazine: number;
  magazineCost: number;
  rateOfFire: string;
  traits?: WeaponTrait[];
}

/**
 * Plasma Weapons
 */
export interface PlasmaWeapon extends Equipment {
  category: 'weapon_plasma';
  damage: string;
  range: number;
  megawattRating: number; // MW output
  magazine: number;
  magazineCost: number;
  rateOfFire: string;
  traits?: WeaponTrait[];
}

/**
 * Grenade/Explosive
 */
export interface Explosive extends Equipment {
  category: 'weapon_explosive';
  damage: string;
  blastRadius: number; // Blast trait value
  type: 'grenade' | 'plastique' | 'dynamite' | 'launcher';
  traits?: WeaponTrait[];
}

/**
 * Weapon Traits (AP = armor piercing, Blast = area effect, Stun = non-lethal, etc)
 */
export type WeaponTrait =
  | 'AP2' | 'AP4' | 'AP5' | 'AP6' | 'AP8' | 'AP10' | 'AP14' | 'AP18'
  | 'Blast1' | 'Blast2' | 'Blast3' | 'Blast4' | 'Blast5' | 'Blast6' | 'Blast9'
  | 'Stun'
  | 'Auto3' | 'Auto4' | 'Auto5' | 'Auto6'
  | 'Bulky'
  | 'Scope'
  | 'ZeroG'
  | 'Sniper';

/**
 * Body Armor
 */
export interface Armor extends Equipment {
  category: 'armor_civilian' | 'armor_military' | 'armor_hardsuit' | 'armor_softsuit';
  protection: number; // Protection value (e.g., +6, +12)
  encumbrance?: number; // Movement penalty if any
  envRating?: number; // Environmental rating for pressure suits
  requiredSkill?: string; // E.g., "Vacc Suit 0"
  armorType: 'inertial' | 'rigid' | 'pressure' | 'hardsuit' | 'softsuit' | 'vest' | 'jacket';
}

/**
 * Armor Add-ons (Helmet parts, visor options, etc)
 */
export interface ArmorAddon extends Equipment {
  category: 'armor_addon' | 'armor_helmet';
  protection?: number;
  enhances: string; // E.g., "vision", "communication", "protection"
  compatibilityRequirements?: string[];
  traits?: string[];
}

/**
 * Cybernetic Sensory Enhancements (Eyes, Ears)
 */
export interface CyberneticSensory extends Equipment {
  category: 'cybernetic_sensory';
  bodyPart: 'eye' | 'ear' | 'eye_ear_combo';
  surgeryTime: string;
  maintenanceRequired: boolean;
  maintenanceCostPerMonth?: number;
  features: string[]; // E.g., ["thermal_imaging", "light_amplification"]
}

/**
 * Cybernetic Limbs
 */
export interface CyberneticLimb extends Equipment {
  category: 'cybernetic_limb';
  limb: 'arm' | 'leg' | 'hand' | 'foot';
  surgeryTime: string;
  enhancedStr?: number;
  enhancedEnd?: number;
  maintenanceCostPerMonth: number;
  armor?: number; // Built-in armor protection
  batteryLife: string; // E.g., "96 hours"
  features?: string[];
}

/**
 * Cybernetic Implants (Neural Jack, HyperCharger, etc)
 */
export interface CyberneticImplant extends Equipment {
  category: 'cybernetic_implant';
  implantType: 'neural_jack' | 'muscle_implant' | 'hypercharger' | 'combat_implant' | 'neural_sheathing';
  surgeryTime: string;
  effects: string[]; // E.g., ["DEX+1", "Tough(+2)"]
  sideEffects?: string[];
  maintenanceRequired: boolean;
}

/**
 * Subdermal Implants (Subdermacomp, AR Rig, Transdermal Link, etc)
 */
export interface SubdermalImplant extends Equipment {
  category: 'cybernetic_subdermal';
  implantType: 'ar_rig' | 'subdermacomp' | 'transdermal_link' | 'subdermatalk' | 'skinwatch' | 'rfid_chip' | 'growler' | 'pan_controller' | 'virtual_input_device';
  surgeryTime: string;
  features: string[];
  maintenanceRequired: boolean;
  yearlyMaintenanceCost?: number;
}

/**
 * Cybernetic Weapons (Hand Razors, Wrist Blades)
 */
export interface CyberneticWeapon extends Equipment {
  category: 'cybernetic_weapon';
  damage: string;
  activationType: 'gesture' | 'mental' | 'automatic';
  implantCost: number; // Cost to implant into cyberlimb
  traits?: WeaponTrait[];
}

/**
 * DNA Modifications
 */
export interface DnaModification extends Equipment {
  category: 'dnam';
  modificationType: 'planetaryAdaptation' | 'weatherAdaptation' | 'gravityAdaptation' | 'other';
  modType: 'minor' | 'major'; // Treatment type
  treatmentDuration: string;
  govtSubsidized: boolean;
  marketCost?: number; // ~5x listed price if not subsidized
  effects: string[];
  sideEffects?: string[];
  constraints?: string[]; // E.g., dietary requirements
}

/**
 * Symbionts (Blood cleaners, filter organisms, etc)
 */
export interface Symbiont extends Equipment {
  category: 'symbiont';
  deliveryMethod: 'injected' | 'ingested' | 'inhaled';
  effects: string[]; // E.g., ["DM+2 to aging rolls"]
  sideEffects?: string[];
  removalDifficulty?: string;
  durability?: string; // E.g., "3-5 years in use"
}

/**
 * Gear/Miscellaneous Equipment
 */
export interface Gear extends Equipment {
  category: 'gear_survival' | 'gear_tools' | 'gear_special' | 'gear_sensor' | 'gear_science' | 'gear_medical' | 'gear_comm' | 'gear_computer' | 'gear_power' | 'gear_drug';
  gearType: string;
  uses?: string;
  features?: string[];
  consumable?: boolean;
  quantity?: number; // For consumables like rations or batteries
}

/**
 * Vehicles (Ships, ground vehicles, etc)
 */
export interface Vehicle extends Equipment {
  category: 'vehicle';
  vehicleType: 'space_boat' | 'spacecraft' | 'ground_vehicle' | 'aircraft' | 'watercraft';
  crewCapacity: number;
  cargo: number; // in tons
  speed?: string;
  range?: string;
  armor?: number;
  weapons?: string[]; // Weapon names
}

/**
 * Robots and Drones
 */
export interface RobotDrone extends Equipment {
  category: 'robot_drone';
  robotType: 'microdrone' | 'attack_drone' | 'recon_drone' | 'security_robot' | 'doll' | 'shell' | 'other';
  hits: number;
  speed: number; // in meters
  skills: string[];
  traits?: string[];
  sensors?: string[];
  armor?: number;
}

/**
 * Pentapod Biotech Equipment
 */
export interface PentapodGear extends Equipment {
  category: 'pentapod_gear';
  gearType: 'biocontact' | 'biosampler' | 'water_breather' | 'other';
  maintenance: string;
  durability?: string;
  quirks?: string[];
}
