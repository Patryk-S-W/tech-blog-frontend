import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AnnouncementService } from '../services/announcement.service';
import { UpdateAnnouncementRequest } from '../models/announcement.model';

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
  { providedIn: 'root' },
  withState(initialFormState),
  withComputed((store) => ({
    canUndo: computed(() => store.historyIndex() > 0),
    canRedo: computed(() => store.historyIndex() < store.history().length - 1),
    currentValues: computed(() => {
      const idx = store.historyIndex();
      return idx >= 0 ? store.history()[idx] : store.values();
    }),
  })),
  withMethods((store) => ({
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
      patchState(store, initialFormState);
    },
  }))
);
