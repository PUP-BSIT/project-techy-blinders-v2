package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.LoginRequest;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.dto.UserDTO;
import com.mindstack.mind_stack_id.services.UserService;

import com.mindstack.mind_stack_id.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.mindstack.mind_stack_id.security.JwtUtil;
import java.util.HashMap;
import org.springframework.security.core.Authentication;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<>() {{
            put("account_successfully_created", true);
            put("user_id", createdUser.getUserId());
        }});
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

        return ResponseEntity.ok(new HashMap<>() {{
            put("token", token);
            put("userId", user.getUserId());
            put("username", user.getUsername());
            put("email", user.getEmail());
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
                request.getNewPassword()
            );
            
            return ResponseEntity.ok(new HashMap<>() {{
                put("success", true);
                put("message", "Password updated successfully");
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new HashMap<>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
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
            
            return ResponseEntity.ok(new HashMap<>() {{
                put("success", true);
                put("message", "Email updated successfully");
                put("token", newToken);
                put("email", updatedUser.getEmail());
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new HashMap<>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // @PutMapping("/update-username")
    // public ResponseEntity<?> updateUsername(
    //         @RequestBody UsernameUpdateRequest request,
    //         Authentication auth) {
    //     try {
    //         String email = auth.getName();
    //         User user = repo.findByEmail(email);
            
    //         if (user == null) {
    //             return ResponseEntity.status(404).body("User not found");
    //         }
            
    //         User updatedUser = userService.updateUsername(user.getUserId(), request.getNewUsername());
            
    //         return ResponseEntity.ok(new HashMap<>() {{
    //             put("success", true);
    //             put("message", "Username updated successfully");
    //             put("username", updatedUser.getUsername());
    //         }});
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.status(400).body(new HashMap<>() {{
    //             put("success", false);
    //             put("message", e.getMessage());
    //         }});
    //     }
    // }
    
    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;
        
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
    
    public static class EmailUpdateRequest {
        private String newEmail;
        
        public String getNewEmail() { return newEmail; }
        public void setNewEmail(String newEmail) { this.newEmail = newEmail; }
    }

    // public static class UsernameUpdateRequest {
    //     private String newUsername;
        
    //     public String getNewUsername() { return newUsername; }
    //     public void setNewUsername(String newUsername) { this.newUsername = newUsername; }
    // }
}