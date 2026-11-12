import { EnvironmentProviders, PLATFORM_ID, Provider, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from '@blog/auth/data-access';
import { API_URL } from '@blog/shared/util';
import { environment } from '../environments/environment';

export function provideBlogApplication(): (Provider | EnvironmentProviders)[] {
  return [
    { provide: API_URL, useValue: environment.apiUrl },
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
