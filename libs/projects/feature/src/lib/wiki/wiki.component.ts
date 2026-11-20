import {
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownPipe } from '@blog/shared/ui';
import { ProjectsFacade } from '@blog/projects/data-access';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe, TranslocoModule],
})
export class WikiComponent implements OnInit, OnDestroy {
  private readonly projectsFacade = inject(ProjectsFacade);
  private readonly route = inject(ActivatedRoute);

  readonly project = this.projectsFacade.currentProject;
  readonly isLoading = this.projectsFacade.isLoading;
  readonly error = this.projectsFacade.error;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    void this.projectsFacade.loadProjectById(id).catch(() => {});
  }

  ngOnDestroy(): void {
    this.projectsFacade.clearCurrentProject();
  }
}
