import {
  Translation,
  TranslocoLoader,
  TranslocoModule,
  provideTransloco,
} from '@ngneat/transloco';
import { Injectable, NgModule } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of } from 'rxjs';
import pl from '../assets/i18n/pl.json';
import en from '../assets/i18n/en.json';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    return of(lang === 'en' ? en : pl);
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: ['pl', 'en'],
        defaultLang: 'pl',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
  ],
})
export class TranslocoRootModule {}
