import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnnouncementsFacade } from './announcements.facade';
import { AnnouncementEditorFacade, provideAnnouncementEditor } from './announcement-editor.facade';

describe('announcement facades', () => {
  const item = { id: 1, title: 'Test', image: '', text: 'Body', category: 'Test', duration: '5', button: 'Read', publishedAt: null };
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('resolves only after HTTP completion and separates owner and public collections', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const published = facade.loadPublishedAnnouncements();
    expect(facade.isLoading()).toBe(true);
    expect(facade.announcements()).toEqual([]);
    http.expectOne('/api/v1/blog/announcements').flush({ items: [item] });
    await published;
    expect(facade.isLoading()).toBe(false);
    const owned = facade.loadMyAnnouncements();
    http.expectOne('/api/v1/announcement').flush([{ ...item, id: 2 }]);
    await owned;
    expect(facade.announcements()).toEqual([item]);
    expect(facade.ownerAnnouncements().map((entry) => entry.id)).toEqual([2]);
  });

  it('rejects failed operations with a safe operation-specific error', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const pending = facade.deleteAnnouncement(1);
    const rejected = expect(pending).rejects.toThrow('Failed to delete announcement');
    TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement/1')
      .flush({ message: 'private upstream detail' }, { status: 500, statusText: 'Server Error' });
    await rejected;
    expect(facade.error()).toBe('Failed to delete announcement');
    expect(facade.isLoading()).toBe(false);
    facade.clearError();
    expect(facade.error()).toBeNull();
  });

  it('scopes editor history and owner detail independently from public state', async () => {
    const parent = TestBed.inject(EnvironmentInjector);
    const first = createEnvironmentInjector([provideAnnouncementEditor()], parent);
    const second = createEnvironmentInjector([provideAnnouncementEditor()], parent);
    try {
      const editor = first.get(AnnouncementEditorFacade);
      const other = second.get(AnnouncementEditorFacade);
      editor.initialize(item);
      editor.updateField('title', 'Changed');
      expect(editor.canUndo()).toBe(true);
      expect(other.currentValues()).toBeNull();
      editor.undo();
      expect(editor.currentValues()?.title).toBe('Test');
      const detail = editor.loadMyAnnouncementById(1);
      TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement/1').flush(item);
      await detail;
      expect(editor.currentAnnouncement()).toEqual(item);
      expect(other.currentAnnouncement()).toBeNull();
      expect(TestBed.inject(AnnouncementsFacade).currentAnnouncement()).toBeNull();
    } finally {
      first.destroy();
      second.destroy();
    }
  });
});
