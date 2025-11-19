package com.xyq.legal.repository;

import com.xyq.legal.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, String> {
    Optional<VerificationCode> findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(
            String phone, String type, Integer used);
    
    @Modifying
    @Query("UPDATE VerificationCode v SET v.used = 1 WHERE v.phone = ?1 AND v.type = ?2 AND v.used = 0")
    void markAsUsed(String phone, String type);
}

