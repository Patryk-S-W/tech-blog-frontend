import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnnouncementDto } from '@blog/articles/entity';
import { AnnouncementsFacade } from './announcements.facade';
import { AnnouncementEditorFacade, provideAnnouncementEditor } from './announcement-editor.facade';

describe('announcement publication', () => {
  const draft: AnnouncementDto = {
    id: 7, title: 'Saved title', image: '', text: 'Saved text', category: 'Test', duration: '5', button: 'Read',
    isPublished: false, publishedAt: null,
  };
  const firstPublication = '2026-11-11T12:00:00Z';
  const published: AnnouncementDto = { ...draft, isPublished: true, publishedAt: firstPublication };
  const failures = [
    ['publish', 400], ['publish', 404], ['publish', 409],
    ['unpublish', 400], ['unpublish', 404], ['unpublish', 409],
  ] as const;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideAnnouncementEditor()],
  }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it.each(['publish', 'unpublish'] as const)('updates only owner state from the completed %s response', async (action) => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const before = action === 'publish' ? draft : published;
    const other = { ...draft, id: 8 };
    const owned = facade.loadMyAnnouncements();
    http.expectOne('/api/v1/announcement').flush([before, other]);
    await owned;
    const publicItem = { ...published, id: 20 };
    const home = facade.loadPublishedAnnouncements();
    http.expectOne('/api/v1/blog/announcements').flush({ items: [publicItem] });
    await home;
    const detail = facade.loadPublicArticleById(20);
    http.expectOne('/api/v1/blog/announcements/20').flush(publicItem);
    await detail;
    const page = { items: [publicItem], totalCount: 1, page: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };
    const archive = facade.loadArchive(1);
    http.expectOne('/api/v1/blog/announcements?page=1&pageSize=10').flush(page);
    await archive;

    const method = action === 'publish' ? 'publishAnnouncement' : 'unpublishAnnouncement';
    const completed = jest.fn();
    const pending = facade[method](7).then(completed);
    expect(facade.isLoading()).toBe(true);
    expect(facade.ownerAnnouncements()).toEqual([before, other]);
    expect(completed).not.toHaveBeenCalled();
    const response: AnnouncementDto = {
      ...before, title: 'Server canonical title', isPublished: action === 'publish', publishedAt: firstPublication,
    };
    const request = http.expectOne(`/api/v1/announcement/7/${action}`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush(response);
    await pending;
    expect(completed).toHaveBeenCalledTimes(1);
    expect(facade.ownerAnnouncements()).toEqual([response, other]);
    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.announcements()).toEqual([publicItem]);
    expect(facade.publicArticle()).toEqual(publicItem);
    expect(facade.archivePage()).toEqual(page);
    expect(facade.currentAnnouncement()).toBeNull();
  });

  it.each(failures)('keeps owner state unchanged when %s fails with %s', async (action, status) => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const before = action === 'publish' ? draft : published;
    const owned = facade.loadMyAnnouncements();
    http.expectOne('/api/v1/announcement').flush([before]);
    await owned;
    const method = action === 'publish' ? 'publishAnnouncement' : 'unpublishAnnouncement';
    const pending = facade[method](7);
    const message = `Failed to ${action} announcement`;
    const rejected = expect(pending).rejects.toMatchObject({ message, cause: expect.objectContaining({ status }) });
    expect(facade.ownerAnnouncements()).toEqual([before]);
    http.expectOne(`/api/v1/announcement/7/${action}`)
      .flush({ message: 'untrusted server detail' }, { status, statusText: 'Rejected' });
    await rejected;
    expect(facade.ownerAnnouncements()).toEqual([before]);
    expect(facade.error()).toBe(message);
    expect(facade.isLoading()).toBe(false);
  });

  it.each(['publish', 'unpublish'] as const)('updates editor publication via %s without replacing content history or the baseline', async (action) => {
    const editor = TestBed.inject(AnnouncementEditorFacade);
    const http = TestBed.inject(HttpTestingController);
    const before = action === 'publish' ? { ...draft, publishedAt: firstPublication } : published;
    const load = editor.loadMyAnnouncementById(7);
    http.expectOne('/api/v1/announcement/7').flush(before);
    await load;
    editor.initialize(before);
    editor.updateField('title', 'Unsaved title');
    const history = editor.currentValues();
    const method = action === 'publish' ? 'publishAnnouncement' : 'unpublishAnnouncement';
    const completed = jest.fn();
    const pending = editor[method](7).then(completed);
    expect(editor.currentAnnouncement()).toEqual(before);
    expect(editor.isLoading()).toBe(true);
    expect(completed).not.toHaveBeenCalled();
    const response: AnnouncementDto = { ...before, isPublished: action === 'publish', publishedAt: firstPublication };
    http.expectOne(`/api/v1/announcement/7/${action}`).flush(response);
    await pending;
    expect(editor.currentAnnouncement()).toEqual(response);
    expect(editor.currentAnnouncement()?.publishedAt).toBe(firstPublication);
    expect(editor.currentValues()).toEqual(history);
    expect(editor.canUndo()).toBe(true);
    expect(editor.canRedo()).toBe(false);
    expect(editor.isLoading()).toBe(false);
    expect(completed).toHaveBeenCalledTimes(1);
    editor.undo();
    expect(editor.currentValues()).toEqual(before);
    editor.redo();
    expect(editor.currentValues()?.title).toBe('Unsaved title');
    expect(editor.currentAnnouncement()).toEqual(response);
    expect(TestBed.inject(AnnouncementsFacade).ownerAnnouncements()).toEqual([]);
  });

  it.each(failures)('preserves editor detail and undo history when %s fails with %s', async (action, status) => {
    const editor = TestBed.inject(AnnouncementEditorFacade);
    const http = TestBed.inject(HttpTestingController);
    const before = action === 'publish' ? draft : published;
    const load = editor.loadMyAnnouncementById(7);
    http.expectOne('/api/v1/announcement/7').flush(before);
    await load;
    editor.initialize(before);
    editor.updateField('text', 'Unsaved content');
    const history = editor.currentValues();
    const method = action === 'publish' ? 'publishAnnouncement' : 'unpublishAnnouncement';
    const pending = editor[method](7);
    const message = `Failed to ${action} announcement`;
    const rejected = expect(pending).rejects.toMatchObject({ message, cause: expect.objectContaining({ status }) });
    http.expectOne(`/api/v1/announcement/7/${action}`)
      .flush({ message: 'untrusted server detail' }, { status, statusText: 'Rejected' });
    await rejected;
    expect(editor.currentAnnouncement()).toEqual(before);
    expect(editor.currentValues()).toEqual(history);
    expect(editor.error()).toBe(message);
    expect(editor.isLoading()).toBe(false);
    editor.undo();
    expect(editor.currentValues()).toEqual(before);
    editor.redo();
    expect(editor.currentValues()?.text).toBe('Unsaved content');
  });
});
