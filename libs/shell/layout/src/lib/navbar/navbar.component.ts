import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '@blog/auth/data-access';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule, NgbCollapseModule, NgbDropdownModule],
})
export class NavbarComponent {
  private readonly auth = inject(AuthFacade);

  isNavbarCollapsed = true;

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly username = this.auth.username;

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
      dropdown: [
        {
          title: 'Recent articles',
          fragment: '/recent-articles',
        },
        {
          title: 'Hardware',
          fragment: '/hardware',
        },
        {
          title: 'AI',
          fragment: '/ai',
        },
      ],
    },
    {
      title: 'About me',
      fragment: '/about-me',
    },
  ];

  logout(): void {
    this.auth.logout();
  }

  trackByFragment(index: number, item: { fragment: string }): string {
    return item.fragment;
  }
}
