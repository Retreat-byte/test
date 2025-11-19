package com.xyq.legal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LitigationFeeCalcRequest {
    
    @NotBlank(message = "caseType不能为空")
    private String caseType;
    
    @NotNull
    @Min(0)
    private Double disputeAmount;
}

