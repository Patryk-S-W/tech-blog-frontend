import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { AnnouncementDto } from '@blog/articles/entity';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let latestFour: ReturnType<typeof signal<AnnouncementDto[]>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AnnouncementsFacade,
          useValue: {
            latestFour: (latestFour = signal<AnnouncementDto[]>([])),
            isLoading: signal(false),
            error: signal(null),
            loadPublishedAnnouncements: () => Promise.resolve(),
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

    const lead = fixture.nativeElement.querySelector('.featured-article');
    expect(lead.classList.contains('text-only')).toBe(true);
    expect(lead.querySelector('img')).toBeNull();
    expect(lead.textContent).toContain('Banana Pi BPI-R4 Pro');
    expect(lead.textContent).toContain('Published article content.');
    expect(latestFour()[0].text).toBe(body);
  });
});
