package com.mindstack.mind_stack_id.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.Models.LoginRequest;
import com.mindstack.mind_stack_id.Models.User;
import com.mindstack.mind_stack_id.Models.dto.UserDTO;
import com.mindstack.mind_stack_id.repositories.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserDTO> getUsers() {
        return repo.findAll()
                .stream()
                .map(f -> new UserDTO(
                        f.getUsername(),
                        f.getUserId()
                ))
                .toList();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
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

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        User user = repo.findByUserId(request.getUserId());

        if (user == null) {
            return "User not found";
        }

        System.out.println("Userfound " + user.getUserId()); // for debugging purpose 
        System.out.println("Password " + request.getPassword()); // for debugging purpose
        System.out.println("Password matches: " + passwordEncoder.matches(request.getPassword(), user.getPassword()));

        String plainPassword = request.getPassword().trim();

        if (!passwordEncoder.matches(plainPassword, user.getPassword())) {
            return "Invalid Password";
        }

        return "Login Succesful";
    }
    
}
