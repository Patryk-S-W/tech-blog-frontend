import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HardwareComponent } from './hardware.component';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('HardwareComponent', () => {
  let component: HardwareComponent;
  let fixture: ComponentFixture<HardwareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HardwareComponent, TranslocoTestingModule.forRoot({
        langs: { en: { hardware: { title: 'Hardware', imageAlt: 'Article illustration' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }, preloadLangs: true,
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(HardwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
