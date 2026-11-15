import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ProjectsFacade } from '@blog/projects/data-access';
import { ProjectDto } from '@blog/projects/entity';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let projects: ReturnType<typeof signal<ProjectDto[]>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ProjectsFacade,
          useValue: {
            projects: (projects = signal<ProjectDto[]>([])),
            isLoading: signal(false),
            error: signal(null),
            loadProjects: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a text-only project without an empty image slot', () => {
    projects.set([
      {
        id: 1,
        title: 'Project',
        image: '',
        shortDescription: 'A short description',
        text: 'Details',
        url: '',
        author: 'Patryk Sadowski',
      },
    ]);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.project-card');
    expect(card.querySelector('img')).toBeNull();
    expect(card.textContent).toContain('A short description');
  });
});
