import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './modules/home/home.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { HardwareComponent } from './modules/hardware/hardware.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { TestComponent } from './modules/test/test.component';
import { AIComponent } from './modules/ai/ai.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RecentArticlesComponent,
    HardwareComponent,
    ProjectsComponent,
    TestComponent,
    AIComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    NgbCollapseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
