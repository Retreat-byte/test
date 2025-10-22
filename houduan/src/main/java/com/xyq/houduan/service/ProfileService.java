package com.xyq.houduan.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.xyq.houduan.entity.UserAchievement;
import com.xyq.houduan.repository.AssessmentHistoryRepository;
import com.xyq.houduan.repository.MoodRecordRepository;
import com.xyq.houduan.repository.PracticeHistoryRepository;
import com.xyq.houduan.repository.UserAchievementRepository;
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

    @Autowired
    private UserAchievementRepository userAchievementRepository;

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
        System.out.println("========== 上传头像开始 ==========");
        System.out.println("用户手机号: " + phone);
        
        // 查找用户
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        System.out.println("找到用户: " + user.getNickname());
        
        // 验证文件
        if (file == null || file.isEmpty()) {
            System.out.println("❌ 文件为空");
            throw new RuntimeException("请选择要上传的图片");
        }
        System.out.println("文件名: " + file.getOriginalFilename());
        System.out.println("文件大小: " + file.getSize() + " bytes");
        
        // 验证文件类型
        String contentType = file.getContentType();
        System.out.println("文件类型: " + contentType);
        if (contentType == null || !contentType.startsWith("image/")) {
            System.out.println("❌ 文件类型不支持");
            throw new RuntimeException("只支持JPG、PNG、GIF格式的图片");
        }
        
        // 验证文件大小（最大2MB）
        long maxSize = 2 * 1024 * 1024; // 2MB
        if (file.getSize() > maxSize) {
            System.out.println("❌ 文件过大");
            throw new RuntimeException("图片大小不能超过2MB");
        }
        
        try {
            // 将图片转换为Base64编码
            byte[] bytes = file.getBytes();
            String base64Image = "data:" + contentType + ";base64," + 
                                java.util.Base64.getEncoder().encodeToString(bytes);
            
            System.out.println("Base64长度: " + base64Image.length());
            
            // 更新用户头像
            user.setAvatar(base64Image);
            userRepository.save(user);
            
            System.out.println("✅ 头像保存成功");
            System.out.println("========== 上传头像结束 ==========");
            
            return base64Image;
        } catch (Exception e) {
            System.out.println("❌ 上传失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("头像上传失败: " + e.getMessage());
        }
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

        // 计算累计冥想分钟数（只计算meditation类型的练习）
        int totalMeditationMinutes = practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.meditation)
                .mapToInt(p -> p.getDuration() != null ? (int) Math.ceil(p.getDuration() / 60.0) : 0)
                .sum();

        // 检查并解锁成就
        checkAndUnlockAchievements(user.getId(), moodHistory, practiceHistory, assessmentHistory, currentStreak, totalMeditationMinutes);

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
        long breathingCount = practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing)
                .count();
        Map<String, Object> practice10 = new HashMap<>();
        practice10.put("id", "practice_10");
        practice10.put("name", "呼吸大师");
        practice10.put("description", "完成10次呼吸练习");
        practice10.put("icon", "fa-wind");
        practice10.put("color", "green");
        practice10.put("unlocked", breathingCount >= 10);
        practice10.put("unlockedDate", breathingCount >= 10 ? 
            practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing)
                .skip(9)
                .findFirst()
                .map(p -> p.getDate().toString())
                .orElse(null) : null);
        practice10.put("progress", Math.min((int)breathingCount, 10));
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
        long mindfulnessCount = practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing || p.getType() == PracticeHistory.PracticeType.meditation)
                .count();
        Map<String, Object> practice50 = new HashMap<>();
        practice50.put("id", "practice_50");
        practice50.put("name", "正念修行者");
        practice50.put("description", "完成50次练习");
        practice50.put("icon", "fa-spa");
        practice50.put("color", "green");
        practice50.put("unlocked", mindfulnessCount >= 50);
        practice50.put("unlockedDate", mindfulnessCount >= 50 ? 
            practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing || p.getType() == PracticeHistory.PracticeType.meditation)
                .skip(49)
                .findFirst()
                .map(p -> p.getDate().toString())
                .orElse(null) : null);
        practice50.put("progress", Math.min((int)mindfulnessCount, 50));
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
        // 只处理meditation类型的练习
        List<PracticeHistory> meditationHistory = practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.meditation)
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());

        for (PracticeHistory practice : meditationHistory) {
            totalMinutes += practice.getDuration() != null ? practice.getDuration() : 0;
            if (totalMinutes >= targetMinutes) {
                return practice.getDate().toString();
            }
        }

        return null;
    }

    /**
     * 检查并解锁成就
     */
    private void checkAndUnlockAchievements(Long userId, List<MoodRecord> moodHistory, 
                                          List<PracticeHistory> practiceHistory, 
                                          List<AssessmentHistory> assessmentHistory,
                                          int currentStreak, int totalMeditationMinutes) {
        
        // 1. 初心者 - 完成第一次打卡
        if (moodHistory.size() >= 1) {
            unlockAchievement(userId, "first_checkin", moodHistory.get(0).getDate());
        }
        
        // 2. 坚持者 - 连续打卡7天
        if (currentStreak >= 7) {
            String unlockDate = getStreakUnlockDate(moodHistory, 7);
            if (unlockDate != null) {
                unlockAchievement(userId, "streak_7", LocalDate.parse(unlockDate));
            }
        }
        
        // 3. 呼吸大师 - 完成10次呼吸练习
        long breathingCount = practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing)
                .count();
        if (breathingCount >= 10) {
            practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing)
                .skip(9)
                .findFirst()
                .ifPresent(p -> unlockAchievement(userId, "practice_10", p.getDate()));
        }
        
        // 4. 冥想达人 - 累计冥想60分钟
        if (totalMeditationMinutes >= 60) {
            String unlockDate = getMeditationUnlockDate(practiceHistory, 60);
            if (unlockDate != null) {
                unlockAchievement(userId, "meditation_60", LocalDate.parse(unlockDate));
            }
        }
        
        // 5. 情绪管理师 - 连续打卡30天
        if (currentStreak >= 30) {
            String unlockDate = getStreakUnlockDate(moodHistory, 30);
            if (unlockDate != null) {
                unlockAchievement(userId, "streak_30", LocalDate.parse(unlockDate));
            }
        }
        
        // 6. 心理探索者 - 完成5项测评
        if (assessmentHistory.size() >= 5) {
            unlockAchievement(userId, "assessment_5", assessmentHistory.get(4).getDate());
        }
        
        // 7. 情绪记录家 - 累计打卡50天
        if (moodHistory.size() >= 50) {
            unlockAchievement(userId, "checkin_50", moodHistory.get(49).getDate());
        }
        
        // 8. 自我认知者 - 完成10项测评
        if (assessmentHistory.size() >= 10) {
            unlockAchievement(userId, "assessment_10", assessmentHistory.get(9).getDate());
        }
        
        // 9. 正念修行者 - 完成50次练习
        long mindfulnessCount = practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing || p.getType() == PracticeHistory.PracticeType.meditation)
                .count();
        if (mindfulnessCount >= 50) {
            practiceHistory.stream()
                .filter(p -> p.getType() == PracticeHistory.PracticeType.breathing || p.getType() == PracticeHistory.PracticeType.meditation)
                .skip(49)
                .findFirst()
                .ifPresent(p -> unlockAchievement(userId, "practice_50", p.getDate()));
        }
    }

    /**
     * 解锁成就
     */
    private void unlockAchievement(Long userId, String achievementId, LocalDate unlockDate) {
        // 检查成就是否已经解锁
        if (!userAchievementRepository.existsByUserIdAndAchievementId(userId, achievementId)) {
            // 创建成就记录
            UserAchievement achievement = new UserAchievement();
            achievement.setUserId(userId);
            achievement.setAchievementId(achievementId);
            achievement.setUnlockedDate(unlockDate);
            
            // 保存到数据库
            userAchievementRepository.save(achievement);
        }
    }
}
