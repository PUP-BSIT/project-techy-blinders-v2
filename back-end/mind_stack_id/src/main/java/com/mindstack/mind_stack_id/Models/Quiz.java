package com.mindstack.mind_stack_id.models;

import jakarta.persistence.*;

@Entity
@Table(name = "tbl_quiz")
public class Quiz {
    
    @Id
    @Column(name = "quiz_id")
    private Long quizId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_set_id", nullable = false)
    private QuizSet quizSet;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "quiz_type")
    private QuizType quizType;
    
    @Column(name = "question")
    private String question;
    
    @Column(name = "option_a")
    private String optionA;
    
    @Column(name = "option_b")
    private String optionB;
    
    @Column(name = "option_c")
    private String optionC;
    
    @Column(name = "option_d")
    private String optionD;
    
    @Column(name = "correct_answer")
    private String correctAnswer;
    
    @Column(name = "identification_answer")
    private String identificationAnswer;
    
    @Column(name = "selected_answer")
    private String selectedAnswer;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points")
    private Integer points;
    
    public Quiz() {}
    
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public QuizSet getQuizSet() {
        return quizSet;
    }
    
    public void setQuizSet(QuizSet quizSet) {
        this.quizSet = quizSet;
    }
    
    public Long getQuizSetId() {
        return quizSet != null ? quizSet.getQuizSetId() : null;
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

    public Integer getPoints() {
        return points != null ? points : 1;
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
}