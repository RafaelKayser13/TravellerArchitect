import { Nationality } from '../core/models/nationality.model';

export const NATIONALITIES: Nationality[] = [
  // Tier 1
  {
    code: 'FR',
    name: 'France',
    tier: 1,
    description: 'The dominant superpower of Earth and the stars. Center of culture, technology, and diplomacy.',
    languages: ['French'],
    adjectives: ['French'],
    effects: [{ type: 'SKILL_MOD', target: 'Diplomat', value: 1, note: 'French Cultural Diplomacy' }]
  },
  {
    code: 'TR',
    name: 'Trilon Corp',
    tier: 1,
    description: 'A massive trans-stellar corporation with influence rivaling major nations. Treated as Tier 1 technology.',
    languages: ['English', 'German', 'Zhargon'], // Corporate mix
    adjectives: ['Trilon']
  },

  // Tier 2
  {
    code: 'US',
    name: 'United States',
    tier: 2,
    description: 'Recovering superpower, aggressive explorer of the American Arm.',
    languages: ['English', 'Spanish'],
    adjectives: ['American'],
    effects: [{ type: 'SKILL_MOD', target: 'Recon', value: 0, note: 'Frontier Experience' }]
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    tier: 2,
    description: 'Strong space power allied with France, focusing on quality over quantity.',
    languages: ['English'],
    adjectives: ['British'],
    effects: [{ type: 'SKILL_MOD', target: 'Gun Combat (Slug)', value: 1 }]
  },
  {
    code: 'DE',
    name: 'Germany',
    tier: 2,
    description: 'Bavarian-led reunified nation, technologically advanced.',
    languages: ['German'],
    adjectives: ['German'],
    effects: [{ type: 'SKILL_MOD', target: 'Engineer (any)', value: 1 }]
  },
  {
    code: 'MN',
    name: 'Manchuria',
    tier: 2,
    description: 'Industrial giant and ruler of the Manchurian Arm.',
    languages: ['Mandarin'],
    adjectives: ['Manchurian'],
    effects: [{ type: 'SKILL_MOD', target: 'Science (any)', value: 1 }]
  },
  {
    code: 'LF',
    name: 'Life Foundation',
    tier: 2,
    description: 'Scientific organization dedicated to understanding alien life. Treated as Tier 2 technology.',
    languages: ['English', 'French'],
    adjectives: ['Foundation']
  },

  // Tier 3
  {
    code: 'AR',
    name: 'Argentina',
    tier: 3,
    description: 'Militantly independent, rival to French influence.',
    languages: ['Spanish'],
    adjectives: ['Argentine'],
    effects: [{ type: 'SKILL_MOD', target: 'Pilot (any)', value: 1 }]
  },
  {
    code: 'AU',
    name: 'Australia',
    tier: 3,
    description: 'Key ally of Britain and America in the Pacific.',
    languages: ['English'],
    adjectives: ['Australian'],
    effects: [{ type: 'SKILL_MOD', target: 'Survival', value: 0 }]
  },
  {
    code: 'AZ',
    name: 'Azania',
    tier: 3,
    description: 'Leading African nation, stable and prosperous.',
    languages: ['Afrikaans', 'Zulu', 'English'],
    adjectives: ['Azanian'],
    effects: [{ type: 'SKILL_MOD', target: 'Persuade', value: 1 }]
  },
  {
    code: 'BR',
    name: 'Brazil',
    tier: 3,
    description: 'Major South American power, expanding into space.',
    languages: ['Portuguese'],
    adjectives: ['Brazilian'],
    effects: [{ type: 'SKILL_MOD', target: 'Athletics (any)', value: 1 }]
  },
  {
    code: 'CA',
    name: 'Canada',
    tier: 3,
    description: 'Prosperous North American nation with active space colonies.',
    languages: ['English', 'French'],
    adjectives: ['Canadian']
  },
  {
    code: 'IR',
    name: 'Inca Republic',
    tier: 3,
    description: 'Union of Andean states.',
    languages: ['Spanish', 'Quechua'],
    adjectives: ['Incan'],
    effects: [{ type: 'SKILL_MOD', target: 'Melee (Blade)', value: 0 }]
  },
  {
    code: 'JP',
    name: 'Japan',
    tier: 3,
    description: 'Economic powerhouse with significant orbital presence.',
    languages: ['Japanese'],
    adjectives: ['Japanese'],
    effects: [{ type: 'CUSTOM', customId: 'JAPAN_BONUS', note: 'Choice of EDU+1 or Commission' }]
  },
  {
    code: 'MX',
    name: 'Mexico',
    tier: 3,
    description: 'North American power with growing orbital industry.',
    languages: ['Spanish'],
    adjectives: ['Mexican'],
    effects: [{ type: 'SKILL_MOD', target: 'Drive (any)', value: 1 }]
  },
  {
    code: 'RU',
    name: 'Russia',
    tier: 3,
    description: 'Successor state to the Soviet Union, technologically capable but politically unstable.',
    languages: ['Russian'],
    adjectives: ['Russian'],
    effects: [{ type: 'SKILL_MOD', target: 'Heavy Weapons (any)', value: 1 }]
  },
  {
    code: 'TX',
    name: 'Texas',
    tier: 3,
    description: 'Independent republic, fiercely proud and autonomous.',
    languages: ['English', 'Spanish'],
    adjectives: ['Texan'],
    effects: [{ type: 'SKILL_MOD', target: 'Gun Combat (Slug)', value: 1 }]
  },
  {
    code: 'UA',
    name: 'Ukraine',
    tier: 3,
    description: 'Independent Eastern European nation with space ambitions.',
    languages: ['Ukrainian'],
    adjectives: ['Ukrainian'],
    effects: [{ type: 'SKILL_MOD', target: 'Streetwise', value: 1 }]
  },

  // Tier 4
  {
    code: 'AB',
    name: 'Arabia',
    tier: 4,
    description: 'Confederation of Arab states.',
    languages: ['Arabic'],
    adjectives: ['Arabian']
  },
  {
    code: 'ID',
    name: 'Indonesia',
    tier: 4,
    description: 'Archipelagic nation.',
    languages: ['Indonesian'],
    adjectives: ['Indonesian']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    tier: 4,
    description: 'West African power.',
    languages: ['English', 'Hausa', 'Yoruba'],
    adjectives: ['Nigerian']
  },
  {
    code: 'UR',
    name: 'UAR',
    tier: 4,
    description: 'United Arab Republic.',
    languages: ['Arabic'],
    adjectives: ['Arab']
  },

  // Tier 6 / Independent
  {
    code: 'IN',
    name: 'Independent',
    tier: 6,
    description: 'Unaffiliated or from a minor nation without a space program.',
    languages: ['English'], // Default
    adjectives: ['Independent']
  }
];
