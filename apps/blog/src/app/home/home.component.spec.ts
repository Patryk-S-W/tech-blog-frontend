import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { ProjectsFacade } from '@blog/projects/data-access';
import { AnnouncementDto } from '@blog/articles/entity';
import { INITIAL_UI_LANGUAGE, LANGUAGE_STORAGE_KEY, UiPreferencesService } from '@blog/shared/util';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let latestFour: ReturnType<typeof signal<AnnouncementDto[]>>;
  let loadPublished: jest.Mock;

  beforeEach(async () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    loadPublished = jest.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [HomeComponent, TranslocoTestingModule.forRoot({
        langs: { pl: {}, en: {} },
        translocoConfig: { availableLangs: ['pl', 'en'], defaultLang: 'en' }, preloadLangs: true,
      })],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: INITIAL_UI_LANGUAGE, useValue: 'pl' },
        { provide: ProjectsFacade, useValue: { projects: signal([{ id: 42, title: 'API project', shortDescription: 'Stored project description' }]), loadProjects: jest.fn().mockResolvedValue(undefined) } },
        {
          provide: AnnouncementsFacade,
          useValue: {
            latestFour: (latestFour = signal<AnnouncementDto[]>([])),
            isLoading: signal(false),
            error: signal(null),
            loadPublishedAnnouncements: loadPublished,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('refetches on language changes without remounting and unsubscribes on destruction', () => {
    const preferences = TestBed.inject(UiPreferencesService);
    expect(loadPublished).toHaveBeenCalledTimes(1);
    preferences.setLanguage('en');
    expect(loadPublished).toHaveBeenCalledTimes(2);
    preferences.setLanguage('en');
    expect(loadPublished).toHaveBeenCalledTimes(2);
    preferences.setLanguage('pl');
    expect(loadPublished).toHaveBeenCalledTimes(3);
    fixture.destroy();
    preferences.setLanguage('en');
    expect(loadPublished).toHaveBeenCalledTimes(3);
  });

  it('renders the published text-only article without an empty image slot', () => {
    const body = 'Published article content. '.repeat(80);
    latestFour.set([
      {
        id: 1,
        title: 'Banana Pi BPI-R4 Pro',
        image: '',
        text: body,
        category: 'Hardware',
        duration: '5 min',
        button: 'Read article',
        isPublished: true,
        publishedAt: '2026-11-14T00:00:00Z',
      },
    ]);
    fixture.detectChanges();

    const lead = fixture.nativeElement.querySelector('.article-card');
    expect(lead.classList.contains('text-only')).toBe(true);
    expect(lead.querySelector('img')).toBeNull();
    expect(lead.textContent).toContain('Banana Pi BPI-R4 Pro');
    expect(lead.textContent).toContain('Published article content.');
    expect(latestFour()[0].text).toBe(body);
  });

  it('loads and renders projects supplied by the project API facade', () => {
    expect(TestBed.inject(ProjectsFacade).loadProjects).toHaveBeenCalledTimes(1);
    const project = fixture.nativeElement.querySelector('.sample-project');
    expect(project.textContent).toContain('API project');
    expect(project.querySelector('a').getAttribute('href')).toBe('/projects/42');
  });
});
