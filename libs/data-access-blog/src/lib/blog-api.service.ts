import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@tech-blog/environments';
import { Announcement } from './announcement.model';

@Injectable({ providedIn: 'root' })
export class BlogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/blog`;

  getPublishedAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/announcements`);
  }

  getPublishedAnnouncementById(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.baseUrl}/announcements/${id}`);
  }
}
