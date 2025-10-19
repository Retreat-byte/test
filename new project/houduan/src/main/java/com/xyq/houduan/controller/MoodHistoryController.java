package com.xyq.houduan.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.xyq.houduan.dto.BaseResponse;
import com.xyq.houduan.dto.request.DateRangeRequest;
import com.xyq.houduan.dto.response.MoodRecordResponse;
import com.xyq.houduan.dto.response.MoodStatisticsResponse;
import com.xyq.houduan.dto.response.UserResponse;
import com.xyq.houduan.service.MoodRecordService;
import com.xyq.houduan.service.UserService;

/**
 * 心情历史记录控制器
 * 专门处理心情历史记录和统计相关的API
 */
@RestController
@RequestMapping("/api/moods")
public class MoodHistoryController {

    @Autowired
    private MoodRecordService moodRecordService;

    @Autowired
    private UserService userService;

    /**
     * 获取心情历史记录
     * 对应API文档: GET /mood/history?days=30
     */
    @GetMapping("/history")
    public ResponseEntity<BaseResponse<List<MoodRecordResponse>>> getMoodHistory(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            UserResponse currentUser = userService.getUserByPhone(phone);
            List<MoodRecordResponse> response = moodRecordService.getMoodHistory(currentUser.getId(), days);
            return ResponseEntity.ok(BaseResponse.success("获取心情历史记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取心情统计信息（按日期范围）
     */
    @GetMapping("/statistics-range")
    public ResponseEntity<BaseResponse<MoodStatisticsResponse>> getMoodStatisticsByRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            UserResponse currentUser = userService.getUserByPhone(phone);
            DateRangeRequest dateRange = new DateRangeRequest();
            dateRange.setStartDate(startDate != null ? startDate : LocalDate.now().minusDays(30).toString());
            dateRange.setEndDate(endDate != null ? endDate : LocalDate.now().toString());
            MoodStatisticsResponse response = moodRecordService.getUserMoodStatistics(currentUser.getId(), dateRange);
            return ResponseEntity.ok(BaseResponse.success("获取心情统计成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }
}
