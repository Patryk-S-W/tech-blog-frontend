import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { ProjectService } from '../services/project.service';
import { ProjectDto, CreateProjectRequest } from '../models/project.model';

interface ProjectState {
  projects: ProjectDto[];
  currentProject: ProjectDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    projectCount: computed(() => store.projects().length),
  })),
  withMethods((store, service = inject(ProjectService)) => ({
    loadProjects(): void {
      patchState(store, { isLoading: true, error: null });
      service.getAllProjects().subscribe({
        next: (items) =>
          patchState(store, { projects: items, isLoading: false }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to load projects',
          }),
      });
    },

    loadProjectById(id: number): void {
      patchState(store, { isLoading: true, error: null });
      service.getProjectById(id).subscribe({
        next: (item) =>
          patchState(store, { currentProject: item, isLoading: false }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to load project',
          }),
      });
    },

    createProject(request: CreateProjectRequest): void {
      patchState(store, { isLoading: true, error: null });
      service.createProject(request).subscribe({
        next: (item) =>
          patchState(store, {
            projects: [...store.projects(), item],
            isLoading: false,
          }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to create project',
          }),
      });
    },

    deleteProject(id: number): void {
      patchState(store, { isLoading: true, error: null });
      service.deleteProject(id).subscribe({
        next: () =>
          patchState(store, {
            projects: store.projects().filter((p) => p.id !== id),
            isLoading: false,
          }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Failed to delete project',
          }),
      });
    },

    clearCurrentProject(): void {
      patchState(store, { currentProject: null });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
