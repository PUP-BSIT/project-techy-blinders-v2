import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionModal } from './question-modal';

describe('QuestionModal', () => {
  let component: QuestionModal;
  let fixture: ComponentFixture<QuestionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
