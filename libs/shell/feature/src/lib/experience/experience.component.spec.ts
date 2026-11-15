import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ExperienceComponent } from './experience.component';

describe('ExperienceComponent', () => {
  let fixture: ComponentFixture<ExperienceComponent>;
  let routeParams: Subject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    routeParams = new Subject();
    await TestBed.configureTestingModule({
      imports: [ExperienceComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: routeParams.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienceComponent);
  });

  function navigate(slug: string): void {
    routeParams.next(convertToParamMap({ slug }));
    fixture.detectChanges();
  }

  it('renders a clearly marked example case study', () => {
    navigate('ksef-integration');

    expect(fixture.nativeElement.textContent).toContain('EXAMPLE CASE STUDY');
    expect(fixture.nativeElement.textContent).toContain('Proposed approach');
    expect(fixture.nativeElement.textContent).toContain('not a claim of completed client work');
  });

  it('updates the rendered case when the route slug changes on the same component', () => {
    navigate('angular-forms');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('multi-step form');

    navigate('python-imports');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Repeatable imports');
  });

  it('shows not found for unknown and inherited object-property slugs', () => {
    for (const slug of ['unknown', 'constructor', '__proto__']) {
      navigate(slug);

      expect(fixture.nativeElement.textContent).toContain('This example is not available.');
      expect(fixture.nativeElement.querySelector('.case-study')).toBeNull();
    }
  });
});
