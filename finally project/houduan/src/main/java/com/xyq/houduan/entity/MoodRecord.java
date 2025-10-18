package com.xyq.houduan.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 心情记录实体类
 */
@Data
@Entity
@Table(name = "mood_records", 
    indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_date", columnList = "date"),
        @Index(name = "idx_mood", columnList = "mood"),
        @Index(name = "idx_value", columnList = "value"),
        @Index(name = "idx_deleted", columnList = "deleted")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_date", columnNames = {"userId", "date"})
    }
)
@EqualsAndHashCode(callSuper = true)
public class MoodRecord extends BaseEntity {

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
     * 心情文字
     */
    @NotBlank(message = "心情不能为空")
    @Column(name = "mood", nullable = false, length = 20)
    private String mood;

    /**
     * 心情分数(1-10)
     */
    @NotNull(message = "心情分数不能为空")
    @Min(value = 1, message = "心情分数不能小于1")
    @Max(value = 10, message = "心情分数不能大于10")
    @Column(name = "value", nullable = false)
    private Integer value;

    /**
     * 打卡日期
     */
    @NotNull(message = "打卡日期不能为空")
    @Column(name = "date", nullable = false)
    private LocalDate date;

    /**
     * 打卡时间
     */
    @NotNull(message = "打卡时间不能为空")
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    /**
     * 用户关联
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * 心情枚举
     */
    public enum MoodType {
        SAD("悲伤", 1),
        ANGRY("生气", 2),
        SORROWFUL("难过", 3),
        AWKWARD("尴尬", 4),
        NERVOUS("紧张", 5),
        CALM("平静", 6),
        SMILE("微笑", 8),
        HAPPY("开心", 10);

        private final String description;
        private final Integer score;

        MoodType(String description, Integer score) {
            this.description = description;
            this.score = score;
        }

        public String getDescription() {
            return description;
        }

        public Integer getScore() {
            return score;
        }

        /**
         * 根据描述获取心情类型
         */
        public static MoodType fromDescription(String description) {
            for (MoodType type : values()) {
                if (type.description.equals(description)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("未知的心情类型: " + description);
        }

        /**
         * 根据分数获取心情类型
         */
        public static MoodType fromScore(Integer score) {
            for (MoodType type : values()) {
                if (type.score.equals(score)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("未知的心情分数: " + score);
        }
    }
}
