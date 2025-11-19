package com.xyq.legal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    
    @Size(max = 50)
    private String nickname;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    private String gender;
    
    private String avatar;
}

