package com.xyq.houduan.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户实体类
 */
@Data
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_phone", columnList = "phone"),
    @Index(name = "idx_created_at", columnList = "createdAt"),
    @Index(name = "idx_deleted", columnList = "deleted")
})
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {

    /**
     * 用户ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 手机号
     */
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    @Column(name = "phone", nullable = false, unique = true, length = 11)
    private String phone;

    /**
     * 密码(加密)
     */
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度不能少于6位")
    @Column(name = "password", nullable = false)
    private String password;

    /**
     * 昵称
     */
    @Size(max = 50, message = "昵称长度不能超过50个字符")
    @Column(name = "nickname", length = 50)
    private String nickname = "情绪岛居民";

    /**
     * 头像URL
     */
    @Size(max = 500, message = "头像URL长度不能超过500个字符")
    @Column(name = "avatar", length = 500)
    private String avatar;

    /**
     * 性别
     */
    @Enumerated(EnumType.ORDINAL)
    @Column(name = "gender")
    private Gender gender = Gender.FEMALE;

    /**
     * 生日
     */
    @Column(name = "birthday")
    private LocalDate birthday;

    /**
     * 最后登录时间
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /**
     * 登录次数
     */
    @Column(name = "login_count")
    private Integer loginCount = 0;

    /**
     * 用户状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status = UserStatus.ACTIVE;

    /**
     * 是否启用
     */
    @Column(name = "enabled")
    private Boolean enabled = true;

    /**
     * 性别枚举
     */
    public enum Gender {
        MALE("male", "男"),
        FEMALE("female", "女"),
        OTHER("other", "其他");

        private final String code;
        private final String description;

        Gender(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 用户状态枚举
     */
    public enum UserStatus {
        ACTIVE("active", "活跃"),
        INACTIVE("inactive", "非活跃"),
        BANNED("banned", "已封禁");

        private final String code;
        private final String description;

        UserStatus(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }
}
