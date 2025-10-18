package com.xyq.houduan.entity;

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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户会话实体类
 * 存储用户练习会话信息，支持正念呼吸和冥想练习的会话管理
 */
@Entity
@Table(name = "user_sessions", 
       indexes = {
           @Index(name = "idx_user_id", columnList = "user_id"),
           @Index(name = "idx_session_type", columnList = "session_type"),
           @Index(name = "idx_status", columnList = "status"),
           @Index(name = "idx_start_time", columnList = "start_time")
       },
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_session_id", columnNames = "session_id")
       })
@Data
@EqualsAndHashCode(callSuper = true)
public class UserSession extends BaseEntity {

    /**
     * 会话ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "用户ID不能为空")
    private User user;

    /**
     * 会话标识
     */
    @Column(name = "session_id", nullable = false, length = 500)
    @NotBlank(message = "会话标识不能为空")
    private String sessionId;

    /**
     * 会话类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    @NotNull(message = "会话类型不能为空")
    private SessionType sessionType;

    /**
     * 会话名称
     */
    @Column(name = "session_name", nullable = false, length = 100)
    @NotBlank(message = "会话名称不能为空")
    private String sessionName;

    /**
     * 音频文件路径
     */
    @Column(name = "audio_file", length = 255)
    private String audioFile;

    /**
     * 开始时间
     */
    @Column(name = "start_time", nullable = false)
    @NotNull(message = "开始时间不能为空")
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @Column(name = "end_time")
    private LocalDateTime endTime;

    /**
     * 持续时长(秒)
     */
    @Column(name = "duration")
    private Integer duration;

    /**
     * 会话状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @NotNull(message = "会话状态不能为空")
    private SessionStatus status = SessionStatus.ACTIVE;

    /**
     * 会话类型枚举
     */
    public enum SessionType {
        PRACTICE("练习"),
        MEDITATION("冥想"),
        BREATHING("呼吸");

        private final String description;

        SessionType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 会话状态枚举
     */
    public enum SessionStatus {
        ACTIVE("进行中"),
        COMPLETED("已完成"),
        CANCELLED("已取消");

        private final String description;

        SessionStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
