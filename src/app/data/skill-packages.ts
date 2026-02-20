export interface SkillPackage {
    name: string;
    description: string;
    skills: string[];
    source?: 'core' | '2300ad'; // Which rulebook this package comes from
}

export const SKILL_PACKAGES: SkillPackage[] = [
    // 2300AD Specific Packages (preferred for this setting)
    {
        name: 'Troubleshooter',
        description: 'Problem solvers for corporations, governments, or other organizations.',
        skills: [
            'Electronics (any) 1', 'Gun Combat (any) 1', 'Investigate 1',
            'Medic 1', 'Melee (any) 1', 'Recon 1', 'Stealth 1', 'Streetwise 1'
        ],
        source: '2300ad'
    },
    {
        name: 'Colonist',
        description: 'Survivors of harsh frontier world challenges.',
        skills: [
            'Animals (any) 1', 'Drive (any) 1', 'Gun Combat (any) 1',
            'Mechanic 1', 'Medic 1', 'Navigation 1', 'Recon 1', 'Survival 1'
        ],
        source: '2300ad'
    },
    {
        name: 'Urbanite',
        description: 'Street-smart dwellers of technologically advanced urban environments.',
        skills: [
            'Carouse 1', 'Computers 1', 'Deception 1',
            'Gun Combat (any) 1', 'Melee (any) 1', 'Stealth 1', 'Streetwise 1'
        ],
        source: '2300ad'
    },
    {
        name: 'Corporate',
        description: 'Professionals working in corporate or government environments.',
        skills: [
            'Admin 1', 'Advocate 1', 'Deception 1', 'Investigate 1',
            'Profession (any) 1', 'Science (any) 1', 'Streetwise 1'
        ],
        source: '2300ad'
    },
    {
        name: 'Libertine Trader',
        description: 'Free traders plying the spaceways between colonies.',
        skills: [
            'Advocate 1', 'Broker 1', 'Deception 1', 'Diplomat 1',
            'Engineer (any) 1', 'Gun Combat (any) 1', 'Persuade 1',
            'Pilot (Spacecraft) 1', 'Streetwise 1'
        ],
        source: '2300ad'
    },

    // Core Rulebook Packages (alternative options)
    {
        name: 'Traveller',
        description: 'All-round package for mixed campaign styles.',
        skills: [
            'Deception 1', 'Electronics (any) 1', 'Gun Combat (any) 1', 'Gunner 1',
            'Medic 1', 'Persuade 1', 'Pilot (any) 1', 'Stealth 1'
        ],
        source: 'core'
    },
    {
        name: 'Trader',
        description: 'For campaigns focused on commerce and trading.',
        skills: [
            'Advocate 1', 'Astrogation 1', 'Broker 1', 'Diplomat 1',
            'Electronics (any) 1', 'Medic 1', 'Pilot (any) 1', 'Streetwise 1'
        ],
        source: 'core'
    },
    {
        name: 'Explorer',
        description: 'For campaigns on the fringe of charted space.',
        skills: [
            'Astrogation 1', 'Electronics (any) 1', 'Gun Combat (any) 1', 'Medic 1',
            'Pilot (any) 1', 'Recon 1', 'Stealth 1', 'Survival 1'
        ],
        source: 'core'
    },
    {
        name: 'Investigator',
        description: 'For campaigns focused on solving crimes and mysteries.',
        skills: [
            'Admin 1', 'Advocate 1', 'Deception 1', 'Electronics (any) 1',
            'Gun Combat (any) 1', 'Investigate 1', 'Persuade 1', 'Stealth 1', 'Streetwise 1'
        ],
        source: 'core'
    },
    {
        name: 'Mercenary',
        description: 'Combat-focused package for military operations.',
        skills: [
            'Electronics (any) 1', 'Heavy Weapons 1', 'Gun Combat (any) 1', 'Gun Combat (any) 1',
            'Leadership 1', 'Medic 1', 'Recon 1', 'Stealth 1'
        ],
        source: 'core'
    },
    {
        name: 'Starship',
        description: 'For campaigns focused on spacecraft operations.',
        skills: [
            'Astrogation 1', 'Electronics (any) 1', 'Engineer (any) 1', 'Gunner 1',
            'Mechanic 1', 'Medic 1', 'Pilot (Spacecraft) 1', 'Tactics (naval) 1'
        ],
        source: 'core'
    },
    {
        name: 'Diplomat',
        description: 'For government operatives and ambassadors.',
        skills: [
            'Admin 1', 'Advocate 1', 'Deception 1', 'Diplomat 1',
            'Electronics (any) 1', 'Persuade 1', 'Stealth 1', 'Streetwise 1'
        ],
        source: 'core'
    },
    {
        name: 'Criminal',
        description: 'For campaigns involving crime and elaborate heists.',
        skills: [
            'Broker 1', 'Deception 1', 'Electronics (any) 1', 'Medic 1',
            'Persuade 1', 'Pilot (any) 1', 'Stealth 1', 'Streetwise 1'
        ],
        source: 'core'
    }
];
