import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule, NgbCollapseModule, NgbDropdownModule],
})
export class NavbarComponent {
  isNavbarCollapsed = true;

  links = [
    {
      title: 'Home',
      fragment: '',
    },
    {
      title: 'Projects',
      fragment: 'projects',
    },
    {
      title: 'Articles',
      fragment: 'artcles',
      dropdown: [
        {
          title: 'Recent articles',
          fragment: 'recent-articles',
        },
        {
          title: 'Hardware',
          fragment: 'hardware',
        },
        {
          title: 'AI',
          fragment: 'ai',
        },
      ],
    },
    {
      title: 'About me',
      fragment: 'about-me',
    },
  ];

  constructor() {}

  trackByFragment(index: number, item: Item): string {
    return item.fragment;
  }
}
interface Item {
  title: string;
  fragment: string;
}
