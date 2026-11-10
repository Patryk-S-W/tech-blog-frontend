import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnnouncementService } from './announcement.service';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';
import { environment as production } from '../../../environments/environment.prod';

describe('API routing', () => {
  it('keeps production URLs same-origin and preserves public API paths', () => {
    expect(production.apiUrl).toBe('');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const announcements = TestBed.inject(AnnouncementService);
    const projects = TestBed.inject(ProjectService);
    const received = jest.fn();
    announcements.getPublishedAnnouncements({ page: 2, pageSize: 3 }).subscribe(received);
    const list = http.expectOne(`${environment.apiUrl}/api/v1/blog/announcements?page=2&pageSize=3`);
    expect(list.request.method).toBe('GET');
    const items = [{ id: 7, title: 'Published announcement' }];
    list.flush({ items, totalCount: 4, page: 2, pageSize: 3, totalPages: 2, hasPrevious: true, hasNext: false });
    expect(received).toHaveBeenCalledWith(items);

    announcements.getPublishedAnnouncementById(7).subscribe();
    const announcement = http.expectOne(`${environment.apiUrl}/api/v1/blog/announcements/7`);
    expect(announcement.request.method).toBe('GET');
    announcement.flush(items[0]);

    projects.getAllProjects().subscribe();
    const projectList = http.expectOne(`${environment.apiUrl}/api/v1/blog/projects`);
    expect(projectList.request.method).toBe('GET');
    projectList.flush([]);
    projects.getProjectById(9).subscribe();
    const project = http.expectOne(`${environment.apiUrl}/api/v1/blog/projects/9`);
    expect(project.request.method).toBe('GET');
    project.flush({ id: 9 });

    announcements.getMyAnnouncements().subscribe();
    const adminList = http.expectOne(`${environment.apiUrl}/api/Announcement`);
    expect(adminList.request.method).toBe('GET');
    adminList.flush([]);
    projects.deleteProject(9).subscribe();
    const adminDelete = http.expectOne(`${environment.apiUrl}/api/Project/9`);
    expect(adminDelete.request.method).toBe('DELETE');
    adminDelete.flush(null);
    http.verify();
  });
});
