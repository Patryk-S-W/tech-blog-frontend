import { Component, inject } from '@angular/core';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { FooterComponent } from '@blog/shared/ui';
import { NavbarComponent } from '@blog/shell/layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
})
export class AppComponent {
  private readonly articles = inject(AnnouncementsFacade);
  readonly categories = this.articles.categories;

  constructor() {
    void this.articles.loadCategories().catch(() => {});
  }
}
