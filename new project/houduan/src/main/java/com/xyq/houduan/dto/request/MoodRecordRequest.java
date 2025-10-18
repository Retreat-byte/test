package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 心情记录请求DTO
 */
public class MoodRecordRequest {
    
    @NotNull(message = "心情分数不能为空")
    @Min(value = 1, message = "心情分数不能小于1")
    @Max(value = 10, message = "心情分数不能大于10")
    private Integer value;
    
    @NotBlank(message = "心情类型不能为空")
    @Size(max = 50, message = "心情类型长度不能超过50个字符")
    private String mood;
    
    @Size(max = 500, message = "心情描述长度不能超过500个字符")
    private String description;
    
    @Size(max = 200, message = "标签长度不能超过200个字符")
    private String tags;
    
    private String date;
    
    private String timestamp;
    
    public MoodRecordRequest() {}
    
    public MoodRecordRequest(Integer value, String mood, String description, String tags) {
        this.value = value;
        this.mood = mood;
        this.description = description;
        this.tags = tags;
    }
    
    // Getters and Setters
    public Integer getValue() {
        return value;
    }
    
    public void setValue(Integer value) {
        this.value = value;
    }
    
    public String getMood() {
        return mood;
    }
    
    public void setMood(String mood) {
        this.mood = mood;
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
    
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
