package com.mindstack.mind_stack_id.Models.dto;

public class QuizCreationDTO {
    private long flashcardId;
    private boolean identificationAnswer;
    private String question;
    private long quizId;

    public QuizCreationDTO(){}

    public QuizCreationDTO(long flashcardId, boolean identificationAnswer, String question, long quizId) {
        this.flashcardId = flashcardId;
        this.identificationAnswer = identificationAnswer;
        this.question = question;
        this.quizId = quizId;
    }

    public long getFlashcardId() {
        return flashcardId;
    }

    public boolean getIdentifcationAnswer() {
        return identificationAnswer;
    }

    public String getQuestion(){
        return question;
    }

    public long getQuizId() {
        return quizId;
    }
}
