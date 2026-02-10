import { Routes } from '@angular/router';
import { CharacterWizardComponent } from './features/character/character-wizard/character-wizard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'wizard', pathMatch: 'full' },
    { path: 'wizard', component: CharacterWizardComponent }
];
