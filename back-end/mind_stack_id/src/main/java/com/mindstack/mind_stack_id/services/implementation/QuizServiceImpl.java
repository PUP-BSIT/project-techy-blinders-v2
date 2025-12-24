package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindstack.mind_stack_id.models.Quiz;
import com.mindstack.mind_stack_id.models.QuizSet;
import com.mindstack.mind_stack_id.models.dto.CreateQuizSetRequest;
import com.mindstack.mind_stack_id.models.dto.QuizItemDTO;
import com.mindstack.mind_stack_id.models.dto.QuizItemRequest;
import com.mindstack.mind_stack_id.models.dto.QuizResponseDTO;
import com.mindstack.mind_stack_id.models.dto.QuizSetResponse;
import com.mindstack.mind_stack_id.repositories.QuizSetRepository;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.services.QuizService;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizSetRepository quizSetRepository;

    @Autowired
    private PostRepository postRepository;

    @Override
    @Transactional
    public QuizSetResponse createQuizSet(CreateQuizSetRequest request) {
        long quizSetId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);

        QuizSet quizSet = new QuizSet();
        quizSet.setQuizSetId(quizSetId);
        quizSet.setUserId(request.getUserId());
        quizSet.setTitle(request.getTitle());
        quizSet.setDescription(request.getDescription());
        quizSet.setPublic(request.isPublic());
        quizSet.setQuizType(request.getQuizType());

        String slug = generateSlug(request.getTitle(), quizSetId);
        quizSet.setSlug(slug);

        LocalDateTime now = LocalDateTime.now();
        quizSet.setCreatedAt(now);
        quizSet.setUpdatedAt(now);

        if (request.getQuizzes() != null && !request.getQuizzes().isEmpty()) {
            for (QuizItemDTO quizDTO : request.getQuizzes()) {
                long quizId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);

                Quiz quiz = new Quiz();
                quiz.setQuizId(quizId);
                quiz.setQuizType(quizDTO.getQuizType());
                quiz.setQuestion(quizDTO.getQuestion());
                quiz.setOptionA(quizDTO.getOptionA());
                quiz.setOptionB(quizDTO.getOptionB());
                quiz.setOptionC(quizDTO.getOptionC());
                quiz.setOptionD(quizDTO.getOptionD());
                quiz.setCorrectAnswer(quizDTO.getCorrectAnswer());
                quiz.setIdentificationAnswer(quizDTO.getIdentificationAnswer());
                quiz.setPoints(quizDTO.getPoints()); // ADD THIS - Set points from DTO

                quizSet.addQuiz(quiz);
            }
        }

        QuizSet savedSet = quizSetRepository.save(quizSet);

        System.out.println("Created quiz set with ID: " + savedSet.getQuizSetId());
        System.out.println("Number of quizzes: " + savedSet.getQuizzes().size());

        return convertToResponse(savedSet);
    }

    @Override
    public QuizSetResponse getQuizSetById(Long quizSetId) {
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new RuntimeException("Quiz set not found with id: " + quizSetId));

        return convertToResponse(quizSet);
    }

    @Override
    public QuizSetResponse getQuizSetBySlug(String slug) {
        QuizSet quizSet = quizSetRepository.findBySlugAndIsDeletedFalse(slug)
            .orElseThrow(() -> new RuntimeException("Quiz set not found with slug: " + slug));
        return convertToResponse(quizSet);
    }

    @Override
    public List<QuizSetResponse> getQuizSetsByUserId(Long userId) {
        List<QuizSet> quizSets = quizSetRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        return quizSets.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<QuizSetResponse> getAllPublicQuizSets() {
        List<QuizSet> quizSets = quizSetRepository.findByIsPublicTrueAndIsDeletedFalseOrderByCreatedAtDesc();
        return quizSets.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizSetResponse updateQuizSet(Long quizSetId, CreateQuizSetRequest request) {
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new RuntimeException("Quiz set not found with id: " + quizSetId));

        if (request.getTitle() != null) {
            quizSet.setTitle(request.getTitle());
            String newSlug = generateSlug(request.getTitle(), quizSetId);
            quizSet.setSlug(newSlug);
        }
        if (request.getDescription() != null) {
            quizSet.setDescription(request.getDescription());
        }
        if (request.getQuizType() != null) {
            quizSet.setQuizType(request.getQuizType());
        }
        quizSet.setPublic(request.isPublic());
        quizSet.setUpdatedAt(LocalDateTime.now());

        QuizSet updatedSet = quizSetRepository.save(quizSet);

        return convertToResponse(updatedSet);
    }

    @Override
    @Transactional
    public void deleteQuizSet(Long quizSetId) {
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
            .orElseThrow(() -> new RuntimeException("Quiz set not found with id: " + quizSetId));

        // Remove any community posts tied to this quiz set via slug prefix (e.g.,
        // quiz-{id}-...)
        deleteCommunityPostsForSlug("quiz-" + quizSetId);
        if (quizSet.getSlug() != null) {
            deleteCommunityPostsForSlug(quizSet.getSlug());
        }

        // SOFT DELETE
        quizSet.setDeleted(true);
        quizSetRepository.save(quizSet);

        System.out.println("Soft deleted quiz set with ID: " + quizSetId);
    }

    @Override
    @Transactional
    public Quiz addQuizToSet(Long quizSetId, QuizItemRequest quizRequest) {
        QuizSet quizSet = quizSetRepository.findById(quizSetId)
                .orElseThrow(() -> new RuntimeException("Quiz set not found with id: " + quizSetId));

        long quizId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);

        Quiz quiz = new Quiz();
        quiz.setQuizId(quizId);
        quiz.setQuizType(quizRequest.getQuizType());
        quiz.setQuestion(quizRequest.getQuestion());
        quiz.setOptionA(quizRequest.getOptionA());
        quiz.setOptionB(quizRequest.getOptionB());
        quiz.setOptionC(quizRequest.getOptionC());
        quiz.setOptionD(quizRequest.getOptionD());
        quiz.setCorrectAnswer(quizRequest.getCorrectAnswer());
        quiz.setIdentificationAnswer(quizRequest.getIdentificationAnswer());
        quiz.setPoints(quizRequest.getPoints()); // ADD THIS - Set points from request

        quizSet.addQuiz(quiz);

        quizSetRepository.save(quizSet);

        System.out.println("Added quiz with ID: " + quizId + " to set: " + quizSetId);

        return quiz;
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId) {
        QuizSet quizSet = quizSetRepository.findAll().stream()
                .filter(set -> set.getQuizzes().stream()
                        .anyMatch(q -> q.getQuizId().equals(quizId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));

        Quiz quizToRemove = quizSet.getQuizzes().stream()
                .filter(q -> q.getQuizId().equals(quizId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));

        quizSet.removeQuiz(quizToRemove);

        quizSetRepository.save(quizSet);

        System.out.println("Deleted quiz with ID: " + quizId);
    }

    private void deleteCommunityPostsForSlug(String slugPrefix) {
        postRepository.deleteBySlugStartingWith(slugPrefix);
        System.out.println("Deleted community posts with slug prefix: " + slugPrefix);
    }

    public int calculateTotalScore(QuizSet quizSet) {
        return quizSet.getQuizzes().stream()
                .filter(q -> Boolean.TRUE.equals(q.getIsCorrect()))
                .mapToInt(Quiz::getPoints)
                .sum();
    }

    // Helper method to get max possible score
    public int getMaxScore(QuizSet quizSet) {
        return quizSet.getQuizzes().stream()
                .mapToInt(Quiz::getPoints)
                .sum();
    }

    private String generateSlug(String title, Long quizSetId) {
        if (title == null || title.trim().isEmpty()) {
            return "quiz-set-" + quizSetId;
        }

        String baseSlug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isEmpty()) {
            baseSlug = "quiz-set";
        }

        return baseSlug + "-" + quizSetId;
    }

    private QuizSetResponse convertToResponse(QuizSet quizSet) {
        QuizSetResponse response = new QuizSetResponse();
        response.setQuizSetId(quizSet.getQuizSetId());
        response.setUserId(quizSet.getUserId());
        response.setTitle(quizSet.getTitle());
        response.setDescription(quizSet.getDescription());
        response.setPublic(quizSet.isPublic());
        response.setSlug(quizSet.getSlug());
        response.setQuizType(quizSet.getQuizType());

        List<QuizResponseDTO> quizzes = quizSet.getQuizzes().stream()
                .map(q -> new QuizResponseDTO(
                        q.getQuizId(),
                        quizSet.getQuizSetId(),
                        q.getQuizType(),
                        q.getQuestion(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD(),
                        q.getCorrectAnswer(),
                        q.getIdentificationAnswer()))
                .collect(Collectors.toList());

        response.setQuizzes(quizzes);

        return response;
    }
}