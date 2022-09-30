import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { HardwareComponent } from './modules/hardware/hardware.component';
import { ProjectsComponent } from './modules/projects/projects.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Tech Blog',
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
