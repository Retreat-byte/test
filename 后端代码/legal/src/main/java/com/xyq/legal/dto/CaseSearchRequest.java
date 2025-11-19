package com.xyq.legal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class CaseSearchRequest {
    
    private String keyword;
    private String caseType;
    private String court;
    
    /**
     * 日期范围，预期为大小为2的列表，格式yyyy-MM-dd
     */
    private List<String> dateRange;
    
    @Min(1)
    private Integer page = 1;
    
    @Positive
    @Max(100)
    private Integer pageSize = 10;
}

