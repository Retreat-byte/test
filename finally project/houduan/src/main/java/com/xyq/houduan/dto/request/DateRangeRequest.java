package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Pattern;

/**
 * 日期范围请求DTO
 */
public class DateRangeRequest {
    
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "开始日期格式必须是YYYY-MM-DD")
    private String startDate;
    
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "结束日期格式必须是YYYY-MM-DD")
    private String endDate;
    
    public DateRangeRequest() {}
    
    public DateRangeRequest(String startDate, String endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    // Getters and Setters
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
}
