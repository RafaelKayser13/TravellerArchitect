import { Component, inject, signal } from '@angular/core';
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
import { WizardFlowService, WIZARD_STEPS } from '../../../core/services/wizard-flow.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

/**
 * CharacterWizardComponent is a thin shell that renders the active wizard step.
 *
 * All navigation state lives in WizardFlowService. Each step component registers
 * its own validator and finish-action via WizardFlowService.registerValidator /
 * registerFinishAction on init, and unregisters on destroy.
 *
 * The wizard shell simply calls:
 *   - wizardFlow.canProceed()  → drives the disabled state of the action button
 *   - wizardFlow.executeFinish() → called when the user clicks the footer button
 *
 * This eliminates all @ViewChild coupling between the wizard and its steps.
 */
@Component({
  selector: 'app-character-wizard',
  standalone: true,
  imports: [
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
    ConfirmationDialogComponent,
  ],
  templateUrl: './character-wizard.component.html',
  styleUrls: ['./character-wizard.component.scss'],
})
export class CharacterWizardComponent {
  readonly wizardFlow = inject(WizardFlowService);
  readonly steps = WIZARD_STEPS;

  /** Transient flag: hides step content during a reset animation frame */
  readonly isResetting = signal(false);
  readonly showResetDialog = signal(false);

  private readonly characterService = inject(CharacterService);

  // ------------------------------------------------------------------
  // Reset flow
  // ------------------------------------------------------------------

  initiateReset(): void {
    this.showResetDialog.set(true);
  }

  cancelReset(): void {
    this.showResetDialog.set(false);
  }

  confirmReset(): void {
    this.showResetDialog.set(false);
    this.characterService.reset();
    this.isResetting.set(true);
    // Single animation frame to tear down and re-mount step components cleanly
    requestAnimationFrame(() => {
      this.wizardFlow.resetToStart();
      this.isResetting.set(false);
    });
  }
}
