import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../../core/services/character.service';
import { SKILL_PACKAGES, SkillPackage } from '../../../../data/skill-packages';
import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-skill-package',
  standalone: true,
  imports: [CommonModule, StepHeaderComponent],
  templateUrl: './skill-package.component.html',
  styleUrls: ['./skill-package.component.scss']
})
export class SkillPackageComponent {
  private characterService = inject(CharacterService);
  
  packages = SKILL_PACKAGES;
  selectedPackage = signal<SkillPackage | null>(null);
  selectedSkills = signal<string[]>([]);

  @Output() complete = new EventEmitter<void>();

  selectPackage(pkg: SkillPackage) {
    this.selectedPackage.set(pkg);
    this.selectedSkills.set([]); // Reset selection when package changes
  }

  toggleSkill(skill: string) {
    const current = this.selectedSkills();
    if (current.includes(skill)) {
        this.selectedSkills.set(current.filter(s => s !== skill));
    } else if (current.length < 4) {
        this.selectedSkills.set([...current, skill]);
    }
  }

  finish() {
    const pkg = this.selectedPackage();
    const skillsToApply = this.selectedSkills();
    if (!pkg || skillsToApply.length === 0) return;

    this.characterService.log(`## Skill Package Selected: ${pkg.name}`);
    this.characterService.log(`Applied solo bonuses: ${skillsToApply.join(', ')}`);
    
    skillsToApply.forEach(skillAward => {
        // Award is usually "Skill (Specialization) 1"
        const parts = skillAward.split(' ');
        const levelText = parts[parts.length - 1];
        let level = parseInt(levelText);
        let skillName = parts.join(' ');
        
        if (isNaN(level)) {
            level = 1;
        } else {
            parts.pop();
            skillName = parts.join(' ');
        }
        
        this.characterService.ensureSkillLevel(skillName, level);
    });

    this.characterService.finalizeCharacter();
    this.complete.emit();
  }
}
