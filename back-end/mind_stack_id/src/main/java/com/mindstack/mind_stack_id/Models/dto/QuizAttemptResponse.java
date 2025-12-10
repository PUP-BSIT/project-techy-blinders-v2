    package com.mindstack.mind_stack_id.models.dto;

    import java.time.LocalDateTime;
    import java.util.List;

    public class QuizAttemptResponse {
        private Long attemptId;
        private Long quizSetId;
        private Long userId;
        private String quizSetTitle;
        private LocalDateTime attemptedDate;
        private Integer totalScore;
        private Integer maxScore;
        private Double percentage;
        private List<QuizResultDTO> results;
        
        public QuizAttemptResponse() {}
        
        public Long getAttemptId() {
            return attemptId;
        }
        
        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }
        
        public Long getQuizSetId() {
            return quizSetId;
        }
        
        public void setQuizSetId(Long quizSetId) {
            this.quizSetId = quizSetId;
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        
        public String getQuizSetTitle() {
            return quizSetTitle;
        }
        
        public void setQuizSetTitle(String quizSetTitle) {
            this.quizSetTitle = quizSetTitle;
        }
        
        public LocalDateTime getAttemptedDate() {
            return attemptedDate;
        }
        
        public void setAttemptedDate(LocalDateTime attemptedDate) {
            this.attemptedDate = attemptedDate;
        }
        
        public Integer getTotalScore() {
            return totalScore;
        }
        
        public void setTotalScore(Integer totalScore) {
            this.totalScore = totalScore;
        }
        
        public Integer getMaxScore() {
            return maxScore;
        }
        
        public void setMaxScore(Integer maxScore) {
            this.maxScore = maxScore;
        }
        
        public Double getPercentage() {
            return percentage;
        }
        
        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }
        
        public List<QuizResultDTO> getResults() {
            return results;
        }
        
        public void setResults(List<QuizResultDTO> results) {
            this.results = results;
        }
    }