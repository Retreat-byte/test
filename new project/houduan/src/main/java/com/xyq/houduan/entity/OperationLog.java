package com.xyq.houduan.entity;

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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;


/**
 * 操作日志实体类
 */
@Data
@Entity
@Table(name = "operation_logs",
    indexes = {
        @Index(name = "idx_user_id", columnList = "userId"),
        @Index(name = "idx_operation", columnList = "operation"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "createdAt")
    }
)
@EqualsAndHashCode(callSuper = true)
public class OperationLog extends BaseEntity {

    /**
     * 日志ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * 操作类型
     */
    @NotBlank(message = "操作类型不能为空")
    @Column(name = "operation", nullable = false, length = 100)
    private String operation;

    /**
     * 操作描述
     */
    @Column(name = "description", length = 255)
    private String description;

    /**
     * IP地址
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * 用户代理
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * 请求数据
     */
    @Column(name = "request_data", columnDefinition = "JSON")
    private String requestData;

    /**
     * 响应数据
     */
    @Column(name = "response_data", columnDefinition = "JSON")
    private String responseData;

    /**
     * 操作状态
     */
    @NotNull(message = "操作状态不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('success','failure') DEFAULT 'success'")
    private OperationStatus status = OperationStatus.SUCCESS;

    /**
     * 用户关联
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    /**
     * 操作状态枚举
     */
    public enum OperationStatus {
        SUCCESS("success", "成功"),
        FAILURE("failure", "失败");

        private final String code;
        private final String description;

        OperationStatus(String code, String description) {
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
