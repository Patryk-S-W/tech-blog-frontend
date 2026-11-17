import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsFacade } from '@blog/projects/data-access';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  imports: [RouterLink, TranslocoModule],
})
export class ProjectsComponent implements OnInit {
  private readonly projectsFacade = inject(ProjectsFacade);
  readonly isWiki = inject(ActivatedRoute).snapshot.data['wiki'] === true;

  readonly projects = this.projectsFacade.projects;
  readonly isLoading = this.projectsFacade.isLoading;
  readonly error = this.projectsFacade.error;

  ngOnInit(): void {
    void this.projectsFacade.loadProjects().catch(() => {});
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  projectLink(id: number): string[] {
    return [this.isWiki ? '/wiki' : '/projects', String(id)];
  }
}
