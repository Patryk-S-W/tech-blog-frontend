import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AnnouncementService } from '../../core/services/announcement.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class HomeComponent {
  private readonly service = inject(AnnouncementService);

  private readonly postsResource = rxResource({
    stream: () => this.service.getPublishedAnnouncements(),
  });

  readonly latestFour = computed(
    () => this.postsResource.value()?.slice(0, 4) ?? []
  );
  readonly isLoading = this.postsResource.isLoading;
  readonly error = computed(() => this.postsResource.error()?.message ?? null);

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
