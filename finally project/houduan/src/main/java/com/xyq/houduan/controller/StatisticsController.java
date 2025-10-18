package com.xyq.houduan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.xyq.houduan.dto.BaseResponse;
import com.xyq.houduan.dto.response.AssessmentStatisticsResponse;
import com.xyq.houduan.dto.response.MoodStatisticsResponse;
import com.xyq.houduan.dto.response.PracticeStatisticsResponse;
import com.xyq.houduan.service.AssessmentHistoryService;
import com.xyq.houduan.service.MoodRecordService;
import com.xyq.houduan.service.PracticeHistoryService;

/**
 * 数据统计控制器
 * 提供综合的数据统计和分析功能
 */
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private MoodRecordService moodRecordService;
    
    @Autowired
    private PracticeHistoryService practiceHistoryService;
    
    @Autowired
    private AssessmentHistoryService assessmentHistoryService;

    /**
     * 获取心情统计
     */
    @GetMapping("/mood")
    public ResponseEntity<BaseResponse<MoodStatisticsResponse>> getMoodStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            MoodStatisticsResponse response = moodRecordService.getMoodStatistics(phone, startDate, endDate);
            return ResponseEntity.ok(BaseResponse.success("获取心情统计成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取练习统计
     */
    @GetMapping("/practice")
    public ResponseEntity<BaseResponse<PracticeStatisticsResponse>> getPracticeStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            PracticeStatisticsResponse response = practiceHistoryService.getPracticeStatistics(phone, startDate, endDate);
            return ResponseEntity.ok(BaseResponse.success("获取练习统计成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取测评统计
     */
    @GetMapping("/assessment")
    public ResponseEntity<BaseResponse<AssessmentStatisticsResponse>> getAssessmentStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            AssessmentStatisticsResponse response = assessmentHistoryService.getAssessmentStatistics(phone, startDate, endDate);
            return ResponseEntity.ok(BaseResponse.success("获取测评统计成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取综合统计概览
     */
    @GetMapping("/overview")
    public ResponseEntity<BaseResponse<StatisticsOverviewResponse>> getStatisticsOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            
            // 获取各项统计数据
            MoodStatisticsResponse moodStats = moodRecordService.getMoodStatistics(phone, startDate, endDate);
            PracticeStatisticsResponse practiceStats = practiceHistoryService.getPracticeStatistics(phone, startDate, endDate);
            AssessmentStatisticsResponse assessmentStats = assessmentHistoryService.getAssessmentStatistics(phone, startDate, endDate);
            
            // 构建综合统计响应
            StatisticsOverviewResponse overview = new StatisticsOverviewResponse();
            overview.setMoodStatistics(moodStats);
            overview.setPracticeStatistics(practiceStats);
            overview.setAssessmentStatistics(assessmentStats);
            
            // 计算综合指标
            overview.setTotalRecords(moodStats.getTotalCount() + practiceStats.getTotalCount() + assessmentStats.getTotalCount());
            overview.setActiveDays(calculateActiveDays(moodStats, practiceStats, assessmentStats));
            
            return ResponseEntity.ok(BaseResponse.success("获取综合统计成功", overview));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取今日统计
     */
    @GetMapping("/today")
    public ResponseEntity<BaseResponse<StatisticsOverviewResponse>> getTodayStatistics(Authentication authentication) {
        try {
            String today = java.time.LocalDate.now().toString();
            return getStatisticsOverview(today, today, authentication);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取本周统计
     */
    @GetMapping("/week")
    public ResponseEntity<BaseResponse<StatisticsOverviewResponse>> getWeekStatistics(Authentication authentication) {
        try {
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate weekStart = now.minusDays(now.getDayOfWeek().getValue() - 1);
            String startDate = weekStart.toString();
            String endDate = now.toString();
            return getStatisticsOverview(startDate, endDate, authentication);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取本月统计
     */
    @GetMapping("/month")
    public ResponseEntity<BaseResponse<StatisticsOverviewResponse>> getMonthStatistics(Authentication authentication) {
        try {
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate monthStart = now.withDayOfMonth(1);
            String startDate = monthStart.toString();
            String endDate = now.toString();
            return getStatisticsOverview(startDate, endDate, authentication);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 计算活跃天数
     */
    private int calculateActiveDays(MoodStatisticsResponse moodStats, 
                                  PracticeStatisticsResponse practiceStats, 
                                  AssessmentStatisticsResponse assessmentStats) {
        // 这里可以根据实际需求计算活跃天数
        // 简单实现：如果有任何记录就认为该天是活跃的
        return (int) Math.max(moodStats.getTotalCount(), 
               Math.max(practiceStats.getTotalCount(), assessmentStats.getTotalCount()));
    }

    /**
     * 综合统计概览响应类
     */
    public static class StatisticsOverviewResponse {
        private MoodStatisticsResponse moodStatistics;
        private PracticeStatisticsResponse practiceStatistics;
        private AssessmentStatisticsResponse assessmentStatistics;
        private long totalRecords;
        private int activeDays;

        // Getters and Setters
        public MoodStatisticsResponse getMoodStatistics() {
            return moodStatistics;
        }

        public void setMoodStatistics(MoodStatisticsResponse moodStatistics) {
            this.moodStatistics = moodStatistics;
        }

        public PracticeStatisticsResponse getPracticeStatistics() {
            return practiceStatistics;
        }

        public void setPracticeStatistics(PracticeStatisticsResponse practiceStatistics) {
            this.practiceStatistics = practiceStatistics;
        }

        public AssessmentStatisticsResponse getAssessmentStatistics() {
            return assessmentStatistics;
        }

        public void setAssessmentStatistics(AssessmentStatisticsResponse assessmentStatistics) {
            this.assessmentStatistics = assessmentStatistics;
        }

        public long getTotalRecords() {
            return totalRecords;
        }

        public void setTotalRecords(long totalRecords) {
            this.totalRecords = totalRecords;
        }

        public int getActiveDays() {
            return activeDays;
        }

        public void setActiveDays(int activeDays) {
            this.activeDays = activeDays;
        }
    }
}
