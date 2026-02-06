import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormlyFieldFile } from './components/dynamic-form/formly-field-file.type';
import { FormlyFieldTable } from './components/dynamic-form/formly-field-table.type';
import { FormlyFieldRepeat } from './components/dynamic-form/formly-field-repeat.type';
import { FormlyFieldAddToTable } from './components/dynamic-form/formly-field-add-to-table.type';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      FormlyBootstrapModule,
      FormlyModule.forRoot({
        types: [
          { name: 'file', component: FormlyFieldFile },
          { name: 'table', component: FormlyFieldTable },
          { name: 'repeat', component: FormlyFieldRepeat },
          { name: 'add-to-table', component: FormlyFieldAddToTable }
        ]
      })
    )
  ]
};
