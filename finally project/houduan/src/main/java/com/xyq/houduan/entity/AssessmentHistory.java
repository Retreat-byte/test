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
 * 测评历史实体类
 */
@Data
@Entity
@Table(name = "assessment_history",
    indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_type", columnList = "type"),
        @Index(name = "idx_date", columnList = "date"),
        @Index(name = "idx_score", columnList = "score"),
        @Index(name = "idx_deleted", columnList = "deleted")
    }
)
@EqualsAndHashCode(callSuper = true)
public class AssessmentHistory extends BaseEntity {

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
     * 测评类型
     */
    @NotNull(message = "测评类型不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, 
        columnDefinition = "ENUM('apeskPstr','sas','sds','bai','psqi','dass21','scl90')")
    private AssessmentType type;

    /**
     * 测评名称
     */
    @NotBlank(message = "测评名称不能为空")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 测评分数
     */
    @NotNull(message = "测评分数不能为空")
    @Min(value = 0, message = "测评分数不能为负数")
    @Column(name = "score", nullable = false)
    private Integer score;

    /**
     * 结果等级
     */
    @Column(name = "level", length = 100)
    private String level;

    /**
     * 结果分析
     */
    @Column(name = "analysis", columnDefinition = "TEXT")
    private String analysis;

    /**
     * 因子分数(JSON格式,用于SCL-90、DASS-21等)
     */
    @Column(name = "factor_scores", columnDefinition = "JSON")
    private String factorScores;

    /**
     * 测评日期
     */
    @NotNull(message = "测评日期不能为空")
    @Column(name = "date", nullable = false)
    private LocalDate date;

    /**
     * 测评时间
     */
    @NotNull(message = "测评时间不能为空")
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    /**
     * 用户关联
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * 测评类型枚举
     */
    public enum AssessmentType {
        APESK_PSTR("apeskPstr", "APESK-PSTR 心理压力量表", 0, 200),
        SAS("sas", "SAS 焦虑自评量表", 20, 80),
        SDS("sds", "SDS 抑郁自评量表", 20, 80),
        BAI("bai", "BAI 贝克焦虑测试", 0, 63),
        PSQI("psqi", "PSQI 匹兹堡睡眠质量指数", 0, 21),
        DASS21("dass21", "DASS-21 抑郁焦虑压力量表", 0, 63),
        SCL90("scl90", "SCL-90 心理健康自评量表", 90, 450);

        private final String code;
        private final String description;
        private final Integer minScore;
        private final Integer maxScore;

        AssessmentType(String code, String description, Integer minScore, Integer maxScore) {
            this.code = code;
            this.description = description;
            this.minScore = minScore;
            this.maxScore = maxScore;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }

        public Integer getMinScore() {
            return minScore;
        }

        public Integer getMaxScore() {
            return maxScore;
        }

        /**
         * 根据代码获取测评类型
         */
        public static AssessmentType fromCode(String code) {
            for (AssessmentType type : values()) {
                if (type.code.equals(code)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("未知的测评类型: " + code);
        }

        /**
         * 验证分数是否在有效范围内
         */
        public boolean isValidScore(Integer score) {
            return score != null && score >= minScore && score <= maxScore;
        }
    }
}
