import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { RecentArticlesComponent } from './modules/recent-articles/recent-articles.component';
import { CategoryPageComponent } from './modules/category-page/category-page.component';
import { CategoriesListComponent } from './modules/categories-list/categories-list.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { AboutMeComponent } from './modules/about-me/about-me.component';
import { LoginComponent } from './modules/login/login.component';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard.component';
import { PostEditorComponent } from './modules/admin/post-editor.component';
import { WikiComponent } from './modules/wiki/wiki.component';
import { BlogDetailComponent } from './modules/blog-detail/blog-detail.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Tech Blog',
    },
  },
  {
    path: 'blog/:slug',
    component: BlogDetailComponent,
    data: {
      title: 'Article - Tech Blog',
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
    path: 'projects/:id',
    component: WikiComponent,
    data: {
      title: 'Project Wiki - Tech Blog',
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
    path: 'categories',
    component: CategoriesListComponent,
    data: {
      title: 'Categories - Tech Blog',
    },
  },
  {
    path: 'category/:slug',
    component: CategoryPageComponent,
    data: {
      title: 'Category - Tech Blog',
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login - Tech Blog',
    },
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: {
      title: 'Admin - Tech Blog',
    },
  },
  {
    path: 'admin/new',
    component: PostEditorComponent,
    canActivate: [authGuard],
    data: {
      title: 'New Announcement - Tech Blog',
    },
  },
  {
    path: 'admin/edit/:id',
    component: PostEditorComponent,
    canActivate: [authGuard],
    data: {
      title: 'Edit Announcement - Tech Blog',
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
