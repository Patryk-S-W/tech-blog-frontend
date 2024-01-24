import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
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
