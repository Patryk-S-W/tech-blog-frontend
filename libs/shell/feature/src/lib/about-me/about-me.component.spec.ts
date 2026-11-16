import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutMeComponent } from './about-me.component';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('AboutMeComponent', () => {
  let component: AboutMeComponent;
  let fixture: ComponentFixture<AboutMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeComponent, TranslocoTestingModule.forRoot({
        langs: { en: { about: { frontend: 'FRONTEND', backend: 'BACKEND', technologiesTitle: 'Technologies I work with', experienceTitle: 'Example problems, practical approaches' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }, preloadLangs: true,
      })],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows all three technology categories and example experience links together', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.technology-card').length).toBe(3);
    expect(element.textContent).toContain('Angular & web');
    expect(element.textContent).toContain('.NET');
    expect(element.textContent).toContain('Python');
    expect(element.querySelectorAll('.experience-card').length).toBe(3);
  });
});
