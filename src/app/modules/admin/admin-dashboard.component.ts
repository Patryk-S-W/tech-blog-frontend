import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnnouncementStore } from '../../core/store/announcement.store';
import { AnnouncementService } from '../../core/services/announcement.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [RouterLink, DatePipe],
})
export class AdminDashboardComponent {
  private readonly service = inject(AnnouncementService);
  private readonly store = inject(AnnouncementStore);

  private readonly myPostsResource = rxResource({
    stream: () => this.service.getMyAnnouncements(),
  });

  readonly announcements = this.myPostsResource.value;
  readonly isLoading = this.myPostsResource.isLoading;
  readonly error = computed(
    () => this.myPostsResource.error()?.message ?? null
  );

  async onDelete(id: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    await this.store.deleteAnnouncement(id);
    this.myPostsResource.reload();
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
