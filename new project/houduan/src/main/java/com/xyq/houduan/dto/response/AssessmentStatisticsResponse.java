package com.xyq.houduan.dto.response;

import java.util.List;

/**
 * 测评统计响应DTO
 */
public class AssessmentStatisticsResponse {
    
    private Long totalAssessments;
    private Double averageScore;
    private Integer maxScore;
    private Integer minScore;
    private Long sdsCount;
    private Long sasCount;
    private Long apeskPstrCount;
    private Long baiCount;
    private Long psqiCount;
    private Long dass21Count;
    private Long scl90Count;
    private List<AssessmentHistoryResponse> recentRecords;
    
    public AssessmentStatisticsResponse() {}
    
    public AssessmentStatisticsResponse(Long totalAssessments, Double averageScore, Integer maxScore, Integer minScore,
                                       Long sdsCount, Long sasCount, Long apeskPstrCount, Long baiCount,
                                       Long psqiCount, Long dass21Count, Long scl90Count,
                                       List<AssessmentHistoryResponse> recentRecords) {
        this.totalAssessments = totalAssessments;
        this.averageScore = averageScore;
        this.maxScore = maxScore;
        this.minScore = minScore;
        this.sdsCount = sdsCount;
        this.sasCount = sasCount;
        this.apeskPstrCount = apeskPstrCount;
        this.baiCount = baiCount;
        this.psqiCount = psqiCount;
        this.dass21Count = dass21Count;
        this.scl90Count = scl90Count;
        this.recentRecords = recentRecords;
    }
    
    // Getters and Setters
    public Long getTotalAssessments() {
        return totalAssessments;
    }
    
    public void setTotalAssessments(Long totalAssessments) {
        this.totalAssessments = totalAssessments;
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
    
    public Long getSdsCount() {
        return sdsCount;
    }
    
    public void setSdsCount(Long sdsCount) {
        this.sdsCount = sdsCount;
    }
    
    public Long getSasCount() {
        return sasCount;
    }
    
    public void setSasCount(Long sasCount) {
        this.sasCount = sasCount;
    }
    
    public Long getApeskPstrCount() {
        return apeskPstrCount;
    }
    
    public void setApeskPstrCount(Long apeskPstrCount) {
        this.apeskPstrCount = apeskPstrCount;
    }
    
    public Long getBaiCount() {
        return baiCount;
    }
    
    public void setBaiCount(Long baiCount) {
        this.baiCount = baiCount;
    }
    
    public Long getPsqiCount() {
        return psqiCount;
    }
    
    public void setPsqiCount(Long psqiCount) {
        this.psqiCount = psqiCount;
    }
    
    public Long getDass21Count() {
        return dass21Count;
    }
    
    public void setDass21Count(Long dass21Count) {
        this.dass21Count = dass21Count;
    }
    
    public Long getScl90Count() {
        return scl90Count;
    }
    
    public void setScl90Count(Long scl90Count) {
        this.scl90Count = scl90Count;
    }
    
    public List<AssessmentHistoryResponse> getRecentRecords() {
        return recentRecords;
    }
    
    public void setRecentRecords(List<AssessmentHistoryResponse> recentRecords) {
        this.recentRecords = recentRecords;
    }
    
    public Long getTotalCount() {
        return totalAssessments;
    }
    
    public void setTotalCount(int count) {
        this.totalAssessments = (long) count;
    }
    
    public void setApeskCount(long count) {
        this.apeskPstrCount = count;
    }
}
