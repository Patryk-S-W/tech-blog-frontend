import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthStore } from '../../../core/store/auth.store';
import { AnnouncementService } from '../../../core/services/announcement.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule, NgbCollapseModule, NgbDropdownModule],
})
export class NavbarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly service = inject(AnnouncementService);

  isNavbarCollapsed = true;

  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly username = this.authStore.username;

  private readonly categoriesResource = rxResource({
    stream: () => this.service.getCategories(),
  });

  readonly categories = this.categoriesResource.value;

  links = [
    {
      title: 'Home',
      fragment: '/',
    },
    {
      title: 'Projects',
      fragment: '/projects',
    },
    {
      title: 'Articles',
      fragment: '/recent-articles',
    },
    {
      title: 'Categories',
      fragment: '/categories',
      dropdown: true,
    },
    {
      title: 'About me',
      fragment: '/about-me',
    },
  ];

  logout(): void {
    this.authStore.logout();
  }

  trackByFragment(index: number, item: { fragment: string }): string {
    return item.fragment;
  }

  trackByCategory(index: number, item: string): string {
    return item;
  }
}
