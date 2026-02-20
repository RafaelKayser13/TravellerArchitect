import { Injectable, signal } from '@angular/core';
import { BenefitChoice, WEAPON_CHOICES, ARMOR_CHOICES, VEHICLE_CHOICES, filterChoices } from '../../data/benefit-choices';
import { Equipment, EquipmentCategory } from '../models/equipment.model';

@Injectable({
    providedIn: 'root'
})
export class BenefitChoiceService {
    private showDialog = signal(false);
    private dialogTitle = signal('');
    private dialogDescription = signal('');
    private choices = signal<BenefitChoice[]>([]);
    private selectedChoice = signal<BenefitChoice | null>(null);
    private resolvePromise: ((choice: BenefitChoice | null) => void) | null = null;

    // Equipment selection signals
    private showEquipmentDialog = signal(false);
    private equipmentDialogTitle = signal('');
    private equipmentDialogDescription = signal('');
    private equipmentSelectionResolve: ((equipment: Equipment | null) => void) | null = null;

    constructor() { }

    /**
     * Show dialog for weapon selection
     */
    async selectWeapon(careerName: string): Promise<BenefitChoice | null> {
        return this.showChoiceDialog(
            'WEAPON SELECTION',
            'Choose the type of weapon you receive as a benefit:',
            filterChoices(WEAPON_CHOICES, careerName)
        );
    }

    /**
     * Show dialog for armor selection
     */
    async selectArmor(careerName: string): Promise<BenefitChoice | null> {
        return this.showChoiceDialog(
            'ARMOR SELECTION',
            'Choose the type of armor you receive as a benefit:',
            filterChoices(ARMOR_CHOICES, careerName)
        );
    }

    /**
     * Show dialog for vehicle selection
     */
    async selectVehicle(careerName: string): Promise<BenefitChoice | null> {
        return this.showChoiceDialog(
            'VEHICLE SELECTION',
            'Choose the vehicle you receive as a benefit:',
            filterChoices(VEHICLE_CHOICES, careerName)
        );
    }

    /**
     * Equipment selection - single category
     */
    async selectEquipment(
        title: string,
        category: EquipmentCategory | EquipmentCategory[],
        description?: string
    ): Promise<Equipment | null> {
        return new Promise((resolve) => {
            this.equipmentDialogTitle.set(title);
            this.equipmentDialogDescription.set(description || 'Select an item:');
            this.showEquipmentDialog.set(true);
            this.equipmentSelectionResolve = resolve;
        });
    }

    /**
     * Confirm equipment selection
     */
    confirmEquipmentSelection(equipment: Equipment | null) {
        this.showEquipmentDialog.set(false);
        if (this.equipmentSelectionResolve) {
            this.equipmentSelectionResolve(equipment);
            this.equipmentSelectionResolve = null;
        }
    }

    /**
     * Cancel equipment selection
     */
    cancelEquipmentSelection() {
        this.showEquipmentDialog.set(false);
        if (this.equipmentSelectionResolve) {
            this.equipmentSelectionResolve(null);
            this.equipmentSelectionResolve = null;
        }
    }

    /**
     * Generic choice dialog
     */
    private async showChoiceDialog(title: string, description: string, availableChoices: BenefitChoice[]): Promise<BenefitChoice | null> {
        return new Promise((resolve) => {
            this.dialogTitle.set(title);
            this.dialogDescription.set(description);
            this.choices.set(availableChoices);
            this.selectedChoice.set(null);
            this.showDialog.set(true);
            this.resolvePromise = resolve;
        });
    }

    /**
     * Select a choice and close dialog
     */
    selectChoice(choice: BenefitChoice) {
        this.selectedChoice.set(choice);
        this.confirmChoice();
    }

    /**
     * Confirm and close dialog
     */
    confirmChoice() {
        const selected = this.selectedChoice();
        this.showDialog.set(false);
        if (this.resolvePromise) {
            this.resolvePromise(selected);
            this.resolvePromise = null;
        }
    }

    /**
     * Cancel and close dialog
     */
    cancelChoice() {
        this.showDialog.set(false);
        if (this.resolvePromise) {
            this.resolvePromise(null);
            this.resolvePromise = null;
        }
    }

    // Signals for template binding
    isDialogOpen = this.showDialog.asReadonly();
    getDialogTitle = this.dialogTitle.asReadonly();
    getDialogDescription = this.dialogDescription.asReadonly();
    getChoices = this.choices.asReadonly();
    getSelectedChoice = this.selectedChoice.asReadonly();

    // Equipment selection signals
    isEquipmentDialogOpen = this.showEquipmentDialog.asReadonly();
    getEquipmentDialogTitle = this.equipmentDialogTitle.asReadonly();
    getEquipmentDialogDescription = this.equipmentDialogDescription.asReadonly();
}
