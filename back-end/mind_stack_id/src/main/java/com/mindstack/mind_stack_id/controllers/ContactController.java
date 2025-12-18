package com.mindstack.mind_stack_id.controllers;

import com.mindstack.mind_stack_id.models.dto.ContactRequest;
import com.mindstack.mind_stack_id.services.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submitContactForm(
            @Valid @RequestBody ContactRequest contactRequest) {
        try {
            emailService.sendContactEmail(contactRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Your message has been sent successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to send message. Please try again later.");
            return ResponseEntity.status(500).body(response);
        }
    }
}