import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AnnouncementService } from '../services/announcement.service';
import {
  AnnouncementDto,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../models/announcement.model';

interface AnnouncementState {
  announcements: AnnouncementDto[];
  currentAnnouncement: AnnouncementDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  currentAnnouncement: null,
  isLoading: false,
  error: null,
};

export const AnnouncementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    latestFour: computed(() => store.announcements().slice(0, 4)),
    announcementCount: computed(() => store.announcements().length),
  })),
  withMethods((store, service = inject(AnnouncementService)) => ({
    loadPublishedAnnouncements(): void {
      patchState(store, { isLoading: true, error: null });
      service.getPublishedAnnouncements().subscribe({
        next: (items) =>
          patchState(store, { announcements: items, isLoading: false }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to load announcements',
          }),
      });
    },

    loadPublishedById(id: number): void {
      patchState(store, { isLoading: true, error: null });
      service.getPublishedAnnouncementById(id).subscribe({
        next: (item) =>
          patchState(store, {
            currentAnnouncement: item,
            isLoading: false,
          }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to load announcement',
          }),
      });
    },

    loadMyAnnouncements(): void {
      patchState(store, { isLoading: true, error: null });
      service.getMyAnnouncements().subscribe({
        next: (items) =>
          patchState(store, { announcements: items, isLoading: false }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to load announcements',
          }),
      });
    },

    createAnnouncement(request: CreateAnnouncementRequest): void {
      patchState(store, { isLoading: true, error: null });
      service.createAnnouncement(request).subscribe({
        next: (item) =>
          patchState(store, {
            announcements: [...store.announcements(), item],
            isLoading: false,
          }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to create announcement',
          }),
      });
    },

    updateAnnouncement(request: UpdateAnnouncementRequest): void {
      patchState(store, { isLoading: true, error: null });
      service.updateAnnouncement(request).subscribe({
        next: (item) =>
          patchState(store, {
            announcements: store
              .announcements()
              .map((a) => (a.id === item.id ? item : a)),
            currentAnnouncement: item,
            isLoading: false,
          }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to update announcement',
          }),
      });
    },

    deleteAnnouncement(id: number): void {
      patchState(store, { isLoading: true, error: null });
      service.deleteAnnouncement(id).subscribe({
        next: () =>
          patchState(store, {
            announcements: store.announcements().filter((a) => a.id !== id),
            isLoading: false,
          }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to delete announcement',
          }),
      });
    },

    clearCurrentAnnouncement(): void {
      patchState(store, { currentAnnouncement: null });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
