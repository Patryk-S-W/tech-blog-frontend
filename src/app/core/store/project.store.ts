import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ProjectService } from '../services/project.service';
import { ProjectDto, CreateProjectRequest } from '../models/project.model';

interface ProjectState {
  projects: ProjectDto[];
}

const initialState: ProjectState = {
  projects: [],
};

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    projectCount: computed(() => store.projects().length),
  })),
  withMethods((store, service = inject(ProjectService)) => ({
    async createProject(request: CreateProjectRequest): Promise<ProjectDto> {
      const item = await firstValueFrom(service.createProject(request));
      patchState(store, { projects: [...store.projects(), item] });
      return item;
    },

    async deleteProject(id: number): Promise<void> {
      await firstValueFrom(service.deleteProject(id));
      patchState(store, {
        projects: store.projects().filter((p) => p.id !== id),
      });
    },

    clearProjects(): void {
      patchState(store, { projects: [] });
    },
  }))
);
