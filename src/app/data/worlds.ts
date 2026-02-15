import { World } from '../core/models/character.model';

export const WORLDS: World[] = [
  // CORE (Earth & Tirane)
  { name: 'Earth', uwp: 'A867A69-F', gravity: 1.0, gravityCode: 'Normal', survivalDm: 0, path: 'Soft', nation: 'Earth', tier: 'Core', system: 'Sol', techLevel: 15 },
  { name: 'Tirane', uwp: 'A867975-F', gravity: 1.0, gravityCode: 'Normal', survivalDm: 0, path: 'Soft', nation: 'France', tier: 'Core', system: 'Alpha Centauri', techLevel: 15 },

  // FRANCE
  { name: 'Aurore', uwp: 'A483664-B', gravity: 0.47, gravityCode: 'Low', survivalDm: -2, path: 'Hard', nation: 'France', tier: 'Frontier', system: 'Eta Bootis', techLevel: 11, environment: ['Frontier'] },
  { name: 'Beta Canum', uwp: 'A886885-C', gravity: 0.94, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'France', tier: 'Frontier', system: 'Beta Canum Venaticorum', techLevel: 12, environment: ['Frontier'] },
  { name: 'Europe Neuve', uwp: 'A', gravity: 1.05, gravityCode: 'Normal', survivalDm: -2, path: 'Soft', nation: 'France', tier: 'Frontier', system: 'DM+4 123', techLevel: 10, environment: ['Frontier'] }, 
  { name: 'Nous Voilà', uwp: 'A', gravity: 1.05, gravityCode: 'Normal', survivalDm: 0, path: 'Hard', nation: 'France', tier: 'Frontier', system: 'DM+4 123', techLevel: 9, environment: ['Frontier'] },
  { name: 'Serurier', uwp: 'A', gravity: 0.21, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'France', tier: 'Frontier', system: 'DM+4 123', techLevel: 8, environment: ['Frontier', 'Low-G'] },
  { name: 'Ville de Glace', uwp: 'A', gravity: 0.76, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'France', tier: 'Frontier', system: 'DM+4 123', techLevel: 9, environment: ['Frontier', 'Cold'] },

  // AMERICA
  { name: 'Ellis', uwp: 'A755755-C', gravity: 0.92, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'United States', tier: 'Frontier', system: 'Ellis', techLevel: 12, environment: ['Dry', 'Frontier'] },
  { name: 'King (New Columbia)', uwp: 'A540544-C', gravity: 3.08, gravityCode: 'Extreme', survivalDm: -3, path: 'Soft', nation: 'United States', tier: 'Frontier', system: 'King', techLevel: 12, environment: ['Heavy', 'Frontier'] },
  { name: 'Hermes', uwp: 'A', gravity: 0.73, gravityCode: 'Low', survivalDm: -2, path: 'Soft', nation: 'United States', tier: 'Frontier', system: 'Hermes', techLevel: 11, environment: ['Cold', 'Frontier'] },

  // ARGENTINA
  { name: 'Estación Escobar', uwp: 'A', gravity: 0.97, gravityCode: 'Normal', survivalDm: 0, path: 'Soft', nation: 'Argentina', tier: 'Frontier', system: 'Omicron 2 Eridani', techLevel: 10 },
  { name: 'Montana', uwp: 'A', gravity: 0.99, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'Argentina', tier: 'Frontier', system: 'Omicron 2 Eridani', techLevel: 9 },

  // AUSTRALIA
  { name: 'Botany Bay', uwp: 'A', gravity: 0.87, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'Australia', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 11, environment: ['Frontier'] }, 
  { name: 'Huntsland', uwp: 'A', gravity: 3.08, gravityCode: 'Extreme', survivalDm: -3, path: 'Soft', nation: 'Australia', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 10, environment: ['Heavy', 'Frontier'] },
  { name: 'Kingsland', uwp: 'A', gravity: 1.07, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'Australia', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 11, environment: ['Frontier'] },

  // AZANIA
  { name: 'Naragema', uwp: 'A', gravity: 1.02, gravityCode: 'Normal', survivalDm: 0, path: 'Soft', nation: 'Azania', tier: 'Frontier', system: 'Epsilon Indi', techLevel: 10, environment: ['Frontier'] },
  { name: 'Lubumbashi', uwp: 'A', gravity: 1.02, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'Azania', tier: 'Frontier', system: 'Epsilon Indi', techLevel: 11, environment: ['Frontier'] },
  { name: 'Okavango', uwp: 'A', gravity: 0.94, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'Azania', tier: 'Frontier', system: 'Epsilon Indi', techLevel: 10, environment: ['Dry', 'Frontier'] },

  // BRAZIL
  { name: 'Eshari Station', uwp: 'A', gravity: 0.69, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Brazil', tier: 'Frontier', system: 'Xi Ursae Majoris', techLevel: 12 },
  { name: 'Paulo', uwp: 'A', gravity: 0.99, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Brazil', tier: 'Frontier', system: 'Xi Ursae Majoris', techLevel: 11 },

  // BRITAIN
  { name: 'Alicia', uwp: 'A765755-C', gravity: 1.05, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'United Kingdom', tier: 'Frontier', system: 'Chi Draconis', techLevel: 12 },
  { name: 'New Africa', uwp: 'A', gravity: 0.94, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'United Kingdom', tier: 'Frontier', system: 'Chi Draconis', techLevel: 10 }, 

  // CANADA
  { name: 'Eriksson', uwp: 'A', gravity: 0.93, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Canada', tier: 'Frontier', system: 'DM+4 123', techLevel: 10 },
  { name: 'Kanata', uwp: 'A', gravity: 0.87, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Canada', tier: 'Frontier', system: 'DM+4 123', techLevel: 10 },

  // GERMANY
  { name: 'Adlerhorst', uwp: 'A', gravity: 1.05, gravityCode: 'Normal', survivalDm: 0, path: 'Soft', nation: 'Germany', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 11 },
  { name: 'Geroellblock', uwp: 'A', gravity: 0.25, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Germany', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 12 },
  { name: 'Hunsrück', uwp: 'A', gravity: 0.47, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Germany', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 10 },
  { name: 'Freihafen', uwp: 'A', gravity: 0.94, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Germany', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 13 },

  // INCA
  { name: 'Pachamama', uwp: 'A', gravity: 0.44, gravityCode: 'Low', survivalDm: -1, path: 'Hard', nation: 'Inca Republic', tier: 'Frontier', system: 'DM+4 123', techLevel: 10 },
  { name: 'Sechura', uwp: 'A', gravity: 1.25, gravityCode: 'High', survivalDm: -1, path: 'Hard', nation: 'Inca Republic', tier: 'Frontier', system: 'DM+4 123', techLevel: 9 },

  // JAPAN
  { name: 'Daikoku', uwp: 'A', gravity: 0.66, gravityCode: 'Low', survivalDm: -1, path: 'Soft', nation: 'Japan', tier: 'Frontier', system: 'Daikoku', techLevel: 11 },
  { name: 'Shungen', uwp: 'A', gravity: 0.76, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Japan', tier: 'Frontier', system: 'Daikoku', techLevel: 10 },
  { name: 'Tosashimizu', uwp: 'A', gravity: 1.02, gravityCode: 'Normal', survivalDm: -1, path: 'Soft', nation: 'Japan', tier: 'Frontier', system: 'Daikoku', techLevel: 12 },

  // MANCHURIA
  { name: 'Chengdu', uwp: 'A', gravity: 0.93, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Manchuria', tier: 'Frontier', system: 'Han Shan', techLevel: 10, environment: ['Frontier'] },
  { name: 'Cold Mountain', uwp: 'A', gravity: 0.83, gravityCode: 'Normal', survivalDm: -3, path: 'Hard', nation: 'Manchuria', tier: 'Frontier', system: 'Han Shan', techLevel: 9, environment: ['Cold', 'Frontier'] },
  { name: 'Dukou', uwp: 'A', gravity: 1.57, gravityCode: 'High', survivalDm: -2, path: 'Hard', nation: 'Manchuria', tier: 'Frontier', system: 'Han Shan', techLevel: 8, environment: ['Cold', 'Heavy', 'Frontier'] },
  { name: 'Fuyuan', uwp: 'A', gravity: 0.71, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Manchuria', tier: 'Frontier', system: 'Han Shan', techLevel: 10, environment: ['Frontier'] },
  { name: 'Han', uwp: 'A', gravity: 0.92, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Manchuria', tier: 'Frontier', system: 'Han Shan', techLevel: 11, environment: ['Frontier'] },
  { name: 'Kwantung', uwp: 'A', gravity: 0.93, gravityCode: 'Normal', survivalDm: 0, path: 'Hard', nation: 'Manchuria', tier: 'Frontier', system: 'Han Shan', techLevel: 12, environment: ['Frontier'] },

  // MEXICO
  { name: 'Azteca', uwp: 'A', gravity: 0.93, gravityCode: 'Normal', survivalDm: -1, path: 'Hard', nation: 'Mexico', tier: 'Frontier', system: 'DM+4 123', techLevel: 10 },

  // TEXAS
  { name: 'Alamo', uwp: 'A', gravity: 0.44, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Texas', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 11 },
  { name: 'New Austin', uwp: 'A', gravity: 1.25, gravityCode: 'High', survivalDm: -2, path: 'Hard', nation: 'Texas', tier: 'Frontier', system: 'Delta Pavonis', techLevel: 10 },

  // UKRAINE
  { name: 'Teliha', uwp: 'A', gravity: 0.33, gravityCode: 'Low', survivalDm: 0, path: 'Hard', nation: 'Ukraine', tier: 'Frontier', system: 'DM+4 123', techLevel: 9 },

  // INDEPENDENT / CORP
  { name: 'Tanstaafl', uwp: 'A', gravity: 0.47, gravityCode: 'Low', survivalDm: -2, path: 'Hard', nation: 'Independent', tier: 'Frontier', system: 'DM+4 123', techLevel: 11 },
  { name: 'Elysia', uwp: 'A', gravity: 1.02, gravityCode: 'Normal', survivalDm: 0, path: 'Soft', nation: 'Independent', tier: 'Frontier', system: 'DM+4 123', techLevel: 12 },
  { name: 'Kie-Yuma', uwp: 'A', gravity: 1.21, gravityCode: 'High', survivalDm: -1, path: 'Hard', nation: 'Trilon Corp', tier: 'Frontier', system: 'DM+4 123', techLevel: 13 },
  { name: 'Cousteau', uwp: 'A', gravity: 1.25, gravityCode: 'High', survivalDm: -1, path: 'Soft', nation: 'Life Foundation', tier: 'Frontier', system: 'DM+4 123', techLevel: 12 },
];

export function getWorldsByNation(nationName: string): World[] {
    if (nationName === 'Earth' || nationName === 'Core') {
        return WORLDS.filter(w => w.name === 'Earth' || w.name === 'Tirane');
    }
    // Strict filter
    return WORLDS.filter(w => w.nation === nationName || w.nation === 'Independent' || w.nation === 'Unknown');
}
