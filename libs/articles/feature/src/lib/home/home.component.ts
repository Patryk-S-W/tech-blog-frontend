import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class HomeComponent implements OnInit {
  private readonly announcements = inject(AnnouncementsFacade);
  private readonly platformId = inject(PLATFORM_ID);

  readonly latestFour = this.announcements.latestFour;
  readonly isLoading = this.announcements.isLoading;
  readonly error = this.announcements.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.announcements.loadPublishedAnnouncements().catch(() => {});
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
