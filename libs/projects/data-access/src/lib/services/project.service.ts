import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@blog/shared/util';
import {
  ProjectDto,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@blog/projects/entity';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/api/v1/project`;

  getAllProjects(): Observable<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(`${this.apiUrl}/api/v1/blog/projects`);
  }

  getProjectById(id: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.apiUrl}/api/v1/blog/projects/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.baseUrl, request);
  }

  updateProject(request: UpdateProjectRequest): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(this.baseUrl, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
