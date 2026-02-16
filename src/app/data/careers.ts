import { CareerDefinition } from '../core/models/career.model';
import { AGENT_EVENT_TABLE } from './events/agent/agent-events';
import { AGENT_MISHAP_TABLE } from './events/agent/agent-mishap-events';
import { ARMY_EVENT_TABLE } from './events/army/army-events';
import { ARMY_MISHAP_TABLE } from './events/army/army-mishap-events';
import { CITIZEN_EVENT_TABLE } from './events/citizen/citizen-events';
import { CITIZEN_MISHAP_TABLE } from './events/citizen/citizen-mishap-events';
import { DRIFTER_EVENT_TABLE } from './events/drifter/drifter-events';
import { DRIFTER_MISHAP_TABLE } from './events/drifter/drifter-mishap-events';
import { ENTERTAINER_EVENT_TABLE } from './events/entertainer/entertainer-events';
import { ENTERTAINER_MISHAP_TABLE } from './events/entertainer/entertainer-mishap-events';
import { MARINE_EVENT_TABLE } from './events/marine/marine-events';
import { MARINE_MISHAP_TABLE } from './events/marine/marine-mishap-events';
import { MERCHANT_EVENT_TABLE } from './events/merchant/merchant-events';
import { MERCHANT_MISHAP_TABLE } from './events/merchant/merchant-mishap-events';
import { NAVY_EVENT_TABLE } from './events/navy/navy-events';
import { NAVY_MISHAP_TABLE } from './events/navy/navy-mishap-events';
import { NOBLE_EVENT_TABLE } from './events/noble/noble-events';
import { NOBLE_MISHAP_TABLE } from './events/noble/noble-mishap-events';
import { ROGUE_EVENT_TABLE } from './events/rogue/rogue-events';
import { ROGUE_MISHAP_TABLE } from './events/rogue/rogue-mishap-events';
import { SCHOLAR_EVENT_TABLE } from './events/scholar/scholar-events';
import { SCHOLAR_MISHAP_TABLE } from './events/scholar/scholar-mishap-events';
import { SCOUT_EVENT_TABLE } from './events/scout/scout-events';
import { SCOUT_MISHAP_TABLE } from './events/scout/scout-mishap-events';
import { SPACEBORNE_EVENT_TABLE } from './events/spaceborne/spaceborne-events';
import { SPACEBORNE_MISHAP_TABLE } from './events/spaceborne/spaceborne-mishap-events';
import { PRISONER_EVENT_TABLE } from './events/prisoner/prisoner-events';
import { PRISONER_MISHAP_TABLE } from './events/prisoner/prisoner-mishap-events';

