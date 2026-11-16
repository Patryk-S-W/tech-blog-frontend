import { EnvironmentProviders, PLATFORM_ID, Provider, inject, provideAppInitializer } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { isPlatformServer } from '@angular/common';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from '@blog/auth/data-access';
import { API_URL, UiPreferencesService } from '@blog/shared/util';
import { environment } from '../environments/environment';

export function provideBlogApplication(): (Provider | EnvironmentProviders)[] {
  return [
    { provide: API_URL, useValue: environment.apiUrl },
    provideAppInitializer(() => inject(UiPreferencesService).initialize(inject(Router), inject(TranslocoService))),
    provideClientHydration(withHttpTransferCacheOptions({
      filter: (request) => !isPlatformServer(inject(PLATFORM_ID)) ||
        new URL(request.url, 'resolve://').origin !== inject(API_URL),
    })),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi()
    ),
  ];
}
