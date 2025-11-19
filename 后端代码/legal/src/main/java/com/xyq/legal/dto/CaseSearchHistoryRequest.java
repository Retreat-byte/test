package com.xyq.legal.dto;

import lombok.Data;

@Data
public class CaseSearchHistoryRequest {
    
    private String keyword;
    private String caseType;
    private String court;
    private String startDate;
    private String endDate;
    private Integer resultCount;
}

