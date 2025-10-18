package com.xyq.houduan.dto.response;

import java.util.List;

/**
 * 练习统计响应DTO
 */
public class PracticeStatisticsResponse {
    
    private Long totalPractices;
    private Long totalDuration;
    private Double averageDuration;
    private Integer breathingCount;
    private Integer meditationCount;
    private Integer relaxationCount;
    private Long breathingDuration;
    private Long meditationDuration;
    private String mostFrequentType;
    private List<PracticeHistoryResponse> recentRecords;
    private Integer totalRecords;
    private String startDate;
    private String endDate;
    
    // API文档要求的字段
    private Long totalMinutes;
    private Long breathingMinutes;
    private Long meditationMinutes;
    private Integer avgDuration;
    private String favoriteType;
    private List<PracticeDayCount> last7Days;
    
    public PracticeStatisticsResponse() {}
    
    public PracticeStatisticsResponse(Long totalPractices, Long totalDuration, Double averageDuration,
                                     Integer breathingCount, Integer meditationCount, Integer relaxationCount,
                                     Long breathingDuration, Long meditationDuration, String mostFrequentType,
                                     List<PracticeHistoryResponse> recentRecords) {
        this.totalPractices = totalPractices;
        this.totalDuration = totalDuration;
        this.averageDuration = averageDuration;
        this.breathingCount = breathingCount;
        this.meditationCount = meditationCount;
        this.relaxationCount = relaxationCount;
        this.breathingDuration = breathingDuration;
        this.meditationDuration = meditationDuration;
        this.mostFrequentType = mostFrequentType;
        this.recentRecords = recentRecords;
    }
    
    // Getters and Setters
    public Long getTotalPractices() {
        return totalPractices;
    }
    
    public void setTotalPractices(Long totalPractices) {
        this.totalPractices = totalPractices;
    }
    
    public Long getTotalDuration() {
        return totalDuration;
    }
    
    public void setTotalDuration(Long totalDuration) {
        this.totalDuration = totalDuration;
    }
    
    public Double getAverageDuration() {
        return averageDuration;
    }
    
    public void setAverageDuration(Double averageDuration) {
        this.averageDuration = averageDuration;
    }
    
    public Integer getBreathingCount() {
        return breathingCount;
    }
    
    public void setBreathingCount(Integer breathingCount) {
        this.breathingCount = breathingCount;
    }
    
    public Integer getMeditationCount() {
        return meditationCount;
    }
    
    public void setMeditationCount(Integer meditationCount) {
        this.meditationCount = meditationCount;
    }
    
    public Long getBreathingDuration() {
        return breathingDuration;
    }
    
    public void setBreathingDuration(Long breathingDuration) {
        this.breathingDuration = breathingDuration;
    }
    
    public Long getMeditationDuration() {
        return meditationDuration;
    }
    
    public void setMeditationDuration(Long meditationDuration) {
        this.meditationDuration = meditationDuration;
    }
    
    public String getMostFrequentType() {
        return mostFrequentType;
    }
    
    public void setMostFrequentType(String mostFrequentType) {
        this.mostFrequentType = mostFrequentType;
    }
    
    public List<PracticeHistoryResponse> getRecentRecords() {
        return recentRecords;
    }
    
    public void setRecentRecords(List<PracticeHistoryResponse> recentRecords) {
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
    
    
    public Integer getRelaxationCount() {
        return relaxationCount;
    }
    
    public void setRelaxationCount(Integer relaxationCount) {
        this.relaxationCount = relaxationCount;
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
    public Long getTotalMinutes() {
        return totalMinutes;
    }
    
    public void setTotalMinutes(Long totalMinutes) {
        this.totalMinutes = totalMinutes;
    }
    
    public Long getBreathingMinutes() {
        return breathingMinutes;
    }
    
    public void setBreathingMinutes(Long breathingMinutes) {
        this.breathingMinutes = breathingMinutes;
    }
    
    public Long getMeditationMinutes() {
        return meditationMinutes;
    }
    
    public void setMeditationMinutes(Long meditationMinutes) {
        this.meditationMinutes = meditationMinutes;
    }
    
    public Integer getAvgDuration() {
        return avgDuration;
    }
    
    public void setAvgDuration(Integer avgDuration) {
        this.avgDuration = avgDuration;
    }
    
    public String getFavoriteType() {
        return favoriteType;
    }
    
    public void setFavoriteType(String favoriteType) {
        this.favoriteType = favoriteType;
    }
    
    public List<PracticeDayCount> getLast7Days() {
        return last7Days;
    }
    
    public void setLast7Days(List<PracticeDayCount> last7Days) {
        this.last7Days = last7Days;
    }
    
    /**
     * 每日练习次数统计DTO
     */
    public static class PracticeDayCount {
        private String date;
        private Integer count;

        // Getters and Setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
    }
}
