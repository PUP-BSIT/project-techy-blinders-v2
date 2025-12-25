package com.mindstack.mind_stack_id.repositories;

import com.mindstack.mind_stack_id.models.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByOtp(String otp);
    Optional<PasswordResetToken> findByUserId(Long userId);
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
