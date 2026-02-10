import { CareerDefinition } from '../core/models/career.model';

export const CAREERS: CareerDefinition[] = [
    {
        name: 'Army',
        description: 'Members of the planetary armed fighting forces. Soldiers deal with planetary surface threats, rebellions, and invasions.',
        qualificationStat: 'END',
        qualificationTarget: 5,
        personalSkills: ['Athletics', 'Melee', 'Drive', 'Heavy Weapons', 'Gun Combat', 'Recon'],
        serviceSkills: ['Gun Combat', 'Athletics', 'Melee', 'Heavy Weapons', 'Tactics', 'Drive'],
        advancedEducation: ['Tactics', 'Electronics', 'Navigation', 'Engineer', 'Survival', 'Medic'],
        officerSkills: ['Tactics', 'Leadership', 'Advocate', 'Diplomat', 'Electronics', 'Admin'],
        assignments: [
            {
                name: 'Support',
                survivalStat: 'END',
                survivalTarget: 5,
                advancementStat: 'EDU',
                advancementTarget: 7,
                skillTable: ['Mechanic', 'Drive', 'Electronics', 'Flyer', 'Profession', 'Admin'],
                ranks: [
                    { level: 0, title: 'Private' },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat 1' },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1' },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Infantry',
                survivalStat: 'STR',
                survivalTarget: 6,
                advancementStat: 'EDU',
                advancementTarget: 6,
                skillTable: ['Gun Combat', 'Melee', 'Heavy Weapons', 'Stealth', 'Athletics', 'Recon'],
                ranks: [
                    { level: 0, title: 'Private' },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat 1' },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1' },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Cavalry',
                survivalStat: 'INT',
                survivalTarget: 7,
                advancementStat: 'INT',
                advancementTarget: 5,
                skillTable: ['Mechanic', 'Drive', 'Flyer', 'Recon', 'Heavy Weapons', 'Electronics'],
                ranks: [
                    { level: 0, title: 'Trooper' },
                    { level: 1, title: 'Lance Corporal', bonus: 'Drive 1' },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1' },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll on the Mishap table.' },
            { roll: 3, description: 'You are assigned to a planet with a hostile environment. Gain Survival 1 or Vacc Suit 1.' },
            { roll: 4, description: 'You are assigned to an urbanised planet torn by war. Gain Stealth 1 or Streetwise 1.' },
            { roll: 5, description: 'You are given a special assignment or duty in your unit. Gain DM+1 to any one Benefit roll.' },
            { roll: 6, description: 'You are thrown into a brutal war. Roll for Survival again (or take a Mishap). If successful, gain Gun Combat 1 or Leadership 1.' },
            { roll: 7, description: 'Life Event. Roll on the Life Event table.' },
            { roll: 8, description: 'You advance your education. Impress your officers. Advance automatically (if eligible).' },
            { roll: 9, description: 'You are surrounded and outnumbered by the enemy. You hold out until relief arrives. Gain DM+2 to Advancement.' },
            { roll: 10, description: 'You are assigned to a peacekeeping role. Gain Admin 1, Advocate 1, or Diplomat 1.' },
            { roll: 11, description: 'Your commanding officer takes an interest in your career. Gain Tactics (military) 1 or Leadership 1.' },
            { roll: 12, description: 'You display heroism in battle. You are automatically promoted.' }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured in action. Reduce one physical characteristic by 1D. Medical Care pays 75%.' },
            { roll: 2, description: 'You are psychologically damaged by your time in the service. Reduce INT or SOC by 1.' },
            { roll: 3, description: 'You are discharged for a crime you did not commit. Lose one Benefit roll.' },
            { roll: 4, description: 'You are discharged for a crime you DID commit. Lose all Benefit rolls.' },
            { roll: 5, description: 'Severe injury. Reduce one physical characteristic by 1D.' },
            { roll: 6, description: 'Injured. No permanent damage, but discharged early.' }
        ],
        musteringOutCash: [2000, 5000, 10000, 10000, 10000, 20000, 30000],
        musteringOutBenefits: ['Combat Implant', 'INT +1', 'EDU +1', 'Weapon', 'Armour', 'SOC +1', 'Ship Share']
    },
    // 2300AD Specific "Drifter" replacement -> Drifter
    {
        name: 'Drifter',
        description: 'Wanderers, scavengers, and those who live outside mainstream society.',
        qualificationStat: 'INT',
        qualificationTarget: 7,
        personalSkills: ['Streetwise', 'Deception', 'Gambler', 'Melee', 'Gun Combat', 'Stealth'],
        serviceSkills: ['Drive', 'Streetwise', 'Broker', 'Electronics', 'Persuade', 'Steward'],
        advancedEducation: ['Admin', 'Advocate', 'Science', 'Electronics', 'Engineer', 'Astrogation'],
        assignments: [
            {
                name: 'Freelancer', // Was Explorer
                survivalStat: 'END',
                survivalTarget: 7,
                advancementStat: 'INT',
                advancementTarget: 7,
                skillTable: ['Navigation', 'Survival', 'Recon', 'Science', 'Animals', 'Drive'],
                ranks: [
                    { level: 0, title: 'Rookie' },
                    { level: 1, title: 'Guide', bonus: 'Survival 1' },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Hunter', bonus: 'Gun Combat 1' },
                    { level: 4, title: 'Surveyor' },
                    { level: 5, title: 'Trailblazer' },
                    { level: 6, title: 'Legend' }
                ]
            },
            {
                name: 'Scavenger',
                survivalStat: 'DEX',
                survivalTarget: 7,
                advancementStat: 'END',
                advancementTarget: 7,
                skillTable: ['Survival', 'Streetwise', 'Mechanic', 'Electronics', 'Stealth', 'Melee'],
                ranks: [
                    { level: 0, title: 'Scavenger' },
                    { level: 1, title: 'Picker' },
                    { level: 2, title: 'Salvager', bonus: 'Mechanic 1' },
                    { level: 3, title: 'Foreman' },
                    { level: 4, title: 'Boss' },
                    { level: 5, title: 'Kingpin' }
                ]
            },
            {
                name: 'Wanderer',
                survivalStat: 'END',
                survivalTarget: 7,
                advancementStat: 'INT',
                advancementTarget: 7,
                skillTable: ['Streetwise', 'Deception', 'Survival', 'Melee', 'Stealth', 'Carouse'],
                ranks: [
                    { level: 0, title: 'Vagrant' },
                    { level: 1, title: 'Drifter', bonus: 'Streetwise 1' },
                    { level: 2, title: 'Traveler' },
                    { level: 3, title: 'Wanderer' },
                    { level: 4, title: 'Nomad' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll on Mishap table.' },
            { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [
             { roll: 1, description: 'Injured.' }
        ],
        musteringOutCash: [1000, 2000, 5000, 10000, 20000, 50000, 100000],
        musteringOutBenefits: ['Contact', 'Weapon', 'Ally', 'Ship Share', 'Armour', 'Equipment', 'Cash']
    },
    {
        name: 'Navy',
        description: 'Members of the interstellar navy, protecting shipping lanes and colonies.',
        qualificationStat: 'INT',
        qualificationTarget: 6,
        personalSkills: ['Athletics', 'Vacc Suit', 'Tactics', 'Gun Combat', 'Melee', 'Zero-G'],
        serviceSkills: ['Pilot', 'Vacc Suit', 'Zero-G', 'Gunner', 'Mechanic', 'Electronics'],
        advancedEducation: ['Astrogation', 'Electronics', 'Navigation', 'Engineer', 'Admin', 'Medic'],
        officerSkills: ['Leadership', 'Tactics', 'Admin', 'Advocate', 'Vacc Suit', 'Diplomat'],
        assignments: [
            {
                name: 'Crew',
                survivalStat: 'INT',
                survivalTarget: 5,
                advancementStat: 'EDU',
                advancementTarget: 7,
                skillTable: ['Gunner', 'Mechanic', 'Electronics', 'Vacc Suit', 'Pilot', 'Melee'],
                ranks: [
                    { level: 0, title: 'Able Spacehand' },
                    { level: 1, title: 'Petty Officer 3rd Class', bonus: 'Mechanic 1' },
                    { level: 2, title: 'Petty Officer 2nd Class' },
                    { level: 3, title: 'Petty Officer 1st Class' },
                    { level: 4, title: 'Chief Petty Officer', bonus: 'Admin 1' },
                    { level: 5, title: 'Senior Chief' },
                    { level: 6, title: 'Master Chief' }
                ]
            },
            {
                name: 'Engineering',
                survivalStat: 'INT',
                survivalTarget: 6,
                advancementStat: 'EDU',
                advancementTarget: 6,
                skillTable: ['Engineer', 'Mechanic', 'Electronics', 'Science', 'Vacc Suit', 'Computers'],
                ranks: [
                    { level: 0, title: 'Engineering Crew' },
                    { level: 1, title: 'Engineering Mate', bonus: 'Engineer 1' },
                    { level: 2, title: 'Petty Officer' },
                    { level: 3, title: 'Chief Engineer' },
                    { level: 4, title: 'Senior Chief' },
                    { level: 5, title: 'Master Chief' },
                    { level: 6, title: 'Engineering Specialist' }
                ]
            },
            {
                name: 'Flight',
                survivalStat: 'DEX',
                survivalTarget: 7,
                advancementStat: 'EDU',
                advancementTarget: 5,
                skillTable: ['Pilot', 'Flyer', 'Gunner', 'Mechanic', 'Astrogation', 'Electronics'],
                ranks: [
                    { level: 0, title: 'Crew' },
                    { level: 1, title: 'Ensign', bonus: 'Pilot 1' },
                    { level: 2, title: 'Lieutenant' },
                    { level: 3, title: 'Lt Commander', bonus: 'Leadership 1' },
                    { level: 4, title: 'Commander' },
                    { level: 5, title: 'Captain' },
                    { level: 6, title: 'Admiral' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Roll on Mishap table.' },
             { roll: 3, description: 'You join a boarding party. Gain Gun Combat 1 or Melee 1.' },
             { roll: 4, description: 'You are given a special assignment. Gain DM+1 to any one Benefit roll.' },
             { roll: 5, description: 'Your vessel participates in a diplomatic mission. Gain Diplomat 1 or Recon 1.' },
             { roll: 6, description: 'You encounter a strange phenomenon. Gain Science 1 or Electronics 1.' },
             { roll: 7, description: 'Life Event.' },
             { roll: 8, description: 'You are involved in a fleet engagement. Gain Gunner 1 or Pilot 1.' },
             { roll: 9, description: 'You foil an espionage attempt. Gain Enemy (Spy) and Advancement DM+2.' },
             { roll: 10, description: 'You spend time in the colonies. Gain Streetwise 1 or Animals 1.' },
             { roll: 11, description: 'Your commanding officer mentors you. Gain Tactics 1 or Admin 1.' },
             { roll: 12, description: 'You display heroism. Automatically promoted.' }
        ],
        mishapTable: [
             { roll: 1, description: 'Severely injured.' },
             { roll: 2, description: 'Honorable discharge after combat injury.' },
             { roll: 3, description: 'Discharged for conduct.' },
             { roll: 4, description: 'Court martial.' },
             { roll: 5, description: 'Injured in accident.' },
             { roll: 6, description: 'Honorable discharge.' }
        ],
        musteringOutCash: [1000, 5000, 10000, 20000, 50000, 50000, 100000],
        musteringOutBenefits: ['Weapon', 'Intellect +1', 'Education +1', 'Ship Share', 'Armour', 'Scholar', 'Travellers']
    },
    {
        name: 'Marines',
        description: 'Spaceborne infantry and security forces.',
        qualificationStat: 'END',
        qualificationTarget: 6,
        personalSkills: ['Athletics', 'Vacc Suit', 'Tactics', 'Heavy Weapons', 'Gun Combat', 'Stealth'],
        serviceSkills: ['Gun Combat', 'Melee', 'Heavy Weapons', 'Tactics', 'Athletics', 'Vacc Suit'],
        advancedEducation: ['Medic', 'Survival', 'Explosives', 'Engineer', 'Navigation', 'Admin'],
        officerSkills: ['Leadership', 'Tactics', 'Admin', 'Advocate', 'Vacc Suit', 'Diplomat'],
        assignments: [
            {
                name: 'Star Marine',
                survivalStat: 'END',
                survivalTarget: 6,
                advancementStat: 'EDU',
                advancementTarget: 6,
                skillTable: ['Vacc Suit', 'Athletics', 'Gunner', 'Melee', 'Electronics', 'Gun Combat'],
                ranks: [
                    { level: 0, title: 'Marine' },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat 1' },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1' },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
             {
                name: 'Ground Assault',
                survivalStat: 'END',
                survivalTarget: 5,
                advancementStat: 'EDU',
                advancementTarget: 7,
                skillTable: ['Gun Combat', 'Heavy Weapons', 'Tactics', 'Melee', 'Survival', 'Drive'],
                ranks: [
                   { level: 0, title: 'Marine' },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat 1' },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1' },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Support',
                survivalStat: 'END',
                survivalTarget: 5,
                advancementStat: 'EDU',
                advancementTarget: 7,
                skillTable: ['Electronics', 'Mechanic', 'Medic', 'Tactics', 'Heavy Weapons', 'Admin'],
                ranks: [
                    { level: 0, title: 'Marine' },
                    { level: 1, title: 'Lance Corporal', bonus: 'Electronics 1' },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1' },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' },
             { roll: 8, description: 'Distinguished service. Promotion DM+2.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [2000, 5000, 10000, 20000, 30000, 40000, 100000],
        musteringOutBenefits: ['Armour', 'INT +1', 'EDU +1', 'Weapon', 'Travel', 'SOC +1', 'Ship Share']
    },
    {
        name: 'Scouts',
        description: 'Explorers and surveyors of the unknown.',
        qualificationStat: 'INT',
        qualificationTarget: 5,
        personalSkills: ['Vacc Suit', 'Survival', 'Mechanic', 'Astrogation', 'Electronics', 'Science'],
        serviceSkills: ['Pilot', 'Survival', 'Mechanic', 'Astrogation', 'Vacc Suit', 'Gun Combat'],
        advancedEducation: ['Medic', 'Navigation', 'Engineer', 'Computers', 'Science', 'Jack-of-all-Trades'],
        officerSkills: [], // Scouts often don't have officers in same way
        assignments: [
            {
                name: 'Explorer',
                survivalStat: 'END',
                survivalTarget: 7,
                advancementStat: 'INT',
                advancementTarget: 7,
                skillTable: ['Electronics', 'Survival', 'Recon', 'Science', 'Stealth', 'Pilot'],
                ranks: [
                    { level: 0, title: 'Scout' },
                    { level: 1, title: 'Scout' },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Senior Scout', bonus: 'Pilot 1' },
                    { level: 4, title: 'Senior Scout' },
                    { level: 5, title: 'Senior Scout' },
                    { level: 6, title: 'Legend' }
                ]
            },
            {
                name: 'Courier',
                survivalStat: 'END',
                survivalTarget: 5,
                advancementStat: 'INT',
                advancementTarget: 9,
                skillTable: ['Electronics', 'Flyer', 'Pilot', 'Engineer', 'Astrogation', 'Diplomat'],
                ranks: [
                    { level: 0, title: 'Scout' },
                    { level: 1, title: 'Scout' },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Senior Scout', bonus: 'Astrogation 1' },
                    { level: 4, title: 'Senior Scout' },
                    { level: 5, title: 'Senior Scout' },
                    { level: 6, title: 'Legend' }
                ]
            },
            {
                name: 'Surveyor',
                survivalStat: 'END',
                survivalTarget: 6,
                advancementStat: 'INT',
                advancementTarget: 8,
                skillTable: ['Electronics', 'Survival', 'Navigation', 'Science', 'Drive', 'Vacc Suit'],
                ranks: [
                    { level: 0, title: 'Scout' },
                    { level: 1, title: 'Scout' },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Senior Scout', bonus: 'Navigation 1' },
                    { level: 4, title: 'Senior Scout' },
                    { level: 5, title: 'Senior Scout' },
                    { level: 6, title: 'Legend' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' },
             { roll: 9, description: 'First Contact due. DM+2 Advancement.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [20000, 20000, 30000, 30000, 50000, 50000, 100000],
        musteringOutBenefits: ['Ship Share', 'INT +1', 'EDU +1', 'Weapon', 'Weapon', 'Scout Ship', 'Equipment']
    },
    {
        name: 'Merchant',
        description: 'Those who haul cargo and passengers across the stars.',
        qualificationStat: 'INT',
        qualificationTarget: 4,
        personalSkills: ['Drive', 'Vacc Suit', 'Broker', 'Steward', 'Electronics', 'Persuade'],
        serviceSkills: ['Steward', 'Electronics', 'Pilot', 'Engineer', 'Mechanic', 'Broker'],
        advancedEducation: ['Engineer', 'Astrogation', 'Computers', 'Pilot', 'Admin', 'Advocate'],
        officerSkills: ['Broker', 'Admin', 'Leadership', 'Diplomat', 'Electronics', 'Pilot'],
        assignments: [
            {
                name: 'Merchant Marine',
                survivalStat: 'EDU',
                survivalTarget: 5,
                advancementStat: 'INT',
                advancementTarget: 7,
                skillTable: ['Pilot', 'Vacc Suit', 'Electronics', 'Mechanic', 'Gunner', 'Engineer'],
                ranks: [
                    { level: 0, title: 'Crew' },
                    { level: 1, title: 'Senior Crew', bonus: 'Mechanic 1' },
                    { level: 2, title: '4th Officer' },
                    { level: 3, title: '3rd Officer' },
                    { level: 4, title: '2nd Officer', bonus: 'Pilot 1' },
                    { level: 5, title: '1st Officer' },
                    { level: 6, title: 'Captain' }
                ]
            },
            {
                name: 'Free Trader',
                survivalStat: 'DEX',
                survivalTarget: 6,
                advancementStat: 'INT',
                advancementTarget: 6,
                skillTable: ['Pilot', 'Vacc Suit', 'Electronics', 'Mechanic', 'Gunner', 'Streetwise'],
                ranks: [
                    { level: 0, title: 'Crew' },
                    { level: 1, title: 'Senior Crew', bonus: 'Persuade 1' },
                    { level: 2, title: '4th Officer' },
                    { level: 3, title: '3rd Officer' },
                    { level: 4, title: '2nd Officer', bonus: 'Pilot 1' },
                    { level: 5, title: '1st Officer' },
                    { level: 6, title: 'Captain' }
                ]
            },
            {
                name: 'Broker',
                survivalStat: 'EDU',
                survivalTarget: 5,
                advancementStat: 'INT',
                advancementTarget: 7,
                skillTable: ['Admin', 'Advocate', 'Broker', 'Streetwise', 'Deception', 'Electronics'],
                ranks: [
                    { level: 0, title: 'Clerk' },
                    { level: 1, title: 'Trader', bonus: 'Broker 1' },
                    { level: 2, title: 'Broker' },
                    { level: 3, title: 'Senior Broker', bonus: 'Streetwise 1' },
                    { level: 4, title: 'Principal' },
                    { level: 5, title: 'Partner' },
                    { level: 6, title: 'Owner' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [1000, 5000, 10000, 20000, 20000, 40000, 40000],
        musteringOutBenefits: ['Blade', 'INT +1', 'EDU +1', 'Gun', 'Armour', 'Free Trader', 'Ship Share']
    },
    {
        name: 'Spaceborne',
        description: 'Belters, Tinkers, and those who live entirely in space.',
         qualificationStat: 'END',
        qualificationTarget: 6,
        personalSkills: ['Zero-G', 'Vacc Suit', 'Mechanic', 'Electronics', 'Pilot', 'Astrogation'],
        serviceSkills: ['Pilot', 'Vacc Suit', 'Zero-G', 'Mechanic', 'Electronics', 'Engineer'],
        advancedEducation: ['Science', 'Engineer', 'Computers', 'Navigation', 'Tactics', 'Medic'],
        officerSkills: [],
        assignments: [
            {
                name: 'Belter',
                survivalStat: 'DEX',
                survivalTarget: 7,
                advancementStat: 'INT',
                advancementTarget: 7,
                skillTable: ['Demolitions', 'Electronics', 'Navigation', 'Pilot', 'Science', 'Zero-G'],
                ranks: [
                    { level: 0, title: 'Miner' },
                    { level: 1, title: 'Prospector', bonus: 'Science 1' },
                    { level: 2, title: 'Foreman' },
                    { level: 3, title: 'Supervisor', bonus: 'Leadership 1' }
                ]
             },
             {
                 name: 'Spacer',
                 survivalStat: 'INT',
                 survivalTarget: 5,
                 advancementStat: 'INT',
                 advancementTarget: 7,
                 skillTable: ['Vacc Suit', 'Zero-G', 'Mechanic', 'Electronics', 'Pilot', 'Steward'],
                 ranks: [
                     { level: 0, title: 'Hand' },
                     { level: 1, title: 'Able Hand', bonus: 'Zero-G 1' },
                     { level: 2, title: 'Mate' },
                     { level: 3, title: 'Skipper' }
                 ]
             },
             {
                 name: 'Tinker',
                 survivalStat: 'DEX',
                 survivalTarget: 6,
                 advancementStat: 'EDU',
                 advancementTarget: 7,
                 skillTable: ['Mechanic', 'Engineer', 'Electronics', 'Computers', 'Science', 'Vacc Suit'],
                 ranks: [
                     { level: 0, title: 'Apprentice' },
                     { level: 1, title: 'Journeyman', bonus: 'Mechanic 1' },
                     { level: 2, title: 'Expert' },
                     { level: 3, title: 'Master' }
                 ]
             }
        ],
         eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [1000, 2000, 5000, 10000, 50000, 100000, 100000],
        musteringOutBenefits: ['Weapon', 'INT +1', 'EDU +1', 'Ship Share', 'Ally', 'Equipment', 'Valuables']
    },
    {
        name: 'Agent',
        description: 'Law enforcement agencies, corporate spies, and intelligence operatives.',
        qualificationStat: 'INT',
        qualificationTarget: 6,
        personalSkills: ['Streetwise', 'Drive', 'Investigate', 'Computers', 'Recon', 'Gun Combat'],
        serviceSkills: ['Investigate', 'Recon', 'Electronics', 'Stealth', 'Gun Combat', 'Advocate'],
        advancedEducation: ['Admin', 'Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit'],
        officerSkills: [],
        assignments: [
            {
                name: 'Police',
                survivalStat: 'END',
                survivalTarget: 6,
                advancementStat: 'INT',
                advancementTarget: 6,
                skillTable: ['Investigate', 'Recon', 'Streetwise', 'Melee', 'Gun Combat', 'Admin'],
                ranks: [
                    { level: 0, title: 'Rookie' },
                    { level: 1, title: 'Corporal', bonus: 'Streetwise 1' },
                    { level: 2, title: 'Sergeant' },
                    { level: 3, title: 'Detective' },
                    { level: 4, title: 'Lieutenant', bonus: 'Investigate 1' },
                    { level: 5, title: 'Chief' },
                    { level: 6, title: 'Commissioner', bonus: 'Admin 1' }
                ]
            },
            {
                name: 'Intelligence',
                survivalStat: 'INT',
                survivalTarget: 7,
                advancementStat: 'INT',
                advancementTarget: 5,
                skillTable: ['Investigate', 'Deception', 'Electronics', 'Stealth', 'Recon', 'Gun Combat'],
                ranks: [
                    { level: 0, title: 'Analyst' },
                    { level: 1, title: 'Agent', bonus: 'Deception 1' },
                    { level: 2, title: 'Field Agent' },
                    { level: 3, title: 'Special Agent' },
                    { level: 4, title: 'Assistant Director', bonus: 'Gun Combat 1' },
                    { level: 5, title: 'Deputy Director' },
                    { level: 6, title: 'Director' }
                ]
            },
             {
                 name: 'Bounty Hunter',
                 survivalStat: 'INT',
                 survivalTarget: 7,
                 advancementStat: 'DEX',
                 advancementTarget: 6,
                 skillTable: ['Investigate', 'Streetwise', 'Electronics', 'Stealth', 'Gun Combat', 'Melee'],
                 ranks: [
                     { level: 0, title: 'Novice' },
                     { level: 1, title: 'Tracker', bonus: 'Survival 1' },
                     { level: 2, title: 'Hunter' },
                     { level: 3, title: 'Professional' },
                     { level: 4, title: 'Ace' }
                 ]
             }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' },
             { roll: 8, description: 'You solve a major case. Promotion DM+2 or Advancement.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured in the line of duty.' }],
        musteringOutCash: [1000, 2000, 5000, 10000, 20000, 50000, 50000],
        musteringOutBenefits: ['Scientific Equipment', 'INT +1', 'Weapon', 'Safe House', 'Armour', 'Science', 'Ship Share']
    },
    {
        name: 'Citizen',
        description: 'Individuals serving in a corporation, bureaucracy, or industry.',
        qualificationStat: 'EDU',
        qualificationTarget: 5,
        personalSkills: ['Drive', 'Flyer', 'Streetwise', 'Melee', 'Steward', 'Profession'],
        serviceSkills: ['Admin', 'Advocate', 'Profession', 'Electronics', 'Driver', 'Mechanic'],
        advancedEducation: ['Art', 'Science', 'Medic', 'Language', 'Computers', 'Diplomat'],
        officerSkills: [],
        assignments: [
            {
                name: 'Corporate',
                survivalStat: 'SOC',
                survivalTarget: 6,
                advancementStat: 'INT',
                advancementTarget: 6,
                skillTable: ['Admin', 'Advocate', 'Broker', 'Diplomat', 'Electronics', 'Computers'],
                ranks: [
                   { level: 0, title: 'Staff' },
                   { level: 1, title: 'Supervisor', bonus: 'Admin 1' },
                   { level: 2, title: 'Manager' },
                   { level: 3, title: 'Junior Executive' },
                   { level: 4, title: 'Director', bonus: 'Advocate 1' },
                   { level: 5, title: 'Executive' },
                   { level: 6, title: 'CEO', bonus: 'Leadership 1' }
                ]
            },
            {
                name: 'Colonist',
                survivalStat: 'END',
                survivalTarget: 7,
                advancementStat: 'EDU',
                advancementTarget: 5,
                skillTable: ['Animals', 'Athletics', 'Drive', 'Medic', 'Survival', 'Recon'],
                ranks: [
                   { level: 0, title: 'Citizen' },
                   { level: 1, title: 'Citizen', bonus: 'Survival 1' },
                   { level: 2, title: 'Councilor' },
                   { level: 3, title: 'Official' },
                   { level: 4, title: 'Governor' }
                ]
            },
            {
                name: 'Worker',
                survivalStat: 'END',
                survivalTarget: 4,
                advancementStat: 'EDU',
                advancementTarget: 8,
                skillTable: ['Drive', 'Mechanic', 'Electronics', 'Engineer', 'Profession', 'Admin'],
                ranks: [
                    { level: 0, title: 'Worker' },
                    { level: 1, title: 'Specialist', bonus: 'Profession 1' },
                    { level: 2, title: 'Supervisor' },
                    { level: 3, title: 'Manager' },
                    { level: 4, title: 'Director' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [1000, 2000, 5000, 10000, 50000, 100000, 200000],
        musteringOutBenefits: ['Weapon', 'Tas Form', 'Ally', 'Ship Share', 'Armour', 'EDU +1', 'Equipment']
    },
    {
        name: 'Entertainer',
        description: 'Individuals who are involved in the media, arts, or entertainment.',
        qualificationStat: 'INT',
        qualificationTarget: 5,
        personalSkills: ['Art', 'Carouse', 'Deception', 'Drive', 'Persuade', 'Stealth'],
        serviceSkills: ['Art', 'Carouse', 'Deception', 'Persuade', 'Steward', 'Electronics'],
        advancedEducation: ['Advocate', 'Broker', 'Diplomat', 'Language', 'Science', 'Computers'],
        officerSkills: [],
        assignments: [
            {
                name: 'Performer',
                survivalStat: 'INT',
                survivalTarget: 5,
                advancementStat: 'DEX',
                advancementTarget: 7,
                skillTable: ['Art', 'Athletics', 'Carouse', 'Deception', 'Stealth', 'Streetwise'],
                ranks: [
                   { level: 0, title: 'Rookie' },
                   { level: 1, title: 'Performer', bonus: 'Art 1' },
                   { level: 2, title: 'Star' },
                   { level: 3, title: 'Superstar' },
                   { level: 4, title: 'Icon', bonus: 'Carouse 1' },
                   { level: 5, title: 'Legend' },
                   { level: 6, title: 'Immortal' }
                ]
            },
            {
                name: 'Journalist',
                survivalStat: 'INT',
                survivalTarget: 5,
                advancementStat: 'EDU',
                advancementTarget: 7,
                skillTable: ['Art', 'Electronics', 'Investigate', 'Streetwise', 'Admin', 'Advocate'],
                ranks: [
                    { level: 0, title: 'Freelancer' },
                    { level: 1, title: 'Staff Writer', bonus: 'Investigate 1' },
                    { level: 2, title: 'Correspondent' },
                    { level: 3, title: 'Editor' },
                    { level: 4, title: 'Publisher', bonus: 'Art 1' },
                    { level: 5, title: 'Mogul' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [1000, 2000, 5000, 10000, 50000, 100000, 100000],
        musteringOutBenefits: ['Weapon', 'INT +1', 'EDU +1', 'Ship Share', 'Ally', 'Equipment', 'Valuables']
    },
    {
        name: 'Noble',
        description: 'Individuals of the upper class, administrators, and diplomats.',
        qualificationStat: 'SOC',
        qualificationTarget: 10,
        personalSkills: ['Admin', 'Advocate', 'Carouse', 'Diplomat', 'Gambler', 'Persuade'],
        serviceSkills: ['Admin', 'Advocate', 'Electronics', 'Diplomat', 'Investigate', 'Persuade'],
        advancedEducation: ['Art', 'Language', 'Leadership', 'Navigation', 'Science', 'Survival'],
        officerSkills: [],
        assignments: [
             {
                name: 'Administrator',
                survivalStat: 'INT',
                survivalTarget: 4,
                advancementStat: 'EDU',
                advancementTarget: 6,
                skillTable: ['Admin', 'Advocate', 'Broker', 'Diplomat', 'Leadership', 'Persuade'],
                ranks: [
                   { level: 0, title: 'Aide' },
                   { level: 1, title: 'Clerk', bonus: 'Admin 1' },
                   { level: 2, title: 'Administrator' },
                   { level: 3, title: 'Director', bonus: 'Leadership 1' },
                   { level: 4, title: 'Minister' }
                ]
            },
            {
                name: 'Diplomat',
                survivalStat: 'INT',
                survivalTarget: 5,
                advancementStat: 'SOC',
                advancementTarget: 7,
                skillTable: ['Advocate', 'Carouse', 'Diplomat', 'Steward', 'Electronics', 'Streetwise'],
                ranks: [
                    { level: 0, title: 'Intern' },
                    { level: 1, title: 'Attaché', bonus: 'Diplomat 1' },
                    { level: 2, title: 'Second Secretary' },
                    { level: 3, title: 'First Secretary', bonus: 'Advocate 1' },
                    { level: 4, title: 'Counselor' },
                    { level: 5, title: 'Minister' },
                    { level: 6, title: 'Ambassador' }
                ]
            },
            {
                name: 'Dilettante',
                survivalStat: 'SOC',
                survivalTarget: 3,
                advancementStat: 'INT',
                advancementTarget: 8,
                skillTable: ['Art', 'Carouse', 'Deception', 'Flyer', 'Jack-of-all-Trades', 'Gambler'],
                ranks: [
                    { level: 0, title: 'Wastrel' },
                    { level: 1, title: 'Heir_ess', bonus: 'Carouse 1' },
                    { level: 2, title: 'Scion' },
                    { level: 3, title: 'Socialite', bonus: 'Art 1' },
                    { level: 4, title: 'Patron' },
                    { level: 5, title: 'Magnate' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Scandal.' }],
        musteringOutCash: [10000, 20000, 50000, 100000, 200000, 500000, 500000],
        musteringOutBenefits: ['Ship Share', 'Social Standing +1', 'Weapon', 'Ship Share', 'Tas Form', 'Yacht', 'Ally']
    },
     {
        name: 'Rogue',
        description: 'Criminals, thieves, and pirates.',
        qualificationStat: 'DEX',
        qualificationTarget: 6,
        personalSkills: ['Athletics', 'Carouse', 'Deception', 'Gambler', 'Melee', 'Streetwise'],
        serviceSkills: ['Deception', 'Recon', 'Athletics', 'Gun Combat', 'Stealth', 'Streetwise'],
        advancedEducation: ['Electronics', 'Mechanic', 'Medic', 'Investigate', 'Navigation', 'Advocate'],
        officerSkills: [],
        assignments: [
            {
                name: 'Thief',
                survivalStat: 'INT',
                survivalTarget: 6,
                advancementStat: 'DEX',
                advancementTarget: 7,
                skillTable: ['Stealth', 'Computers', 'Electronics', 'Streetwise', 'Investigate', 'Athletics'],
                ranks: [
                   { level: 0, title: 'Lackey' },
                   { level: 1, title: 'Henchman', bonus: 'Stealth 1' },
                   { level: 2, title: 'Thief' },
                   { level: 3, title: 'Master Thief', bonus: 'Streetwise 1' },
                   { level: 4, title: 'Crime Lord' }
                ]
            },
            {
                name: 'Enforcer',
                survivalStat: 'END',
                survivalTarget: 6,
                advancementStat: 'STR',
                advancementTarget: 6,
                skillTable: ['Gun Combat', 'Melee', 'Streetwise', 'Persuade', 'Athletics', 'Drive'],
                ranks: [
                    { level: 0, title: 'Thug' },
                    { level: 1, title: 'Soldier', bonus: 'Gun Combat 1' },
                    { level: 2, title: 'Captain' },
                    { level: 3, title: 'Commander', bonus: 'Tactics 1' },
                    { level: 4, title: 'Boss' }
                ]
            },
            {
                name: 'Pirate',
                survivalStat: 'DEX',
                survivalTarget: 6,
                advancementStat: 'INT',
                advancementTarget: 6,
                skillTable: ['Pilot', 'Astrogation', 'Gunner', 'Engineer', 'Vacc Suit', 'Melee'],
                ranks: [
                    { level: 0, title: 'Lackey' },
                    { level: 1, title: 'Corsair', bonus: 'Pilot 1' },
                    { level: 2, title: 'Lieutenant' },
                    { level: 3, title: 'Leader', bonus: 'Tactics 1' },
                    { level: 4, title: 'Dread Pirate' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Arrested.' }],
        musteringOutCash: [1000, 5000, 10000, 20000, 50000, 100000, 100000],
        musteringOutBenefits: ['Weapon', 'Intellect +1', 'Ally', 'Armour', 'Equipment', 'Ship Share', 'Cash']
    },
    {
        name: 'Scholar',
        description: 'Researchers, scientists, and physicians.',
        qualificationStat: 'INT',
        qualificationTarget: 6,
        personalSkills: ['Drive', 'Electronics', 'Diplomat', 'Medic', 'Investigate', 'Science'],
        serviceSkills: ['Electronics', 'Medic', 'Investigate', 'Persuade', 'Science', 'Animals'],
        advancedEducation: ['Art', 'Advocate', 'Computers', 'Language', 'Engineer', 'Science'],
        officerSkills: [],
        assignments: [
            {
                name: 'Scientist',
                survivalStat: 'EDU',
                survivalTarget: 4,
                advancementStat: 'INT',
                advancementTarget: 8,
                skillTable: ['Science', 'Computers', 'Electronics', 'Investigate', 'Art', 'Admin'],
                ranks: [
                    { level: 0, title: 'Student' },
                    { level: 1, title: 'Researcher', bonus: 'Science 1' },
                    { level: 2, title: 'Writer' },
                    { level: 3, title: 'Professor', bonus: 'Admin 1' },
                    { level: 4, title: 'Dean' },
                    { level: 5, title: 'Head of Research' },
                    { level: 6, title: 'Nobel Prize' }
                ]
            },
            {
                name: 'Physician',
                survivalStat: 'EDU',
                survivalTarget: 4,
                advancementStat: 'INT',
                advancementTarget: 8,
                skillTable: ['Medic', 'Electronics', 'Investigate', 'Science', 'Persuade', 'Admin'],
                ranks: [
                    { level: 0, title: 'Intern' },
                    { level: 1, title: 'Resident', bonus: 'Medic 1' },
                    { level: 2, title: 'Specialist' },
                    { level: 3, title: 'Consultant', bonus: 'Admin 1' },
                    { level: 4, title: 'Chief of Dept' },
                    { level: 5, title: 'Hospital Admin' },
                    { level: 6, title: 'Surgeon General' }
                ]
            }
        ],
        eventTable: [
             { roll: 2, description: 'Disaster! Mishap.' },
             { roll: 7, description: 'Life Event.' }
        ],
        mishapTable: [{ roll: 1, description: 'Injured.' }],
        musteringOutCash: [1000, 5000, 10000, 20000, 40000, 80000, 100000],
        musteringOutBenefits: ['INT +1', 'EDU +1', 'Social Standing +1', 'Weapon', 'Equipment', 'Lab Ship', 'Ship Share']
    }
];
