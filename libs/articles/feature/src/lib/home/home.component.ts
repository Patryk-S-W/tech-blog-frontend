import { Component, DestroyRef, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { UiPreferencesService } from '@blog/shared/util';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe, TranslocoModule],
})
export class HomeComponent implements OnInit {
  private readonly announcements = inject(AnnouncementsFacade);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly preferences = inject(UiPreferencesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly latestFour = this.announcements.latestFour;
  readonly isLoading = this.announcements.isLoading;
  readonly error = this.announcements.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const load = () => this.announcements.loadPublishedAnnouncements().catch(() => {});
      void load();
      this.preferences.languageChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { void load(); });
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
