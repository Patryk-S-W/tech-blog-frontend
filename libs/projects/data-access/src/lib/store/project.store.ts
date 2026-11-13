import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ProjectDto, CreateProjectRequest, UpdateProjectRequest } from '@blog/projects/entity';
import { withCallState } from '@blog/shared/util';
import { ProjectService } from '../services/project.service';

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState({ projects: [] as ProjectDto[], currentProject: null as ProjectDto | null }),
  withCallState(),
  withComputed((store) => ({ projectCount: computed(() => store.projects().length) })),
  withMethods((store, service = inject(ProjectService)) => ({
    clearCurrentProject(): void { patchState(store, { currentProject: null }); },
    async loadProjects(): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.getAllProjects());
        patchState(store, { projects: result });
        store.finishCall();
      } catch {
        store.failCall('Failed to load projects');
        throw new Error('Failed to load projects');
      }
    },
    async loadProjectById(id: number): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.getProjectById(id));
        patchState(store, { currentProject: result });
        store.finishCall();
      } catch {
        store.failCall('Failed to load project');
        throw new Error('Failed to load project');
      }
    },
    async createProject(request: CreateProjectRequest): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.createProject(request));
        patchState(store, { projects: [...store.projects(), result] });
        store.finishCall();
      } catch {
        store.failCall('Failed to create project');
        throw new Error('Failed to create project');
      }
    },
    async updateProject(request: UpdateProjectRequest): Promise<void> {
      store.startCall();
      try {
        const result = await firstValueFrom(service.updateProject(request));
        patchState(store, { projects: store.projects().map((item) => item.id === result.id ? result : item) });
        store.finishCall();
      } catch {
        store.failCall('Failed to update project');
        throw new Error('Failed to update project');
      }
    },
    async deleteProject(id: number): Promise<void> {
      store.startCall();
      try {
        await firstValueFrom(service.deleteProject(id));
        patchState(store, { projects: store.projects().filter((item) => item.id !== id) });
        store.finishCall();
      } catch {
        store.failCall('Failed to delete project');
        throw new Error('Failed to delete project');
      }
    },
  }))
);
