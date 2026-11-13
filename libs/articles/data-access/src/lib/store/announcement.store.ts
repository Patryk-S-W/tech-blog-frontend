import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AnnouncementDto, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@blog/articles/entity';
import { withCallState } from '@blog/shared/util';
import { AnnouncementService } from '../services/announcement.service';

export const AnnouncementStore = signalStore(
  { providedIn: 'root' },
  withState({ announcements: [] as AnnouncementDto[], currentAnnouncement: null as AnnouncementDto | null, ownerAnnouncements: [] as AnnouncementDto[] }),
  withCallState(),
  withComputed((store) => ({ latestFour: computed(() => store.announcements().slice(0, 4)), announcementCount: computed(() => store.announcements().length) })),
  withMethods((store, service = inject(AnnouncementService)) => ({
    async loadPublishedAnnouncements(): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.getPublishedAnnouncements());
        patchState(store, { announcements: result });
        store.finishCall();
      } catch {
        store.failCall('Failed to load announcements');
        throw new Error('Failed to load announcements');
      }
    },
    async loadPublishedById(id: number): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.getPublishedAnnouncementById(id));
        patchState(store, { currentAnnouncement: result });
        store.finishCall();
      } catch {
        store.failCall('Failed to load announcement');
        throw new Error('Failed to load announcement');
      }
    },
    async loadMyAnnouncements(): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.getMyAnnouncements());
        patchState(store, { ownerAnnouncements: result });
        store.finishCall();
      } catch {
        store.failCall('Failed to load announcements');
        throw new Error('Failed to load announcements');
      }
    },
    async createAnnouncement(request: CreateAnnouncementRequest): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.createAnnouncement(request));
        patchState(store, { ownerAnnouncements: [...store.ownerAnnouncements(), result] });
        store.finishCall();
      } catch {
        store.failCall('Failed to create announcement');
        throw new Error('Failed to create announcement');
      }
    },
    async updateAnnouncement(request: UpdateAnnouncementRequest): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.updateAnnouncement(request));
        patchState(store, { ownerAnnouncements: store.ownerAnnouncements().map((item) => item.id === result.id ? result : item) });
        store.finishCall();
      } catch {
        store.failCall('Failed to update announcement');
        throw new Error('Failed to update announcement');
      }
    },
    async deleteAnnouncement(id: number): Promise<void> {
      store.startCall();
      try {
        await firstValueFrom(service.deleteAnnouncement(id));
        patchState(store, { ownerAnnouncements: store.ownerAnnouncements().filter((item) => item.id !== id) });
        store.finishCall();
      } catch {
        store.failCall('Failed to delete announcement');
        throw new Error('Failed to delete announcement');
      }
    },
    clearCurrentAnnouncement(): void { patchState(store, { currentAnnouncement: null }); },
  }))
);
