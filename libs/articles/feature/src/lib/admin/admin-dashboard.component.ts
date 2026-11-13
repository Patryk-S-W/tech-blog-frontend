import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [RouterLink, DatePipe],
})
export class AdminDashboardComponent implements OnInit {
  private readonly facade = inject(AnnouncementsFacade);
  private readonly platformId = inject(PLATFORM_ID);

  readonly announcements = this.facade.ownerAnnouncements;
  readonly isLoading = this.facade.isLoading;
  readonly error = this.facade.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.facade.loadMyAnnouncements().catch(() => {});
    }
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      void this.facade.deleteAnnouncement(id).catch(() => {});
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
