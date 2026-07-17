import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BlogApiService } from './blog-api.service';

@Injectable({ providedIn: 'root' })
export class BlogStore {
  private readonly api = inject(BlogApiService);

  readonly announcementsResource = resource({
    loader: () => firstValueFrom(this.api.getPublishedAnnouncements()),
  });

  readonly announcements = this.announcementsResource.value;
  readonly isLoading = this.announcementsResource.isLoading;
  readonly error = this.announcementsResource.error;
}
