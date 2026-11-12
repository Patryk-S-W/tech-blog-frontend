import { Injectable, inject } from '@angular/core';
import { CreateProjectRequest, UpdateProjectRequest } from '@blog/projects/entity';
import { ProjectStore } from './store/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectsFacade {
  private readonly store = inject(ProjectStore);
  readonly projects = this.store.projects;
  readonly currentProject = this.store.currentProject;
  readonly projectCount = this.store.projectCount;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  loadProjects(): Promise<void> { return this.store.loadProjects(); }
  loadProjectById(id: number): Promise<void> { return this.store.loadProjectById(id); }
  createProject(request: CreateProjectRequest): Promise<void> { return this.store.createProject(request); }
  updateProject(request: UpdateProjectRequest): Promise<void> { return this.store.updateProject(request); }
  deleteProject(id: number): Promise<void> { return this.store.deleteProject(id); }
  clearCurrentProject(): void { this.store.clearCurrentProject(); }
  clearError(): void { this.store.clearError(); }
}
