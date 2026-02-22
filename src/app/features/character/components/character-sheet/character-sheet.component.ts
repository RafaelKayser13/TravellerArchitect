import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../../../core/models/character.model';
import { CharacterService } from '../../../../core/services/character.service';

declare var pdfMake: any;

interface SkillGroup {
  name: string;
  parentLevel?: number;
  children: any[];
}

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss']
})
export class CharacterSheetComponent implements OnInit {
  @Input() characterData?: Character;
  
  protected characterService = inject(CharacterService);
  character = this.characterService.character;

  constructor() {}

  ngOnInit() {
    if (this.characterData) {
      this.characterService.updateCharacter(this.characterData);
    }
  }

  uppString() {
    return this.getUPP(this.character());
  }

  get skillGroups() {
    return this.character().skills;
  }

  mergedSkills() {
    const char = this.character();
    const combinedMap = new Map<string, { level: number | null, children: any[] }>();

    char.skills.forEach((skill) => {
      let trueName = skill.name;
      let spec = skill.specialization;

      // Ensure embedded specializations are extracted if missed by service
      if (!spec && skill.name.includes('(') && skill.name.includes(')')) {
          const parts = skill.name.split('(');
          trueName = parts[0].trim();
          spec = parts[1].replace(')', '').trim();
      }

      if (!combinedMap.has(trueName)) {
        combinedMap.set(trueName, { level: null, children: [] });
      }
      
      const entry = combinedMap.get(trueName)!;
      
      if (spec) {
        entry.children.push({
          name: trueName,
          specialization: spec,
          level: skill.level
        });
      } else {
        // standalone/parent skill
        if (entry.level === null || skill.level > entry.level) {
          entry.level = skill.level;
        }
      }
    });

    // Convert to one flat array, sorted alphabetically by parent
    const sortedSkills = Array.from(combinedMap.entries()).map(([name, data]) => {
      // Sort children alphabetically
      data.children.sort((a, b) => a.specialization.localeCompare(b.specialization));
      return {
        name,
        level: data.level,
        children: data.children
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return sortedSkills;
  }

  getSkillsForPdf() {
    // Return flattened skill array for PDF with grouped display
    // Parent skills show first (with level), then children indented
    const result: any[] = [];
    const skills = this.mergedSkills();

    skills.forEach((skill) => {
      const levelText = skill.level === null ? '-3' : `LVL ${skill.level}`;
      const levelColor = skill.level === null ? '#ff3333' : '#00ccff';
      const nameColor = '#000000'; // Default black

      if (skill.children.length > 0) {
        // Parent skill line
        result.push({
          columns: [
            { text: skill.name, fontSize: 10, bold: true, color: nameColor, width: '*' },
            { text: levelText, fontSize: 10, bold: true, color: levelColor, width: 'auto' }
          ],
          margin: [0, 3, 0, 2]
        });
        // Child skills (specializations)
        skill.children.forEach((child) => {
          result.push({
            columns: [
              { text: `  ↳ ${child.specialization}`, fontSize: 9, color: '#333333', width: '*' }, // darker gray for readability on PDF
              { text: `LVL ${child.level}`, fontSize: 9, color: '#666666', width: 'auto' }
            ],
            margin: [0, 1, 0, 1]
          });
        });
      } else {
        // Add standalone skills
        result.push({
          columns: [
            { text: skill.name, fontSize: 10, bold: true, color: nameColor, width: '*' },
            { text: levelText, fontSize: 10, bold: true, color: levelColor, width: 'auto' }
          ],
          margin: [0, 2, 0, 2]
        });
      }
    });

    return result;
  }

  implants() {
    return this.character().equipment.filter(e => e.toLowerCase().includes('implant') || e.toLowerCase().includes('augment'));
  }

  generalEquipment() {
     const imps = this.implants();
     return this.character().equipment.filter(e => !imps.includes(e));
  }

  statStr(char: any) {
    if (!char) return '0 ( -3)';
    const val = char.value || 0;
    const mod = char.modifier !== undefined ? char.modifier : -3;
    const sign = mod >= 0 ? '+' : '';
    return `${val} (${sign}${mod})`;
  }

  exportJson() {
    const data = JSON.stringify(this.character(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `character_${this.character().name || 'unnamed'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportPdf() {
    const char = this.character();
    const upp = this.getUPP(char);
    
    // Define a stable docDefinition for 2300AD PDF
    // Version note: Using standard text/columns to avoid LayoutBuilder issues in 0.3.x
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'TRAVELLER: 2300AD', fontSize: 8, color: '#00ccff' },
                { text: char.name || 'UNNAMED_OPERATIVE', fontSize: 24, bold: true },
                { text: `DESIGNATION: ${char.nickname || 'N/A'} // UPP: ${upp}`, fontSize: 10, color: '#00ccff' }
              ]
            },
            {
              width: 'auto',
              stack: [
                { text: 'CLEARANCE_LEVEL', fontSize: 8, alignment: 'center', color: '#666666' },
                { text: `0${char.careerHistory?.length || 0}`, fontSize: 28, bold: true, alignment: 'center', color: '#00ccff' }
              ]
            }
          ]
        },
        { text: '\n' },

        // IDENTITY & ORIGIN
        {
          columns: [
            { width: '33%', stack: [{ text: 'SPECIES', fontSize: 8, color: '#666666' }, { text: char.species || 'N/A', fontSize: 11, bold: true }] },
            { width: '33%', stack: [{ text: 'NATIONALITY', fontSize: 8, color: '#666666' }, { text: char.nationality || 'N/A', fontSize: 11, bold: true }] },
            { width: '33%', stack: [{ text: 'HOMEWORLD', fontSize: 8, color: '#666666' }, { text: `${char.homeworld?.name || 'N/A'} (${char.homeworld?.uwp || '???????'})`, fontSize: 11, bold: true }] }
          ]
        },
        { text: '\n' },

        // ATTRIBUTES Header
        { text: 'PRIMARY_ATTRIBUTES', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 5] },
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 1, color: '#eeeeee' }] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'].map(h => ({ text: h, fontSize: 8, color: '#666666', alignment: 'center' })),
              [
                this.statStr(char.characteristics.str),
                this.statStr(char.characteristics.dex),
                this.statStr(char.characteristics.end),
                this.statStr(char.characteristics.int),
                this.statStr(char.characteristics.edu),
                this.statStr(char.characteristics.soc)
              ].map(v => ({ text: v, fontSize: 12, bold: true, alignment: 'center' }))
            ]
          },
          layout: 'noBorders',
          margin: [0, 5, 0, 5]
        },
        { text: '\n' },

        // STATUS & TRAUMA
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'TRAUMA_LOG', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                {
                  stack: char.injuries?.length > 0 
                    ? char.injuries.map((i: any) => ({
                        text: `${i.name}: -${i.reduction} ${i.stat} (${i.treated ? 'STABILIZED' : 'ACTIVE'})`,
                        fontSize: 9,
                        color: i.treated ? '#666666' : '#ff4444',
                        margin: [0, 2, 0, 0]
                      }))
                    : [{ text: 'OPTIMAL_CONDITION', fontSize: 9, color: '#666666', margin: [0, 2, 0, 0] }]
                }
              ]
            },
            {
              width: '50%',
              margin: [20, 0, 0, 0],
              stack: [
                { text: 'AUGMENTATIONS', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                {
                  stack: this.implants().length > 0
                    ? this.implants().map((m: any) => ({ text: m, fontSize: 9, margin: [0, 2, 0, 0] }))
                    : [{ text: 'ORGANIC_PURE', fontSize: 9, color: '#666666', margin: [0, 2, 0, 0] }]
                }
              ]
            }
          ]
        },
        { text: '\n' },

        // SKILLS & FINANCE
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'NEURAL_ENCODING (SKILLS)', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                {
                  stack: this.getSkillsForPdf()
                }
              ]
            },
            {
              width: '50%',
              margin: [20, 0, 0, 0],
              stack: [
                { text: 'FINANCIAL_LEDGER', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                {
                  stack: [
                    { columns: [{ text: 'CASH_ASSETS', fontSize: 8, color: '#666666' }, { text: `Lv ${char.finances.cash.toLocaleString()}`, fontSize: 11, bold: true, alignment: 'right' }] },
                    { columns: [{ text: 'SHIP_SHARES', fontSize: 8, color: '#666666' }, { text: `${char.finances.shipShares}`, fontSize: 11, bold: true, alignment: 'right' }] },
                    { columns: [{ text: 'DEBT', fontSize: 8, color: '#666666' }, { text: `Lv ${char.finances.debt.toLocaleString()}`, fontSize: 11, bold: true, color: '#ff4444', alignment: 'right' }] },
                    { columns: [{ text: 'ANNUAL_PENSION', fontSize: 8, color: '#666666' }, { text: `Lv ${(this.characterService.pension() * 10000).toLocaleString()}`, fontSize: 11, bold: true, alignment: 'right' }] }
                  ],
                  margin: [0, 5, 0, 0]
                },
                { text: '\n' },
                { text: 'EQUIPMENT_GEAR', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                {
                  ul: this.generalEquipment().map((e: string) => ({ text: e, fontSize: 9, color: '#666666' })),
                  margin: [0, 5, 0, 0]
                }
              ]
            }
          ]
        },
        { text: '\n' },

        // SERVICE HISTORY
        { text: 'SERVICE_RECORD_CHRONOLOGY', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 1, color: '#eeeeee' }] },
        {
          stack: char.careerHistory?.length > 0
            ? char.careerHistory.map((term: any) => ({
                stack: [
                  {
                    text: `TERM ${term.termNumber}: ${term.careerName.toUpperCase()} // ${term.rankTitle || 'Rank 0'} (R${term.rank})`,
                    fontSize: 10, bold: true, color: '#333333', margin: [0, 5, 0, 2]
                  },
                  { text: term.events?.join(' // ') || 'No significant events recorded.', fontSize: 9, color: '#666666' }
                ]
              }))
            : [{ text: 'NO_SERVICE_RECORD_ENCODED', fontSize: 9, color: '#666666', margin: [0, 5, 0, 0] }]
        },
        { text: '\n' },

        // RELATIONSHIPS
        { text: 'RELATIONSHIP_MATRIX', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 1, color: '#eeeeee' }] },
        {
          stack: char.npcs?.length > 0
            ? char.npcs.map((npc: any) => ({
                text: `${npc.type.toUpperCase()}: ${npc.name} (${npc.role || 'N/A'}) - ${npc.nature || 'Neutral'} - ${npc.notes || 'No data'}`,
                fontSize: 9,
                color: '#666666',
                margin: [0, 2, 0, 0]
              }))
            : [{ text: 'ISOLATED_OPERATIVE', fontSize: 9, color: '#666666', margin: [0, 5, 0, 0] }]
        },
        { text: '\n' },

        // BIO & EDUCATION
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'BIO_RECORD', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                { text: char.description || 'NO_RECORD_FOUND', fontSize: 9, color: '#666666', margin: [0, 5, 0, 0] }
              ]
            },
            {
              width: '50%',
              margin: [20, 0, 0, 0],
              stack: [
                { text: 'ACADEMIC_SERVICE_HISTORY', fontSize: 10, bold: true, color: '#00ccff', margin: [0, 5, 0, 2] },
                { canvas: [{ type: 'rect', x: 0, y: 0, w: 240, h: 1, color: '#eeeeee' }] },
                {
                  stack: [
                    char.education?.university ? { text: `UNIVERSITY: GRADUATED (${char.education.major || 'General'})`, fontSize: 9, margin: [0, 2, 0, 0] } : null,
                    char.education?.academy ? { text: `MILITARY_ACADEMY: HONORS_GRADUATE`, fontSize: 9, margin: [0, 2, 0, 0] } : null,
                    (!char.education?.university && !char.education?.academy) ? { text: 'NO_ACADEMIC_DATA', fontSize: 9, color: '#666666', margin: [0, 2, 0, 0] } : null
                  ].filter(x => x !== null) as any[]
                }
              ]
            }
          ]
        }
      ],
      defaultStyle: {
        font: 'Roboto'
      }
    };

    if (typeof pdfMake !== 'undefined') {
      const fileName = char.name ? char.name.replace(/\s+/g, '_') : 'Unnamed';
      pdfMake.createPdf(docDefinition).download(`2300AD_Dossier_${fileName}.pdf`);
    } else {
      console.error('pdfMake not found');
      alert('PDF library not loaded yet. Please wait a moment or refresh.');
    }
  }

  private getUPP(char: Character): string {
    if (!char || !char.characteristics || !char.characteristics.str) return '000000';
    try {
        const s = char.characteristics.str.value.toString(16).toUpperCase();
        const d = char.characteristics.dex.value.toString(16).toUpperCase();
        const e = char.characteristics.end.value.toString(16).toUpperCase();
        const i = char.characteristics.int.value.toString(16).toUpperCase();
        const ed = char.characteristics.edu.value.toString(16).toUpperCase();
        const so = char.characteristics.soc.value.toString(16).toUpperCase();
        return `${s}${d}${e}${i}${ed}${so}`;
    } catch (e) {
        return '000000';
    }
  }
}
