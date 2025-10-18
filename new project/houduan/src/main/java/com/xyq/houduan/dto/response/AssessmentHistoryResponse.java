package com.xyq.houduan.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.xyq.houduan.entity.AssessmentHistory.AssessmentType;

/**
 * 测评历史响应DTO
 */
public class AssessmentHistoryResponse {
    
    private Long id;
    private Long userId;
    private LocalDate date;
    private String type;
    private String name;
    private Integer score;
    private String result;
    private String description;
    private String tags;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public AssessmentHistoryResponse() {}
    
    public AssessmentHistoryResponse(Long id, Long userId, LocalDate date, String type, String name, 
                                    Integer score, String result, String description, String tags, 
                                    LocalDateTime timestamp, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.type = type;
        this.name = name;
        this.score = score;
        this.result = result;
        this.description = description;
        this.tags = tags;
        this.timestamp = timestamp;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // 从AssessmentType枚举转换
    public void setTypeFromEnum(AssessmentType typeEnum) {
        if (typeEnum != null) {
            this.type = typeEnum.getCode();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getScore() {
        return score;
    }
    
    public void setScore(Integer score) {
        this.score = score;
    }
    
    public String getResult() {
        return result;
    }
    
    public void setResult(String result) {
        this.result = result;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getTags() {
        return tags;
    }
    
    public void setTags(String tags) {
        this.tags = tags;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public void setLevel(String level) {
        // 这个方法可能用于设置测评等级，暂时留空或根据需求实现
    }
    
    public void setAnalysis(String analysis) {
        // 这个方法可能用于设置分析结果，暂时留空或根据需求实现
    }
    
    public void setFactorScores(String factorScores) {
        // 这个方法可能用于设置因子分数，暂时留空或根据需求实现
    }
}
