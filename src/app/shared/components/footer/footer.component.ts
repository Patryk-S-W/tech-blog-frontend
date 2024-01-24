import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  icons = [
    {
      id: 0,
      icon: 'fa-linkedin-in',
      link: 'https://www.linkedin.com/in/patryksadowski/',
    },
    { id: 1, icon: 'fa-github', link: 'https://github.com/Patryk-S-W' },
  ];
  trackById(index: number, item: Item): number {
    return item.id;
  }
}
interface Item {
  id: number;
  icon: string;
  link: string;
}
