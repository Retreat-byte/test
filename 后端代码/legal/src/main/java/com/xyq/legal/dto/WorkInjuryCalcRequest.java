package com.xyq.legal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkInjuryCalcRequest {
    
    @NotNull(message = "disabilityLevel不能为空")
    @Min(1)
    @Max(10)
    private Integer disabilityLevel;
    
    @NotNull
    @Min(0)
    private Double monthlyWage;
    
    @NotNull
    @Min(0)
    private Double localAvgWage;
    
    @NotNull
    @Min(0)
    private Double medicalCost;
    
    @NotNull
    @Min(0)
    private Double otherCosts;
}

