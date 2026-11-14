import { Injectable, inject } from '@angular/core';
import { CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@blog/articles/entity';
import { AnnouncementStore } from './store/announcement.store';

@Injectable({ providedIn: 'root' })
export class AnnouncementsFacade {
  private readonly store = inject(AnnouncementStore);
  readonly announcements = this.store.announcements;
  readonly ownerAnnouncements = this.store.ownerAnnouncements;
  readonly currentAnnouncement = this.store.currentAnnouncement;
  readonly publicArticle = this.store.publicArticle;
  readonly publicArticleStatus = this.store.publicArticleStatus;
  readonly publicArticleError = this.store.publicArticleError;
  readonly archivePage = this.store.archivePage;
  readonly archiveIsLoading = this.store.archiveIsLoading;
  readonly archiveError = this.store.archiveError;
  readonly categories = this.store.categories;
  readonly categoriesError = this.store.categoriesError;
  readonly latestFour = this.store.latestFour;
  readonly announcementCount = this.store.announcementCount;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  loadPublishedAnnouncements(): Promise<void> { return this.store.loadPublishedAnnouncements(); }
  loadPublishedById(id: number): Promise<void> { return this.store.loadPublishedById(id); }
  loadPublicArticleById(id: number): Promise<void> { return this.store.loadPublicArticleById(id); }
  loadArchive(page: number, category?: string): Promise<void> { return this.store.loadArchive(page, category); }
  loadCategories(): Promise<void> { return this.store.loadCategories(); }
  loadMyAnnouncements(): Promise<void> { return this.store.loadMyAnnouncements(); }
  createAnnouncement(request: CreateAnnouncementRequest): Promise<void> { return this.store.createAnnouncement(request); }
  updateAnnouncement(request: UpdateAnnouncementRequest): Promise<void> { return this.store.updateAnnouncement(request); }
  deleteAnnouncement(id: number): Promise<void> { return this.store.deleteAnnouncement(id); }
  publishAnnouncement(id: number): Promise<void> { return this.store.publishAnnouncement(id); }
  unpublishAnnouncement(id: number): Promise<void> { return this.store.unpublishAnnouncement(id); }
  clearCurrentAnnouncement(): void { this.store.clearCurrentAnnouncement(); }
  clearError(): void { this.store.clearError(); }
}
