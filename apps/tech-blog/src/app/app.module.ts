import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AIComponent } from '@tech-blog/feature-ai';
import { AboutMeComponent } from '@tech-blog/feature-about-me';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HardwareComponent } from '@tech-blog/feature-hardware';
import { HomeComponent } from '@tech-blog/feature-home';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectsComponent } from '@tech-blog/feature-projects';
import { RecentArticlesComponent } from '@tech-blog/feature-recent-articles';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SharedModule } from '@tech-blog/shared-ui';
import { TestComponent } from '@tech-blog/feature-test';
import { TranslocoRootModule } from './transloco-root.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslocoRootModule,
    AppRoutingModule,
    SharedModule,
    NgbCollapseModule,
    AppComponent,
    HomeComponent,
    RecentArticlesComponent,
    HardwareComponent,
    ProjectsComponent,
    TestComponent,
    AIComponent,
    AboutMeComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
