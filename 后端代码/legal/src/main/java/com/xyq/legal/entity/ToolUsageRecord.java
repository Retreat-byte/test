package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tool_usage_records", indexes = {
    @Index(name = "idx_user_tool", columnList = "user_id, tool_type"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class ToolUsageRecord extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "tool_type", nullable = false, length = 50)
    private String toolType;
    
    @Column(name = "tool_name", length = 100)
    private String toolName;
    
    @Type(JsonType.class)
    @Column(name = "input_data", columnDefinition = "json")
    private Map<String, Object> inputData;
    
    @Type(JsonType.class)
    @Column(name = "result_data", columnDefinition = "json")
    private Map<String, Object> resultData;
}