export const CAREERS: CareerDefinition[] = [
    // 1. AGENT (Core Rulebook / 2300AD)
    {
        name: 'Agent',
        description: 'Law enforcement agencies, intelligence operatives, and corporate spies.',
        qualificationStat: 'INT',
        qualificationTarget: 6,
        minAttributes: { int: 6 },
        personalSkills: ['Gun Combat (any)', 'DEX +1', 'END +1', 'Melee (any)', 'INT +1', 'Athletics (any)'],
        serviceSkills: ['Streetwise', 'Drive (any)', 'Investigate', 'Flyer (any)', 'Recon', 'Gun Combat (any)'],
        advancedEducation: ['Advocate', 'Language (any)', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics (any)'],
        assignments: [
            {
                name: 'Law Enforcement',
                survivalStat: 'END', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 6,
                skillTable: ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee (any)', 'Advocate'],
                ranks: [
                    { level: 0, title: 'Rookie' },
                    { level: 1, title: 'Corporal', bonus: 'Streetwise 1', bonusSkill: 'Streetwise', bonusValue: 1 },
                    { level: 2, title: 'Sergeant' },
                    { level: 3, title: 'Detective', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 4, title: 'Lieutenant', bonus: 'Admin 1', bonusSkill: 'Admin', bonusValue: 1 },
                    { level: 5, title: 'Chief', bonus: 'SOC +1', bonusSkill: 'SOC', bonusValue: '+1' },
                    { level: 6, title: 'Commissioner' }
                ]
            },
            {
                name: 'Intelligence',
                survivalStat: 'INT', survivalTarget: 7,
                advancementStat: 'INT', advancementTarget: 5,
                skillTable: ['Investigate', 'Recon', 'Electronics (comms)', 'Stealth', 'Persuade', 'Deception'],
                ranks: [
                    { level: 0, title: 'Agent', bonus: 'Deception 1', bonusSkill: 'Deception', bonusValue: 1 },
                    { level: 1, title: 'Field Agent', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 2, title: 'Field Agent' },
                    { level: 3, title: 'Special Agent', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 4, title: 'Assistant Director' },
                    { level: 5, title: 'Director' }
                ]
            },
            {
                name: 'Corporate',
                survivalStat: 'INT', survivalTarget: 5,
                advancementStat: 'DEX', advancementTarget: 7,
                skillTable: ['Investigate', 'Electronics (computers)', 'Stealth', 'Carouse', 'Deception', 'Streetwise'],
                ranks: [
                    { level: 0, title: 'Agent', bonus: 'Deception 1', bonusSkill: 'Deception', bonusValue: 1 },
                    { level: 1, title: 'Field Agent', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 2, title: 'Field Agent' },
                    { level: 3, title: 'Special Agent', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 4, title: 'Assistant Director' },
                    { level: 5, title: 'Director' }
                ]
            }
        ],
        eventTable: AGENT_EVENT_TABLE,
        mishapTable: AGENT_MISHAP_TABLE,
        musteringOutCash: [1000, 2000, 5000, 7500, 10000, 25000, 50000],
        musteringOutBenefits: ['Scientific Equipment', 'INT +1', 'Ship Share', 'Weapon', 'Combat Implant', 'SOC +1', 'TAS Membership']
    },
    // 2. ARMY (Core Rulebook / 2300AD)
    {
        name: 'Army',
        description: 'Members of the planetary armed fighting forces. (Note: Spacers cannot take Army in Term 1).',
        qualificationStat: 'END',
        qualificationTarget: 5,
        minAttributes: { str: 5, dex: 5, end: 5 },
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'Gambler', 'Medic', 'Melee (any)'],
        serviceSkills: ['Drive (any)', 'Athletics (any)', 'Gun Combat (any)', 'Recon', 'Melee (any)', 'Heavy Weapons (any)'],
        advancedEducation: ['Tactics (Military)', 'Electronics (any)', 'Navigation', 'Explosives', 'Engineer (any)', 'Survival'],
        officerSkills: ['Tactics (Military)', 'Leadership', 'Advocate', 'Diplomat', 'Electronics (any)', 'Admin'],
        officerRanks: [
            { level: 1, title: 'Lieutenant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
            { level: 2, title: 'Captain' },
            { level: 3, title: 'Major', bonus: 'Tactics (Military) 1', bonusSkill: 'Tactics (Military)', bonusValue: 1 },
            { level: 4, title: 'Lt Colonel' },
            { level: 5, title: 'Colonel' },
            { level: 6, title: 'General', bonus: 'SOC 10 or +1', bonusSkill: 'SOC', bonusValue: '10 or +1' }
        ],
        assignments: [
            {
                name: 'Support',
                survivalStat: 'END', survivalTarget: 5,
                advancementStat: 'EDU', advancementTarget: 7,
                skillTable: ['Mechanic', 'Drive (any)', 'Profession (any)', 'Explosives', 'Electronics (comms)', 'Medic'],
                ranks: [
                    { level: 0, title: 'Private', bonus: 'Gun Combat (slug) 1', bonusSkill: 'Gun Combat (slug)', bonusValue: 1 },
                    { level: 1, title: 'Lance Corporal', bonus: 'Recon 1', bonusSkill: 'Recon', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant', bonus: 'STR +1', bonusSkill: 'STR', bonusValue: '+1' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Infantry',
                survivalStat: 'STR', survivalTarget: 6,
                advancementStat: 'EDU', advancementTarget: 6,
                skillTable: ['Gun Combat (any)', 'Melee (any)', 'Heavy Weapons (any)', 'Stealth', 'Athletics (any)', 'Recon'],
                ranks: [
                    { level: 0, title: 'Private', bonus: 'Gun Combat (slug) 1', bonusSkill: 'Gun Combat (slug)', bonusValue: 1 },
                    { level: 1, title: 'Lance Corporal', bonus: 'Recon 1', bonusSkill: 'Recon', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant', bonus: 'STR +1', bonusSkill: 'STR', bonusValue: '+1' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Cavalry',
                survivalStat: 'DEX', survivalTarget: 7,
                advancementStat: 'INT', advancementTarget: 5,
                skillTable: ['Mechanic', 'Drive (any)', 'Flyer (any)', 'Recon', 'Heavy Weapons (vehicle)', 'Electronics (sensors)'],
                ranks: [
                    { level: 0, title: 'Private', bonus: 'Gun Combat (slug) 1', bonusSkill: 'Gun Combat (slug)', bonusValue: 1 },
                    { level: 1, title: 'Lance Corporal', bonus: 'Recon 1', bonusSkill: 'Recon', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant', bonus: 'STR +1', bonusSkill: 'STR', bonusValue: '+1' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            }
        ],
        eventTable: ARMY_EVENT_TABLE,
        mishapTable: ARMY_MISHAP_TABLE,
        musteringOutCash: [2000, 5000, 10000, 10000, 10000, 20000, 30000],
        musteringOutBenefits: ['Combat Implant', 'INT +1', 'EDU +1', 'Weapon', 'Armour', 'SOC +1', 'Ship Share']
    },
    // 3. CITIZEN (Core Rulebook / 2300AD)
    {
        name: 'Citizen',
        description: 'Individuals serving in a corporation, bureaucracy, or industry. (Basic Training covers all Service and Assignment skills at 0).',
        qualificationStat: 'EDU',
        qualificationTarget: 5,
        minAttributes: { edu: 5 },
        personalSkills: ['EDU +1', 'INT +1', 'Carouse', 'Gambler', 'Drive (any)', 'Jack-of-all-Trades'],
        serviceSkills: ['Drive (any)', 'Flyer (any)', 'Streetwise', 'Melee (any)', 'Steward', 'Profession (any)'],
        advancedEducation: ['Art (any)', 'Advocate', 'Diplomat', 'Language (any)', 'Electronics (computers)', 'Medic'],
        advancedEducationMinEdu: 10,
        assignments: [
            {
                name: 'Corporate',
                survivalStat: 'SOC', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 6,
                skillTable: ['Advocate', 'Admin', 'Broker', 'Electronics (computers)', 'Diplomat', 'Leadership'],
                ranks: [
                    { level: 0, title: 'Citizen' },
                    { level: 1, title: 'Employee' },
                    { level: 2, title: 'Manager', bonus: 'Admin 1', bonusSkill: 'Admin', bonusValue: 1 },
                    { level: 3, title: 'Senior Manager' },
                    { level: 4, title: 'Senior Manager', bonus: 'Advocate 1', bonusSkill: 'Advocate', bonusValue: 1 },
                    { level: 5, title: 'Executive' },
                    { level: 6, title: 'Director', bonus: 'SOC +1', bonusSkill: 'SOC', bonusValue: '+1' }
                ]
            },
            {
                name: 'Worker',
                survivalStat: 'END', survivalTarget: 4,
                advancementStat: 'EDU', advancementTarget: 8,
                skillTable: ['Drive (any)', 'Mechanic', 'Electronics (any)', 'Engineer (any)', 'Profession (any)', 'Science (any)'],
                ranks: [
                    { level: 0, title: 'Worker' },
                    { level: 1, title: 'Worker' },
                    { level: 2, title: 'Technician', bonus: 'Profession (any) 1', bonusSkill: 'Profession (any)', bonusValue: 1 },
                    { level: 3, title: 'Technician' },
                    { level: 4, title: 'Craftsman', bonus: 'Mechanic 1', bonusSkill: 'Mechanic', bonusValue: 1 },
                    { level: 5, title: 'Senior Craftsman' },
                    { level: 6, title: 'Master Technician', bonus: 'Engineer (any) 1', bonusSkill: 'Engineer (any)', bonusValue: 1 }
                ]
            },
            {
                name: 'Colonist',
                survivalStat: 'INT', survivalTarget: 7,
                advancementStat: 'EDU', advancementTarget: 5,
                skillTable: ['Animals (any)', 'Athletics (any)', 'Jack-of-all-Trades', 'Drive (any)', 'Survival', 'Recon'],
                ranks: [
                    { level: 0, title: 'Citizen' },
                    { level: 1, title: 'Citizen' },
                    { level: 2, title: 'Settler', bonus: 'Survival 1', bonusSkill: 'Survival', bonusValue: 1 },
                    { level: 3, title: 'Settler' },
                    { level: 4, title: 'Explorer', bonus: 'Navigation 1', bonusSkill: 'Navigation', bonusValue: 1 },
                    { level: 5, title: 'Explorer' },
                    { level: 6, title: 'Senior Colonist', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 }
                ]
            }
        ],
        eventTable: CITIZEN_EVENT_TABLE,
        mishapTable: CITIZEN_MISHAP_TABLE,
        musteringOutCash: [1000, 5000, 10000, 10000, 10000, 50000, 100000],
        musteringOutBenefits: ['Ship Share', 'Ally', 'INT +1', 'EDU +1', 'TAS Membership', 'Weapon', 'Two Ship Shares']
    },
    // 4. DRIFTER (Andarilho - 2300AD)
    {
        name: 'Drifter',
        description: 'Freelancers, wanderers, scavengers, and those who live outside mainstream society. Note: Drifters are not ejected on survival failure unless specified.',
        qualificationStat: 'DEX',
        qualificationTarget: 0, // Automatic
        personalSkills: ['STR +1', 'END +1', 'DEX +1', 'Language (any)', 'Profession (any)', 'Jack-of-all-Trades'],
        serviceSkills: ['Athletics (any)', 'Melee (unarmed)', 'Recon', 'Streetwise', 'Stealth', 'Survival'],
        advancedEducation: [],
        assignments: [
            {
                name: 'Freelancer',
                survivalStat: 'END', survivalTarget: 7,
                advancementStat: 'INT', advancementTarget: 7,
                skillTable: ['Electronics (any)', 'Art (any)', 'Carouse', 'Profession (any)', 'Language (any)', 'Science (any)'],
                ranks: [
                    { level: 0, title: 'Freelancer' },
                    { level: 1, title: 'Freelancer' },
                    { level: 2, title: 'Freelancer' },
                    { level: 3, title: 'Freelancer' },
                    { level: 4, title: 'Freelancer' },
                    { level: 5, title: 'Freelancer' },
                    { level: 6, title: 'Freelancer' }
                ]
            },
            {
                name: 'Wanderer',
                survivalStat: 'END', survivalTarget: 7,
                advancementStat: 'INT', advancementTarget: 7,
                skillTable: ['Engineer (Stutterwarp)', 'Electronics (any)', 'Science (any)', 'Streetwise', 'Deception', 'Melee (unarmed)'],
                ranks: [
                    { level: 0, title: 'Inmate' },
                    { level: 1, title: 'Inmate' },
                    { level: 2, title: 'Inmate' },
                    { level: 3, title: 'Inmate' },
                    { level: 4, title: 'Inmate' },
                    { level: 5, title: 'Inmate' },
                    { level: 6, title: 'Inmate' }
                ]
            },
            {
                name: 'Scavenger',
                survivalStat: 'DEX', survivalTarget: 7,
                advancementStat: 'END', advancementTarget: 7,
                skillTable: ['Pilot (small craft)', 'Mechanic', 'Astrogation', 'Vacc Suit', 'Profession (any)', 'Gun Combat (any)'],
                ranks: [
                    { level: 0, title: 'Scavenger' },
                    { level: 1, title: 'Scavenger', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 2, title: 'Scavenger' },
                    { level: 3, title: 'Scavenger', bonus: 'Profession (Belter) 1 or Mechanic 1', bonusSkill: 'Profession (Belter)', bonusValue: 1 },
                    { level: 4, title: 'Scavenger' },
                    { level: 5, title: 'Scavenger' },
                    { level: 6, title: 'Scavenger' }
                ]
            }
        ],
        eventTable: DRIFTER_EVENT_TABLE,
        mishapTable: DRIFTER_MISHAP_TABLE,
        musteringOutCash: [0, 0, 1000, 2000, 3000, 4000, 8000],
        musteringOutBenefits: ['Contact', 'Weapon', 'Ally', 'Weapon', 'EDU +1', 'Ship Share', 'Two Ship Shares']
    },
    // 5. ENTERTAINER (Entretenimento - 2300AD)
    {
        name: 'Entertainer',
        description: 'Artists, journalists, and performers who create, report, and entertain. (2300AD)',
        qualificationStat: 'DEX or INT',
        qualificationTarget: 5,
        minAttributes: { dex: 5, int: 5 }, // Or logic handled in check
        personalSkills: ['DEX +1', 'INT +1', 'SOC +1', 'Language (any)', 'Carouse', 'Jack-of-all-Trades'],
        serviceSkills: ['Art (any)', 'Carouse', 'Deception', 'Drive (any)', 'Persuade', 'Steward'],
        advancedEducation: ['Advocate', 'Broker', 'Deception', 'Science (any)', 'Streetwise', 'Diplomat'],
        advancedEducationMinEdu: 10,
        assignments: [
            {
                name: 'Artist',
                survivalStat: 'SOC', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 6,
                skillTable: ['Art (any)', 'Carouse', 'Electronics (computers)', 'Gambler', 'Persuade', 'Profession (any)'],
                ranks: [
                    { level: 0, title: 'Artist' },
                    { level: 1, title: 'Artist', bonus: 'Art (any) 1', bonusSkill: 'Art (any)', bonusValue: 1 },
                    { level: 2, title: 'Artist' },
                    { level: 3, title: 'Artist', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 4, title: 'Artist' },
                    { level: 5, title: 'Famous Artist', bonus: 'SOC +1', bonusSkill: 'SOC', bonusValue: '+1' },
                    { level: 6, title: 'Artist' }
                ]
            },
            {
                name: 'Journalist',
                survivalStat: 'EDU', survivalTarget: 7,
                advancementStat: 'INT', advancementTarget: 5,
                skillTable: ['Art (any)', 'Electronics (any)', 'Drive (any)', 'Investigate', 'Recon', 'Streetwise'],
                ranks: [
                    { level: 0, title: 'Journalist' },
                    { level: 1, title: 'Freelancer', bonus: 'Electronics (comms) 1', bonusSkill: 'Electronics (comms)', bonusValue: 1 },
                    { level: 2, title: 'Staff Writer', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 3, title: 'Journalist' },
                    { level: 4, title: 'Correspondent', bonus: 'Persuade 1', bonusSkill: 'Persuade', bonusValue: 1 },
                    { level: 5, title: 'Journalist' },
                    { level: 6, title: 'Senior Correspondent', bonus: 'SOC +1', bonusSkill: 'SOC', bonusValue: '+1' }
                ]
            },
            {
                name: 'Performer',
                survivalStat: 'INT', survivalTarget: 5,
                advancementStat: 'DEX', advancementTarget: 7,
                skillTable: ['Art (any)', 'Athletics (any)', 'Carouse', 'Deception', 'Stealth', 'Streetwise'],
                ranks: [
                    { level: 0, title: 'Performer' },
                    { level: 1, title: 'Performer', bonus: 'DEX +1', bonusSkill: 'DEX', bonusValue: '+1' },
                    { level: 2, title: 'Performer' },
                    { level: 3, title: 'Performer', bonus: 'STR +1', bonusSkill: 'STR', bonusValue: '+1' },
                    { level: 4, title: 'Performer' },
                    { level: 5, title: 'Famous Performer', bonus: 'SOC +1', bonusSkill: 'SOC', bonusValue: '+1' },
                    { level: 6, title: 'Performer' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll on the Mishap table, but you are not ejected from this career.', effects: [{ type: 'mishap' }] },
            { roll: 3, description: 'Controversial event.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['Art (any)', 'Investigate'], onSuccess: [{ type: 'stat-bonus', stat: 'SOC', value: 1 }], onFailure: [{ type: 'stat-bonus', stat: 'SOC', value: -1 }] }] },
            { roll: 4, description: 'Celebrity circles.', effects: [{ type: 'choice', note: 'Celebrity Circles: Skill or Contact' }] },
            { roll: 5, description: 'Popular work. DM+1 to a Benefit roll.', effects: [{ type: 'benefit-dm', value: 1 }] },
            { roll: 6, description: 'Patron. Gain an Ally and DM+2 to next Advancement roll.', effects: [{ type: 'npc', npcType: 'ally' }, { type: 'advancement-dm', value: 2 }] },
            { roll: 7, description: 'Life Event. Roll on the Life Events table.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Celebrity circles.', effects: [{ type: 'choice', note: 'Celebrity Circles', skills: ['Skill', 'Contact'] }] },
            { roll: 9, description: 'Political criticism.', effects: [{ type: 'choice', note: 'Political Criticism', skills: ['Criticize', 'Refuse'] }] },
            { roll: 10, description: 'Tour.', effects: [{ type: 'skill-choice', skills: ['Carouse', 'Persuade', 'Language (any)'] }, { type: 'benefit-dm', value: 1 }] },
            { roll: 11, description: 'Celebrity circles.', effects: [{ type: 'choice', note: 'Celebrity Circles', skills: ['Skill', 'Contact'] }] },
            { roll: 12, description: 'Betrayal.', effects: [{ type: 'choice', note: 'Betrayal', skills: ['Existing Contact', 'New Rival'] }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Scandal. Ejected.', effects: [{ type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 2, description: 'Bad publicity. Reduce SOC by 1.', effects: [{ type: 'stat-bonus', stat: 'SOC', value: -1 }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 3, description: 'Betrayed. Peer becomes Rival. Ejected.', effects: [{ type: 'choice', note: 'Betrayal', skills: ['Existing Contact', 'New Rival'] }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 4, description: 'Censorship. Ejected.', effects: [{ type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 5, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 6, description: 'Bad publicity. Reduce SOC by 1. Ejected.', effects: [{ type: 'stat-bonus', stat: 'SOC', value: -1 }, { type: 'forced-out' }, { type: 'lose-benefit' }] }
        ],
        musteringOutCash: [0, 0, 10000, 10000, 40000, 40000, 80000],
        musteringOutBenefits: ['Contact', 'SOC +1', 'Contact', 'INT +1', 'EDU +1', 'Two Ship Shares', 'Ship Share']
    },
    // 6. MARINE (Fuzileiro - 2300AD)
    {
        name: 'Marine',
        description: 'Spaceborne infantry, boarding parties, and ground assault forces. Neural Jack option for Tier 3+ nations. (2300AD)',
        qualificationStat: 'END',
        qualificationTarget: 6,
        minAttributes: { str: 5, dex: 5, end: 5 },
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'Gambler', 'Melee (unarmed)', 'Melee (blade)'],
        serviceSkills: ['Athletics (any)', 'Vacc Suit', 'Tactics (any)', 'Heavy Weapons (any)', 'Gun Combat (any)', 'Stealth'],
        advancedEducation: ['Medic', 'Survival', 'Explosives', 'Engineer (any)', 'Pilot (any)', 'Navigation'],
        officerSkills: ['Electronics (any)', 'Tactics (any)', 'Admin', 'Advocate', 'Diplomat', 'Leadership'],
        officerRanks: [
            { level: 1, title: 'Lieutenant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
            { level: 2, title: 'Captain' },
            { level: 3, title: 'Force Commander', bonus: 'Tactics (any) 1', bonusSkill: 'Tactics (any)', bonusValue: 1 },
            { level: 4, title: 'Lieutenant Colonel' },
            { level: 5, title: 'Colonel', bonus: 'SOC 10 or +1', bonusSkill: 'SOC', bonusValue: '10 or +1' },
            { level: 6, title: 'Brigadier' }
        ],
        assignments: [
            {
                name: 'Support',
                survivalStat: 'END', survivalTarget: 5,
                advancementStat: 'EDU', advancementTarget: 7,
                skillTable: ['Electronics (any)', 'Mechanic', 'Drive (any)', 'Medic', 'Heavy Weapons (any)', 'Gun Combat (any)'],
                ranks: [
                    { level: 0, title: 'Marine', bonus: 'Gun Combat (any) 1 or Melee (blade) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Star Marine',
                survivalStat: 'END', survivalTarget: 6,
                advancementStat: 'EDU', advancementTarget: 6,
                skillTable: ['Vacc Suit', 'Athletics (any)', 'Gunner (any)', 'Melee (blade)', 'Electronics (any)', 'Gun Combat (any)'],
                ranks: [
                    { level: 0, title: 'Marine', bonus: 'Gun Combat (any) 1 or Melee (blade) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            },
            {
                name: 'Ground Assault',
                survivalStat: 'END', survivalTarget: 7,
                advancementStat: 'EDU', advancementTarget: 5,
                skillTable: ['Vacc Suit', 'Heavy Weapons (any)', 'Recon', 'Melee (blade)', 'Tactics (military)', 'Gun Combat (any)'],
                ranks: [
                    { level: 0, title: 'Marine', bonus: 'Gun Combat (any) 1 or Melee (blade) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 1, title: 'Lance Corporal', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Lance Sergeant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Gunnery Sergeant', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 6, title: 'Sergeant Major' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll on the Mishap table, but you are not ejected from this career.', effects: [{ type: 'mishap' }] },
            { roll: 3, description: 'Trapped behind enemy lines.', effects: [{ type: 'skill-choice', skills: ['Survival', 'Stealth', 'Deception', 'Streetwise'] }] },
            { roll: 4, description: 'Security duty.', effects: [{ type: 'skill-choice', skills: ['Vacc Suit', 'Athletics (any)'] }] },
            { roll: 5, description: 'Advanced Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 6, description: 'Assault!', effects: [{ type: 'skill-check', target: 8, checkSkills: ['Melee (any)', 'Gun Combat (any)'], onSuccess: [{ type: 'skill-choice', skills: ['Tactics (military)', 'Leadership'] }], onFailure: [{ type: 'stat-bonus', stat: 'STR', value: -1 }] }] },
            { roll: 7, description: 'Life Event. Roll on the Life Events table.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Front Lines.', effects: [{ type: 'skill-choice', skills: ['Recon', 'Gun Combat (any)', 'Leadership', 'Electronics (comms)'] }] },
            { roll: 9, description: 'Commander Error.', effects: [{ type: 'choice', note: 'Commander Error', skills: ['Report', 'Protect'] }] },
            { roll: 10, description: 'Black Ops.', effects: [{ type: 'advancement-dm', value: 2 }] },
            { roll: 11, description: 'Commanding Officer Interest.', effects: [{ type: 'choice', note: 'CO Interest', skills: ['Tactics', 'Advancement DM'] }] },
            { roll: 12, description: 'Heroism.', effects: [{ type: 'choice', note: 'Heroism', skills: ['Promotion', 'Commission'] }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured in action. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Captured. Maltreated by enemy. Reduce STR and DEX by 1.', effects: [{ type: 'npc', npcType: 'enemy', note: 'Carcereiro' }, { type: 'stat-bonus', stat: 'STR', value: -1 }, { type: 'stat-bonus', stat: 'DEX', value: -1 }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 3, description: 'Stranded. Stuck behind lines. Gain skill.', effects: [{ type: 'skill-choice', skills: ['Stealth', 'Survival'] }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 4, description: 'Black Ops Conflict. Moral choice.', effects: [{ type: 'choice', note: 'Black Ops Conflict', skills: ['Recuse', 'Accept'] }] },
            { roll: 5, description: 'Quarrel. Rival officer.', effects: [{ type: 'npc', npcType: 'rival' }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [2000, 5000, 5000, 10000, 20000, 30000, 40000],
        musteringOutBenefits: ['Armour', 'INT +1', 'EDU +1', 'Weapon', 'TAS Membership', 'Armour', 'SOC +1']
    },
    // 7. MERCHANT (Comerciante - 2300AD)
    {
        name: 'Merchant',
        description: 'Large corporate crew, independent free traders, or orbital brokers (2300AD).',
        qualificationStat: 'INT',
        qualificationTarget: 4,
        minAttributes: { int: 5, soc: 5 },
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'INT +1', 'EDU +1', 'SOC +1'],
        serviceSkills: ['Drive (any)', 'Vacc Suit', 'Broker', 'Steward', 'Electronics (any)', 'Persuade'],
        advancedEducation: ['Engineer (any)', 'Astrogation', 'Electronics (sensors)', 'Pilot (small craft)', 'Admin', 'Advocate'],
        assignments: [
            {
                name: 'Merchant Marine',
                survivalStat: 'EDU', survivalTarget: 5,
                advancementStat: 'INT', advancementTarget: 7,
                skillTable: ['Pilot (spacecraft)', 'Vacc Suit', 'Electronics (comms)', 'Mechanic', 'Engineer (any)', 'Electronics (any)'],
                ranks: [
                    { level: 0, title: 'Crewman' },
                    { level: 1, title: 'Senior Crewman', bonus: 'Mechanic 1', bonusSkill: 'Mechanic', bonusValue: 1 },
                    { level: 2, title: '4th Officer' },
                    { level: 3, title: '3rd Officer' },
                    { level: 4, title: '2nd Officer', bonus: 'Pilot 1', bonusSkill: 'Pilot', bonusValue: 1 },
                    { level: 5, title: '1st Officer', bonus: 'SOC +1', bonusSkill: 'SOC', bonusValue: '+1' },
                    { level: 6, title: 'Captain' }
                ]
            },
            {
                name: 'Free Trader',
                survivalStat: 'DEX', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 6,
                skillTable: ['Pilot (spacecraft)', 'Vacc Suit', 'Deception', 'Mechanic', 'Streetwise', 'Gunner (any)'],
                ranks: [
                    { level: 0, title: 'Crew' },
                    { level: 1, title: 'Senior Crew', bonus: 'Persuade 1', bonusSkill: 'Persuade', bonusValue: 1 },
                    { level: 2, title: 'Trader' },
                    { level: 3, title: 'Experienced Trader', bonus: 'Jack-of-all-Trades 1', bonusSkill: 'Jack-of-all-Trades', bonusValue: 1 },
                    { level: 4, title: 'Partner' },
                    { level: 5, title: 'Senior Partner' },
                    { level: 6, title: 'Captain' }
                ]
            },
            {
                name: 'Broker',
                survivalStat: 'EDU', survivalTarget: 5,
                advancementStat: 'INT', advancementTarget: 7,
                skillTable: ['Admin', 'Advocate', 'Broker', 'Streetwise', 'Deception', 'Persuade'],
                ranks: [
                    { level: 0, title: 'Clerk' },
                    { level: 1, title: 'Trader', bonus: 'Broker 1', bonusSkill: 'Broker', bonusValue: 1 },
                    { level: 2, title: 'Broker' },
                    { level: 3, title: 'Experienced Broker', bonus: 'Streetwise 1', bonusSkill: 'Streetwise', bonusValue: 1 },
                    { level: 4, title: 'Principal' },
                    { level: 5, title: 'Partner' },
                    { level: 6, title: 'Owner' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll on the Mishap table, but you are not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Smuggling offer.', effects: [{ type: 'choice', note: 'Smuggling Offer', skills: ['Accept', 'Refuse'] }] },
            { roll: 4, description: 'Diverse experience.', effects: [{ type: 'skill-choice', skills: ['Profession (any)', 'Electronics (any)', 'Engineer (any)', 'Animals (any)', 'Science (any)'] }] },
            { roll: 5, description: 'Gambling/Risk.', effects: [{ type: 'choice', note: 'Gambling Risk', skills: ['Bet', 'Pass'] }] },
            { roll: 6, description: 'High Connection.', effects: [{ type: 'npc', npcType: 'contact' }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Legal Trouble.', effects: [{ type: 'skill-choice', skills: ['Advocate', 'Admin', 'Diplomat', 'Investigate'] }, { type: 'sub-roll', note: 'Prison Check' }] },
            { roll: 9, description: 'Advanced Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 10, description: 'Good Deal.', effects: [{ type: 'benefit-dm', value: 1 }] },
            { roll: 11, description: 'Helpful Ally.', effects: [{ type: 'npc', npcType: 'ally' }, { type: 'choice', note: 'Ally Benefit', skills: ['Carouse 1', 'Advancement DM+4'] }] },
            { roll: 12, description: 'Thriving. Automatic Promotion.', effects: [{ type: 'auto-promotion' }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Bankrupt. Lose all Cash Benefits accumulated in this career.', effects: [{ type: 'lose-cash-benefits' }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 3, description: 'Trade War. Gain an Enemy.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 4, description: 'Legal Trouble.', effects: [{ type: 'choice', note: 'Legal Trouble', skills: ['Advocate check'] }] },
            { roll: 5, description: 'Market Crash. Ejected.', effects: [{ type: 'forced-out' }, { type: 'lose-benefit' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [1000, 5000, 10000, 20000, 20000, 40000, 40000],
        musteringOutBenefits: ['Blade', 'INT +1', 'EDU +1', 'Gun', 'Ship Share', 'Free Trader', 'Free Trader']
    },
    // 8. NAVY (Marinha Espacial - 2300AD)
    {
        name: 'Navy',
        description: 'Interstellar navy crew, engineers, and pilots. Neural Jack option for Tier 3+ nations.',
        qualificationStat: 'INT',
        qualificationTarget: 6,
        minAttributes: { str: 5, dex: 5, end: 5 },
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'INT +1', 'EDU +1', 'SOC +1'],
        serviceSkills: ['Pilot (any)', 'Vacc Suit', 'Athletics (any)', 'Gunner (any)', 'Mechanic', 'Gun Combat (any)'],
        advancedEducation: ['Electronics (any)', 'Astrogation', 'Engineer (any)', 'Drive (any)', 'Medic', 'Admin'],
        officerSkills: ['Leadership', 'Electronics (any)', 'Pilot (any)', 'Melee (blade)', 'Admin', 'Tactics (naval)'],
        assignments: [
            {
                name: 'Line/Crew',
                survivalStat: 'INT', survivalTarget: 5,
                advancementStat: 'EDU', advancementTarget: 7,
                skillTable: ['Electronics (any)', 'Mechanic', 'Gun Combat (any)', 'Flyer (any)', 'Melee (any)', 'Vacc Suit'],
                ranks: [
                    { level: 0, title: 'Crewman' },
                    { level: 1, title: 'Able Spacehand', bonus: 'Mechanic 1', bonusSkill: 'Mechanic', bonusValue: 1 },
                    { level: 2, title: 'Petty Officer 3rd Class', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 3, title: 'Petty Officer 2nd Class' },
                    { level: 4, title: 'Petty Officer 1st Class', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 5, title: 'Chief Petty Officer' },
                    { level: 6, title: 'Master Chief' }
                ]
            },
            {
                name: 'Engineer/Gunner',
                survivalStat: 'INT', survivalTarget: 6,
                advancementStat: 'EDU', advancementTarget: 6,
                skillTable: ['Engineer (any)', 'Mechanic', 'Electronics (any)', 'Engineer (any)', 'Gunner (any)', 'Flyer (any)'],
                ranks: [
                    { level: 0, title: 'Crewman' },
                    { level: 1, title: 'Able Spacehand', bonus: 'Mechanic 1', bonusSkill: 'Mechanic', bonusValue: 1 },
                    { level: 2, title: 'Petty Officer 3rd Class', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 3, title: 'Petty Officer 2nd Class' },
                    { level: 4, title: 'Petty Officer 1st Class', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 5, title: 'Chief Petty Officer' },
                    { level: 6, title: 'Master Chief' }
                ]
            },
            {
                name: 'Flight',
                survivalStat: 'DEX', survivalTarget: 7,
                advancementStat: 'EDU', advancementTarget: 5,
                skillTable: ['Pilot (any)', 'Flyer (any)', 'Gunner (any)', 'Pilot (small craft)', 'Astrogation', 'Electronics (any)'],
                ranks: [
                    { level: 0, title: 'Crewman' },
                    { level: 1, title: 'Able Spacehand', bonus: 'Mechanic 1', bonusSkill: 'Mechanic', bonusValue: 1 },
                    { level: 2, title: 'Petty Officer 3rd Class', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 3, title: 'Petty Officer 2nd Class' },
                    { level: 4, title: 'Petty Officer 1st Class', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 5, title: 'Chief Petty Officer' },
                    { level: 6, title: 'Master Chief' }
                ]
            }
        ],
        officerRanks: [
            { level: 1, title: 'Ensign', bonus: 'Melee (blade) 1', bonusSkill: 'Melee (blade)', bonusValue: 1 },
            { level: 2, title: 'Sublieutenant', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
            { level: 3, title: 'Lieutenant' },
            { level: 4, title: 'Commander', bonus: 'Tactics (naval) 1', bonusSkill: 'Tactics (naval)', bonusValue: 1 },
            { level: 5, title: 'Captain', bonus: 'SOC 10 or +1', bonusSkill: 'SOC', bonusValue: '10 or +1' },
            { level: 6, title: 'Admiral', bonus: 'SOC 12 or +1', bonusSkill: 'SOC', bonusValue: '12 or +1' }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll on the Mishap table, but you are not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Gambling Circle.', effects: [{ type: 'choice', note: 'Gambling Circle', skills: ['Observe', 'Play'] }] },
            { roll: 4, description: 'Special Assignment.', effects: [{ type: 'benefit-dm', value: 1 }] },
            { roll: 5, description: 'Advanced Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 6, description: 'Notable Engagement.', effects: [{ type: 'skill-choice', skills: ['Electronics (any)', 'Engineer (any)', 'Gunner (any)', 'Pilot (any)'] }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Diplomatic Mission.', effects: [{ type: 'choice', note: 'Diplomatic Mission', skills: ['Recon', 'Diplomat', 'Steward', 'Contact'] }] },
            { roll: 9, description: 'Foil Crime. Gain an Enemy but DM+2 to Advancement.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'advancement-dm', value: 2 }] },
            { roll: 10, description: 'Abuse Position.', effects: [{ type: 'choice', note: 'Abuse Position', skills: ['Profit', 'Refuse'] }] },
            { roll: 11, description: 'Commanding Officer Interest.', effects: [{ type: 'choice', note: 'CO Interest', skills: ['Tactics (naval) 1', 'Advancement DM+4'] }] },
            { roll: 12, description: 'Heroism.', effects: [{ type: 'choice', note: 'Heroism', skills: ['Promotion', 'Commission'] }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Frozen Watch Error.', effects: [{ type: 'choice', note: 'Frozen Watch Error', skills: ['STR -1', 'DEX -1', 'END -1'] }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Battle Responsibility.', effects: [{ type: 'choice', note: 'Battle Responsibility', skills: ['Accept responsibility check'] }] },
            { roll: 4, description: 'Blamed for Accident.', effects: [{ type: 'choice', note: 'Blamed for Accident', skills: ['Take Blame', 'Deny/Innocent'] }] },
            { roll: 5, description: 'Quarrel. Rival officer.', effects: [{ type: 'npc', npcType: 'rival' }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [1000, 5000, 5000, 10000, 20000, 50000, 50000],
        musteringOutBenefits: ['INT +1', 'EDU +1', 'Weapon', 'TAS Membership', 'Ship Share', 'Two Ship Shares', 'SOC +1']
    },
    // 9. NOBLE (Nobre - 2300AD)
    {
        name: 'Noble',
        description: 'Upper class elite, diplomats, and administrators. Auto-qualify if SOC 10+.',
        qualificationStat: 'SOC',
        qualificationTarget: 10,
        minAttributes: { soc: 6 },
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'Gambler', 'Gun Combat (any)', 'Melee (any)'],
        serviceSkills: ['Admin', 'Advocate', 'Electronics (any)', 'Diplomat', 'Investigate', 'Persuade'],
        advancedEducation: ['Science (any)', 'Advocate', 'Language (any)', 'Leadership', 'Diplomat', 'Art (any)'],
        assignments: [
            {
                name: 'Administrator',
                survivalStat: 'INT', survivalTarget: 4,
                advancementStat: 'EDU', advancementTarget: 6,
                skillTable: ['Admin', 'Advocate', 'Broker', 'Diplomat', 'Leadership', 'Persuade'],
                ranks: [
                    { level: 0, title: 'Assistant' },
                    { level: 1, title: 'Clerk', bonus: 'Admin 1', bonusSkill: 'Admin', bonusValue: 1 },
                    { level: 2, title: 'Supervisor' },
                    { level: 3, title: 'Manager', bonus: 'Advocate 1', bonusSkill: 'Advocate', bonusValue: 1 },
                    { level: 4, title: 'Director' },
                    { level: 5, title: 'Vice President', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 6, title: 'Minister' }
                ]
            },
            {
                name: 'Diplomat',
                survivalStat: 'INT', survivalTarget: 5,
                advancementStat: 'SOC', advancementTarget: 7,
                skillTable: ['Advocate', 'Carouse', 'Electronics (any)', 'Steward', 'Diplomat', 'Deception'],
                ranks: [
                    { level: 0, title: 'Intern' },
                    { level: 1, title: '3rd Secretary', bonus: 'Admin 1', bonusSkill: 'Admin', bonusValue: 1 },
                    { level: 2, title: '2nd Secretary' },
                    { level: 3, title: '1st Secretary', bonus: 'Advocate 1', bonusSkill: 'Advocate', bonusValue: 1 },
                    { level: 4, title: 'Counsellor' },
                    { level: 5, title: 'Minister', bonus: 'Diplomat 1', bonusSkill: 'Diplomat', bonusValue: 1 },
                    { level: 6, title: 'Ambassador' }
                ]
            },
            {
                name: 'Dilettante',
                survivalStat: 'SOC', survivalTarget: 3,
                advancementStat: 'INT', advancementTarget: 8,
                skillTable: ['Carouse', 'Deception', 'Flyer (any)', 'Streetwise', 'Gambler', 'Jack-of-all-Trades'],
                ranks: [
                    { level: 0, title: 'Wastrel' },
                    { level: 1, title: 'Wastrel' },
                    { level: 2, title: 'Ingrate', bonus: 'Carouse 1', bonusSkill: 'Carouse', bonusValue: 1 },
                    { level: 3, title: 'Ingrate' },
                    { level: 4, title: 'Black Sheep', bonus: 'Persuade 1', bonusSkill: 'Persuade', bonusValue: 1 },
                    { level: 5, title: 'Black Sheep' },
                    { level: 6, title: 'Scoundrel', bonus: 'Jack-of-all-Trades 1', bonusSkill: 'Jack-of-all-Trades', bonusValue: 1 }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Roll Mishap but not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Challenged to Duel.', effects: [{ type: 'choice', note: 'Challenged to Duel', skills: ['Accept Duel', 'Refuse Duel'] }] },
            { roll: 4, description: 'Conspiracy revealed.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'skill-choice', skills: ['Investigate', 'Streetwise'] }] },
            { roll: 5, description: 'Political Faction.', effects: [{ type: 'npc', npcType: 'ally' }, { type: 'skill-choice', skills: ['Advocate 1', 'Diplomat 1'] }] },
            { roll: 6, description: 'Good Deal.', effects: [{ type: 'benefit-dm', value: 1 }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Socialite.', effects: [{ type: 'skill-choice', skills: ['Carouse 1', 'Persuade 1'] }] },
            { roll: 9, description: 'Standing rises.', effects: [{ type: 'advancement-dm', value: 2 }] },
            { roll: 10, description: 'Specialist Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 11, description: 'Patron Support.', effects: [{ type: 'npc', npcType: 'ally' }, { type: 'advancement-dm', value: 4 }] },
            { roll: 12, description: 'High Reputation. Automatic Promotion.', effects: [{ type: 'auto-promotion' }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Political Scandal. Lose SOC 1.', effects: [{ type: 'stat-bonus', stat: 'SOC', value: -1 }, { type: 'forced-out' }] },
            { roll: 3, description: 'Family Feud. Gain a Rival.', effects: [{ type: 'npc', npcType: 'rival' }, { type: 'forced-out' }] },
            { roll: 4, description: 'Crime Implication. Lose one Benefit roll.', effects: [{ type: 'lose-benefit' }, { type: 'forced-out' }] },
            { roll: 5, description: 'Reputation Destroyed. Reduce SOC 1.', effects: [{ type: 'stat-bonus', stat: 'SOC', value: -1 }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [10000, 10000, 50000, 50000, 100000, 100000, 200000],
        musteringOutBenefits: ['Ship Share', 'Two Ship Shares', 'TAS Membership', 'SOC +1', 'Yacht', 'SOC +1', 'SOC +1']
    },
    // 10. ROGUE (Bandido - 2300AD)
    {
        name: 'Rogue',
        description: 'Criminals, thieves, and pirates. High risk of arrest (next career: Prisoner).',
        qualificationStat: 'DEX',
        qualificationTarget: 6,
        minAttributes: { dex: 6 },
        personalSkills: ['Carouse', 'DEX +1', 'END +1', 'Gambler', 'Melee (any)', 'Gun Combat (any)'],
        serviceSkills: ['Deception', 'Recon', 'Athletics (any)', 'Gun Combat (any)', 'Stealth', 'Streetwise'],
        advancedEducation: ['Electronics (any)', 'Navigation', 'Medic', 'Investigate', 'Broker', 'Advocate'],
        assignments: [
            {
                name: 'Thief',
                survivalStat: 'INT', survivalTarget: 6,
                advancementStat: 'DEX', advancementTarget: 6,
                skillTable: ['Stealth', 'Electronics (any)', 'Recon', 'Streetwise', 'Deception', 'Athletics (any)'],
                ranks: [
                    { level: 0, title: 'Lackey' },
                    { level: 1, title: 'Henchman', bonus: 'Stealth 1', bonusSkill: 'Stealth', bonusValue: 1 },
                    { level: 2, title: 'Henchman' },
                    { level: 3, title: 'Corporal', bonus: 'Streetwise 1', bonusSkill: 'Streetwise', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Lieutenant', bonus: 'Recon 1', bonusSkill: 'Recon', bonusValue: 1 },
                    { level: 6, title: 'Leader' }
                ]
            },
            {
                name: 'Enforcer',
                survivalStat: 'END', survivalTarget: 6,
                advancementStat: 'STR', advancementTarget: 6,
                skillTable: ['Gun Combat (any)', 'Melee (any)', 'Streetwise', 'Persuade', 'Athletics (any)', 'Drive (any)'],
                ranks: [
                    { level: 0, title: 'Lackey' },
                    { level: 1, title: 'Henchman', bonus: 'Persuade 1', bonusSkill: 'Persuade', bonusValue: 1 },
                    { level: 2, title: 'Henchman' },
                    { level: 3, title: 'Corporal', bonus: 'Gun Combat (any) 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 4, title: 'Sergeant' },
                    { level: 5, title: 'Lieutenant', bonus: 'Streetwise 1', bonusSkill: 'Streetwise', bonusValue: 1 },
                    { level: 6, title: 'Leader' }
                ]
            },
            {
                name: 'Pirate',
                survivalStat: 'DEX', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 6,
                skillTable: ['Pilot (any)', 'Astrogation', 'Gunner (any)', 'Engineer (any)', 'Vacc Suit', 'Melee (any)'],
                ranks: [
                    { level: 0, title: 'Lackey' },
                    { level: 1, title: 'Henchman', bonus: 'Pilot 1 or Gunner 1', bonusSkill: 'Pilot', bonusValue: 1 },
                    { level: 2, title: 'Corporal' },
                    { level: 3, title: 'Sergeant', bonus: 'Gun Combat (any) 1 or Melee 1', bonusSkill: 'Gun Combat (any)', bonusValue: 1 },
                    { level: 4, title: 'Lieutenant' },
                    { level: 5, title: 'Leader', bonus: 'Leadership 1', bonusSkill: 'Leadership', bonusValue: 1 },
                    { level: 6, title: 'Captain' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Mishap but not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Arrested.', effects: [{ type: 'choice', note: 'Arrested', skills: ['Lawyer/Defence', 'Accept Sentence'] }] },
            { roll: 4, description: 'The Job goes right.', effects: [{ type: 'benefit-dm', value: 2 }] },
            { roll: 5, description: 'Network of Contacts.', effects: [{ type: 'npc', npcType: 'contact' }, { type: 'npc', npcType: 'contact', note: 'Gain 2 Contacts' }] },
            { roll: 6, description: 'Advanced Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'High-risk Crime.', effects: [{ type: 'choice', note: 'High-risk Heist', skills: ['Stealth/Deception check'] }] },
            { roll: 9, description: 'Legendary Score.', effects: [{ type: 'advancement-dm', value: 4 }] },
            { roll: 10, description: 'Street Smarts.', effects: [{ type: 'skill-choice', skills: ['Streetwise', 'Deception', 'Stealth', 'Gun Combat'] }] },
            { roll: 11, description: 'New Patron.', effects: [{ type: 'npc', npcType: 'ally' }, { type: 'advancement-dm', value: 2 }] },
            { roll: 12, description: 'Gang Leader. Automatic Promotion.', effects: [{ type: 'auto-promotion' }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Caught! You are arrested and must take the Prisoner career next term.', effects: [{ type: 'career-force', note: 'Prisoner' }, { type: 'forced-out' }] },
            { roll: 3, description: 'Partner Betrayal. Gain an Enemy.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'lose-benefit' }, { type: 'forced-out' }] },
            { roll: 4, description: 'Job gone wrong. Gain an Enemy.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'forced-out' }] },
            { roll: 5, description: 'Framed. Gain a Rival.', effects: [{ type: 'npc', npcType: 'rival' }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [0, 0, 10000, 10000, 50000, 100000, 100000],
        musteringOutBenefits: ['Ship Share', 'Weapon', 'INT +1', 'TAS Membership', 'Armour', 'Two Ship Shares', 'SOC +1']
    },
    // 11. SCHOLAR (Cientista/Erudito - 2300AD)
    {
        name: 'Scholar',
        description: 'Researchers, scientists, and physicians (2300AD).',
        qualificationStat: 'INT',
        qualificationTarget: 6,
        minAttributes: { int: 6, edu: 6 },
        personalSkills: ['INT +1', 'EDU +1', 'SOC +1', 'DEX +1', 'END +1', 'Language (any)'],
        serviceSkills: ['Drive (any)', 'Electronics (any)', 'Diplomat', 'Medic', 'Investigate', 'Science (any)'],
        advancedEducation: ['Art (any)', 'Advocate', 'Electronics (any)', 'Language (any)', 'Engineer (any)', 'Science (any)'],
        assignments: [
            {
                name: 'Field Researcher',
                survivalStat: 'END', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 6,
                skillTable: ['Electronics (any)', 'Vacc Suit', 'Navigation', 'Survival', 'Investigate', 'Science (any)'],
                ranks: [
                    { level: 0, title: 'Student' },
                    { level: 1, title: 'Researcher', bonus: 'Science (any) 1', bonusSkill: 'Science (any)', bonusValue: 1 },
                    { level: 2, title: 'Researcher', bonus: 'Electronics (computers) 1', bonusSkill: 'Electronics (computers)', bonusValue: 1 },
                    { level: 3, title: 'Senior Researcher', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 4, title: 'Senior Researcher' },
                    { level: 5, title: 'Fellow', bonus: 'Science (any) 2', bonusSkill: 'Science (any)', bonusValue: 2 },
                    { level: 6, title: 'Fellow' }
                ]
            },
            {
                name: 'Scientist',
                survivalStat: 'EDU', survivalTarget: 4,
                advancementStat: 'INT', advancementTarget: 8,
                skillTable: ['Admin', 'Engineer (any)', 'Science (any)', 'Science (any)', 'Electronics (any)', 'Science (any)'],
                ranks: [
                    { level: 0, title: 'Student' },
                    { level: 1, title: 'Researcher', bonus: 'Science (any) 1', bonusSkill: 'Science (any)', bonusValue: 1 },
                    { level: 2, title: 'Researcher', bonus: 'Electronics (computers) 1', bonusSkill: 'Electronics (computers)', bonusValue: 1 },
                    { level: 3, title: 'Senior Researcher', bonus: 'Investigate 1', bonusSkill: 'Investigate', bonusValue: 1 },
                    { level: 4, title: 'Senior Researcher' },
                    { level: 5, title: 'Fellow', bonus: 'Science (any) 2', bonusSkill: 'Science (any)', bonusValue: 2 },
                    { level: 6, title: 'Fellow' }
                ]
            },
            {
                name: 'Physician',
                survivalStat: 'EDU', survivalTarget: 4,
                advancementStat: 'INT', advancementTarget: 8,
                skillTable: ['Medic', 'Electronics (any)', 'Investigate', 'Medic', 'Persuade', 'Science (any)'],
                ranks: [
                    { level: 0, title: 'Student' },
                    { level: 1, title: 'Resident', bonus: 'Medic 1', bonusSkill: 'Medic', bonusValue: 1 },
                    { level: 2, title: 'Resident' },
                    { level: 3, title: 'Senior Physician', bonus: 'Science (any) 1', bonusSkill: 'Science (any)', bonusValue: 1 },
                    { level: 4, title: 'Senior Physician' },
                    { level: 5, title: 'Chief Physician', bonus: 'Science (any) 2', bonusSkill: 'Science (any)', bonusValue: 2 },
                    { level: 6, title: 'Chief Physician' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Mishap but not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Scientific Breakthrough.', effects: [{ type: 'advancement-dm', value: 2 }] },
            { roll: 4, description: 'Scientific Interference.', effects: [{ type: 'choice', note: 'Scientific Interference', skills: ['Accept Interference', 'Report/Resist'] }] },
            { roll: 5, description: 'Advanced Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 6, description: 'Research Patron.', effects: [{ type: 'benefit-dm', value: 1 }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Academic Dishonesty.', effects: [{ type: 'choice', note: 'Academic Cheating', skills: ['Cheat for DM+2', 'Refuse'] }] },
            { roll: 9, description: 'Renowned Discovery. Automatic Promotion.', effects: [{ type: 'auto-promotion' }] },
            { roll: 10, description: 'Valuable Partnership.', effects: [{ type: 'npc', npcType: 'ally' }] },
            { roll: 11, description: 'Academic Prize.', effects: [{ type: 'stat-bonus', stat: 'SOC', value: 1 }] },
            { roll: 12, description: 'Paradigm Shift. Automatic Promotion and SOC+1.', effects: [{ type: 'auto-promotion' }, { type: 'stat-bonus', stat: 'SOC', value: 1 }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Lab Accident.', effects: [{ type: 'choice', note: 'Lab Accident', skills: ['Roll Higher Injury', 'Lose Benefit'] }] },
            { roll: 3, description: 'Work Stolen. Gain a Rival.', effects: [{ type: 'npc', npcType: 'rival' }, { type: 'forced-out' }] },
            { roll: 4, description: 'Funding Crisis.', effects: [{ type: 'lose-benefit' }, { type: 'forced-out' }] },
            { roll: 5, description: 'Betrayal. Gain an Enemy.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [5000, 10000, 20000, 30000, 40000, 60000, 100000],
        musteringOutBenefits: ['Scientific Equipment', 'INT +1', 'EDU +1', 'Ship Share', 'Two Ship Shares', 'Lab Ship', 'SOC +1']
    },
    // 12. SCOUT (Batedor/Explorador - 2300AD)
    {
        name: 'Scout',
        description: 'Deep space explorers, surveyors, and stutterwarp mappers (2300AD).',
        qualificationStat: 'INT',
        qualificationTarget: 5,
        minAttributes: { int: 6, end: 6 },
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'INT +1', 'EDU +1', 'Jack-of-all-Trades'],
        serviceSkills: ['Pilot (any)', 'Survival', 'Mechanic', 'Astrogation', 'Vacc Suit', 'Gun Combat (any)'],
        advancedEducation: ['Medic', 'Language (any)', 'Navigation', 'Explosives', 'Science (any)', 'Jack-of-all-Trades'],
        assignments: [
            {
                name: 'Courier',
                survivalStat: 'END', survivalTarget: 5,
                advancementStat: 'INT', advancementTarget: 9,
                skillTable: ['Electronics (any)', 'Flyer (any)', 'Pilot (spacecraft)', 'Engineer (any)', 'Athletics (any)', 'Astrogation'],
                ranks: [
                    { level: 0, title: 'Scout' },
                    { level: 1, title: 'Scout', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Senior Scout', bonus: 'Pilot 1', bonusSkill: 'Pilot', bonusValue: 1 },
                    { level: 4, title: 'Senior Scout' },
                    { level: 5, title: 'Senior Scout' },
                    { level: 6, title: 'Senior Scout' }
                ]
            },
            {
                name: 'Surveyor',
                survivalStat: 'END', survivalTarget: 6,
                advancementStat: 'INT', advancementTarget: 8,
                skillTable: ['Electronics (any)', 'Persuade', 'Pilot (any)', 'Navigation', 'Diplomat', 'Streetwise'],
                ranks: [
                    { level: 0, title: 'Scout' },
                    { level: 1, title: 'Scout', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Senior Scout', bonus: 'Pilot 1', bonusSkill: 'Pilot', bonusValue: 1 },
                    { level: 4, title: 'Senior Scout' },
                    { level: 5, title: 'Senior Scout' },
                    { level: 6, title: 'Senior Scout' }
                ]
            },
            {
                name: 'Explorer',
                survivalStat: 'END', survivalTarget: 7,
                advancementStat: 'INT', advancementTarget: 7,
                skillTable: ['Electronics (any)', 'Pilot (any)', 'Engineer (any)', 'Science (any)', 'Stealth', 'Recon'],
                ranks: [
                    { level: 0, title: 'Scout' },
                    { level: 1, title: 'Scout', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 2, title: 'Scout' },
                    { level: 3, title: 'Senior Scout', bonus: 'Pilot 1', bonusSkill: 'Pilot', bonusValue: 1 },
                    { level: 4, title: 'Senior Scout' },
                    { level: 5, title: 'Senior Scout' },
                    { level: 6, title: 'Senior Scout' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Mishap but not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Ambushed.', effects: [{ type: 'choice', note: 'Ambushed', skills: ['Flee (Pilot)', 'Negotiate (Persuade)'] }] },
            { roll: 4, description: 'Survey alien world.', effects: [{ type: 'skill-choice', skills: ['Animals (any)', 'Survival', 'Recon', 'Science (any)'] }] },
            { roll: 5, description: 'Exemplary Service.', effects: [{ type: 'benefit-dm', value: 1 }] },
            { roll: 6, description: 'Stutterwarp Route. Gain Astrogation 1, Electronics (any) 1, Navigation 1, Pilot (small craft) 1, or Mechanic 1.', effects: [{ type: 'skill-choice', skills: ['Astrogation', 'Electronics (any)', 'Navigation', 'Pilot (small craft)', 'Mechanic'] }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Intelligence Gathering.', effects: [{ type: 'choice', note: 'Gather Intel', skills: ['Electronics/Deception check'] }] },
            { roll: 9, description: 'Rescue Mission.', effects: [{ type: 'choice', note: 'Rescue Mission', skills: ['Medic/Engineer check'] }] },
            { roll: 10, description: 'Fringes of Space.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['Survival', 'Pilot (any)'], onSuccess: [{ type: 'npc', npcType: 'contact', note: 'Alien Contact' }, { type: 'any-skill-up' }] }] },
            { roll: 11, description: 'Courier Duty.', effects: [{ type: 'choice', note: 'Courier Duty', skills: ['Diplomat 1', 'Advancement DM+4'] }] },
            { roll: 12, description: 'Major Discovery. Automatic Promotion.', effects: [{ type: 'auto-promotion' }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Hull Breach. Reduce END 1.', effects: [{ type: 'stat-bonus', stat: 'END', value: -1 }, { type: 'forced-out' }] },
            { roll: 3, description: 'Disease. Reduce END 1.', effects: [{ type: 'stat-bonus', stat: 'END', value: -1 }, { type: 'forced-out' }] },
            { roll: 4, description: 'Stranded. Career ends.', effects: [{ type: 'skill-gain', skill: 'Survival' }, { type: 'forced-out' }] },
            { roll: 5, description: 'Attacked. Gain Enemy.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [20000, 20000, 30000, 30000, 50000, 50000, 50000],
        musteringOutBenefits: ['Ship Share', 'INT +1', 'EDU +1', 'Weapon', 'Weapon', 'Scout Ship', 'Scout Ship']
    },
    // 13. SPACEBORNE (Vida no Espaço - 2300AD)
    {
        name: 'Spaceborne',
        description: 'Individuals born and raised in zero-gravity environments or nomadic clans. (2300AD)',
        qualificationStat: 'INT',
        qualificationTarget: 0, // Automatic (Substitutes Drifter)
        traits: ['0-G DNAM'],
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'INT +1', 'Language (any)', 'Profession (any)'],
        serviceSkills: ['Vacc Suit', 'Athletics (any)', 'Mechanic', 'Electronics (comms)', 'Recon', 'Streetwise'],
        advancedEducation: ['Engineer (any)', 'Astrogation', 'Electronics (sensors)', 'Pilot (small craft)', 'Admin', 'Science (any)'],
        assignments: [
            {
                name: 'Libertine',
                survivalStat: 'INT', survivalTarget: 5,
                advancementStat: 'EDU', advancementTarget: 7,
                skillTable: ['Pilot (any)', 'Vacc Suit', 'Deception', 'Mechanic', 'Engineer (any)', 'Electronics (any)'],
                ranks: [
                    { level: 0, title: 'Crewman' },
                    { level: 1, title: 'Able Spacehand', bonus: 'Mechanic 1', bonusSkill: 'Mechanic', bonusValue: 1 },
                    { level: 2, title: 'Petty Officer 3rd Class', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 3, title: 'Petty Officer 2nd Class' },
                    { level: 4, title: 'Petty Officer 1st Class', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' },
                    { level: 5, title: 'Chief Petty Officer' },
                    { level: 6, title: 'Master Chief' }
                ]
            },
            {
                name: 'Tinker',
                survivalStat: 'EDU', survivalTarget: 5,
                advancementStat: 'INT', advancementTarget: 7,
                skillTable: ['Mechanic', 'Engineer (any)', 'Electronics (any)', 'Profession (any)', 'Advocate', 'Jack-of-all-Trades'],
                ranks: [
                    { level: 0, title: 'Tinker' },
                    { level: 1, title: 'Senior Tinker', bonus: 'Profession (any) 1', bonusSkill: 'Profession (any)', bonusValue: 1 },
                    { level: 2, title: 'Tinker' },
                    { level: 3, title: 'Master Tinker', bonus: 'Engineer 1', bonusSkill: 'Engineer', bonusValue: 1 },
                    { level: 4, title: 'Tinker' },
                    { level: 5, title: 'Clan Leader', bonus: 'Electronics 1', bonusSkill: 'Electronics', bonusValue: 1 },
                    { level: 6, title: 'Master Tinker' }
                ]
            },
            {
                name: 'Belter',
                survivalStat: 'DEX', survivalTarget: 7,
                advancementStat: 'END', advancementTarget: 7,
                skillTable: ['Vacc Suit', 'Pilot (small craft)', 'Electronics (sensors)', 'Mechanic', 'Survival', 'Gunner (turret)'],
                ranks: [
                    { level: 0, title: 'Belter' },
                    { level: 1, title: 'Senior Belter', bonus: 'Vacc Suit 1', bonusSkill: 'Vacc Suit', bonusValue: 1 },
                    { level: 2, title: 'Belter' },
                    { level: 3, title: 'Master Belter', bonus: 'Profession (belter) 1 or Mechanic 1', bonusSkill: 'Profession (belter)', bonusValue: 1 },
                    { level: 4, title: 'Belter' },
                    { level: 5, title: 'Clan Leader', bonus: 'Electronics (sensors) 1', bonusSkill: 'Electronics (sensors)', bonusValue: 1 },
                    { level: 6, title: 'Master Belter' }
                ]
            }
        ],
        eventTable: [
            { roll: 2, description: 'Disaster! Mishap but not ejected.', effects: [{ type: 'mishap' }, { type: 'forced-out', value: 0 }] },
            { roll: 3, description: 'Trade Opportunity.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['Broker'], onSuccess: [{ type: 'benefit-dm', value: 1 }] }] },
            { roll: 4, description: 'Shipboard life.', effects: [{ type: 'skill-choice', skills: ['Mechanic', 'Vacc Suit', 'Electronics', 'Astrogation'] }] },
            { roll: 5, description: 'Alien contact.', effects: [{ type: 'npc', npcType: 'contact', note: 'Alien contact' }, { type: 'skill-gain', skill: 'Science (Xenology)' }] },
            { roll: 6, description: 'Advanced Training.', effects: [{ type: 'skill-check', target: 8, checkSkills: ['EDU'], onSuccess: [{ type: 'any-skill-up' }] }] },
            { roll: 7, description: 'Life Event.', effects: [{ type: 'life-event' }] },
            { roll: 8, description: 'Smuggling run.', effects: [{ type: 'choice', note: 'Smuggling Run', skills: ['Deception/Streetwise check'] }] },
            { roll: 9, description: 'Discovery! Route or resource found.', effects: [{ type: 'advancement-dm', value: 2 }] },
            { roll: 10, description: 'Conflict.', effects: [{ type: 'choice', note: 'Conflict/Pirates', skills: ['Pilot/Gunner check'] }] },
            { roll: 11, description: 'Mentor.', effects: [{ type: 'npc', npcType: 'ally' }, { type: 'advancement-dm', value: 4 }] },
            { roll: 12, description: 'Legendary Spacer. Automatic Promotion.', effects: [{ type: 'auto-promotion' }] }
        ],
        mishapTable: [
            { roll: 1, description: 'Severely injured. Roll on the Injury table.', effects: [{ type: 'injury' }] },
            { roll: 2, description: 'Hull Breach. Reduce END 1.', effects: [{ type: 'stat-bonus', stat: 'END', value: -1 }, { type: 'forced-out' }] },
            { roll: 3, description: 'Deep Space Stranded.', effects: [{ type: 'skill-gain', skill: 'Survival' }, { type: 'lose-benefit' }, { type: 'forced-out' }] },
            { roll: 4, description: 'Pirate Attack. Gain Enemy.', effects: [{ type: 'npc', npcType: 'enemy' }, { type: 'forced-out' }] },
            { roll: 5, description: 'Equipment failure. Lose one Benefit roll.', effects: [{ type: 'lose-benefit' }, { type: 'forced-out' }] },
            { roll: 6, description: 'Injured. Roll on the Injury table.', effects: [{ type: 'injury' }, { type: 'forced-out' }] }
        ],
        musteringOutCash: [1000, 5000, 10000, 20000, 20000, 40000, 40000],
        musteringOutBenefits: ['Weapon', 'INT +1', 'EDU +1', 'Ship Share', 'Ally', 'Equipment', 'Two Ship Shares']
    },
    // 14. PRISONER (Core Rulebook)
    {
        name: 'Prisoner',
        description: 'Incarceration in a penal colony or prison ship.',
        qualificationStat: 'none',
        qualificationTarget: 0, // Forced career
        personalSkills: ['STR +1', 'DEX +1', 'END +1', 'Melee (unarmed)', 'Melee (blade)', 'Streetwise'],
        serviceSkills: ['Deception', 'Stealth', 'Athletics (any)', 'Carouse', 'Persuade', 'Profession (any)'],
        advancedEducation: [],
        assignments: [
            {
                name: 'Inmate',
                survivalStat: 'END', survivalTarget: 7,
                advancementStat: 'STR', advancementTarget: 7,
                skillTable: ['Stealth', 'Melee (unarmed)', 'Streetwise', 'Survival', 'Athletics (strength)', 'Mechanic'],
                ranks: [
                    { level: 0, title: 'New Fish', bonus: 'Melee (unarmed) 1', bonusSkill: 'Melee (unarmed)', bonusValue: 1 },
                    { level: 1, title: 'Inmate' },
                    { level: 2, title: 'Senior Inmate', bonus: 'Athletics 1', bonusSkill: 'Athletics', bonusValue: 1 },
                    { level: 3, title: 'Trustee' },
                    { level: 4, title: 'Senior Trustee', bonus: 'Advocate 1', bonusSkill: 'Advocate', bonusValue: 1 },
                    { level: 5, title: 'Model Prisoner' },
                    { level: 6, title: 'Parolee', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' }
                ]
            },
            {
                name: 'Thug',
                survivalStat: 'STR', survivalTarget: 8,
                advancementStat: 'END', advancementTarget: 6,
                skillTable: ['Persuade', 'Melee (unarmed)', 'Melee (unarmed)', 'Melee (blade)', 'Athletics (strength)', 'Athletics (strength)'],
                ranks: [
                    { level: 0, title: 'Thug', bonus: 'Melee (unarmed) 1', bonusSkill: 'Melee (unarmed)', bonusValue: 1 },
                    { level: 1, title: 'Enforcer' },
                    { level: 2, title: 'Gang Leader', bonus: 'Athletics 1', bonusSkill: 'Athletics', bonusValue: 1 },
                    { level: 3, title: 'Boss' },
                    { level: 4, title: 'Kingpin', bonus: 'Advocate 1', bonusSkill: 'Advocate', bonusValue: 1 },
                    { level: 5, title: 'Warden' },
                    { level: 6, title: 'General', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' }
                ]
            },
            {
                name: 'Fixer',
                survivalStat: 'INT', survivalTarget: 9,
                advancementStat: 'END', advancementTarget: 5,
                skillTable: ['Investigate', 'Broker', 'Deception', 'Streetwise', 'Stealth', 'Admin'],
                ranks: [
                    { level: 0, title: 'Fixer', bonus: 'Melee (unarmed) 1', bonusSkill: 'Melee (unarmed)', bonusValue: 1 },
                    { level: 1, title: 'Dealer' },
                    { level: 2, title: 'Supplier', bonus: 'Athletics 1', bonusSkill: 'Athletics', bonusValue: 1 },
                    { level: 3, title: 'Smuggler' },
                    { level: 4, title: 'Broker', bonus: 'Advocate 1', bonusSkill: 'Advocate', bonusValue: 1 },
                    { level: 5, title: 'Mastermind' },
                    { level: 6, title: 'Kingpin', bonus: 'END +1', bonusSkill: 'END', bonusValue: '+1' }
                ]
            }
        ],
        eventTable: PRISONER_EVENT_TABLE,
        mishapTable: PRISONER_MISHAP_TABLE,
        musteringOutCash: [0, 0, 100, 200, 500, 1000, 2500],
        musteringOutBenefits: ['Contact', 'Blade', 'Choice: Deception/Persuade/Stealth', 'Ally', 'Choice: Melee/Recon/Streetwise', 'STR +1 or END +1', 'Deception, Persuade and Stealth']
    }
];
