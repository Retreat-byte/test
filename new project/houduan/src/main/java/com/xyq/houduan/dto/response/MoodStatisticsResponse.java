package com.xyq.houduan.dto.response;

import java.util.List;

/**
 * 心情统计响应DTO
 */
public class MoodStatisticsResponse {
    
    private Double averageScore;
    private Integer maxScore;
    private Integer minScore;
    private Long happyDays;
    private Long sadDays;
    private Integer consecutiveDays;
    private boolean checkedInToday;
    private List<MoodRecordResponse> recentRecords;
    private Integer totalRecords;
    private Double averageValue;
    private Integer maxValue;
    private Integer minValue;
    private Integer happyCount;
    private Integer neutralCount;
    private Integer sadCount;
    private String startDate;
    private String endDate;
    
    // API文档要求的字段
    private Integer totalDays;
    private Double recentAverage; // 最近7天平均心情分数
    private Double monthAverageScore; // 近一个月平均心情分数
    private String trend; // 趋势：improving/stable/declining/no_data
    
    public MoodStatisticsResponse() {}
    
    public MoodStatisticsResponse(Integer totalDays, Double averageScore, Integer maxScore, Integer minScore,
                                 Long happyDays, Long sadDays, Integer consecutiveDays, boolean checkedInToday,
                                 List<MoodRecordResponse> recentRecords) {
        this.totalDays = totalDays;
        this.averageScore = averageScore;
        this.maxScore = maxScore;
        this.minScore = minScore;
        this.happyDays = happyDays;
        this.sadDays = sadDays;
        this.consecutiveDays = consecutiveDays;
        this.checkedInToday = checkedInToday;
        this.recentRecords = recentRecords;
    }
    
    // Getters and Setters
    public Integer getTotalDays() {
        return totalDays;
    }
    
    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }
    
    public Double getAverageScore() {
        return averageScore;
    }
    
    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
    
    public Integer getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }
    
    public Integer getMinScore() {
        return minScore;
    }
    
    public void setMinScore(Integer minScore) {
        this.minScore = minScore;
    }
    
    public Long getHappyDays() {
        return happyDays;
    }
    
    public void setHappyDays(Long happyDays) {
        this.happyDays = happyDays;
    }
    
    public Long getSadDays() {
        return sadDays;
    }
    
    public void setSadDays(Long sadDays) {
        this.sadDays = sadDays;
    }
    
    public Integer getConsecutiveDays() {
        return consecutiveDays;
    }
    
    public void setConsecutiveDays(Integer consecutiveDays) {
        this.consecutiveDays = consecutiveDays;
    }
    
    public boolean isCheckedInToday() {
        return checkedInToday;
    }
    
    public void setCheckedInToday(boolean checkedInToday) {
        this.checkedInToday = checkedInToday;
    }
    
    public List<MoodRecordResponse> getRecentRecords() {
        return recentRecords;
    }
    
    public void setRecentRecords(List<MoodRecordResponse> recentRecords) {
        this.recentRecords = recentRecords;
    }
    
    public Integer getTotalRecords() {
        return totalRecords;
    }
    
    public void setTotalRecords(Integer totalRecords) {
        this.totalRecords = totalRecords;
    }
    
    public Integer getTotalCount() {
        return totalRecords;
    }
    
    public Double getAverageValue() {
        return averageValue;
    }
    
    public void setAverageValue(Double averageValue) {
        this.averageValue = averageValue;
    }
    
    public Integer getMaxValue() {
        return maxValue;
    }
    
    public void setMaxValue(Integer maxValue) {
        this.maxValue = maxValue;
    }
    
    public Integer getMinValue() {
        return minValue;
    }
    
    public void setMinValue(Integer minValue) {
        this.minValue = minValue;
    }
    
    public Integer getHappyCount() {
        return happyCount;
    }
    
    public void setHappyCount(Integer happyCount) {
        this.happyCount = happyCount;
    }
    
    public Integer getNeutralCount() {
        return neutralCount;
    }
    
    public void setNeutralCount(Integer neutralCount) {
        this.neutralCount = neutralCount;
    }
    
    public Integer getSadCount() {
        return sadCount;
    }
    
    public void setSadCount(Integer sadCount) {
        this.sadCount = sadCount;
    }
    
    public String getStartDate() {
        return startDate;
    }
    
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
    
    public String getEndDate() {
        return endDate;
    }
    
    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
    
    // API文档要求字段的getter和setter
    
    public Double getRecentAverage() {
        return recentAverage;
    }
    
    public void setRecentAverage(Double recentAverage) {
        this.recentAverage = recentAverage;
    }
    
    public Double getMonthAverageScore() {
        return monthAverageScore;
    }
    
    public void setMonthAverageScore(Double monthAverageScore) {
        this.monthAverageScore = monthAverageScore;
    }
    
    public String getTrend() {
        return trend;
    }
    
    public void setTrend(String trend) {
        this.trend = trend;
    }
}
