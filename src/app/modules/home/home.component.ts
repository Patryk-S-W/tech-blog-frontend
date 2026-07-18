import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AnnouncementStore } from '../../core/store/announcement.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class HomeComponent implements OnInit {
  private readonly store = inject(AnnouncementStore);
  private readonly platformId = inject(PLATFORM_ID);

  readonly latestFour = this.store.latestFour;
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
