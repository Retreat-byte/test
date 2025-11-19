package com.xyq.legal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;
    
    @NotBlank(message = "密码不能为空")
    private String password;
    
    private String nickname;
    private String email;
    private String gender;
    
    @NotBlank(message = "验证码不能为空")
    private String verificationCode;
}

