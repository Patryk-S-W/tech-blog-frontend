import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownPipe } from '@blog/shared/ui';
import { ProjectsFacade } from '@blog/projects/data-access';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class WikiComponent implements OnInit, OnDestroy {
  private readonly projectsFacade = inject(ProjectsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  readonly project = this.projectsFacade.currentProject;
  readonly isLoading = this.projectsFacade.isLoading;
  readonly error = this.projectsFacade.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const id = +this.route.snapshot.paramMap.get('id')!;
      void this.projectsFacade.loadProjectById(id).catch(() => {});
    }
  }

  ngOnDestroy(): void {
    this.projectsFacade.clearCurrentProject();
  }
}
