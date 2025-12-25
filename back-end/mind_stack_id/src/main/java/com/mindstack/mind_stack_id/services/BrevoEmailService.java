package com.mindstack.mind_stack_id.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class BrevoEmailService {
    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public void sendOtpEmail(String toEmail, String otp) {
        String url = "https://api.brevo.com/v3/smtp/email";
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        Map<String, String> sender = new HashMap<>();
        sender.put("email", senderEmail);
        sender.put("name", senderName);
        body.put("sender", sender);
        body.put("to", new Map[]{new HashMap<String, String>() {{ put("email", toEmail); }}});
        body.put("subject", "Password Reset OTP");
        body.put("htmlContent", "<p>Your OTP for password reset is: <strong>" + otp + "</strong>. This OTP will expire in 10 minutes.</p>");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }
}
