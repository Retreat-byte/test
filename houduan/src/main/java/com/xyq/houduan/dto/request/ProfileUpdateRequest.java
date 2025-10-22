package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 个人设置更新请求DTO
 */
public class ProfileUpdateRequest {

    @Size(min = 1, max = 20, message = "昵称长度必须在1-20个字符之间")
    private String nickname;

    @Pattern(regexp = "^(male|female|other)$", message = "性别只能是male、female或other")
    private String gender;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "生日格式必须是YYYY-MM-DD")
    private String birthday;

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
}
