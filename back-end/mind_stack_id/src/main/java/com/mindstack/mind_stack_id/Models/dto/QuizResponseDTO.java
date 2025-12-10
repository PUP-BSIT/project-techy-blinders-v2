package com.mindstack.mind_stack_id.models.dto;

import com.mindstack.mind_stack_id.models.QuizType;

public class QuizResponseDTO {
    private Long quizId;
    private Long quizSetId;
    private QuizType quizType;
    private String question;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String identificationAnswer;
    private String selectedAnswer;
    private Boolean isCorrect;
    
    public QuizResponseDTO() {}
    
    public QuizResponseDTO(Long quizId, Long quizSetId, QuizType quizType, String question,
                          String optionA, String optionB, String optionC, String optionD,
                          String correctAnswer, String identificationAnswer) {
        this.quizId = quizId;
        this.quizSetId = quizSetId;
        this.quizType = quizType;
        this.question = question;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctAnswer = correctAnswer;
        this.identificationAnswer = identificationAnswer;
    }
    
    // Getters and Setters
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public Long getQuizSetId() {
        return quizSetId;
    }
    
    public void setQuizSetId(Long quizSetId) {
        this.quizSetId = quizSetId;
    }
    
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
    
    public String getSelectedAnswer() {
        return selectedAnswer;
    }
    
    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }
    
    public Boolean getIsCorrect() {
        return isCorrect;
    }
    
    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}