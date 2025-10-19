package com.xyq.houduan.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户成就响应DTO
 */
public class UserAchievementResponse {
    
    private Long id;
    private Long userId;
    private String achievementId;
    private String name;
    private String description;
    private String icon;
    private LocalDate unlockedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public UserAchievementResponse() {}
    
    public UserAchievementResponse(Long id, Long userId, String achievementId, String name, 
                                   String description, String icon, LocalDate unlockedDate,
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.achievementId = achievementId;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.unlockedDate = unlockedDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    
    public String getAchievementId() {
        return achievementId;
    }
    
    public void setAchievementId(String achievementId) {
        this.achievementId = achievementId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public LocalDate getUnlockedDate() {
        return unlockedDate;
    }
    
    public void setUnlockedDate(LocalDate unlockedDate) {
        this.unlockedDate = unlockedDate;
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
}
