import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '@blog/shared/util';
import {
  AnnouncementDto,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  PaginationParams,
  PagedResult,
} from '@blog/articles/entity';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/api/v1`;

  getPublishedAnnouncements(
    params?: PaginationParams
  ): Observable<AnnouncementDto[]> {
    let httpParams = new HttpParams();
    if (params?.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<{ items: AnnouncementDto[] }>(
      `${this.baseUrl}/blog/announcements`,
      { params: httpParams }
    ).pipe(map((response) => response.items));
  }

  getPublishedAnnouncementById(id: number): Observable<AnnouncementDto> {
    return this.http.get<AnnouncementDto>(
      `${this.baseUrl}/blog/announcements/${id}`,
      { transferCache: false }
    );
  }

  getPublishedAnnouncementsPage(page: number, category?: string): Observable<PagedResult<AnnouncementDto>> {
    let params = new HttpParams().set('page', page).set('pageSize', 10);
    if (category) params = params.set('category', category);
    return this.http.get<PagedResult<AnnouncementDto>>(
      `${this.baseUrl}/blog/announcements`,
      { params, transferCache: false }
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/blog/categories`, { transferCache: false });
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
