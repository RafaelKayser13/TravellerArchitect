import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CareerService } from './core/services/career.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (careerService: CareerService) => () => careerService.loadAllCareers(),
      deps: [CareerService],
      multi: true
    }
  ]
};
