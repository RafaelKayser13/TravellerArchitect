import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../../core/services/character.service';

declare var pdfMake: any;

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-sheet.component.html',
  styleUrls: ['./character-sheet.component.scss']
})
export class CharacterSheetComponent {
  protected characterService = inject(CharacterService);
  character = this.characterService.character;

  exportJson() {
    const data = JSON.stringify(this.character(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traveller_character_${this.character().name.replace(/\s+/g, '_') || 'unnamed'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportPdf() {
    const char = this.character();
    
    const docDefinition: any = {
      content: [
        { text: 'Traveller 2300AD Character Sheet', style: 'header' },
        { text: `Name: ${char.name}${char.nickname ? ' "' + char.nickname + '"' : ''}`, style: 'subheader' },
        { text: `Player: ${char.playerName || 'N/A'}`, style: 'subheader' },
        { text: `Species: ${char.species}`, style: 'subheader' },
        { text: `Nationality: ${char.nationality}`, style: 'subheader' },
        { text: `Gender: ${char.gender}`, style: 'subheader' },
        { text: `Age: ${char.age}`, style: 'subheader' },
        { text: `Description: ${char.description || 'N/A'}`, margin: [0, 5, 0, 5] },
        { text: '\n' },
        
        { text: 'Characteristics', style: 'sectionHeader' },
        {
          table: {
            body: [
              ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'],
              [
                this.statStr(char.characteristics.str),
                this.statStr(char.characteristics.dex),
                this.statStr(char.characteristics.end),
                this.statStr(char.characteristics.int),
                this.statStr(char.characteristics.edu),
                this.statStr(char.characteristics.soc)
              ]
            ]
          }
        },
        
        { text: 'Skills', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
          ul: char.skills.map((s: any) => `${s.name} ${s.level}`)
        },
        
        { text: 'Equipment', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        {
            ul: char.equipment
        },
        
        { text: 'Career History', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        ...char.careerHistory.map((term: any) => ({
            text: `Term ${term.termNumber}: ${term.careerName} (Rank ${term.rank}) - ${term.events.join(', ')}`,
            margin: [0, 2, 0, 2]
        })),
        
        { text: 'Finances', style: 'sectionHeader', margin: [0, 10, 0, 5] },
        { text: `Cash: Lv ${char.finances.cash}` }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        sectionHeader: { fontSize: 12, bold: true, decoration: 'underline' }
      }
    };
    
    pdfMake.createPdf(docDefinition).open();
  }
  
  private statStr(stat: any) {
      return `${stat.value} / ${stat.modifier >= 0 ? '+' : ''}${stat.modifier}`;
  }
}
