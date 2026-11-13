import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AnnouncementEditorFacade, provideAnnouncementEditor } from '@blog/articles/data-access';
import { PostEditorComponent } from './post-editor.component';

describe('PostEditorComponent', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('uses the loaded article as the baseline for edit, undo and redo', async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnnouncementEditor(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const editor = TestBed.inject(AnnouncementEditorFacade);
    const load = jest.spyOn(editor, 'loadMyAnnouncementById');
    const existing = {
      id: 7, title: 'Original title', image: '', text: 'Original text',
      category: 'Test', duration: '5', button: 'Read', publishedAt: null,
    };
    fixture.detectChanges();
    expect(load).toHaveBeenCalledWith(7);
    const completion = load.mock.results[0].value as Promise<void>;
    TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement/7').flush(existing);
    // Angular stability does not guarantee completion of the facade's native promise chain.
    await expect(completion).resolves.toBeUndefined();
    fixture.detectChanges();

    expect(editor.error()).toBeNull();
    expect(editor.currentAnnouncement()).toEqual(existing);
    expect(component.title).toBe(existing.title);
    expect(component.currentValues()).toMatchObject(existing);
    expect(component.canUndo()).toBe(false);
    expect(component.canRedo()).toBe(false);

    component.title = 'Edited title';
    component.onFieldChange('title', component.title);
    expect(component.currentValues()?.title).toBe('Edited title');
    expect(component.canUndo()).toBe(true);

    component.undo();
    expect(component.title).toBe(existing.title);
    expect(component.text).toBe(existing.text);
    expect(component.currentValues()).toMatchObject(existing);
    expect(component.canUndo()).toBe(false);
    expect(component.canRedo()).toBe(true);

    component.redo();
    expect(component.title).toBe('Edited title');
    expect(component.currentValues()?.title).toBe('Edited title');
    expect(component.canUndo()).toBe(true);
    expect(component.canRedo()).toBe(false);
  });
});
