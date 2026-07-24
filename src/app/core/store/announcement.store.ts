import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AnnouncementService } from '../services/announcement.service';
import {
  AnnouncementDto,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../models/announcement.model';

interface AnnouncementState {
  announcements: AnnouncementDto[];
}

const initialState: AnnouncementState = {
  announcements: [],
};

export const AnnouncementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    latestFour: computed(() => store.announcements().slice(0, 4)),
    announcementCount: computed(() => store.announcements().length),
  })),
  withMethods((store, service = inject(AnnouncementService)) => ({
    async createAnnouncement(
      request: CreateAnnouncementRequest
    ): Promise<AnnouncementDto> {
      const item = await firstValueFrom(service.createAnnouncement(request));
      patchState(store, { announcements: [...store.announcements(), item] });
      return item;
    },

    async updateAnnouncement(
      request: UpdateAnnouncementRequest
    ): Promise<AnnouncementDto> {
      const item = await firstValueFrom(service.updateAnnouncement(request));
      patchState(store, {
        announcements: store
          .announcements()
          .map((a) => (a.id === item.id ? item : a)),
      });
      return item;
    },

    async deleteAnnouncement(id: number): Promise<void> {
      await firstValueFrom(service.deleteAnnouncement(id));
      patchState(store, {
        announcements: store.announcements().filter((a) => a.id !== id),
      });
    },

    clearAnnouncements(): void {
      patchState(store, { announcements: [] });
    },
  }))
);
