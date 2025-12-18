package com.mindstack.mind_stack_id.services;

import com.mindstack.mind_stack_id.models.dto.ContactRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${app.contact.recipient-email}")
    private String recipientEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendContactEmail(ContactRequest contactRequest) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("Contact Form Submission from " + contactRequest.getName());
        message.setText(
            "Name: " + contactRequest.getName() + "\n" +
            "Email: " + contactRequest.getEmail() + "\n" +
            "Message: \n" + contactRequest.getMessage()
        );
        message.setReplyTo(contactRequest.getEmail());
        
        mailSender.send(message);
    }
}