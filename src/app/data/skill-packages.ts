export interface SkillPackage {
    name: string;
    description: string;
    skills: string[];
}

export const SKILL_PACKAGES: SkillPackage[] = [
    {
        name: 'Troubleshooter',
        description: 'Fixed-it specialists and problem solvers.',
        skills: [
            'Electronics (Comms) 1', 'Gun Combat (Slug) 1', 'Investigate 1', 
            'Medic 1', 'Melee (Unarmed) 1', 'Recon 1', 'Stealth 1', 'Streetwise 1'
        ]
    },
    {
        name: 'Colonist',
        description: 'Hardy pioneers on the frontier.',
        skills: [
            'Animals (Handling) 1', 'Drive (Wheel) 1', 'Gun Combat (Slug) 1', 
            'Mechanics 1', 'Medic 1', 'Navigation 1', 'Recon 1', 'Survival 1'
        ]
    },
    {
        name: 'Urbanite',
        description: 'Street-smart city dwellers and hackers.',
        skills: [
            'Carouse 1', 'Electronics (Computers) 1', 'Deception 1', 
            'Gun Combat (Slug) 1', 'Melee (Bludgeon) 1', 'Stealth 1', 'Streetwise 1'
        ]
    },
    {
        name: 'Corporate',
        description: 'Efficient agents and executives.',
        skills: [
            'Admin 1', 'Advocate 1', 'Deception 1', 'Investigate 1', 
            'Profession (Management) 1', 'Science (Economics) 1', 'Streetwise 1'
        ]
    },
    {
        name: 'Libertine Trader',
        description: 'Free-wheeling merchants and pilots.',
        skills: [
            'Advocate 1', 'Broker 1', 'Deception 1', 'Diplomat 1', 
            'Engineer (Stutterwarp) 1', 'Gun Combat (Slug) 1', 'Persuade 1', 
            'Pilot (Spacecraft) 1', 'Streetwise 1'
        ]
    },
    {
        name: 'Starship Skills',
        description: 'Essential crew for any deep space vessel.',
        skills: [
            'Astrogation 1', 'Electronics (Sensors) 1', 'Engineer (Power) 1', 
            'Gunner (Turret) 1', 'Mechanics 1', 'Medic 1', 'Pilot (Spacecraft) 1', 
            'Tactics (Naval) 1'
        ]
    },
    {
        name: 'Mercenary',
        description: 'Hired guns and tactical experts.',
        skills: [
            'Electronics (Comms) 1', 'Medic 1', 'Leadership 1', 
            'Heavy Weapons (Man Portable) 1', 'Gun Combat (Slug) 1', 
            'Stealth 1', 'Recon 1'
        ]
    }
];
