import { Routes } from '@angular/router';
import { CharacterWizardComponent } from './features/character/character-wizard/character-wizard.component';
import { EquipmentSectionComponent } from './features/shared/equipment-section/equipment-section.component';
export const routes: Routes = [
    { path: '', redirectTo: 'dossier', pathMatch: 'full' },
    { path: 'dossier', component: CharacterWizardComponent },
    { path: 'equipment', component: EquipmentSectionComponent, data: { mode: 'equipment' } },
    { path: 'vehicles', component: EquipmentSectionComponent, data: { mode: 'vehicles' } },
    { path: 'vessels', component: EquipmentSectionComponent, data: { mode: 'vessels' } }
];
