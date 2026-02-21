import { Routes } from '@angular/router';
import { CharacterWizardComponent } from './features/character/character-wizard/character-wizard.component';
import { EquipmentSectionComponent } from './features/shared/equipment-section/equipment-section.component';
import { VehiclesSectionComponent } from './features/shared/vehicles-section/vehicles-section.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dossier', pathMatch: 'full' },
    { path: 'dossier', component: CharacterWizardComponent },
    { path: 'equipment', component: EquipmentSectionComponent },
    { path: 'vehicles', component: VehiclesSectionComponent }
];
