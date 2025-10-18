package com.xyq.houduan.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.xyq.houduan.dto.request.ProfileUpdateRequest;
import com.xyq.houduan.dto.response.ProfileInfoResponse;
import com.xyq.houduan.dto.response.ProfileUpdateResponse;
import com.xyq.houduan.entity.AssessmentHistory;
import com.xyq.houduan.entity.MoodRecord;
import com.xyq.houduan.entity.PracticeHistory;
import com.xyq.houduan.entity.User;
import com.xyq.houduan.repository.AssessmentHistoryRepository;
import com.xyq.houduan.repository.MoodRecordRepository;
import com.xyq.houduan.repository.PracticeHistoryRepository;
import com.xyq.houduan.repository.UserRepository;

/**
 * 个人设置服务类
 * 处理用户个人信息管理、成就计算等功能
 */
@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MoodRecordRepository moodRecordRepository;

    @Autowired
    private PracticeHistoryRepository practiceHistoryRepository;

    @Autowired
    private AssessmentHistoryRepository assessmentHistoryRepository;

    /**
     * 获取用户完整个人信息
     */
    public ProfileInfoResponse getUserProfile(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 计算统计数据
        Long totalCheckins = moodRecordRepository.countByUserId(user.getId());
        Long totalPractices = practiceHistoryRepository.countByUserId(user.getId());
        Long totalAssessments = assessmentHistoryRepository.countByUserId(user.getId());

        // 计算注册天数
        long daysFromRegistration = java.time.temporal.ChronoUnit.DAYS.between(
                user.getCreatedAt().toLocalDate(), LocalDate.now());

        ProfileInfoResponse.Statistics statistics = new ProfileInfoResponse.Statistics();
        statistics.setTotalCheckins(totalCheckins.intValue());
        statistics.setTotalPractices(totalPractices.intValue());
        statistics.setTotalAssessments(totalAssessments.intValue());

        ProfileInfoResponse response = new ProfileInfoResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setGender(user.getGender() != null ? user.getGender().getCode() : null);
        response.setBirthday(user.getBirthday() != null ? user.getBirthday().toString() : null);
        response.setRegistrationDate(user.getCreatedAt().toLocalDate().toString());
        response.setDaysFromRegistration((int) daysFromRegistration);
        response.setStatistics(statistics);

        return response;
    }

    /**
     * 更新个人设置
     */
    public ProfileUpdateResponse updateProfile(String phone, ProfileUpdateRequest request) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 更新用户信息
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getGender() != null) {
            user.setGender(User.Gender.valueOf(request.getGender().toUpperCase()));
        }
        if (request.getBirthday() != null) {
            user.setBirthday(LocalDate.parse(request.getBirthday()));
        }

        userRepository.save(user);

        ProfileUpdateResponse response = new ProfileUpdateResponse();
        response.setNickname(user.getNickname());
        response.setGender(user.getGender() != null ? user.getGender().getCode() : null);
        response.setBirthday(user.getBirthday() != null ? user.getBirthday().toString() : null);
        response.setUpdatedAt(java.time.LocalDateTime.now().toString());

        return response;
    }

    /**
     * 上传头像
     */
    public String uploadAvatar(String phone, MultipartFile file) {
        // 这里应该实现文件上传逻辑
        // 暂时返回一个模拟的URL
        return "https://example.com/avatars/user_" + phone + ".jpg";
    }

    /**
     * 获取成就勋章列表
     */
    public Object getAchievements(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 获取用户数据
        List<MoodRecord> moodHistory = moodRecordRepository.findByUserIdAndDeletedFalseOrderByDateDesc(user.getId());
        List<PracticeHistory> practiceHistory = practiceHistoryRepository.findByUserIdAndDeletedFalseOrderByDateDesc(user.getId());
        List<AssessmentHistory> assessmentHistory = assessmentHistoryRepository.findByUserIdAndDeletedFalseOrderByDateDesc(user.getId());

        // 计算连续打卡天数
        int currentStreak = calculateStreak(moodHistory);

        // 计算累计冥想分钟数
        int totalMeditationMinutes = practiceHistory.stream()
                .mapToInt(p -> p.getDuration() != null ? p.getDuration() : 0)
                .sum();

        // 定义成就列表
        List<Map<String, Object>> achievements = new ArrayList<>();

        // 1. 初心者 - 完成第一次打卡
        Map<String, Object> firstCheckin = new HashMap<>();
        firstCheckin.put("id", "first_checkin");
        firstCheckin.put("name", "初心者");
        firstCheckin.put("description", "完成第一次打卡");
        firstCheckin.put("icon", "fa-heart");
        firstCheckin.put("color", "purple");
        firstCheckin.put("unlocked", moodHistory.size() >= 1);
        firstCheckin.put("unlockedDate", moodHistory.size() >= 1 ? moodHistory.get(0).getDate().toString() : null);
        firstCheckin.put("progress", Math.min(moodHistory.size(), 1));
        firstCheckin.put("total", 1);
        achievements.add(firstCheckin);

        // 2. 坚持者 - 连续打卡7天
        Map<String, Object> streak7 = new HashMap<>();
        streak7.put("id", "streak_7");
        streak7.put("name", "坚持者");
        streak7.put("description", "连续打卡7天");
        streak7.put("icon", "fa-calendar-check");
        streak7.put("color", "blue");
        streak7.put("unlocked", currentStreak >= 7);
        streak7.put("unlockedDate", currentStreak >= 7 ? getStreakUnlockDate(moodHistory, 7) : null);
        streak7.put("progress", Math.min(currentStreak, 7));
        streak7.put("total", 7);
        achievements.add(streak7);

        // 3. 呼吸大师 - 完成10次呼吸练习
        Map<String, Object> practice10 = new HashMap<>();
        practice10.put("id", "practice_10");
        practice10.put("name", "呼吸大师");
        practice10.put("description", "完成10次呼吸练习");
        practice10.put("icon", "fa-wind");
        practice10.put("color", "green");
        practice10.put("unlocked", practiceHistory.size() >= 10);
        practice10.put("unlockedDate", practiceHistory.size() >= 10 ? practiceHistory.get(9).getDate().toString() : null);
        practice10.put("progress", Math.min(practiceHistory.size(), 10));
        practice10.put("total", 10);
        achievements.add(practice10);

        // 4. 冥想达人 - 累计冥想60分钟
        Map<String, Object> meditation60 = new HashMap<>();
        meditation60.put("id", "meditation_60");
        meditation60.put("name", "冥想达人");
        meditation60.put("description", "累计冥想60分钟");
        meditation60.put("icon", "fa-om");
        meditation60.put("color", "purple");
        meditation60.put("unlocked", totalMeditationMinutes >= 60);
        meditation60.put("unlockedDate", getMeditationUnlockDate(practiceHistory, 60));
        meditation60.put("progress", Math.min(totalMeditationMinutes, 60));
        meditation60.put("total", 60);
        achievements.add(meditation60);

        // 5. 情绪管理师 - 连续打卡30天
        Map<String, Object> streak30 = new HashMap<>();
        streak30.put("id", "streak_30");
        streak30.put("name", "情绪管理师");
        streak30.put("description", "连续打卡30天");
        streak30.put("icon", "fa-trophy");
        streak30.put("color", "blue");
        streak30.put("unlocked", currentStreak >= 30);
        streak30.put("unlockedDate", currentStreak >= 30 ? getStreakUnlockDate(moodHistory, 30) : null);
        streak30.put("progress", Math.min(currentStreak, 30));
        streak30.put("total", 30);
        achievements.add(streak30);

        // 6. 心理探索者 - 完成5项测评
        Map<String, Object> assessment5 = new HashMap<>();
        assessment5.put("id", "assessment_5");
        assessment5.put("name", "心理探索者");
        assessment5.put("description", "完成5项测评");
        assessment5.put("icon", "fa-star");
        assessment5.put("color", "green");
        assessment5.put("unlocked", assessmentHistory.size() >= 5);
        assessment5.put("unlockedDate", assessmentHistory.size() >= 5 ? assessmentHistory.get(4).getDate().toString() : null);
        assessment5.put("progress", Math.min(assessmentHistory.size(), 5));
        assessment5.put("total", 5);
        achievements.add(assessment5);

        // 7. 情绪记录家 - 累计打卡50天
        Map<String, Object> checkin50 = new HashMap<>();
        checkin50.put("id", "checkin_50");
        checkin50.put("name", "情绪记录家");
        checkin50.put("description", "累计打卡50天");
        checkin50.put("icon", "fa-book");
        checkin50.put("color", "blue");
        checkin50.put("unlocked", moodHistory.size() >= 50);
        checkin50.put("unlockedDate", moodHistory.size() >= 50 ? moodHistory.get(49).getDate().toString() : null);
        checkin50.put("progress", Math.min(moodHistory.size(), 50));
        checkin50.put("total", 50);
        achievements.add(checkin50);

        // 8. 自我认知者 - 完成10项测评
        Map<String, Object> assessment10 = new HashMap<>();
        assessment10.put("id", "assessment_10");
        assessment10.put("name", "自我认知者");
        assessment10.put("description", "完成10项测评");
        assessment10.put("icon", "fa-brain");
        assessment10.put("color", "purple");
        assessment10.put("unlocked", assessmentHistory.size() >= 10);
        assessment10.put("unlockedDate", assessmentHistory.size() >= 10 ? assessmentHistory.get(9).getDate().toString() : null);
        assessment10.put("progress", Math.min(assessmentHistory.size(), 10));
        assessment10.put("total", 10);
        achievements.add(assessment10);

        // 9. 正念修行者 - 完成50次练习
        Map<String, Object> practice50 = new HashMap<>();
        practice50.put("id", "practice_50");
        practice50.put("name", "正念修行者");
        practice50.put("description", "完成50次练习");
        practice50.put("icon", "fa-spa");
        practice50.put("color", "green");
        practice50.put("unlocked", practiceHistory.size() >= 50);
        practice50.put("unlockedDate", practiceHistory.size() >= 50 ? practiceHistory.get(49).getDate().toString() : null);
        practice50.put("progress", Math.min(practiceHistory.size(), 50));
        practice50.put("total", 50);
        achievements.add(practice50);

        return achievements;
    }

    /**
     * 计算连续打卡天数
     */
    private int calculateStreak(List<MoodRecord> moodHistory) {
        if (moodHistory.isEmpty()) return 0;

        // 按日期排序（最新的在前）
        moodHistory.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        int streak = 0;
        LocalDate today = LocalDate.now();

        for (int i = 0; i < moodHistory.size(); i++) {
            LocalDate recordDate = moodHistory.get(i).getDate();
            LocalDate expectedDate = today.minusDays(i);

            if (recordDate.equals(expectedDate)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * 获取连续打卡成就解锁日期
     */
    private String getStreakUnlockDate(List<MoodRecord> moodHistory, int targetDays) {
        if (moodHistory.size() < targetDays) return null;

        // 按日期排序（最早的在前）
        moodHistory.sort((a, b) -> a.getDate().compareTo(b.getDate()));

        int currentStreak = 1;
        for (int i = 1; i < moodHistory.size(); i++) {
            LocalDate prevDate = moodHistory.get(i - 1).getDate();
            LocalDate currDate = moodHistory.get(i).getDate();

            if (currDate.equals(prevDate.plusDays(1))) {
                currentStreak++;
                if (currentStreak == targetDays) {
                    return currDate.toString();
                }
            } else {
                currentStreak = 1;
            }
        }

        return null;
    }

    /**
     * 获取冥想成就解锁日期
     */
    private String getMeditationUnlockDate(List<PracticeHistory> practiceHistory, int targetMinutes) {
        int totalMinutes = 0;
        practiceHistory.sort((a, b) -> a.getDate().compareTo(b.getDate()));

        for (PracticeHistory practice : practiceHistory) {
            totalMinutes += practice.getDuration() != null ? practice.getDuration() : 0;
            if (totalMinutes >= targetMinutes) {
                return practice.getDate().toString();
            }
        }

        return null;
    }
}
