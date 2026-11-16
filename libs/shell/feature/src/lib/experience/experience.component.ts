import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

export interface ExperienceCaseStudy {
  key: string;
  technologies: string[];
}

export const experienceCaseStudies: Partial<Record<string, ExperienceCaseStudy>> = {
  'angular-forms': {
    key: 'about.cases.forms',
    technologies: ['Angular', 'TypeScript', 'NgRx', 'Jest', 'Cypress'],
  },
  'ksef-integration': {
    key: 'about.cases.ksef',
    technologies: ['C#', '.NET', 'ASP.NET Core', 'Entity Framework Core'],
  },
  'python-imports': {
    key: 'about.cases.imports',
    technologies: ['Python', 'FastAPI', 'pytest'],
  },
};

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  imports: [RouterLink, TranslocoModule],
})
export class ExperienceComponent {
  private readonly route = inject(ActivatedRoute);
  readonly caseStudy = signal<ExperienceCaseStudy | undefined>(undefined);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((params) => {
      const slug = params.get('slug');
      this.caseStudy.set(
        slug && Object.hasOwn(experienceCaseStudies, slug)
          ? experienceCaseStudies[slug]
          : undefined,
      );
    });
  }
}
