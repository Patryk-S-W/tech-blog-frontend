import { Injectable, Provider, inject } from '@angular/core';
import { UpdateAnnouncementRequest } from '@blog/articles/entity';
import { FormStore } from './store/form.store';

@Injectable()
export class AnnouncementEditorFacade {
  private readonly store = inject(FormStore);
  readonly currentValues = this.store.currentValues;
  readonly canUndo = this.store.canUndo;
  readonly canRedo = this.store.canRedo;
  readonly currentAnnouncement = this.store.currentAnnouncement;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  loadMyAnnouncementById(id: number): Promise<void> { return this.store.loadMyAnnouncementById(id); }
  initialize(values: UpdateAnnouncementRequest): void { this.store.initialize(values); }
  updateField(field: keyof UpdateAnnouncementRequest, value: string | number): void { this.store.updateField(field, value); }
  undo(): void { this.store.undo(); }
  redo(): void { this.store.redo(); }
  reset(): void { this.store.reset(); }
  clearError(): void { this.store.clearError(); }
}

export function provideAnnouncementEditor(): Provider[] {
  return [FormStore, AnnouncementEditorFacade];
}
