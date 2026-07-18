import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectStore } from '../../core/store/project.store';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  imports: [RouterLink],
})
export class ProjectsComponent implements OnInit {
  private readonly store = inject(ProjectStore);
  private readonly platformId = inject(PLATFORM_ID);

  readonly projects = this.store.projects;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.loadProjects();
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
