package com.mindstack.mind_stack_id.models.dto;

public class QuizAttemptDTO {
    private long quizId;
    private long quizAttemptId;
    private String selectedAnswer;
    private Boolean isCorrect;


    public QuizAttemptDTO(){}

    public QuizAttemptDTO(long quizId, long quizAttemptId, String selectedAnswer, Boolean isCorrect) {
        this.quizId = quizId;
        this.quizAttemptId = quizAttemptId;
        this.selectedAnswer = selectedAnswer;
        this.isCorrect = isCorrect;
    }

    public long getQuizId() {
        return quizId;
    }

    public long getQuizAttemptId(){
        return quizAttemptId;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public boolean getIsCorrect() {
        return isCorrect;
    }
}
