import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { OpenQuiz } from './open-quiz';
import { QuizzesService, QuestionType, QuizType } from '../../../../service/quizzes.service';

describe('OpenQuiz', () => {
  let component: OpenQuiz;
  let fixture: ComponentFixture<OpenQuiz>;

  const mockQuizzesService = {
    getQuizSetById: (id: number) => of({
      quiz_set_id: 1,
      title: 'Test Quiz',
      description: 'A sample quiz',
      quizzes: [{
        quizId: 1,
        question: 'Sample question',
        optionA: 'A',
        optionB: 'B',
        optionC: 'C',
        optionD: 'D',
        correctAnswer: 'A',
        identificationAnswer: '',
        points: 1
      }],
      quiz_type: QuizType.MULTIPLE_CHOICE,
      created_at: new Date(),
      is_public: false,
      user_id: 1
    })
  } as Partial<QuizzesService>;

  const mockRouter = { navigate: jasmine.createSpy('navigate') };
  const mockActivatedRoute = { snapshot: { paramMap: { get: (key: string) => '1' } } } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenQuiz, HttpClientTestingModule],
      providers: [
        { provide: QuizzesService, useValue: mockQuizzesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
