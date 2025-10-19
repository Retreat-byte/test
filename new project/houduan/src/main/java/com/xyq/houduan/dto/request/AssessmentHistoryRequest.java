package com.xyq.houduan.dto.request;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 测评历史请求DTO
 */
public class AssessmentHistoryRequest {
    
    @NotBlank(message = "测评类型不能为空")
    private String type;
    
    @NotBlank(message = "测评名称不能为空")
    @Size(max = 100, message = "测评名称长度不能超过100个字符")
    private String name;
    
    @NotNull(message = "测评分数不能为空")
    @Min(value = 0, message = "测评分数不能小于0")
    private Integer score;
    
    @Size(max = 100, message = "结果等级长度不能超过100个字符")
    private String level;
    
    @Size(max = 2000, message = "结果分析长度不能超过2000个字符")
    private String analysis;
    
    @Size(max = 2000, message = "因子分数长度不能超过2000个字符")
    private String factorScores;
    
    private String date;
    
    private String timestamp;
    
    @Size(max = 1000, message = "测评结果长度不能超过1000个字符")
    private String result;
    
    @Size(max = 500, message = "测评描述长度不能超过500个字符")
    private String description;
    
    @Size(max = 200, message = "标签长度不能超过200个字符")
    private String tags;
    
    public AssessmentHistoryRequest() {}
    
    public AssessmentHistoryRequest(String type, String name, Integer score, String level, String analysis, String factorScores, String date, String timestamp) {
        this.type = type;
        this.name = name;
        this.score = score;
        this.level = level;
        this.analysis = analysis;
        this.factorScores = factorScores;
        this.date = date;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
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
    
    public String getLevel() {
        return level;
    }
    
    public void setLevel(String level) {
        this.level = level;
    }
    
    public String getAnalysis() {
        return analysis;
    }
    
    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }
    
    public String getFactorScores() {
        return factorScores;
    }
    
    public void setFactorScores(String factorScores) {
        this.factorScores = factorScores;
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
