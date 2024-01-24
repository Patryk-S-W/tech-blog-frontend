import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { AppRoutingModule } from './app-routing.module';

import { SharedModule } from './shared/shared.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './modules/home/home.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { HardwareComponent } from './modules/hardware/hardware.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { TestComponent } from './modules/test/test.component';
import { AIComponent } from './modules/ai/ai.component';
import { AboutMeComponent } from './modules/about-me/about-me.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RecentArticlesComponent,
    HardwareComponent,
    ProjectsComponent,
    TestComponent,
    AIComponent,
    AboutMeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoRootModule,
    AppRoutingModule,
    SharedModule,
    NgbCollapseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
