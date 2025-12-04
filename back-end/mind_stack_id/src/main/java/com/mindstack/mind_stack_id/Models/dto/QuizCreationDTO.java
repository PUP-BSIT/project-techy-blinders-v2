package com.mindstack.mind_stack_id.models.dto;

public class QuizCreationDTO {
    private long quizSetId;
    private boolean identificationAnswer;
    private String question;
    private long quizId;
    private long userId; // NEW FIELD

    public QuizCreationDTO(){}

    public QuizCreationDTO(long quizSetId, boolean identificationAnswer, String question, long quizId, long userId) {
        this.quizSetId = quizSetId;
        this.identificationAnswer = identificationAnswer;
        this.question = question;
        this.quizId = quizId;
        this.userId = userId; // INITIALIZED
    }

    public long getQuizSetId() {
        return quizSetId;
    }

    public boolean getIdentificationAnswer() {
        return identificationAnswer;
    }

    public String getQuestion(){
        return question;
    }

    public long getQuizId() {
        return quizId;
    }
    
    public long getUserId() {
        return userId;
    }
}