import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: '',
  //   data: {
  //     title: 'Tech Blog',
  //   },
  // },
  // {
  //   path: 'projects',
  //   component: ProjectsComponent,
  //   data: {
  //     title: 'Projects - Tech Blog',
  //   },
  // },
  // {
  //   path: 'recent-articles',
  //   component: RecentArticlesComponent,
  //   data: {
  //     title: 'Recent articles - Tech Blog',
  //   },
  // },
  // {
  //   path: 'hardware',
  //   component: HardwareComponent,
  //   data: {
  //     title: 'Hardware - Tech Blog',
  //   },
  // },
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
