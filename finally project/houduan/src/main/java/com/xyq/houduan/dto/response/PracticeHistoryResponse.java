package com.xyq.houduan.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.xyq.houduan.entity.PracticeHistory.PracticeType;

/**
 * 练习历史响应DTO
 */
public class PracticeHistoryResponse {
    
    private Long id;
    private Long userId;
    private LocalDate date;
    private String type;
    private String name;
    private String title;
    private Integer duration;
    private String description;
    private String tags;
    private String audio;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public PracticeHistoryResponse() {}
    
    public PracticeHistoryResponse(Long id, Long userId, LocalDate date, String type, String name, 
                                  Integer duration, String description, String tags, LocalDateTime timestamp,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.type = type;
        this.name = name;
        this.duration = duration;
        this.description = description;
        this.tags = tags;
        this.timestamp = timestamp;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // 从PracticeType枚举转换
    public void setTypeFromEnum(PracticeType typeEnum) {
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
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
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
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAudio() {
        return audio;
    }
    
    public void setAudio(String audio) {
        this.audio = audio;
    }
}
