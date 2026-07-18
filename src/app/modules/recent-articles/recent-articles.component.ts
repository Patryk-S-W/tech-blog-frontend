import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AnnouncementStore } from '../../core/store/announcement.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.component.html',
  styleUrls: ['./recent-articles.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class RecentArticlesComponent implements OnInit {
  private readonly store = inject(AnnouncementStore);
  private readonly platformId = inject(PLATFORM_ID);

  readonly articles = this.store.announcements;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.loadPublishedAnnouncements();
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
