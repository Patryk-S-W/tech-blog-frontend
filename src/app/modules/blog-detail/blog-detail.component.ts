import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AnnouncementService } from '../../core/services/announcement.service';
import { AnnouncementDto } from '../../core/models/announcement.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  imports: [RouterLink, MarkdownPipe, DatePipe],
})
export class BlogDetailComponent implements OnInit {
  private readonly service = inject(AnnouncementService);
  private readonly route = inject(ActivatedRoute);

  private readonly slug = signal<string | undefined>(undefined);

  private readonly postResource = rxResource<AnnouncementDto, string>({
    params: () => this.slug(),
    stream: ({ params }) => this.service.getPublishedAnnouncementBySlug(params),
  });

  readonly announcement = this.postResource.value;
  readonly isLoading = this.postResource.isLoading;
  readonly error = computed(() => this.postResource.error()?.message ?? null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.slug.set(slug);
  }
}
