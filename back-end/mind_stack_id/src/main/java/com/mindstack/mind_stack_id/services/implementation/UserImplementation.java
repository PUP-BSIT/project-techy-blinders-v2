package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mindstack.mind_stack_id.Models.dto.UserDTO;
import com.mindstack.mind_stack_id.Models.User;
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
                        f.getUserId()
                ))
                .toList();
    }

    @Override
    public User createUser(User user) {
        long randomDigits = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        user.setUserId(randomDigits);

        String plainPassword = user.getPassword().trim();
        String hash = passwordEncoder.encode(plainPassword);
        user.setPassword(hash);

        user.setDate(LocalDateTime.now());
        user.setUpdateAt(LocalDateTime.now());
        
        System.out.println("Created user with ID: " + user.getUserId());
        System.out.println("Hashed password: " + hash);
        
        return repo.save(user);
    }

    @Override
    public boolean authenticateUser(Long userId, String password) {
        User user = repo.findByUserId(userId);

        if (user == null) {
            System.out.println("User not found: " + userId);
            return false;
        }

        System.out.println("User found: " + user.getUserId());
        System.out.println("Password: " + password);
        
        String plainPassword = password.trim();
        boolean matches = passwordEncoder.matches(plainPassword, user.getPassword());
        
        System.out.println("Password matches: " + matches);
        
        return matches;
    }

    @Override
    public User findUserById(Long userId) {
        return repo.findByUserId(userId);
    }
}
