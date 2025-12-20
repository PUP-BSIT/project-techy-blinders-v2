package com.mindstack.mind_stack_id.models.dto;
import java.util.List;

public class GoogleAiRequest {
    private List<Content> contents;
    
    public GoogleAiRequest(String prompt) {
        this.contents = List.of(new Content(List.of(new Part(prompt))));
    }
    
    public List<Content> getContents() {
        return contents;
    }
    
    public static class Content {
        private List<Part> parts;
        
        public Content(List<Part> parts) {
            this.parts = parts;
        }
        
        public List<Part> getParts() {
            return parts;
        }
    }
    
    public static class Part {
        private String text;
        
        public Part(String text) {
            this.text = text;
        }
        
        public String getText() {
            return text;
        }
    }
}