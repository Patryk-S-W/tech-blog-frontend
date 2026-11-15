import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

export interface ExperienceCaseStudy {
  title: string;
  category: string;
  summary: string;
  problem: string;
  approach: string[];
  scope: string[];
  validation: string;
  technologies: string[];
}

export const experienceCaseStudies: Partial<Record<string, ExperienceCaseStudy>> = {
  'angular-forms': {
    title: 'A multi-step form that keeps its state',
    category: 'Angular & web',
    summary: 'An example approach to form flows where validation and server errors should not erase a person’s work.',
    problem: 'A long form is split into steps. A validation error or a failed save sends the user back through the flow, and it is unclear which fields need attention or whether the entered data is still safe.',
    approach: [
      'Keep form state and validation rules explicit for each step.',
      'Show field-level feedback and a clear summary for errors returned by the server.',
      'Preserve entered values when a request fails and make retry actions clear.',
    ],
    scope: ['Accessible labels and error announcements', 'Loading, success and failure states', 'Keyboard and narrow-screen checks'],
    validation: 'Check that values survive validation and network failures, and that each error can be found and corrected using a keyboard or screen reader.',
    technologies: ['Angular', 'TypeScript', 'NgRx', 'Jest', 'Cypress'],
  },
  'ksef-integration': {
    title: 'A more reliable KSeF integration flow',
    category: '.NET',
    summary: 'An illustrative integration design for handling invoice validation, temporary failures and repeated delivery safely.',
    problem: 'An invoicing system sends documents to an external service. Requests can be rejected or temporarily unavailable, while an automatic retry may accidentally send the same document twice.',
    approach: [
      'Validate outgoing data before sending and keep rejection details available to the operator.',
      'Queue work and make retry decisions from the service response instead of retrying blindly.',
      'Record a stable document reference and processing state so retries can be idempotent.',
    ],
    scope: ['Outbound document flow', 'Retry and duplicate handling', 'Status visibility and actionable errors'],
    validation: 'Exercise accepted, rejected, delayed and repeated-request scenarios in a test environment before any production rollout.',
    technologies: ['C#', '.NET', 'ASP.NET Core', 'Entity Framework Core'],
  },
  'python-imports': {
    title: 'Repeatable imports from data files',
    category: 'Python',
    summary: 'An example workflow for importing recurring files without hiding malformed rows or creating avoidable duplicates.',
    problem: 'A team receives data files on a schedule. Small changes in column names, empty values or date formats make manual imports inconsistent and difficult to repeat.',
    approach: [
      'Normalize and validate each row before it reaches the application data.',
      'Return a useful report that points to the affected rows instead of failing without context.',
      'Make repeat runs safe and separate rejected records from accepted ones.',
    ],
    scope: ['Input validation and normalization', 'Clear row-level error reporting', 'Safe reruns and automated checks'],
    validation: 'Test valid, malformed, duplicate and partially invalid files, then confirm that rerunning the same input does not create duplicate records.',
    technologies: ['Python', 'FastAPI', 'pytest'],
  },
};

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  imports: [RouterLink],
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
