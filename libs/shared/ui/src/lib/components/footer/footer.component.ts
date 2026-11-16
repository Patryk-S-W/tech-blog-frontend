import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [RouterLink, TranslocoModule],
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
