import { Nationality } from '../core/models/nationality.model';

export const NATIONALITIES: Nationality[] = [
  // Tier 1
  {
    code: 'FR',
    name: 'France',
    tier: 1,
    description: 'The dominant superpower of Earth and the stars. Center of culture, technology, and diplomacy.',
    languages: ['French'],
    adjectives: ['French']
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
    adjectives: ['American']
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    tier: 2,
    description: 'Strong space power allied with France, focusing on quality over quantity.',
    languages: ['English'],
    adjectives: ['British']
  },
  {
    code: 'DE',
    name: 'Germany',
    tier: 2,
    description: 'Bavarian-led reunified nation, technologically advanced.',
    languages: ['German'],
    adjectives: ['German']
  },
  {
    code: 'MN',
    name: 'Manchuria',
    tier: 2,
    description: 'Industrial giant and ruler of the Manchurian Arm.',
    languages: ['Mandarin'],
    adjectives: ['Manchurian']
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
    adjectives: ['Argentine']
  },
  {
    code: 'AU',
    name: 'Australia',
    tier: 3,
    description: 'Key ally of Britain and America in the Pacific.',
    languages: ['English'],
    adjectives: ['Australian']
  },
  {
    code: 'AZ',
    name: 'Azania',
    tier: 3,
    description: 'Leading African nation, stable and prosperous.',
    languages: ['Afrikaans', 'Zulu', 'English'],
    adjectives: ['Azanian']
  },
  {
    code: 'BR',
    name: 'Brazil',
    tier: 3,
    description: 'Major South American power, expanding into space.',
    languages: ['Portuguese'],
    adjectives: ['Brazilian']
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
    adjectives: ['Incan']
  },
  {
    code: 'JP',
    name: 'Japan',
    tier: 3,
    description: 'Economic powerhouse with significant orbital presence.',
    languages: ['Japanese'],
    adjectives: ['Japanese']
  },
  {
    code: 'MX',
    name: 'Mexico',
    tier: 3,
    description: 'North American power with growing orbital industry.',
    languages: ['Spanish'],
    adjectives: ['Mexican']
  },
  {
    code: 'RU',
    name: 'Russia',
    tier: 3,
    description: 'Successor state to the Soviet Union, technologically capable but politically unstable.',
    languages: ['Russian'],
    adjectives: ['Russian']
  },
  {
    code: 'TX',
    name: 'Texas',
    tier: 3,
    description: 'Independent republic, fiercely proud and autonomous.',
    languages: ['English', 'Spanish'],
    adjectives: ['Texan']
  },
  {
    code: 'UA',
    name: 'Ukraine',
    tier: 3,
    description: 'Independent Eastern European nation with space ambitions.',
    languages: ['Ukrainian'],
    adjectives: ['Ukrainian']
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
