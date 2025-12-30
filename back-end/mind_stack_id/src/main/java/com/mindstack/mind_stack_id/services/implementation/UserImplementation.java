package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mindstack.mind_stack_id.models.dto.UserDTO;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.repositories.UserRepository;
import com.mindstack.mind_stack_id.services.UserService;

@Service
public class UserImplementation implements UserService {
    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserDTO> getAllUsers() {
        return repo.findAll()
                .stream()
                .map(f -> new UserDTO(
                        f.getUsername(),
                        f.getUserId(),
                        f.getEmail()))
                .toList();
    }

    @Override
    public User createUser(User user) {
        // check if email already exists
        if (repo.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already in use");
        }
        long randomDigits = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        user.setUserId(randomDigits);

        String plainPassword = user.getPassword().trim();
        String hash = passwordEncoder.encode(plainPassword);
        user.setPassword(hash);

        return repo.save(user);
    }

    @Override
    public User findUserById(Long userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public User updatePassword(Long userId, String currentPassword, String newPassword) {
        User user = repo.findByUserId(userId);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(currentPassword.trim(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        String hashedPassword = passwordEncoder.encode(newPassword.trim());
        user.setPassword(hashedPassword);
        user.setUpdateAt(LocalDateTime.now());

        return repo.save(user);
    }

    @Override
    public User updateEmail(Long userId, String newEmail) {
        User user = repo.findByUserId(userId);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (newEmail == null || !isValidEmail(newEmail)) {
            throw new RuntimeException("Invalid email format");
        }

        User existingUser = repo.findByEmail(newEmail);
        if (existingUser != null && existingUser.getUserId() != userId) {
            throw new RuntimeException("Email already in use");
        }

        user.setEmail(newEmail);
        user.setUpdateAt(LocalDateTime.now());

        return repo.save(user);
    }

    // @Override
    // public User updateUsername(Long userId, String newUsername) {
    // User user = repo.findByUserId(userId);

    // if (user == null) {
    // throw new RuntimeException("User not found");
    // }

    // if (newUsername == null || newUsername.trim().isEmpty()) {
    // throw new RuntimeException("Username cannot be empty");
    // }

    // if (newUsername.trim().length() < 3) {
    // throw new RuntimeException("Username must be at least 3 characters long");
    // }

    // if (newUsername.trim().length() > 50) {
    // throw new RuntimeException("Username cannot exceed 50 characters");
    // }

    // user.setUsername(newUsername.trim());
    // user.setUpdateAt(LocalDateTime.now());

    // return repo.save(user);
    // }

    @Override
    public User resetPasswordByEmail(String email, String newPassword) {
        User user = repo.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("Email not found in our system");
        }

        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        // Update password
        String hashedPassword = passwordEncoder.encode(newPassword.trim());
        user.setPassword(hashedPassword);
        user.setUpdateAt(LocalDateTime.now());

        return repo.save(user);
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }
}