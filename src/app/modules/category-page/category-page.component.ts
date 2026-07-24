import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AnnouncementService } from '../../core/services/announcement.service';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  imports: [RouterLink, DatePipe],
})
export class CategoryPageComponent implements OnInit {
  private readonly service = inject(AnnouncementService);
  private readonly route = inject(ActivatedRoute);

  private readonly category = signal<string | undefined>(undefined);

  private readonly postsResource = rxResource({
    params: () => this.category(),
    stream: ({ params }) => this.service.getPublishedByCategory(params),
  });

  readonly articles = this.postsResource.value;
  readonly isLoading = this.postsResource.isLoading;
  readonly error = computed(() => this.postsResource.error()?.message ?? null);
  readonly categoryName = this.category;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.category.set(slug);
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
