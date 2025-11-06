package com.mindstack.mind_stack_id.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.Models.User;
import com.mindstack.mind_stack_id.repositories.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getUsers() {
        return repo.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        long randomDigits = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        user.setUserId(randomDigits);

        String hash = passwordEncoder.encode(user.getPassword());
        user.setPassword(hash);

        user.setDate(LocalDateTime.now());
        user.setUpdateAt(LocalDateTime.now());
        return repo.save(user);
    }
    
}
