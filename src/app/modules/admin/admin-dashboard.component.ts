import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnnouncementStore } from '../../core/store/announcement.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [RouterLink, DatePipe],
})
export class AdminDashboardComponent implements OnInit {
  private readonly store = inject(AnnouncementStore);
  private readonly platformId = inject(PLATFORM_ID);

  readonly announcements = this.store.announcements;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.loadMyAnnouncements();
    }
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.store.deleteAnnouncement(id);
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
