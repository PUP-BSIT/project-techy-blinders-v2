package com.mindstack.mind_stack_id.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import com.mindstack.mind_stack_id.config.GoogleAiConfig;
import com.mindstack.mind_stack_id.models.dto.GoogleAiRequest;
import com.mindstack.mind_stack_id.models.dto.GoogleAiResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.ArrayList;

@Service
public class QuestionSuggestionService {
    
    private final RestTemplate restTemplate;
    private final GoogleAiConfig config;
    
    public QuestionSuggestionService(RestTemplate restTemplate, GoogleAiConfig config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }
    
    public List<String> generateQuestions(String title, String description) {
        String prompt = buildPrompt(title, description);
        
        try {
            // Use URL directly without query parameter
            String url = config.getApiUrl();
            
            // Add API key in header (x-goog-api-key) as per Google AI Studio format
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("x-goog-api-key", config.getApiKey());
            
            GoogleAiRequest request = new GoogleAiRequest(prompt);
            HttpEntity<GoogleAiRequest> entity = new HttpEntity<>(request, headers);
            
            System.out.println("Calling Google AI API: " + url);
            
            ResponseEntity<GoogleAiResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                GoogleAiResponse.class
            );
            
            System.out.println("Response received successfully!");
            
            return parseQuestions(response.getBody());
            
        } catch (HttpClientErrorException e) {
            System.err.println("Google AI API Error: " + e.getStatusCode());
            System.err.println("Response Body: " + e.getResponseBodyAsString());
            
            // Handle specific HTTP errors
            if (e.getStatusCode().value() == 403) {
                throw new RuntimeException("API Key is invalid or Generative Language API is not enabled. Check Google AI Studio settings.");
            } else if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("Rate limit exceeded. Free tier allows 15 requests per minute. Please try again later.");
            } else if (e.getStatusCode().value() == 400) {
                throw new RuntimeException("Bad request to Google AI API. Check your request format.");
            }
            
            throw new RuntimeException("Google AI API error (" + e.getStatusCode() + "): " + e.getMessage());
            
        } catch (Exception e) {
            System.err.println("Unexpected error calling Google AI API:");
            e.printStackTrace();
            throw new RuntimeException("Error calling Google AI API: " + e.getMessage(), e);
        }
    }
    
    private String buildPrompt(String title, String description) {
        // Optimized prompt for free tier - concise to save tokens
        return String.format(
            "Generate 5 questions users might ask about:\n" +
            "Title: %s\n" +
            "Description: %s\n\n" +
            "Format: numbered list 1-5",
            title, description
        );
    }
    
    private List<String> parseQuestions(GoogleAiResponse response) {
        List<String> questions = new ArrayList<>();
        
        if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
            String text = response.getCandidates().get(0)
                .getContent()
                .getParts()
                .get(0)
                .getText();
            
            System.out.println("AI Generated Text: " + text);
            
            // Parse the numbered questions from response
            String[] lines = text.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (line.matches("^\\d+\\..*")) {
                    // Remove the number prefix
                    questions.add(line.replaceFirst("^\\d+\\.\\s*", ""));
                }
            }
        }
        
        return questions;
    }
}