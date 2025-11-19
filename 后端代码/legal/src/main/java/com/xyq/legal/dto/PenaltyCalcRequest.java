package com.xyq.legal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PenaltyCalcRequest {
    
    @NotNull
    @Min(0)
    private Double contractAmount;
    
    @NotBlank
    private String breachType;
    
    @NotNull
    @Min(0)
    private Double penaltyRate;
    
    @NotNull
    @Min(0)
    private Double actualLoss;
}

