package com.mindstack.mind_stack_id.repositories;
import org.springframework.data.jpa.repository.JpaRepository;

import com.mindstack.mind_stack_id.Models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserId(long userId);
}
