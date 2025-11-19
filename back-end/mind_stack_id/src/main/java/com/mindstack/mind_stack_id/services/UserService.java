package com.mindstack.mind_stack_id.services;

import java.util.List;
import com.mindstack.mind_stack_id.Models.User;
import com.mindstack.mind_stack_id.Models.dto.UserDTO;

public interface UserService {
    List<UserDTO> getAllUsers();
    User createUser(User user);
    boolean authenticateUser(Long userId, String password);
    User findUserById(Long userId);
}