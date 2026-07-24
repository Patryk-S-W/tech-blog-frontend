import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProjectDto,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly adminUrl = `${environment.apiUrl}/api/v1/project`;
  private readonly blogUrl = `${environment.apiUrl}/api/v1/blog/projects`;

  getAllPublished(): Observable<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(this.blogUrl);
  }

  getPublishedById(id: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.blogUrl}/${id}`);
  }

  getMyProjects(): Observable<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(this.adminUrl);
  }

  getMyProjectById(id: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.adminUrl}/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.adminUrl, request);
  }

  updateProject(request: UpdateProjectRequest): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(this.adminUrl, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
