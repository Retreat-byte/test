package com.xyq.houduan.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户成就实体类
 */
@Data
@Entity
@Table(name = "user_achievements",
    indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_achievement_id", columnList = "achievementId"),
        @Index(name = "idx_unlocked_date", columnList = "unlockedDate")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_achievement", columnNames = {"userId", "achievementId"})
    }
)
@EqualsAndHashCode(callSuper = true)
public class UserAchievement extends BaseEntity {

    /**
     * 记录ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 成就ID
     */
    @NotBlank(message = "成就ID不能为空")
    @Column(name = "achievement_id", nullable = false, length = 50)
    private String achievementId;

    /**
     * 解锁日期
     */
    @NotNull(message = "解锁日期不能为空")
    @Column(name = "unlocked_date", nullable = false)
    private LocalDate unlockedDate;

    /**
     * 用户关联
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * 成就类型枚举
     */
    public enum AchievementType {
        FIRST_CHECKIN("first_checkin", "初心者", "完成第一次打卡", "fa-heart", "purple"),
        STREAK_7("streak_7", "坚持者", "连续打卡7天", "fa-calendar-check", "blue"),
        PRACTICE_10("practice_10", "呼吸大师", "完成10次呼吸练习", "fa-wind", "green"),
        MEDITATION_60("meditation_60", "冥想达人", "累计冥想60分钟", "fa-om", "purple"),
        STREAK_30("streak_30", "情绪管理师", "连续打卡30天", "fa-trophy", "blue"),
        ASSESSMENT_5("assessment_5", "心理探索者", "完成5项测评", "fa-star", "green"),
        CHECKIN_50("checkin_50", "情绪记录家", "累计打卡50天", "fa-book", "blue"),
        ASSESSMENT_10("assessment_10", "自我认知者", "完成10项测评", "fa-brain", "purple"),
        PRACTICE_50("practice_50", "正念修行者", "完成50次练习", "fa-spa", "green");

        private final String code;
        private final String name;
        private final String description;
        private final String icon;
        private final String color;

        AchievementType(String code, String name, String description, String icon, String color) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.icon = icon;
            this.color = color;
        }

        public String getCode() {
            return code;
        }

        public String getName() {
            return name;
        }

        public String getDescription() {
            return description;
        }

        public String getIcon() {
            return icon;
        }

        public String getColor() {
            return color;
        }

        /**
         * 根据代码获取成就类型
         */
        public static AchievementType fromCode(String code) {
            for (AchievementType type : values()) {
                if (type.code.equals(code)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("未知的成就类型: " + code);
        }
    }
}
