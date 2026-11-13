import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { withCallState } from '@blog/shared/util';
import { AnnouncementService } from '../services/announcement.service';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AnnouncementDto, UpdateAnnouncementRequest } from '@blog/articles/entity';

interface FormState {
  values: UpdateAnnouncementRequest | null;
  history: UpdateAnnouncementRequest[];
  historyIndex: number;
}

const initialFormState: FormState = {
  values: null,
  history: [],
  historyIndex: -1,
};

export const FormStore = signalStore(
  withState(initialFormState),
  withState({ currentAnnouncement: null as AnnouncementDto | null }),
  withCallState(),
  withComputed((store) => ({
    canUndo: computed(() => store.historyIndex() > 0),
    canRedo: computed(() => store.historyIndex() < store.history().length - 1),
    currentValues: computed(() => {
      const idx = store.historyIndex();
      return idx >= 0 ? store.history()[idx] : store.values();
    }),
  })),
  withMethods((store, service = inject(AnnouncementService)) => ({
    async loadMyAnnouncementById(id: number): Promise<void> {
      store.startCall();
      patchState(store, { currentAnnouncement: null });
      try {
        const item = await firstValueFrom(service.getMyAnnouncementById(id));
        patchState(store, { currentAnnouncement: item });
        store.finishCall();
      } catch {
        store.failCall('Failed to load announcement');
        throw new Error('Failed to load announcement');
      }
    },
    initialize(values: UpdateAnnouncementRequest): void {
      patchState(store, {
        values,
        history: [values],
        historyIndex: 0,
      });
    },

    updateField(
      field: keyof UpdateAnnouncementRequest,
      value: string | number
    ): void {
      const current = store.history()[store.historyIndex()];
      if (!current) return;

      const updated = { ...current, [field]: value };
      const newHistory = store.history().slice(0, store.historyIndex() + 1);
      newHistory.push(updated);

      patchState(store, {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    undo(): void {
      const idx = store.historyIndex();
      if (idx > 0) {
        patchState(store, { historyIndex: idx - 1 });
      }
    },

    redo(): void {
      const idx = store.historyIndex();
      if (idx < store.history().length - 1) {
        patchState(store, { historyIndex: idx + 1 });
      }
    },

    reset(): void {
      patchState(store, { ...initialFormState, currentAnnouncement: null, error: null });
    },
  }))
);
