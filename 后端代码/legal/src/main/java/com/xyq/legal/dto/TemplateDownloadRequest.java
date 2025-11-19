package com.xyq.legal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TemplateDownloadRequest {
    
    @NotBlank(message = "templateId不能为空")
    private String templateId;
}

