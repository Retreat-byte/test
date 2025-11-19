package com.xyq.legal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class LegalRegulationSearchRequest {
    
    private String keyword;
    private String category;
    
    /**
     * 效力状态
     */
    private String effectStatus;
    
    /**
     * 更新年份
     */
    private Integer updateYear;
    
    @Min(1)
    private Integer page = 1;
    
    @Positive
    @Max(100)
    private Integer pageSize = 20;
}

