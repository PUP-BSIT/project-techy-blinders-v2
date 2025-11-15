import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, ViewChild, TemplateRef, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionType, QuestionItem } from '../../../services/quizzes.service';

@Component({
  selector: 'app-add-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-quiz.html',
  styleUrls: ['./add-quiz.scss']
})
export class AddQuiz implements OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() quizCreated = new EventEmitter<{ title: string; description: string; questions: QuestionItem[]; questionType: QuestionType; isPublic: boolean }>();

  quizTitle: string = '';
  quizDescription: string = '';
  selectedQuestionType: QuestionType = QuestionType.MULTIPLE_CHOICE;
  questions: QuestionItem[] = [];
  readonly MAX_QUESTIONS = 20;

  QuestionType = QuestionType;

  @ViewChild('questionsContainer', { read: ViewContainerRef }) private questionsContainer!: ViewContainerRef;
  @ViewChild('questionTpl') private questionTpl!: TemplateRef<any>;

  ngAfterViewInit() {
    setTimeout(() => this.renderQuestions());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  addQuestion() {
    if (this.questions.length < this.MAX_QUESTIONS) {
      if (this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE) {
        this.questions.push({ 
          question: '', 
          optionA: '', 
          optionB: '', 
          optionC: '', 
          optionD: '', 
          correctAnswer: 'A' 
        });
      } else {
        this.questions.push({ question: '', answer: 'True' });
      }
      this.renderQuestions();
    }
  }

  selectCorrectAnswer(questionIndex: number, answer: string) {
    if (this.questions[questionIndex]) {
      this.questions[questionIndex].correctAnswer = answer;
    }
  }

  removeQuestion(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.questions.splice(index, 1);
      this.renderQuestions();
    }
  }

  selectQuestionType(type: QuestionType) {
    if (this.selectedQuestionType !== type && this.questions.length > 0) {
      this.questions = [];
      this.renderQuestions();
    }
    this.selectedQuestionType = type;
  }

  close() {
    document.body.style.overflow = '';
    this.closeModal.emit();
    this.resetForm();
  }

  resetForm() {
    this.quizTitle = '';
    this.quizDescription = '';
    this.questions = [];
    this.selectedQuestionType = QuestionType.MULTIPLE_CHOICE;
    this.renderQuestions();
  }

  savePrivate() {
    if (this.quizTitle.trim() === '') {
      alert('Please enter a quiz title');
      return;
    }

    if (this.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const validQuestions = this.questions.filter(q => {
      if (this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE) {
        return q.question.trim() !== '' && 
               (q.optionA?.trim() || q.optionB?.trim() || q.optionC?.trim() || q.optionD?.trim()) &&
               q.correctAnswer;
      } else {
        return q.question.trim() !== '' && q.answer?.trim();
      }
    });

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question with all required fields filled');
      return;
    }

    console.log('Saving quiz with data:', {
      title: this.quizTitle,
      description: this.quizDescription,
      questionsCount: validQuestions.length,
      questionType: this.selectedQuestionType,
      isPublic: false
    });

    this.quizCreated.emit({
      title: this.quizTitle,
      description: this.quizDescription,
      questions: validQuestions,
      questionType: this.selectedQuestionType,
      isPublic: false
    });
    this.close();
  }

  publishPublic() {
    if (this.quizTitle.trim() === '') {
      alert('Please enter a quiz title');
      return;
    }

    if (this.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const validQuestions = this.questions.filter(q => {
      if (this.selectedQuestionType === QuestionType.MULTIPLE_CHOICE) {
        return q.question.trim() !== '' && 
               (q.optionA?.trim() || q.optionB?.trim() || q.optionC?.trim() || q.optionD?.trim()) &&
               q.correctAnswer;
      } else {
        return q.question.trim() !== '' && q.answer?.trim();
      }
    });

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question with all required fields filled');
      return;
    }

    console.log('Publishing quiz with data:', {
      title: this.quizTitle,
      description: this.quizDescription,
      questionsCount: validQuestions.length,
      questionType: this.selectedQuestionType,
      isPublic: true
    });

    this.quizCreated.emit({
      title: this.quizTitle,
      description: this.quizDescription,
      questions: validQuestions,
      questionType: this.selectedQuestionType,
      isPublic: true
    });
    this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  private renderQuestions() {
    if (!this.questionsContainer || !this.questionTpl) return;
    this.questionsContainer.clear();
    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      this.questionsContainer.createEmbeddedView(this.questionTpl, { question, index: i });
    }
  }

  get hasQuestions() {
    return this.questions.length > 0;
  }
}