import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(
      FormlyBootstrapModule,
      FormlyModule.forRoot()
    )
  ]
}).catch(err => console.error(err));
