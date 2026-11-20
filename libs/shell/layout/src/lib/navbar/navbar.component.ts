import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '@blog/auth/data-access';
import { UiPreferencesService, categorySlug, categoryTranslationKey } from '@blog/shared/util';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule, NgbCollapseModule, NgbDropdownModule, TranslocoModule],
})
export class NavbarComponent {
  readonly categories = input<readonly string[]>([]);
  private readonly auth = inject(AuthFacade);
  readonly preferences = inject(UiPreferencesService);

  isNavbarCollapsed = true;

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly username = this.auth.username;

  readonly links = computed(() => [
    {
      titleKey: 'nav.home',
      fragment: '/',
    },
    {
      titleKey: 'nav.projects',
      fragment: '/projects',
    },
    {
      titleKey: 'nav.wiki',
      fragment: '/wiki',
    },
    {
      titleKey: 'nav.articles',
      fragment: '/recent-articles',
      dropdown: [
        {
          titleKey: 'nav.recentArticles',
          fragment: '/recent-articles',
        },
        ...this.categories().map((category) => ({ titleKey: categoryTranslationKey(category) ?? '', label: category, fragment: '/recent-articles/' + categorySlug(category) })),
      ],
    },
    {
      titleKey: 'nav.about',
      fragment: '/about-me',
    },
  ]);

  logout(): void {
    this.auth.logout();
  }

  trackByFragment(index: number, item: { fragment: string }): string {
    return item.fragment;
  }
}
