import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '@blog/auth/data-access';
import { UiPreferencesService } from '@blog/shared/util';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule, NgbCollapseModule, NgbDropdownModule, TranslocoModule],
})
export class NavbarComponent {
  private readonly auth = inject(AuthFacade);
  readonly preferences = inject(UiPreferencesService);

  isNavbarCollapsed = true;

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly username = this.auth.username;

  links = [
    {
      titleKey: 'nav.home',
      fragment: '/',
    },
    {
      titleKey: 'nav.projects',
      fragment: '/projects',
    },
    {
      titleKey: 'nav.articles',
      fragment: '/recent-articles',
      dropdown: [
        {
          titleKey: 'nav.recentArticles',
          fragment: '/recent-articles',
        },
        {
          titleKey: 'nav.hardware',
          fragment: '/hardware',
        },
        {
          titleKey: 'nav.ai',
          fragment: '/ai',
        },
      ],
    },
    {
      titleKey: 'nav.about',
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
