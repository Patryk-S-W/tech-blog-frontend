import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectsFacade } from '@blog/projects/data-access';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  imports: [RouterLink],
})
export class ProjectsComponent implements OnInit {
  private readonly projectsFacade = inject(ProjectsFacade);
  private readonly platformId = inject(PLATFORM_ID);

  readonly projects = this.projectsFacade.projects;
  readonly isLoading = this.projectsFacade.isLoading;
  readonly error = this.projectsFacade.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.projectsFacade.loadProjects().catch(() => {});
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
