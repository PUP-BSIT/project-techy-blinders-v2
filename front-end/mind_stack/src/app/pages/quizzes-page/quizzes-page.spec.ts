import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { QuizzesPage } from './quizzes-page';

describe('QuizzesPage', () => {
  let component: QuizzesPage;
  let fixture: ComponentFixture<QuizzesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesPage],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizzesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
