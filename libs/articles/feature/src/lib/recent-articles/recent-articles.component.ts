import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.component.html',
  styleUrls: ['./recent-articles.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class RecentArticlesComponent implements OnInit {
  private readonly announcementsFacade = inject(AnnouncementsFacade);
  private readonly platformId = inject(PLATFORM_ID);

  readonly articles = this.announcementsFacade.announcements;
  readonly isLoading = this.announcementsFacade.isLoading;
  readonly error = this.announcementsFacade.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.announcementsFacade.loadPublishedAnnouncements().catch(() => {});
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
