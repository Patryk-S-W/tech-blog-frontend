import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '@tech-blog/feature-home';
import { RecentArticlesComponent } from '@tech-blog/feature-recent-articles';
import { HardwareComponent } from '@tech-blog/feature-hardware';
import { ProjectsComponent } from '@tech-blog/feature-projects';
import { AboutMeComponent } from '@tech-blog/feature-about-me';
import { AIComponent } from '@tech-blog/feature-ai';

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
