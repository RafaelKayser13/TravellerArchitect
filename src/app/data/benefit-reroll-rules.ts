/**
 * Re-Roll Rules for Mustering Out Benefits
 * Defines what happens when a benefit is rolled twice in the same table
 */

export interface BenefitRerollRule {
    benefitName: string;
    canDouble: boolean;
    doubleDescription?: string; // What player gets when choosing "double"
    hasAlternative: boolean;
    alternativeDescription?: string; // What player gets if choosing "alternative"
    alternativeEffect?: any; // The effect to apply if choosing alternative
    affectedCareers?: string[]; // If undefined, applies to all careers with this benefit
}

export const BENEFIT_REROLL_RULES: Record<string, BenefitRerollRule> = {
    // Weapons - Can take 2x guns OR increase Gun Combat skill by 1
    'Gun': {
        benefitName: 'Gun',
        canDouble: true,
        doubleDescription: 'Take 2 guns instead of 1',
        hasAlternative: true,
        alternativeDescription: 'Increase Gun Combat skill by 1',
    },
    'Blade': {
        benefitName: 'Blade',
        canDouble: true,
        doubleDescription: 'Take 2 blades instead of 1',
        hasAlternative: true,
        alternativeDescription: 'Increase Melee (Blade) skill by 1',
    },
    'Rifle': {
        benefitName: 'Rifle',
        canDouble: true,
        doubleDescription: 'Take 2 rifles instead of 1',
        hasAlternative: true,
        alternativeDescription: 'Increase Gun Combat (Rifle) skill by 1',
    },
    'Shotgun': {
        benefitName: 'Shotgun',
        canDouble: true,
        doubleDescription: 'Take 2 shotguns instead of 1',
        hasAlternative: true,
        alternativeDescription: 'Increase Gun Combat (Shotgun) skill by 1',
    },

    // Armor - Can take 2 suits OR higher-grade armor
    'Combat Armor': {
        benefitName: 'Combat Armor',
        canDouble: true,
        doubleDescription: 'Take 2 Combat Armor suits',
        hasAlternative: true,
        alternativeDescription: 'Upgrade to Advanced Combat Armor',
    },

    // Ship Shares - Can take 2 shares OR convert to +1 Merchant skill
    'Ship Share': {
        benefitName: 'Ship Share',
        canDouble: true,
        doubleDescription: 'Take 2 Ship Shares instead of 1',
        hasAlternative: true,
        alternativeDescription: 'Increase Merchants skill by 1',
        affectedCareers: ['Merchant', 'Rogue']
    },

    // Stat Modifiers - Can double the bonus
    'STR +1': {
        benefitName: 'STR +1',
        canDouble: true,
        doubleDescription: 'STR +2 instead of STR +1',
        hasAlternative: false,
    },
    'END +1': {
        benefitName: 'END +1',
        canDouble: true,
        doubleDescription: 'END +2 instead of END +1',
        hasAlternative: false,
    },
    'DEX +1': {
        benefitName: 'DEX +1',
        canDouble: true,
        doubleDescription: 'DEX +2 instead of DEX +1',
        hasAlternative: false,
    },
    'INT +1': {
        benefitName: 'INT +1',
        canDouble: true,
        doubleDescription: 'INT +2 instead of INT +1',
        hasAlternative: false,
    },
    'EDU +1': {
        benefitName: 'EDU +1',
        canDouble: true,
        doubleDescription: 'EDU +2 instead of EDU +1',
        hasAlternative: false,
    },
    'SOC +1': {
        benefitName: 'SOC +1',
        canDouble: true,
        doubleDescription: 'SOC +2 instead of SOC +1',
        hasAlternative: false,
    },

    // Armor/Implants - Can take 2nd piece OR improve existing
    'Cybernetic Implant': {
        benefitName: 'Cybernetic Implant',
        canDouble: true,
        doubleDescription: 'Take a second Cybernetic Implant',
        hasAlternative: true,
        alternativeDescription: 'Improve the existing Cybernetic Implant',
    },

    // Vehicles - Can take 2nd vessel OR upgrade class
    'Yacht': {
        benefitName: 'Yacht',
        canDouble: true,
        doubleDescription: 'Add a second Yacht',
        hasAlternative: true,
        alternativeDescription: 'Upgrade Yacht to luxury-class vessel',
        affectedCareers: ['Noble']
    },

    // Generic effects that may repeat
    'Contact': {
        benefitName: 'Contact',
        canDouble: true,
        doubleDescription: 'Generate an additional Contact',
        hasAlternative: false,
    },
    'Ally': {
        benefitName: 'Ally',
        canDouble: true,
        doubleDescription: 'Generate an additional Ally',
        hasAlternative: false,
    },
    'Enemy': {
        benefitName: 'Enemy',
        canDouble: true,
        doubleDescription: 'You have generated another Enemy (unfortunately)',
        hasAlternative: false,
    },
    'Rival': {
        benefitName: 'Rival',
        canDouble: true,
        doubleDescription: 'You have generated another Rival',
        hasAlternative: false,
    },
};

/**
 * Get re-roll rule for a benefit
 */
export function getRerollRule(benefitName: string, careerName?: string): BenefitRerollRule | null {
    const rule = BENEFIT_REROLL_RULES[benefitName];
    if (!rule) return null;

    // Check if applicable to this career
    if (rule.affectedCareers && careerName && !rule.affectedCareers.includes(careerName)) {
        return null;
    }

    return rule;
}

/**
 * Check if a benefit can be re-rolled
 */
export function canBenefitDouble(benefitName: string, careerName?: string): boolean {
    const rule = getRerollRule(benefitName, careerName);
    return rule?.canDouble || false;
}

/**
 * Check if a benefit has an alternative when doubled
 */
export function hasAlternativeOnDouble(benefitName: string, careerName?: string): boolean {
    const rule = getRerollRule(benefitName, careerName);
    return rule?.hasAlternative || false;
}
