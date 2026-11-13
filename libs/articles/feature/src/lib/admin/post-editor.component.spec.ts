import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router, RouterLink, UrlTree } from '@angular/router';
import { AnnouncementEditorFacade, provideAnnouncementEditor } from '@blog/articles/data-access';
import { PostEditorComponent } from './post-editor.component';

describe('PostEditorComponent', () => {
  const initialValues = {
    id: 7, title: 'Original title', image: '', text: 'Original text',
    category: 'Test', duration: '5', button: 'Read',
  };
  const existing = { ...initialValues, publishedAt: null };

  beforeEach(async () => {
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
  });

  afterEach(() => {
    try {
      TestBed.inject(HttpTestingController).verify();
    } finally {
      jest.restoreAllMocks();
    }
  });

  it('waits for existing content before allowing edits or save, then tracks history against baseline', async () => {
    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const editor = TestBed.inject(AnnouncementEditorFacade);
    const load = jest.spyOn(editor, 'loadMyAnnouncementById');
    fixture.detectChanges();

    expect(load).toHaveBeenCalledWith(7);
    expect(component.isLoading()).toBe(true);
    expect(component.canSave()).toBe(false);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    const completion = load.mock.results[0].value as Promise<void>;
    TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement/7').flush(existing);
    await completion;
    fixture.detectChanges();

    expect(component.isDirty()).toBe(false);
    expect(component.title).toBe(existing.title);
    expect(component.currentValues()).toEqual(initialValues);
    expect(component.canUndo()).toBe(false);
    expect(component.canRedo()).toBe(false);

    const editable = [
      ['title', 'Changed title'],
      ['image', 'cover.jpg'],
      ['text', 'Changed body'],
      ['category', 'Other'],
      ['duration', '8'],
      ['button', 'Open'],
    ] as const;
    for (const [field, value] of editable) {
      component.onFieldChange(field, value);
      expect(component.isDirty()).toBe(true);
      component.undo();
      expect(component.isDirty()).toBe(false);
      component.redo();
      expect(component.isDirty()).toBe(true);
      component.undo();
    }
    expect(component.currentValues()).toEqual(initialValues);
  });

  it('retains form and history on failed save, blocks duplicate writes and does not navigate', async () => {
    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const load = jest.spyOn(TestBed.inject(AnnouncementEditorFacade), 'loadMyAnnouncementById');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const completion = load.mock.results[0].value as Promise<void>;
    http.expectOne('/api/v1/announcement/7').flush(existing);
    await completion;
    fixture.detectChanges();

    component.title = 'Unsaved title';
    component.onFieldChange('title', component.title);
    const saving = component.onSubmit();
    expect(component.isLoading()).toBe(true);
    await component.onSubmit();
    const request = http.expectOne('/api/v1/announcement');
    expect(request.request.method).toBe('PUT');
    request.flush({ message: 'private backend detail' }, { status: 500, statusText: 'Server Error' });
    await saving;
    fixture.detectChanges();

    expect(component.title).toBe('Unsaved title');
    expect(component.currentValues()?.title).toBe('Unsaved title');
    expect(component.isDirty()).toBe(true);
    expect(component.canUndo()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Failed to update announcement');
  });

  it('marks a successful save clean before navigating', async () => {
    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigate = jest.spyOn(router, 'navigate').mockImplementation(async () => {
      expect(component.isDirty()).toBe(false);
      expect(component.canDeactivate()).toBe(true);
      return true;
    });
    const load = jest.spyOn(TestBed.inject(AnnouncementEditorFacade), 'loadMyAnnouncementById');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const completion = load.mock.results[0].value as Promise<void>;
    http.expectOne('/api/v1/announcement/7').flush(existing);
    await completion;
    fixture.detectChanges();

    component.title = 'Saved title';
    component.onFieldChange('title', component.title);
    const saving = component.onSubmit();
    expect(component.canDeactivate()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    http.expectOne('/api/v1/announcement').flush({ ...existing, title: 'Saved title' });
    await saving;

    expect(component.isDirty()).toBe(false);
    expect(component.canDeactivate()).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('activates the Cancel link through RouterLink', async () => {
    const fixture = TestBed.createComponent(PostEditorComponent);
    const router = TestBed.inject(Router);
    const navigate = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const load = jest.spyOn(TestBed.inject(AnnouncementEditorFacade), 'loadMyAnnouncementById');
    fixture.detectChanges();
    const completion = load.mock.results[0].value as Promise<void>;
    TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement/7').flush(existing);
    await completion;
    fixture.detectChanges();

    const cancel = fixture.debugElement.query(By.directive(RouterLink));
    expect(cancel).not.toBeNull();
    cancel.nativeElement.click();
    expect(navigate).toHaveBeenCalled();
    expect(router.serializeUrl(navigate.mock.calls[0][0] as UrlTree)).toBe('/admin');
  });

  it('keeps a failed new post dirty and allows navigation only after a successful retry', async () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap({}) } },
    });
    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(async () => {
      expect(component.isDirty()).toBe(false);
      expect(component.canDeactivate()).toBe(true);
      return true;
    });
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    component.title = 'New post';
    component.text = 'New content';
    component.onFieldChange('title', component.title);
    component.onFieldChange('text', component.text);

    const failedSave = component.onSubmit();
    expect(component.canDeactivate()).toBe(false);
    await component.onSubmit();
    const failure = http.expectOne('/api/v1/announcement');
    expect(failure.request.method).toBe('POST');
    failure.flush({}, { status: 500, statusText: 'Server Error' });
    await failedSave;
    fixture.detectChanges();
    expect(component.isDirty()).toBe(true);
    expect(component.currentValues()).toMatchObject({ title: 'New post', text: 'New content' });
    expect(component.canUndo()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();

    const retry = component.onSubmit();
    expect(component.canDeactivate()).toBe(false);
    await component.onSubmit();
    const success = http.expectOne('/api/v1/announcement');
    expect(success.request.method).toBe('POST');
    success.flush({ ...existing, id: 8, title: 'New post', text: 'New content' });
    await retry;
    expect(component.isDirty()).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('offers stay or leave when dirty and blocks navigation while saving', async () => {
    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const load = jest.spyOn(TestBed.inject(AnnouncementEditorFacade), 'loadMyAnnouncementById');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const completion = load.mock.results[0].value as Promise<void>;
    http.expectOne('/api/v1/announcement/7').flush(existing);
    await completion;
    fixture.detectChanges();

    component.title = 'Unsaved';
    component.onFieldChange('title', component.title);
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    expect(component.canDeactivate()).toBe(false);
    confirm.mockReturnValue(true);
    expect(component.canDeactivate()).toBe(true);

    const saving = component.onSubmit();
    expect(component.canDeactivate()).toBe(false);
    http.expectOne('/api/v1/announcement').flush({ ...existing, title: 'Unsaved' });
    await saving;
  });

  it('prompts before unloading only while dirty', async () => {
    const fixture = TestBed.createComponent(PostEditorComponent);
    const component = fixture.componentInstance;
    const load = jest.spyOn(TestBed.inject(AnnouncementEditorFacade), 'loadMyAnnouncementById');
    fixture.detectChanges();
    const completion = load.mock.results[0].value as Promise<void>;
    TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement/7').flush(existing);
    await completion;
    fixture.detectChanges();

    const cleanEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
    component.title = 'Unsaved';
    component.onFieldChange('title', component.title);
    const dirtyEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
  });

  it('does not access browser confirmation APIs during SSR', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PostEditorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnnouncementEditor(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
      ],
    }).compileComponents();

    const confirm = jest.spyOn(window, 'confirm');
    const fixture = TestBed.createComponent(PostEditorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.canDeactivate()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });
});
