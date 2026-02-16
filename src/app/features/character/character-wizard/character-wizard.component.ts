import { Component, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentityComponent } from '../steps/identity/identity.component';
import { SpeciesComponent } from '../steps/species/species.component';
import { AttributesComponent } from '../steps/attributes/attributes.component';
import { OriginComponent } from '../steps/origin/origin.component';
import { EducationComponent } from '../steps/education/education.component';
import { CareerComponent } from '../steps/career/career.component';
import { MusteringOutComponent } from '../steps/mustering-out/mustering-out.component';
import { NpcManagementComponent } from '../steps/npc-management/npc-management.component';
import { SkillPackageComponent } from '../steps/skill-package/skill-package.component';
import { CharacterSheetComponent } from '../components/character-sheet/character-sheet.component';
import { CharacterService } from '../../../core/services/character.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-character-wizard',
  standalone: true,
  imports: [
      CommonModule, 
      IdentityComponent,
      SpeciesComponent,
      AttributesComponent,
      OriginComponent,
      EducationComponent,
      CareerComponent,
      MusteringOutComponent,
      NpcManagementComponent,
      SkillPackageComponent,
      CharacterSheetComponent,
      ConfirmationDialogComponent
  ],
  templateUrl: './character-wizard.component.html',
  styleUrls: ['./character-wizard.component.scss']
})
export class CharacterWizardComponent {
    currentStep = 1;
    isResetting = false;
    showResetDialog = false;
    
    private characterService = inject(CharacterService);
    protected cdr = inject(ChangeDetectorRef);

    @ViewChild(IdentityComponent) identityStep?: IdentityComponent;
    @ViewChild(SpeciesComponent) speciesStep?: SpeciesComponent;
    @ViewChild(AttributesComponent) attributesStep?: AttributesComponent;
    @ViewChild(OriginComponent) originStep?: OriginComponent;
    @ViewChild(EducationComponent) educationStep?: EducationComponent;
    @ViewChild(CareerComponent) careerStep?: CareerComponent;
    @ViewChild(MusteringOutComponent) musteringStep?: MusteringOutComponent;
    @ViewChild(NpcManagementComponent) npcStep?: NpcManagementComponent;
    @ViewChild(SkillPackageComponent) skillPkgStep?: SkillPackageComponent;

    nextStep() {
        this.currentStep++;
        this.scrollToTop();
    }

    goToStep(step: number) {
        this.currentStep = step;
        this.scrollToTop();
    }

    private scrollToTop() {
        // Centralized reset for step transitions
        window.scrollTo(0, 0);
        const content = document.querySelector('.wizard-content');
        if (content) {
            content.scrollTop = 0;
        }
    }

    /** Label for the sticky footer action button */
    get actionLabel(): string {
        switch (this.currentStep) {
            case 1: return 'PROCEED > BIOMETRICS';
            case 2: return 'PROCEED > ORIGIN';
            case 3: return 'PROCEED > EDUCATION';
            case 4: return 'PROCEED > CAREER';
            case 5: return 'PROCEED > MUSTER_OUT';
            case 6: return 'PROCEED > NPC_MANAGEMENT';
            case 7: return 'PROCEED > SKILL_PACKAGE';
            case 8: return 'FINALIZE_CHARACTER';
            default: return 'PROCEED';
        }
    }

    /** Whether the sticky footer action button is enabled */
    get actionEnabled(): boolean {
        switch (this.currentStep) {
            case 1: return this.identityStep ? this.identityStep.isValid() : false;
            case 2: return !!this.attributesStep?.isComplete;
            case 3: return this.originStep ? this.originStep.canProceed() : false;
            case 4: return this.educationStep ? (this.educationStep.canProceedToNext() || this.educationStep.admissionStatus === 'Rejected') : false;
            case 5: return this.careerStep ? this.careerStep.canProceedToNext() : false;
            case 6: return this.musteringStep ? this.musteringStep.canProceedToNext() : false;
            case 7: return this.npcStep ? this.npcStep.isValid() : true;
            case 8: return !!this.skillPkgStep?.selectedPackage();
            default: return true;
        }
    }

    /** Show the footer on steps 1-8, hide on step 9 (character sheet) */
    get showActionBar(): boolean {
        return this.currentStep >= 1 && this.currentStep <= 9;
    }

    /** Handle action button click — triggers finish() on active step */
    onActionClick() {
        switch (this.currentStep) {
            case 1: this.identityStep?.finish(); break;
            case 2: this.speciesStep?.finish(); break;
            case 3: this.attributesStep?.finish(); break;
            case 4: this.originStep?.finish(); break;
            case 5: this.educationStep?.finishStep(); break;
            case 6: this.careerStep?.startMusteringOut(); break;
            case 7: this.musteringStep?.finish(); break;
            case 8: this.npcStep?.finish(); break; // NPC management finish
            case 9: this.skillPkgStep?.finish(); break;
        }
    }

    initiateReset() {
        this.showResetDialog = true;
    }

    cancelReset() {
        this.showResetDialog = false;
    }

    confirmReset() {
        this.showResetDialog = false;
        this.characterService.reset();
        this.isResetting = true;
        setTimeout(() => {
            this.currentStep = 1;
            this.isResetting = false;
            this.cdr.detectChanges();
        }, 100);
    }

    onCareerComplete() {
        this.currentStep = 7;
    }

    onMusteringOutComplete() {
        this.currentStep = 8;
    }

    onNpcManagementComplete() {
        this.currentStep = 9;
    }

    onSkillPackageComplete() {
        this.currentStep = 10;
    }
}
