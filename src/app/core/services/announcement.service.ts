import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnnouncementDto,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  PaginatedResponse,
  PaginationParams,
} from '../models/announcement.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  getPublishedAnnouncements(
    params?: PaginationParams
  ): Observable<AnnouncementDto[]> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<{ items: AnnouncementDto[] }>(
      `${this.baseUrl}/v1/blog/announcements`,
      { params: httpParams }
    ).pipe(map((response) => response.items));
  }

  getPublishedAnnouncementById(id: number): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(
      `${this.baseUrl}/v1/blog/announcements/${id}`
    );
  }

  getMyAnnouncements(): Observable<AnnouncementDto[]> {
    return this.http.get<AnnouncementDto[]>(`${this.baseUrl}/Announcement`);
  }

  getMyAnnouncementById(id: number): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(`${this.baseUrl}/Announcement/${id}`);
  }

  createAnnouncement(
    request: CreateAnnouncementRequest
  ): Observable<AnnouncementDto> {
    return this.http.post<AnnouncementDto>(
      `${this.baseUrl}/Announcement`,
      request
    );
  }

  updateAnnouncement(
    request: UpdateAnnouncementRequest
  ): Observable<AnnouncementDto> {
    return this.http.put<AnnouncementDto>(
      `${this.baseUrl}/Announcement`,
      request
    );
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Announcement/${id}`);
  }
}
