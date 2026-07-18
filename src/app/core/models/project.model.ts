export interface ProjectDto {
  id: number;
  title: string;
  image: string;
  shortDescription: string;
  text: string;
  url: string;
  author: string;
}

export interface CreateProjectRequest {
  title: string;
  image: string;
  shortDescription: string;
  text: string;
  url: string;
  author: string;
}

export interface UpdateProjectRequest extends CreateProjectRequest {
  id: number;
}
