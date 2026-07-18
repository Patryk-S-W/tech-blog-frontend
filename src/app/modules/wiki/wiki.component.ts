import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { ProjectStore } from '../../core/store/project.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class WikiComponent implements OnInit, OnDestroy {
  private readonly store = inject(ProjectStore);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  readonly project = this.store.currentProject;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const id = +this.route.snapshot.paramMap.get('id')!;
      this.store.loadProjectById(id);
    }
  }

  ngOnDestroy(): void {
    this.store.clearCurrentProject();
  }
}
