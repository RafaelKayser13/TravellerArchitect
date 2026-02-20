/**
 * Benefit Choice Options for Mustering Out
 * Used when a benefit allows the player to choose from multiple options
 */

export interface BenefitChoice {
    name: string;
    description: string;
    restricted?: 'military' | 'spaceborne';
}

export const WEAPON_CHOICES = [
    // Slug Throwers (available to all)
    { name: 'Rifle (Slug Thrower)', description: 'Standard military or civilian rifle. Reliable and effective.' } as BenefitChoice,
    { name: 'Pistol (Slug Thrower)', description: 'Compact sidearm for close quarters. Easy to conceal.' } as BenefitChoice,
    { name: 'Shotgun', description: 'Scatter gun for close-range combat. High damage potential.' } as BenefitChoice,
    { name: 'Submachine Gun', description: 'Rapid-fire automatic weapon. Favored in urban combat.' } as BenefitChoice,
    { name: 'Carbine', description: 'Compact rifle variant. Good balance of firepower and mobility.' } as BenefitChoice,
    // Energy Weapons (military/spaceborne only)
    { name: 'Laser Rifle', description: 'Energy weapon. Silent, efficient, requires power cells.', restricted: 'military' } as BenefitChoice,
    { name: 'Laser Pistol', description: 'Compact energy weapon. Concealable and reliable.', restricted: 'military' } as BenefitChoice,
    { name: 'Plasma Rifle', description: 'Advanced energy weapon. Devastating at close range.', restricted: 'military' } as BenefitChoice,
] as const as BenefitChoice[];

export const ARMOR_CHOICES = [
    { name: 'Combat Armor (TL 10)', description: 'Standard military-grade protection. Covers vitals.' } as BenefitChoice,
    { name: 'Vacc Suit with Armor', description: 'Vacuum-rated armor. Provides both pressure and ballistic protection.' } as BenefitChoice,
    { name: 'Ballistic Jacket', description: 'Civilian-grade light armor. Concealable under clothing.' } as BenefitChoice,
    { name: 'Combat Suit', description: 'Full-body protection. Military-grade materials and design.' } as BenefitChoice,
    { name: 'Powered Armor Frame', description: 'Exoskeleton frame without power source. Requires technical support.' } as BenefitChoice,
] as const as BenefitChoice[];

export const VEHICLE_CHOICES = [
    { name: 'Grav ATV', description: 'Small anti-gravity vehicle. Terrain-independent. (Lv 250,000)' } as BenefitChoice,
    { name: 'Ground Truck', description: 'Reliable utility vehicle. Cargo capacity varies. (Lv 150,000)' } as BenefitChoice,
    { name: 'Hover Transport', description: 'Air-cushion vehicle. Fast movement across most terrain. (Lv 200,000)' } as BenefitChoice,
    { name: 'Fast Bike', description: 'High-speed personal transport. Minimal cargo. (Lv 100,000)' } as BenefitChoice,
    { name: 'Explorer Hangar', description: 'Dedicated vehicle storage and repair facility. (Lv 300,000)' } as BenefitChoice,
] as const as BenefitChoice[];

export function filterChoices(choices: BenefitChoice[], careerName: string): BenefitChoice[] {
    const isMilitary = ['Army', 'Navy', 'Marine', 'Agent'].includes(careerName);
    const isSpaceborne = ['Spaceborne', 'Belter', 'Scout'].includes(careerName);
    
    return choices.filter(choice => {
        if (!choice.restricted) return true;
        if (choice.restricted === 'military') return isMilitary;
        if (choice.restricted === 'spaceborne') return isSpaceborne;
        return false;
    });
}
