import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { AboutMeComponent } from './modules/about-me/about-me.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CategoriesListComponent } from './modules/categories-list/categories-list.component';
import { CategoryPageComponent } from './modules/category-page/category-page.component';
import { HomeComponent } from './modules/home/home.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectsComponent } from './modules/projects/projects.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SharedModule } from './shared/shared.module';
import { TestComponent } from './modules/test/test.component';
import { TranslocoRootModule } from './transloco-root.module';
import { LoginComponent } from './modules/login/login.component';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard.component';
import { PostEditorComponent } from './modules/admin/post-editor.component';
import { WikiComponent } from './modules/wiki/wiki.component';
import { BlogDetailComponent } from './modules/blog-detail/blog-detail.component';

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
    CategoriesListComponent,
    CategoryPageComponent,
    ProjectsComponent,
    TestComponent,
    AboutMeComponent,
    LoginComponent,
    AdminDashboardComponent,
    PostEditorComponent,
    WikiComponent,
    BlogDetailComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi()
    ),
  ],
})
export class AppModule {}
