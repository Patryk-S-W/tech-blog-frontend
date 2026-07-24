import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnnouncementDto,
  CreateAnnouncementRequest,
  PaginatedResponse,
  UpdateAnnouncementRequest,
  PaginationParams,
} from '../models/announcement.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  getPublishedAnnouncements(
    params?: PaginationParams
  ): Observable<AnnouncementDto[]> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http
      .get<
        PaginatedResponse<AnnouncementDto>
      >(`${this.baseUrl}/blog/announcements`, { params: httpParams })
      .pipe(map((res) => res.items));
  }

  getPublishedByCategory(category: string): Observable<AnnouncementDto[]> {
    return this.http.get<AnnouncementDto[]>(
      `${this.baseUrl}/blog/announcements`,
      { params: { category } }
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/blog/categories`);
  }

  getPublishedAnnouncementBySlug(slug: string): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(
      `${this.baseUrl}/blog/announcements/by-slug/${slug}`
    );
  }

  getPublishedAnnouncementById(id: number): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(
      `${this.baseUrl}/blog/announcements/${id}`
    );
  }

  getMyAnnouncements(): Observable<AnnouncementDto[]> {
    return this.http.get<AnnouncementDto[]>(`${this.baseUrl}/announcement`);
  }

  getMyAnnouncementById(id: number): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(`${this.baseUrl}/announcement/${id}`);
  }

  createAnnouncement(
    request: CreateAnnouncementRequest
  ): Observable<AnnouncementDto> {
    return this.http.post<AnnouncementDto>(
      `${this.baseUrl}/announcement`,
      request
    );
  }

  updateAnnouncement(
    request: UpdateAnnouncementRequest
  ): Observable<AnnouncementDto> {
    return this.http.put<AnnouncementDto>(
      `${this.baseUrl}/announcement`,
      request
    );
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/announcement/${id}`);
  }
}
