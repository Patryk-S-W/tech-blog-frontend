import { Injectable, inject } from '@angular/core';
import { CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@blog/articles/entity';
import { AnnouncementStore } from './store/announcement.store';

@Injectable({ providedIn: 'root' })
export class AnnouncementsFacade {
  private readonly store = inject(AnnouncementStore);
  readonly announcements = this.store.announcements;
  readonly ownerAnnouncements = this.store.ownerAnnouncements;
  readonly currentAnnouncement = this.store.currentAnnouncement;
  readonly latestFour = this.store.latestFour;
  readonly announcementCount = this.store.announcementCount;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  loadPublishedAnnouncements(): Promise<void> { return this.store.loadPublishedAnnouncements(); }
  loadPublishedById(id: number): Promise<void> { return this.store.loadPublishedById(id); }
  loadMyAnnouncements(): Promise<void> { return this.store.loadMyAnnouncements(); }
  createAnnouncement(request: CreateAnnouncementRequest): Promise<void> { return this.store.createAnnouncement(request); }
  updateAnnouncement(request: UpdateAnnouncementRequest): Promise<void> { return this.store.updateAnnouncement(request); }
  deleteAnnouncement(id: number): Promise<void> { return this.store.deleteAnnouncement(id); }
  clearCurrentAnnouncement(): void { this.store.clearCurrentAnnouncement(); }
  clearError(): void { this.store.clearError(); }
}
