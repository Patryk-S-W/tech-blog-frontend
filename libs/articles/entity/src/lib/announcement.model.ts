export interface AnnouncementDto {
  id: number;
  title: string;
  image: string;
  text: string;
  category: string;
  duration: string;
  button: string;
  publishedAt: string | null;
}

export interface CreateAnnouncementRequest {
  title: string;
  image: string;
  text: string;
  category: string;
  duration: string;
  button: string;
}

export interface UpdateAnnouncementRequest extends CreateAnnouncementRequest {
  id: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
