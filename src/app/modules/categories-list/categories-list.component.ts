import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnnouncementService } from '../../core/services/announcement.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  imports: [RouterLink],
})
export class CategoriesListComponent {
  private readonly service = inject(AnnouncementService);

  private readonly categoriesResource = rxResource({
    stream: () => this.service.getCategories(),
  });

  readonly categories = this.categoriesResource.value;
  readonly isLoading = this.categoriesResource.isLoading;
  readonly error = computed(
    () => this.categoriesResource.error()?.message ?? null
  );
}
