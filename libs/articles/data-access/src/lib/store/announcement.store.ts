import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AnnouncementDto, CreateAnnouncementRequest, PagedResult, UpdateAnnouncementRequest } from '@blog/articles/entity';
import { UiPreferencesService, withCallState } from '@blog/shared/util';
import { AnnouncementService } from '../services/announcement.service';

type PublicArticleStatus = 'idle' | 'loading' | 'loaded' | 'not-found' | 'error';

export const AnnouncementStore = signalStore(
  { providedIn: 'root' },
  withState({ announcements: [] as AnnouncementDto[], currentAnnouncement: null as AnnouncementDto | null, ownerAnnouncements: [] as AnnouncementDto[] }),
  withState({
    publicArticle: null as AnnouncementDto | null,
    publicArticleStatus: 'idle' as PublicArticleStatus,
    publicArticleError: null as string | null,
  }),
  withCallState(),
  withState({
    archivePage: null as PagedResult<AnnouncementDto> | null,
    archiveIsLoading: false,
    archiveError: null as string | null,
    categories: [] as string[],
    categoriesError: null as string | null,
  }),
  withComputed((store) => ({ latestFour: computed(() => store.announcements().slice(0, 4)), announcementCount: computed(() => store.announcements().length) })),
  withMethods((store, service = inject(AnnouncementService), preferences = inject(UiPreferencesService)) => {
    let homeRequestId = 0;
    let publicRequestId = 0;
    let archiveRequestId = 0;
    let categoriesRequestId = 0;
    preferences.languageChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      ++homeRequestId;
      ++publicRequestId;
      ++archiveRequestId;
      patchState(store, {
        announcements: [], publicArticle: null, publicArticleStatus: 'idle', publicArticleError: null,
        archivePage: null, archiveIsLoading: false, archiveError: null,
      });
    });
    return {
    async loadArchive(page: number, category?: string): Promise<void> {
      const requestId = ++archiveRequestId;
      const language = preferences.language();
      patchState(store, { archivePage: null, archiveIsLoading: true, archiveError: null });
      try {
        const result = await firstValueFrom(service.getPublishedAnnouncementsPage(page, category, language));
        if (requestId !== archiveRequestId || language !== preferences.language()) return;
        patchState(store, { archivePage: result, archiveIsLoading: false });
      } catch (error) {
        if (requestId !== archiveRequestId || language !== preferences.language()) return;
        const message = 'Failed to load article archive';
        patchState(store, { archiveIsLoading: false, archiveError: message });
        throw new Error(message, { cause: error });
      }
    },
    async loadCategories(): Promise<void> {
      const requestId = ++categoriesRequestId;
      patchState(store, { categoriesError: null });
      try {
        const categories = await firstValueFrom(service.getCategories());
        if (requestId !== categoriesRequestId) return;
        patchState(store, { categories });
      } catch (error) {
        if (requestId !== categoriesRequestId) return;
        const message = 'Failed to load article categories';
        patchState(store, { categoriesError: message });
        throw new Error(message, { cause: error });
      }
    },
    async loadPublicArticleById(id: number): Promise<void> {
      const requestId = ++publicRequestId;
      const language = preferences.language();
      patchState(store, { publicArticle: null, publicArticleStatus: 'loading', publicArticleError: null });
      try {
        const article = await firstValueFrom(service.getPublishedAnnouncementById(id, language));
        if (requestId !== publicRequestId || language !== preferences.language()) return;
        patchState(store, { publicArticle: article, publicArticleStatus: 'loaded' });
      } catch (error) {
        if (requestId !== publicRequestId || language !== preferences.language()) return;
        if (error instanceof HttpErrorResponse && error.status === 404) {
          patchState(store, { publicArticleStatus: 'not-found' });
          return;
        }
        const message = 'Failed to load article';
        patchState(store, { publicArticleStatus: 'error', publicArticleError: message });
        throw new Error(message, { cause: error });
      }
    },
    async loadPublishedAnnouncements(): Promise<void> {
      const requestId = ++homeRequestId;
      const language = preferences.language();
      patchState(store, { announcements: [] });
      store.startCall();
      try {
        const result = await firstValueFrom(service.getPublishedAnnouncements(undefined, language));
        if (requestId !== homeRequestId || language !== preferences.language()) return;
        patchState(store, { announcements: result });
        store.finishCall();
      } catch {
        if (requestId !== homeRequestId || language !== preferences.language()) return;
        store.failCall('Failed to load announcements');
        throw new Error('Failed to load announcements');
      }
    },
    async loadPublishedById(id: number): Promise<void> {
      const language = preferences.language();
      store.startCall();
      try {
        const result = await firstValueFrom(service.getPublishedAnnouncementById(id, language));
        if (language !== preferences.language()) return;
        patchState(store, { currentAnnouncement: result });
        store.finishCall();
      } catch {
        if (language !== preferences.language()) return;
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
    async publishAnnouncement(id: number): Promise<void> {
      store.startCall();
      try {
        const item = await firstValueFrom(service.publishAnnouncement(id));
        patchState(store, { ownerAnnouncements: store.ownerAnnouncements().map((entry) => entry.id === item.id ? item : entry) });
        store.finishCall();
      } catch (error) {
        const message = 'Failed to publish announcement';
        store.failCall(message);
        throw new Error(message, { cause: error });
      }
    },
    async unpublishAnnouncement(id: number): Promise<void> {
      store.startCall();
      try {
        const item = await firstValueFrom(service.unpublishAnnouncement(id));
        patchState(store, { ownerAnnouncements: store.ownerAnnouncements().map((entry) => entry.id === item.id ? item : entry) });
        store.finishCall();
      } catch (error) {
        const message = 'Failed to unpublish announcement';
        store.failCall(message);
        throw new Error(message, { cause: error });
      }
    },
    };
  })
);
