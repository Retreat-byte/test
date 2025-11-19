package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "verification_codes", indexes = {
    @Index(name = "idx_phone_type", columnList = "phone, type"),
    @Index(name = "idx_expired_at", columnList = "expired_at")
})
public class VerificationCode extends BaseEntity {
    
    @Column(nullable = false, length = 11)
    private String phone;
    
    @Column(nullable = false, length = 6)
    private String code;
    
    @Column(nullable = false, length = 20)
    private String type; // register/reset_password
    
    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
    
    @Column(nullable = false)
    private Integer used = 0; // 0-未使用，1-已使用
}

