import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { AIComponent } from './modules/ai/ai.component';
import { AboutMeComponent } from './modules/about-me/about-me.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HardwareComponent } from './modules/hardware/hardware.component';
import { HomeComponent } from './modules/home/home.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectsComponent } from './modules/projects/projects.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SharedModule } from './shared/shared.module';
import { TestComponent } from './modules/test/test.component';
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
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi()
    ),
  ],
})
export class AppModule {}
