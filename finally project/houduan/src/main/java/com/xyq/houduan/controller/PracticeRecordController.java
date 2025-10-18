package com.xyq.houduan.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.xyq.houduan.dto.BaseResponse;
import com.xyq.houduan.dto.response.PracticeHistoryResponse;
import com.xyq.houduan.dto.response.PracticeStatisticsResponse;
import com.xyq.houduan.dto.response.PracticeStatisticsResponse.PracticeDayCount;
import com.xyq.houduan.entity.PracticeHistory;
import com.xyq.houduan.entity.PracticeHistory.PracticeType;
import com.xyq.houduan.entity.User;
import com.xyq.houduan.repository.PracticeHistoryRepository;
import com.xyq.houduan.repository.UserRepository;

import jakarta.validation.Valid;

/**
 * 练习记录API控制器
 * 实现符合API文档规范的练习记录接口
 */
@RestController
@RequestMapping("/api/practices")
public class PracticeRecordController {


    @Autowired
    private PracticeHistoryRepository practiceHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 提交练习记录
     * POST /api/practices
     */
    @PostMapping("")
    public ResponseEntity<BaseResponse<PracticeHistoryResponse>> submitPracticeRecord(
            @Valid @RequestBody PracticeRecordRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByPhoneAndDeletedFalse(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

            // 创建练习记录
            PracticeHistory practiceHistory = new PracticeHistory();
            practiceHistory.setUserId(user.getId());
            practiceHistory.setType(PracticeType.fromCode(request.getType()));
            practiceHistory.setName(request.getName());
            practiceHistory.setDuration(request.getDuration());
            practiceHistory.setAudio(request.getAudio());
            practiceHistory.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now());
            practiceHistory.setTimestamp(request.getTimestamp() != null ? 
                parseTimestamp(request.getTimestamp()) : LocalDateTime.now());
            practiceHistory.setCreatedAt(LocalDateTime.now());
            practiceHistory.setUpdatedAt(LocalDateTime.now());

            PracticeHistory savedRecord = practiceHistoryRepository.save(practiceHistory);
            PracticeHistoryResponse response = convertToResponse(savedRecord);

            return ResponseEntity.ok(BaseResponse.success("练习记录保存成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取练习历史记录
     * GET /api/practices/history?days=30&type=breathing&limit=50
     */
    @GetMapping("/history")
    public ResponseEntity<BaseResponse<List<PracticeHistoryResponse>>> getPracticeHistory(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer limit,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByPhoneAndDeletedFalse(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days - 1);

            List<PracticeHistory> records;
            if (type != null) {
                PracticeType practiceType = PracticeType.fromCode(type);
                records = practiceHistoryRepository.findByUserIdAndTypeAndDateBetweenAndDeletedFalseOrderByDateDesc(
                    user.getId(), practiceType, startDate, endDate);
            } else {
                records = practiceHistoryRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
                    user.getId(), startDate, endDate);
            }

            // 应用限制
            if (limit != null && limit > 0) {
                records = records.stream().limit(limit).collect(Collectors.toList());
            }

            List<PracticeHistoryResponse> responses = records.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(BaseResponse.success("获取练习历史记录成功", responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取练习统计数据
     * GET /api/practices/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<BaseResponse<PracticeStatisticsResponse>> getPracticeStatistics(
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByPhoneAndDeletedFalse(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

            // 获取所有练习记录
            List<PracticeHistory> allRecords = practiceHistoryRepository.findByUserIdAndDeletedFalseOrderByDateDesc(user.getId());
            
            if (allRecords.isEmpty()) {
                return ResponseEntity.ok(BaseResponse.success("获取练习统计成功", new PracticeStatisticsResponse()));
            }

            // 计算统计数据
            int totalPractices = allRecords.size();
            int breathingCount = (int) allRecords.stream().filter(r -> r.getType() == PracticeType.breathing).count();
            int meditationCount = (int) allRecords.stream().filter(r -> r.getType() == PracticeType.meditation).count();
            
            int totalMinutes = allRecords.stream().mapToInt(PracticeHistory::getDuration).sum() / 60;
            int breathingMinutes = allRecords.stream()
                .filter(r -> r.getType() == PracticeType.breathing)
                .mapToInt(PracticeHistory::getDuration).sum() / 60;
            int meditationMinutes = allRecords.stream()
                .filter(r -> r.getType() == PracticeType.meditation)
                .mapToInt(PracticeHistory::getDuration).sum() / 60;
            
            int avgDuration = totalMinutes / totalPractices;
            
            // 确定最常练习的类型
            String favoriteType = "none";
            if (breathingCount > meditationCount) {
                favoriteType = "breathing";
            } else if (meditationCount > breathingCount) {
                favoriteType = "meditation";
            } else if (breathingCount > 0 && meditationCount > 0) {
                favoriteType = "both";
            }

            // 获取最近7天的练习记录
            LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
            List<PracticeHistory> last7DaysRecords = practiceHistoryRepository.findLast7DaysPracticeRecords(user.getId(), sevenDaysAgo);
            List<PracticeDayCount> last7Days = generateLast7DaysCount(last7DaysRecords);

            PracticeStatisticsResponse response = new PracticeStatisticsResponse();
            response.setTotalPractices((long) totalPractices);
            response.setBreathingCount(breathingCount);
            response.setMeditationCount(meditationCount);
            response.setTotalMinutes((long) totalMinutes);
            response.setBreathingMinutes((long) breathingMinutes);
            response.setMeditationMinutes((long) meditationMinutes);
            response.setAvgDuration(avgDuration);
            response.setFavoriteType(favoriteType);
            response.setLast7Days(last7Days);

            return ResponseEntity.ok(BaseResponse.success("获取练习统计成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除练习记录
     * DELETE /api/practices/{practiceId}
     */
    @DeleteMapping("/{practiceId}")
    public ResponseEntity<BaseResponse<Void>> deletePracticeRecord(
            @PathVariable Long practiceId,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByPhoneAndDeletedFalse(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

            PracticeHistory record = practiceHistoryRepository.findByIdAndUserIdAndDeletedFalse(practiceId, user.getId())
                .orElseThrow(() -> new RuntimeException("练习记录不存在"));

            record.setDeleted(true);
            record.setUpdatedAt(LocalDateTime.now());
            practiceHistoryRepository.save(record);

            return ResponseEntity.ok(BaseResponse.success("删除成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 解析时间戳字符串
     */
    private LocalDateTime parseTimestamp(String timestamp) {
        try {
            // 处理ISO 8601格式，移除Z后缀
            if (timestamp.endsWith("Z")) {
                timestamp = timestamp.substring(0, timestamp.length() - 1);
            }
            return LocalDateTime.parse(timestamp);
        } catch (Exception e) {
            // 如果解析失败，返回当前时间
            return LocalDateTime.now();
        }
    }

    /**
     * 转换为响应DTO
     */
    private PracticeHistoryResponse convertToResponse(PracticeHistory record) {
        PracticeHistoryResponse response = new PracticeHistoryResponse();
        response.setId(record.getId());
        response.setType(record.getType().getCode());
        response.setName(record.getName());
        response.setDuration(record.getDuration());
        response.setAudio(record.getAudio());
        response.setTimestamp(record.getTimestamp());
        response.setDate(record.getDate());
        return response;
    }

    /**
     * 生成最近7天的练习次数统计
     */
    private List<PracticeDayCount> generateLast7DaysCount(List<PracticeHistory> records) {
        LocalDate today = LocalDate.now();
        List<PracticeDayCount> result = new java.util.ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long count = records.stream()
                .filter(r -> r.getDate().equals(date))
                .count();
            
            PracticeDayCount dayCount = new PracticeDayCount();
            dayCount.setDate(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            dayCount.setCount((int) count);
            result.add(dayCount);
        }
        
        return result;
    }

    /**
     * 练习记录请求DTO
     */
    public static class PracticeRecordRequest {
        private String type;
        private String name;
        private Integer duration;
        private String audio;
        private String timestamp;
        private String date;

        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
        public String getAudio() { return audio; }
        public void setAudio(String audio) { this.audio = audio; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

}
