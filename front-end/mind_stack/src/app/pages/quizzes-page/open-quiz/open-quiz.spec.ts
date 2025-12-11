import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { OpenQuiz } from './open-quiz';
import { QuizzesService, QuestionType } from '../../../../service/quizzes.service';

describe('OpenQuiz', () => {
  let component: OpenQuiz;
  let fixture: ComponentFixture<OpenQuiz>;

  const mockQuizzesService = {
    getQuizById: (id: number) => ({
      quiz_id: 1,
      title: 'Test Quiz',
      description: 'A sample quiz',
      questions: [{ question: 'Sample question' }],
      questionType: QuestionType.MULTIPLE_CHOICE,
      created_at: new Date(),
      is_public: false
    })
  } as Partial<QuizzesService>;

  const mockRouter = { navigate: jasmine.createSpy('navigate') };
  const mockActivatedRoute = { snapshot: { paramMap: { get: (key: string) => '1' } } } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenQuiz],
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
