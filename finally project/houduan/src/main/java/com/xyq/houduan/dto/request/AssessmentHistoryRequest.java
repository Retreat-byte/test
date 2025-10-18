package com.xyq.houduan.dto.request;

import com.xyq.houduan.entity.AssessmentHistory.AssessmentType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 测评历史请求DTO
 */
public class AssessmentHistoryRequest {
    
    @NotNull(message = "测评类型不能为空")
    private AssessmentType type;
    
    @NotBlank(message = "测评名称不能为空")
    @Size(max = 100, message = "测评名称长度不能超过100个字符")
    private String name;
    
    @NotNull(message = "测评分数不能为空")
    @Min(value = 0, message = "测评分数不能小于0")
    @Max(value = 100, message = "测评分数不能大于100")
    private Integer score;
    
    @Size(max = 1000, message = "测评结果长度不能超过1000个字符")
    private String result;
    
    @Size(max = 500, message = "测评描述长度不能超过500个字符")
    private String description;
    
    @Size(max = 200, message = "标签长度不能超过200个字符")
    private String tags;
    
    public AssessmentHistoryRequest() {}
    
    public AssessmentHistoryRequest(AssessmentType type, String name, Integer score, String result, String description, String tags) {
        this.type = type;
        this.name = name;
        this.score = score;
        this.result = result;
        this.description = description;
        this.tags = tags;
    }
    
    // Getters and Setters
    public AssessmentType getType() {
        return type;
    }
    
    public void setType(AssessmentType type) {
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
    
    public String getLevel() {
        // 这个方法可能用于获取测评等级，暂时返回null或根据需求实现
        return null;
    }
    
    public String getAnalysis() {
        // 这个方法可能用于获取分析结果，暂时返回null或根据需求实现
        return null;
    }
    
    public String getFactorScores() {
        // 这个方法可能用于获取因子分数，暂时返回null或根据需求实现
        return null;
    }
    
    public String getDate() {
        // 这个方法可能用于获取日期，暂时返回null或根据需求实现
        return null;
    }
    
    public String getTimestamp() {
        // 这个方法可能用于获取时间戳，暂时返回null或根据需求实现
        return null;
    }
}
