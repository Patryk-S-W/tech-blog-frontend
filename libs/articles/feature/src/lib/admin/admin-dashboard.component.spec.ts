import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AnnouncementDto } from '@blog/articles/entity';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent publication controls', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let ownerAnnouncements: ReturnType<typeof signal<AnnouncementDto[]>>;
  let facade: {
    ownerAnnouncements: ReturnType<typeof signal<AnnouncementDto[]>>;
    announcements: ReturnType<typeof signal<AnnouncementDto[]>>;
    isLoading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    clearError: jest.Mock;
    loadMyAnnouncements: jest.Mock<Promise<void>, []>;
    publishAnnouncement: jest.Mock<Promise<void>, [number]>;
    unpublishAnnouncement: jest.Mock<Promise<void>, [number]>;
    deleteAnnouncement: jest.Mock<Promise<void>, [number]>;
  };

  const draft: AnnouncementDto = {
    id: 1, title: 'Owner draft', image: '', text: 'Body', category: 'Tech',
    duration: '', button: '', isPublished: false, publishedAt: null,
  };
  const publicOnly: AnnouncementDto = {
    ...draft, id: 2, title: 'Public article', isPublished: true,
  };

  beforeEach(async () => {
    ownerAnnouncements = signal([draft]);
    facade = {
      ownerAnnouncements,
      announcements: signal([publicOnly]),
      isLoading: signal(false),
      error: signal<string | null>(null),
      clearError: jest.fn(),
      loadMyAnnouncements: jest.fn().mockResolvedValue(undefined),
      publishAnnouncement: jest.fn(),
      unpublishAnnouncement: jest.fn(),
      deleteAnnouncement: jest.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [provideRouter([]), { provide: AnnouncementsFacade, useValue: facade }],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
  });

  it('uses owner articles and changes publication only after the server operation completes', async () => {
    let complete!: () => void;
    facade.publishAnnouncement.mockImplementation(() => new Promise<void>((resolve) => {
      complete = () => {
        ownerAnnouncements.set([{ ...draft, isPublished: true }]);
        resolve();
      };
    }));
    expect(fixture.nativeElement.textContent).toContain('Owner draft');
    expect(fixture.nativeElement.textContent).not.toContain('Public article');
    const publish = fixture.nativeElement.querySelector('button[aria-label="Publish Owner draft"]');
    expect(publish).not.toBeNull();

    const operation = fixture.componentInstance.setPublished(draft.id, true);
    fixture.detectChanges();
    expect(facade.publishAnnouncement).toHaveBeenCalledWith(draft.id);
    expect(fixture.nativeElement.textContent).toContain('Draft');
    expect(publish.disabled).toBe(true);
    expect(fixture.componentInstance.publicationPending()).toBe(true);
    complete();
    await operation;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Published');
    expect(fixture.nativeElement.querySelector('button[aria-label="Unpublish Owner draft"]')).not.toBeNull();
    expect(fixture.componentInstance.publicationPending()).toBe(false);
  });

  it('keeps status unchanged and surfaces transition failures', async () => {
    facade.publishAnnouncement.mockImplementation(async () => {
      (facade.error as ReturnType<typeof signal<string | null>>).set('Publication failed');
      throw new Error('conflict');
    });
    await fixture.componentInstance.setPublished(draft.id, true);
    fixture.detectChanges();

    expect(ownerAnnouncements()).toEqual([draft]);
    expect(fixture.nativeElement.textContent).toContain('Draft');
    expect(fixture.nativeElement.textContent).toContain('Publication failed');
  });

  it('offers unpublish for a published owner article, even without a publication date', async () => {
    const published = { ...draft, isPublished: true };
    ownerAnnouncements.set([published]);
    facade.unpublishAnnouncement.mockImplementation(async () => {
      ownerAnnouncements.set([draft]);
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Published');
    expect(fixture.nativeElement.querySelector('time')).toBeNull();
    await fixture.componentInstance.setPublished(published.id, false);
    fixture.detectChanges();

    expect(facade.unpublishAnnouncement).toHaveBeenCalledWith(published.id);
    expect(fixture.nativeElement.textContent).toContain('Draft');
  });
});
