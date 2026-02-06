import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

import { App } from './app/app';
import { routes } from './app/app.routes';
import { FormlyFieldFile } from './app/components/dynamic-form/formly-field-file.type';
import { FormlyFieldTable } from './app/components/dynamic-form/formly-field-table.type';
import { FormlyFieldRepeat } from './app/components/dynamic-form/formly-field-repeat.type';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(
      FormlyBootstrapModule,
      FormlyModule.forRoot({
        types: [
          { name: 'file', component: FormlyFieldFile },
          { name: 'table', component: FormlyFieldTable },
          { name: 'repeat', component: FormlyFieldRepeat }
        ]
      })
    )
  ]
}).catch((err: Error) => console.error(err));
