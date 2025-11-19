package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_phone", columnList = "phone"),
    @Index(name = "idx_status", columnList = "status")
})
public class User extends BaseEntity {
    
    @Column(unique = true, nullable = false, length = 11)
    private String phone;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(length = 50)
    private String nickname;
    
    @Column(length = 500)
    private String avatar;
    
    @Column(length = 100)
    private String email;
    
    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender = Gender.UNKNOWN;
    
    @Column(nullable = false)
    private Integer status = 1; // 1-正常，0-禁用
    
    // 关联关系
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversations;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;
    
    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }
}

