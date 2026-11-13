import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@blog/auth/data-access';
import { provideAnnouncementEditor } from '@blog/articles/data-access';

const routes: Routes = [
  { path: '', loadComponent: () => import('@blog/articles/feature').then((m) => m.HomeComponent), data: { title: 'Tech Blog' } },
  { path: 'about-me', loadComponent: () => import('@blog/shell/feature').then((m) => m.AboutMeComponent), data: { title: 'About me - Tech Blog' } },
  { path: 'projects', loadComponent: () => import('@blog/projects/feature').then((m) => m.ProjectsComponent), data: { title: 'Projects - Tech Blog' } },
  { path: 'projects/:id', loadComponent: () => import('@blog/projects/feature').then((m) => m.WikiComponent), data: { title: 'Project Wiki - Tech Blog' } },
  { path: 'recent-articles', loadComponent: () => import('@blog/articles/feature').then((m) => m.RecentArticlesComponent), data: { title: 'Recent articles - Tech Blog' } },
  { path: 'blog/:id', loadComponent: () => import('@blog/articles/feature').then((m) => m.ArticleDetailComponent), data: { title: 'Article - Tech Blog' } },
  { path: 'hardware', loadComponent: () => import('@blog/shell/feature').then((m) => m.HardwareComponent), data: { title: 'Hardware - Tech Blog' } },
  { path: 'ai', loadComponent: () => import('@blog/shell/feature').then((m) => m.AIComponent), data: { title: 'AI - Tech Blog' } },
  { path: 'login', loadComponent: () => import('@blog/auth/feature').then((m) => m.LoginComponent), data: { title: 'Login - Tech Blog' } },
  { path: 'admin', loadComponent: () => import('@blog/articles/feature').then((m) => m.AdminDashboardComponent), data: { title: 'Admin - Tech Blog' }, canActivate: [authGuard] },
  { path: 'admin/new', loadComponent: () => import('@blog/articles/feature').then((m) => m.PostEditorComponent), data: { title: 'New Announcement - Tech Blog' }, canActivate: [authGuard], providers: [provideAnnouncementEditor()] },
  { path: 'admin/edit/:id', loadComponent: () => import('@blog/articles/feature').then((m) => m.PostEditorComponent), data: { title: 'Edit Announcement - Tech Blog' }, canActivate: [authGuard], providers: [provideAnnouncementEditor()] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
