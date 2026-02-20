import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenefitChoiceService } from '../../../core/services/benefit-choice.service';
import { BenefitChoice } from '../../../data/benefit-choices';

@Component({
    selector: 'app-benefit-choice-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './benefit-choice-dialog.component.html',
    styleUrls: ['./benefit-choice-dialog.component.scss']
})
export class BenefitChoiceDialogComponent {
    private benefitChoiceService = inject(BenefitChoiceService);

    isOpen = this.benefitChoiceService.isDialogOpen;
    title = this.benefitChoiceService.getDialogTitle;
    description = this.benefitChoiceService.getDialogDescription;
    choices = this.benefitChoiceService.getChoices;
    selectedChoice = this.benefitChoiceService.getSelectedChoice;

    onSelectChoice(choice: BenefitChoice) {
        this.benefitChoiceService.selectChoice(choice);
    }

    onConfirm() {
        this.benefitChoiceService.confirmChoice();
    }

    onCancel() {
        this.benefitChoiceService.cancelChoice();
    }
}
