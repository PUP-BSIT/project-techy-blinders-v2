package com.mindstack.mind_stack_id.models.dto;

import com.mindstack.mind_stack_id.models.QuizType;

public class QuizItemRequest {
    private QuizType quizType;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String identificationAnswer;
    private Integer points;

    public QuizItemRequest() {}
    
    public QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizType quizType) {
        this.quizType = quizType;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
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
    
    public String getCorrectAnswer() {
        return correctAnswer;
    }
    
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
    
    public String getIdentificationAnswer() {
        return identificationAnswer;
    }
    
    public void setIdentificationAnswer(String identificationAnswer) {
        this.identificationAnswer = identificationAnswer;
    }

        public Integer getPoints() {
        return points != null ? points : 1; 
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
}
