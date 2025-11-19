package com.xyq.legal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompensationCalcRequest {
    
    @NotNull(message = "monthlyWage不能为空")
    @Min(value = 0, message = "monthlyWage必须大于或等于0")
    private Double monthlyWage;
    
    @Min(0)
    private Integer workYears = 0;
    
    @Min(0)
    private Integer workMonths = 0;
    
    @NotBlank(message = "calculationType不能为空")
    private String calculationType;
}

