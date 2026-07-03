import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { HardwareComponent } from './modules/hardware/hardware.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { AboutMeComponent } from './modules/about-me/about-me.component';
import { AIComponent } from './modules/ai/ai.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Tech Blog',
    },
  },
  {
    path: 'about-me',
    component: AboutMeComponent,
    data: {
      title: 'About me - Tech Blog',
    },
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    data: {
      title: 'Projects - Tech Blog',
    },
  },
  {
    path: 'recent-articles',
    component: RecentArticlesComponent,
    data: {
      title: 'Recent articles - Tech Blog',
    },
  },
  {
    path: 'hardware',
    component: HardwareComponent,
    data: {
      title: 'Hardware - Tech Blog',
    },
  },
  {
    path: 'ai',
    component: AIComponent,
    data: {
      title: 'AI - Tech Blog',
    },
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
