import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { ProjectService } from '../../core/services/project.service';
import { ProjectDto } from '../../core/models/project.model';

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss'],
  imports: [RouterLink, MarkdownPipe],
})
export class WikiComponent implements OnInit {
  private readonly service = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

  private readonly projectId = signal<number | undefined>(undefined);

  private readonly projectResource = rxResource<ProjectDto, number>({
    params: () => this.projectId(),
    stream: ({ params }) => this.service.getPublishedById(params),
  });

  readonly project = this.projectResource.value;
  readonly isLoading = this.projectResource.isLoading;
  readonly error = computed(
    () => this.projectResource.error()?.message ?? null
  );

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.projectId.set(id);
  }
}
