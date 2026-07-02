import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@tech-blog/feature-home').then((m) => m.HomeComponent),
    data: {
      title: 'Tech Blog',
    },
  },
  {
    path: 'about-me',
    loadComponent: () =>
      import('@tech-blog/feature-about-me').then((m) => m.AboutMeComponent),
    data: {
      title: 'About me - Tech Blog',
    },
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('@tech-blog/feature-projects').then((m) => m.ProjectsComponent),
    data: {
      title: 'Projects - Tech Blog',
    },
  },
  {
    path: 'recent-articles',
    loadComponent: () =>
      import('@tech-blog/feature-recent-articles').then(
        (m) => m.RecentArticlesComponent
      ),
    data: {
      title: 'Recent articles - Tech Blog',
    },
  },
  {
    path: 'hardware',
    loadComponent: () =>
      import('@tech-blog/feature-hardware').then((m) => m.HardwareComponent),
    data: {
      title: 'Hardware - Tech Blog',
    },
  },
  {
    path: 'ai',
    loadComponent: () =>
      import('@tech-blog/feature-ai').then((m) => m.AIComponent),
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
