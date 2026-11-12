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
    const adminList = http.expectOne(`${environment.apiUrl}/api/v1/announcement`);
    expect(adminList.request.method).toBe('GET');
    adminList.flush([]);
    announcements.getMyAnnouncementById(7).subscribe();
    const adminDetail = http.expectOne(`${environment.apiUrl}/api/v1/announcement/7`);
    expect(adminDetail.request.method).toBe('GET');
    adminDetail.flush(items[0]);

    const announcementBody = {
      title: 'Test announcement', image: '', text: 'Test text',
      category: 'Test', duration: '5', button: 'Read',
    };
    const createdAnnouncement = jest.fn();
    announcements.createAnnouncement(announcementBody).subscribe(createdAnnouncement);
    const announcementCreate = http.expectOne(`${environment.apiUrl}/api/v1/announcement`);
    expect(announcementCreate.request.method).toBe('POST');
    expect(announcementCreate.request.body).toEqual(announcementBody);
    const announcementDto = { ...announcementBody, id: 7, publishedAt: null };
    announcementCreate.flush(announcementDto, { status: 201, statusText: 'Created' });
    expect(createdAnnouncement).toHaveBeenCalledWith(announcementDto);

    const announcementUpdateBody = { ...announcementBody, id: 7 };
    const updatedAnnouncement = jest.fn();
    announcements.updateAnnouncement(announcementUpdateBody).subscribe(updatedAnnouncement);
    const announcementUpdate = http.expectOne(`${environment.apiUrl}/api/v1/announcement`);
    expect(announcementUpdate.request.method).toBe('PUT');
    expect(announcementUpdate.request.body).toEqual(announcementUpdateBody);
    announcementUpdate.flush(announcementDto);
    expect(updatedAnnouncement).toHaveBeenCalledWith(announcementDto);

    announcements.deleteAnnouncement(7).subscribe();
    const announcementDelete = http.expectOne(`${environment.apiUrl}/api/v1/announcement/7`);
    expect(announcementDelete.request.method).toBe('DELETE');
    announcementDelete.flush(null, { status: 204, statusText: 'No Content' });

    const projectBody = {
      title: 'Test project', image: '', shortDescription: 'Summary',
      text: 'Test text', url: '/projects/9', author: 'Test author',
    };
    const createdProject = jest.fn();
    projects.createProject(projectBody).subscribe(createdProject);
    const projectCreate = http.expectOne(`${environment.apiUrl}/api/v1/project`);
    expect(projectCreate.request.method).toBe('POST');
    expect(projectCreate.request.body).toEqual(projectBody);
    const projectDto = { ...projectBody, id: 9 };
    projectCreate.flush(projectDto, { status: 201, statusText: 'Created' });
    expect(createdProject).toHaveBeenCalledWith(projectDto);

    const projectUpdateBody = { ...projectBody, id: 9 };
    const updatedProject = jest.fn();
    projects.updateProject(projectUpdateBody).subscribe(updatedProject);
    const projectUpdate = http.expectOne(`${environment.apiUrl}/api/v1/project`);
    expect(projectUpdate.request.method).toBe('PUT');
    expect(projectUpdate.request.body).toEqual(projectUpdateBody);
    projectUpdate.flush(projectDto);
    expect(updatedProject).toHaveBeenCalledWith(projectDto);

    projects.deleteProject(9).subscribe();
    const adminDelete = http.expectOne(`${environment.apiUrl}/api/v1/project/9`);
    expect(adminDelete.request.method).toBe('DELETE');
    adminDelete.flush(null, { status: 204, statusText: 'No Content' });
    http.verify();
  });
});
