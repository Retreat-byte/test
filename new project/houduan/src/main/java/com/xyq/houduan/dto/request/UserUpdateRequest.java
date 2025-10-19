package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.xyq.houduan.entity.User.Gender;

/**
 * 用户信息更新请求DTO
 */
public class UserUpdateRequest {
    
    @Size(max = 50, message = "昵称长度不能超过50个字符")
    private String nickname;
    
    @Pattern(regexp = "^(男|女)$", message = "性别只能是男或女")
    private String gender;
    
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "生日格式必须是YYYY-MM-DD")
    private String birthday;
    
    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱长度不能超过100个字符")
    private String email;
    
    @Size(max = 200, message = "个人简介长度不能超过200个字符")
    private String bio;
    
    private String avatar;
    
    public UserUpdateRequest() {}
    
    public UserUpdateRequest(String nickname, String gender, String birthday, String email, String bio) {
        this.nickname = nickname;
        this.gender = gender;
        this.birthday = birthday;
        this.email = email;
        this.bio = bio;
    }
    
    // 转换为Gender枚举
    public Gender getGenderEnum() {
        if (gender == null) {
            return null;
        }
        return "男".equals(gender) ? Gender.MALE : Gender.FEMALE;
    }
    
    // Getters and Setters
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getBirthday() {
        return birthday;
    }
    
    public void setBirthday(String birthday) {
        this.birthday = birthday;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
