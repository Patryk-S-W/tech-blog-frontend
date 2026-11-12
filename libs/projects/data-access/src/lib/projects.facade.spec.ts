import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectsFacade } from './projects.facade';

describe('ProjectsFacade', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('awaits successful requests and rejects failures without exposing server messages', async () => {
    const facade = TestBed.inject(ProjectsFacade);
    const pending = facade.loadProjects();
    expect(facade.isLoading()).toBe(true);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/blog/projects').flush([]);
    await pending;
    expect(facade.isLoading()).toBe(false);
    const failed = facade.loadProjectById(1);
    const rejected = expect(failed).rejects.toThrow('Failed to load project');
    TestBed.inject(HttpTestingController).expectOne('/api/v1/blog/projects/1')
      .flush({ message: 'private upstream detail' }, { status: 500, statusText: 'Server Error' });
    await rejected;
    expect(facade.error()).toBe('Failed to load project');
    expect(facade.isLoading()).toBe(false);
  });
});
