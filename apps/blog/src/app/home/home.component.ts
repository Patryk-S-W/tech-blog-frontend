import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementsFacade, categorySlug, categoryTranslationKey } from '@blog/articles/data-access';
import { ProjectsFacade } from '@blog/projects/data-access';
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
  readonly categorySlug = categorySlug;
  readonly categoryTranslationKey = categoryTranslationKey;
  private readonly announcements = inject(AnnouncementsFacade);
  private readonly projectFacade = inject(ProjectsFacade);
  private readonly preferences = inject(UiPreferencesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly latestFour = this.announcements.latestFour;
  readonly isLoading = this.announcements.isLoading;
  readonly error = this.announcements.error;
  readonly projects = this.projectFacade.projects;

  ngOnInit(): void {
    const load = () => this.announcements.loadPublishedAnnouncements().catch(() => {});
    void load();
    void this.projectFacade.loadProjects().catch(() => {});
    this.preferences.languageChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { void load(); });
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
