import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentArticlesComponent } from './recent-articles.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AnnouncementsFacade } from '@blog/articles/data-access';

describe('RecentArticlesComponent', () => {
  let component: RecentArticlesComponent;
  let fixture: ComponentFixture<RecentArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentArticlesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AnnouncementsFacade,
          useValue: {
            announcements: signal([]),
            isLoading: signal(false),
            error: signal(null),
            loadPublishedAnnouncements: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
