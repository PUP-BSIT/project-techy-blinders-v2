package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.LoginRequest;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.dto.ResetPasswordRequest;
import com.mindstack.mind_stack_id.models.dto.UserDTO;
import com.mindstack.mind_stack_id.models.dto.UserProfileDTO;
import com.mindstack.mind_stack_id.services.UserService;

import com.mindstack.mind_stack_id.repositories.UserRepository;
import com.mindstack.mind_stack_id.repositories.QuizSetRepository;
import com.mindstack.mind_stack_id.repositories.FlashcardSetRepository;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.mindstack.mind_stack_id.security.JwtUtil;
import org.springframework.security.core.Authentication;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200", "https://techymindstack.site"}, allowCredentials = "true")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private QuizSetRepository quizSetRepository;

    @Autowired
    private FlashcardSetRepository flashcardSetRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private com.mindstack.mind_stack_id.repositories.PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private com.mindstack.mind_stack_id.services.BrevoEmailService brevoEmailService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        User user = userService.findUserById(userId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<>() {
                        {
                            put("success", false);
                            put("message", "User not found");
                        }
                    });
        }

        // Count user's milestones
        long quizzesCreated = quizSetRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId).size();
        long flashcardSetsCreated = flashcardSetRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId).size();

        // Count total likes on user's posts
        long totalLikes = postRepository.findByUserId(userId).stream()
                .mapToLong(post -> post.getNumLike())
                .sum();

        UserProfileDTO profileDTO = new UserProfileDTO(
                user.getUsername(),
                user.getUserId(),
                user.getEmail(),
                quizzesCreated,
                flashcardSetsCreated,
                totalLikes);

        return ResponseEntity.ok(profileDTO);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<>() {{
                put("account_successfully_created", true);
                put("user_id", createdUser.getUserId());
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new HashMap<>() {{
                put("account_successfully_created", false);
                put("error", e.getMessage());
            }});
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = repo.findByEmail(request.getEmail());

        if (user == null) {
            return ResponseEntity.status(404).body("Email not found");
        }

        boolean valid = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!valid) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new HashMap<>() {
            {
                put("token", token);
                put("userId", user.getUserId());
                put("username", user.getUsername());
                put("email", user.getEmail());
            }
        });
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody com.mindstack.mind_stack_id.models.dto.ForgotPasswordRequest request) {
        String email = request.getEmail();
        User user = repo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<>() {{
                        put("success", false);
                        put("message", "Email not found");
                    }});
        }

        // Remove any existing token for this user
        passwordResetTokenRepository.deleteByUserId(user.getUserId());

        // Generate OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        java.util.Date expiryDate = new java.util.Date(System.currentTimeMillis() + 1000 * 60 * 10); // 10 minutes expiry

        com.mindstack.mind_stack_id.models.PasswordResetToken resetToken = new com.mindstack.mind_stack_id.models.PasswordResetToken();
        resetToken.setUserId(user.getUserId());
        resetToken.setOtp(otp);
        resetToken.setExpiryDate(expiryDate);
        passwordResetTokenRepository.save(resetToken);

        // Send OTP email
        brevoEmailService.sendOtpEmail(user.getEmail(), otp);

        return ResponseEntity.ok(new HashMap<>() {{
            put("success", true);
            put("message", "Password reset link sent to email if it exists.");
        }});
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody com.mindstack.mind_stack_id.models.dto.ResetPasswordWithTokenRequest request) {
        String email = request.getEmail();
        String otp = request.getOtp();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();
        if (newPassword == null || newPassword.length() < 6 || !newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(new HashMap<>() {{
                put("success", false);
                put("message", "Passwords must match and be at least 6 characters.");
            }});
        }

        User user = repo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<>() {{
                put("success", false);
                put("message", "User not found.");
            }});
        }

        com.mindstack.mind_stack_id.models.PasswordResetToken resetToken = passwordResetTokenRepository.findByOtp(otp).orElse(null);
        if (resetToken == null || resetToken.getExpiryDate().before(new java.util.Date()) || !resetToken.getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<>() {{
                put("success", false);
                put("message", "Invalid or expired OTP.");
            }});
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        repo.save(user);

        // Invalidate token
        passwordResetTokenRepository.deleteByUserId(user.getUserId());

        return ResponseEntity.ok(new HashMap<>() {{
            put("success", true);
            put("message", "Password has been reset successfully.");
        }});
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        String email = auth.getName();
        User user = repo.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(
            @RequestBody PasswordUpdateRequest request,
            Authentication auth) {
        try {
            String email = auth.getName();
            User user = repo.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            userService.updatePassword(
                    user.getUserId(),
                    request.getCurrentPassword(),
                    request.getNewPassword());

            return ResponseEntity.ok(new HashMap<>() {
                {
                    put("success", true);
                    put("message", "Password updated successfully");
                }
            });
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new HashMap<>() {
                {
                    put("success", false);
                    put("message", e.getMessage());
                }
            });
        }
    }

    @PutMapping("/update-email")
    public ResponseEntity<?> updateEmail(
            @RequestBody EmailUpdateRequest request,
            Authentication auth) {
        try {
            String currentEmail = auth.getName();
            User user = repo.findByEmail(currentEmail);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            User updatedUser = userService.updateEmail(user.getUserId(), request.getNewEmail());

            String newToken = jwtUtil.generateToken(updatedUser.getEmail());

            return ResponseEntity.ok(new HashMap<>() {
                {
                    put("success", true);
                    put("message", "Email updated successfully");
                    put("token", newToken);
                    put("email", updatedUser.getEmail());
                }
            });
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new HashMap<>() {
                {
                    put("success", false);
                    put("message", e.getMessage());
                }
            });
        }
    }

    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class EmailUpdateRequest {
        private String newEmail;

        public String getNewEmail() {
            return newEmail;
        }

        public void setNewEmail(String newEmail) {
            this.newEmail = newEmail;
        }
    }
}