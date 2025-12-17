package com.mindstack.mind_stack_id.services;

import java.util.List;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.dto.UserDTO;

public interface UserService {
    List<UserDTO> getAllUsers();
    User createUser(User user);
    User findUserById(Long userId);
    User updatePassword(Long userId, String currentPassword, String newPassword);
    User updateEmail(Long userId, String newEmail);
    User updateUsername(Long userId, String newUsername);
}