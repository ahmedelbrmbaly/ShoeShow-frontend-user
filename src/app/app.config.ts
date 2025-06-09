import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import {ApiLoggingInterceptor} from './core/interceptors/api-logging.interceptor';
import {groqApiInterceptor} from './core/interceptors/groq-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiLoggingInterceptor, multi: true },
    provideRouter(
      routes,
      withViewTransitions()
    ),
    provideAnimations(), // Required for Material animations
    provideHttpClient(
      withInterceptors([groqApiInterceptor, authInterceptor])
    ),
    MatNativeDateModule, // Required for Material Datepicker
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000 }
    }
  ]
};
