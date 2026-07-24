import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  imports: [RouterLink],
})
export class ProjectsComponent {
  private readonly service = inject(ProjectService);

  private readonly projectsResource = rxResource({
    stream: () => this.service.getAllPublished(),
  });

  readonly projects = this.projectsResource.value;
  readonly isLoading = this.projectsResource.isLoading;
  readonly error = computed(
    () => this.projectsResource.error()?.message ?? null
  );

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
