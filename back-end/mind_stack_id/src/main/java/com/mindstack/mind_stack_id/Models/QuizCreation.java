package com.mindstack.mind_stack_id.Models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table (name = "tbl_quiz")
public class QuizCreation {

    public enum QuestionType {
        MULTIPLE_CHOICE("multiple choice"),
        IDENTIFICATION("identification");

        private final String value;

        QuestionType(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static QuestionType fromValue(String input) {
            if (input == null) {
                throw new IllegalArgumentException("Question type cannot be null");
            }
            
            for (QuestionType type : QuestionType.values()) {
                if (type.name().equalsIgnoreCase(input)) {
                    return type;
                }
            }
            
            for (QuestionType type : QuestionType.values()) {
                if (type.value.equalsIgnoreCase(input)) {
                    return type;
                }
            }
            
            throw new IllegalArgumentException("Unknown question type: " + input + 
                ". Accepted values: MULTIPLE_CHOICE, IDENTIFICATION, multiple choice, identification");
        }
    }

    @Id
    @Column(name = "quiz_id")
    private long quizId;

    @Column(name = "flashcard_id")
    private long flashcardId;

    @Column(name = "question")
    private String question;

    @Column(name = "question_type")
    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @Column(name = "option_a")
    private String optionA;

    @Column(name = "option_b")
    private String optionB;

    @Column(name = "option_c")
    private String optionC;

    @Column(name = "option_d")
    private String optionD;

    @Column(name = "identfication_answer")
    private Boolean isIdentificationAnswer;

    @Column(name = "correct_answer")
    private String correctAnswer;

    public long getQuizId() {
        return quizId;
    }

    public void setQuizId(long quizId) {
        this.quizId = quizId;
    }

    public long getFlashcardId() {
        return flashcardId;
    }

    public void setFlashcardId(long flashcardId) {
        this.flashcardId = flashcardId;
    }

    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public Boolean getIdentifcationAnswer() {
        return isIdentificationAnswer;
    }

    public void setIdentifcationAnswer(Boolean isIdentifcationAnswer) {
        this.isIdentificationAnswer = isIdentifcationAnswer;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer){
        this.correctAnswer = correctAnswer;
    }
}