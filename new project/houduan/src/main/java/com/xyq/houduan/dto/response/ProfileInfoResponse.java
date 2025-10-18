package com.xyq.houduan.dto.response;

/**
 * 个人设置信息响应DTO
 */
public class ProfileInfoResponse {

    private Long id;
    private String phone;
    private String nickname;
    private String avatar;
    private String gender;
    private String birthday;
    private String registrationDate;
    private Integer daysFromRegistration;
    private Statistics statistics;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
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

    public String getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(String registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Integer getDaysFromRegistration() {
        return daysFromRegistration;
    }

    public void setDaysFromRegistration(Integer daysFromRegistration) {
        this.daysFromRegistration = daysFromRegistration;
    }

    public Statistics getStatistics() {
        return statistics;
    }

    public void setStatistics(Statistics statistics) {
        this.statistics = statistics;
    }

    /**
     * 统计数据内部类
     */
    public static class Statistics {
        private Integer totalCheckins;
        private Integer totalPractices;
        private Integer totalAssessments;

        // Getters and Setters
        public Integer getTotalCheckins() {
            return totalCheckins;
        }

        public void setTotalCheckins(Integer totalCheckins) {
            this.totalCheckins = totalCheckins;
        }

        public Integer getTotalPractices() {
            return totalPractices;
        }

        public void setTotalPractices(Integer totalPractices) {
            this.totalPractices = totalPractices;
        }

        public Integer getTotalAssessments() {
            return totalAssessments;
        }

        public void setTotalAssessments(Integer totalAssessments) {
            this.totalAssessments = totalAssessments;
        }
    }
}
