import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
const environment = { apiUrl: '' };
describe('Project API routing', () => {
  it('preserves public reads and versioned owner writes', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(ProjectService);
    service.getAllProjects().subscribe();
    const list = http.expectOne('/api/v1/blog/projects');
    expect(list.request.method).toBe('GET');
    list.flush([]);
    service.getProjectById(9).subscribe();
    const detail = http.expectOne('/api/v1/blog/projects/9');
    expect(detail.request.method).toBe('GET');
    detail.flush({ id: 9 });
    const projectBody = {
      title: 'Test project', image: '', shortDescription: 'Summary',
      text: 'Test text', url: '/projects/9', author: 'Test author',
    };
    const createdProject = jest.fn();
    service.createProject(projectBody).subscribe(createdProject);
    const projectCreate = http.expectOne(`${environment.apiUrl}/api/v1/project`);
    expect(projectCreate.request.method).toBe('POST');
    expect(projectCreate.request.body).toEqual(projectBody);
    const projectDto = { ...projectBody, id: 9 };
    projectCreate.flush(projectDto, { status: 201, statusText: 'Created' });
    expect(createdProject).toHaveBeenCalledWith(projectDto);

    const projectUpdateBody = { ...projectBody, id: 9 };
    const updatedProject = jest.fn();
    service.updateProject(projectUpdateBody).subscribe(updatedProject);
    const projectUpdate = http.expectOne(`${environment.apiUrl}/api/v1/project`);
    expect(projectUpdate.request.method).toBe('PUT');
    expect(projectUpdate.request.body).toEqual(projectUpdateBody);
    projectUpdate.flush(projectDto);
    expect(updatedProject).toHaveBeenCalledWith(projectDto);

    service.deleteProject(9).subscribe();
    const adminDelete = http.expectOne(`${environment.apiUrl}/api/v1/project/9`);
    expect(adminDelete.request.method).toBe('DELETE');
    adminDelete.flush(null, { status: 204, statusText: 'No Content' });
    http.verify();
  });
});
