package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.xyq.houduan.entity.PracticeHistory.PracticeType;

/**
 * 练习历史请求DTO
 */
public class PracticeHistoryRequest {
    
    @NotNull(message = "练习类型不能为空")
    private PracticeType type;
    
    @NotBlank(message = "练习名称不能为空")
    @Size(max = 100, message = "练习名称长度不能超过100个字符")
    private String name;
    
    @NotNull(message = "练习时长不能为空")
    @Min(value = 1, message = "练习时长必须大于0")
    private Integer duration;
    
    @Size(max = 500, message = "练习描述长度不能超过500个字符")
    private String description;
    
    @Size(max = 200, message = "标签长度不能超过200个字符")
    private String tags;
    
    private String title;
    private String audio;
    private String date;
    private String timestamp;
    
    public PracticeHistoryRequest() {}
    
    public PracticeHistoryRequest(PracticeType type, String name, Integer duration, String description, String tags) {
        this.type = type;
        this.name = name;
        this.duration = duration;
        this.description = description;
        this.tags = tags;
    }
    
    // Getters and Setters
    public PracticeType getType() {
        return type;
    }
    
    public void setType(PracticeType type) {
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
