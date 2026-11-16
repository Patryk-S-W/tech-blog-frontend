import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIComponent } from './ai.component';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('AIComponent', () => {
  let component: AIComponent;
  let fixture: ComponentFixture<AIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIComponent, TranslocoTestingModule.forRoot({
        langs: { en: { ai: { title: 'AI', imageAlt: 'Article illustration' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }, preloadLangs: true,
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(AIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
