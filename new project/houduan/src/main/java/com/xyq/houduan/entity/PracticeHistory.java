package com.xyq.houduan.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 练习历史实体类
 */
@Data
@Entity
@Table(name = "practice_history",
    indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_type", columnList = "type"),
        @Index(name = "idx_date", columnList = "date"),
        @Index(name = "idx_duration", columnList = "duration"),
        @Index(name = "idx_deleted", columnList = "deleted")
    }
)
@EqualsAndHashCode(callSuper = true)
public class PracticeHistory extends BaseEntity {

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
     * 练习类型
     */
    @NotNull(message = "练习类型不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, columnDefinition = "ENUM('breathing','meditation','relaxation')")
    private PracticeType type;

    /**
     * 练习名称
     */
    @NotBlank(message = "练习名称不能为空")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 练习标题
     */
    @Column(name = "title", length = 100)
    private String title;

    /**
     * 练习描述
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * 持续时长(秒)
     */
    @NotNull(message = "持续时长不能为空")
    @Min(value = 1, message = "持续时长至少为1秒")
    @Column(name = "duration", nullable = false)
    private Integer duration;

    /**
     * 音频文件路径(仅冥想类型需要)
     */
    @Column(name = "audio", length = 255)
    private String audio;

    /**
     * 练习日期
     */
    @NotNull(message = "练习日期不能为空")
    @Column(name = "date", nullable = false)
    private LocalDate date;

    /**
     * 练习时间
     */
    @NotNull(message = "练习时间不能为空")
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    /**
     * 用户关联
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * 练习类型枚举
     */
    public enum PracticeType {
        breathing("breathing", "正念呼吸"),
        meditation("meditation", "冥想音频"),
        relaxation("relaxation", "放松练习");

        private final String code;
        private final String description;

        PracticeType(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }

        /**
         * 根据代码获取练习类型
         */
        public static PracticeType fromCode(String code) {
            for (PracticeType type : values()) {
                if (type.code.equals(code)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("未知的练习类型: " + code);
        }
    }
}
