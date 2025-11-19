package com.xyq.legal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    
    @NotBlank
    private String phone;
    
    @NotBlank
    private String verificationCode;
    
    @NotBlank
    @Size(min = 6, max = 64)
    private String newPassword;
}

