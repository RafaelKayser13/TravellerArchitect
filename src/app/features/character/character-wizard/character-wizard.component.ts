import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributesComponent } from '../steps/attributes/attributes.component';
import { OriginComponent } from '../steps/origin/origin.component';
import { EducationComponent } from '../steps/education/education.component';
import { CareerComponent } from '../steps/career/career.component';
import { MusteringOutComponent } from '../steps/mustering-out/mustering-out.component';
import { CharacterSheetComponent } from '../components/character-sheet/character-sheet.component';
import { CharacterService } from '../../../core/services/character.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-character-wizard',
  standalone: true,
  imports: [
      CommonModule, 
      AttributesComponent, 
      OriginComponent, 
      EducationComponent, 
      CareerComponent, 
      MusteringOutComponent, 
      CharacterSheetComponent,
      ConfirmationDialogComponent // New
  ],
  templateUrl: './character-wizard.component.html',
  styleUrls: ['./character-wizard.component.scss']
})
export class CharacterWizardComponent {
    currentStep = 1;
    isResetting = false; // Flag for reset visual state
    showResetDialog = false; // Dialog state
    
    // Inject service
    private characterService = inject(CharacterService);
    private cdr = inject(ChangeDetectorRef);

    nextStep() {
        this.currentStep++;
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    goToStep(step: number) {
        this.currentStep = step;
    }

    initiateReset() {
        this.showResetDialog = true;
    }

    cancelReset() {
        this.showResetDialog = false;
    }

    confirmReset() {
        this.showResetDialog = false;
        
        // 1. Clear Data
        this.characterService.reset();
        
        // 2. Trigger UI Refresh
        // We toggle isResetting to True, then False to forcing *ngIf recreation
        this.isResetting = true;
        
        // We need a slight delay to allow Angular to process the destruction
        setTimeout(() => {
            this.currentStep = 1;
            this.isResetting = false;
            this.cdr.detectChanges(); // Force update
        }, 100);
    }
    onCareerComplete() {
        this.currentStep = 5;
    }

    onMusteringOutComplete() {
        this.currentStep = 6;
    }
}
