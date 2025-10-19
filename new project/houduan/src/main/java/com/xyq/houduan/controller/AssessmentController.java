package com.xyq.houduan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.xyq.houduan.dto.BaseResponse;
import com.xyq.houduan.dto.request.AssessmentHistoryRequest;
import com.xyq.houduan.dto.response.AssessmentHistoryResponse;
import com.xyq.houduan.dto.response.AssessmentStatisticsResponse;
import com.xyq.houduan.dto.response.PageResponse;
import com.xyq.houduan.service.AssessmentHistoryService;

import jakarta.validation.Valid;

/**
 * 测评记录管理控制器
 * 提供测评记录的增删改查和统计功能
 */
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentHistoryService assessmentHistoryService;

    /**
     * 创建测评记录
     */
    @PostMapping
    public ResponseEntity<BaseResponse<AssessmentHistoryResponse>> createAssessmentRecord(
            @Valid @RequestBody AssessmentHistoryRequest request,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            AssessmentHistoryResponse response = assessmentHistoryService.createAssessmentRecord(phone, request);
            return ResponseEntity.ok(BaseResponse.success("创建测评记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 更新测评记录
     */
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<AssessmentHistoryResponse>> updateAssessmentRecord(
            @PathVariable Long id,
            @Valid @RequestBody AssessmentHistoryRequest request,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            AssessmentHistoryResponse response = assessmentHistoryService.updateAssessmentRecord(id, phone, request);
            return ResponseEntity.ok(BaseResponse.success("更新测评记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除测评记录
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteAssessmentRecord(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            assessmentHistoryService.deleteAssessmentRecord(id, phone);
            return ResponseEntity.ok(BaseResponse.success("删除测评记录成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 根据ID获取测评记录
     */
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<AssessmentHistoryResponse>> getAssessmentRecordById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            AssessmentHistoryResponse response = assessmentHistoryService.getAssessmentRecordById(id, phone);
            return ResponseEntity.ok(BaseResponse.success("获取测评记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取当前用户的测评记录列表
     */
    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<AssessmentHistoryResponse>>> getAssessmentRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            @RequestParam(required = false) String type,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            PageResponse<AssessmentHistoryResponse> response = assessmentHistoryService.getAssessmentRecords(
                    phone, page, size, startDate, endDate, type);
            return ResponseEntity.ok(BaseResponse.success("获取测评记录列表成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取测评历史记录（前端专用接口）
     * GET /api/assessments/history?days=90&type=sds&limit=20
     */
    @GetMapping("/history")
    public ResponseEntity<BaseResponse<java.util.List<AssessmentHistoryResponse>>> getAssessmentHistory(
            @RequestParam(defaultValue = "90") int days,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer limit,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            
            // 计算日期范围
            java.time.LocalDate endDate = java.time.LocalDate.now();
            java.time.LocalDate startDate = endDate.minusDays(days - 1);
            
            // 获取记录
            java.util.List<AssessmentHistoryResponse> records = assessmentHistoryService.getAssessmentHistory(
                    phone, startDate.toString(), endDate.toString(), type);
            
            // 应用限制
            if (limit != null && limit > 0) {
                records = records.stream().limit(limit).collect(java.util.stream.Collectors.toList());
            }
            
            return ResponseEntity.ok(BaseResponse.success("获取测评历史记录成功", records));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取指定日期的测评记录
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<BaseResponse<PageResponse<AssessmentHistoryResponse>>> getAssessmentRecordsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            PageResponse<AssessmentHistoryResponse> response = assessmentHistoryService.getAssessmentRecordsByDate(
                    phone, date, page, size);
            return ResponseEntity.ok(BaseResponse.success("获取指定日期测评记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取测评统计信息
     */
    @GetMapping("/statistics")
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
     * 获取测评趋势数据
     */
    @GetMapping("/trend")
    public ResponseEntity<BaseResponse<PageResponse<AssessmentHistoryResponse>>> getAssessmentTrend(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            @RequestParam(required = false) String type,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            PageResponse<AssessmentHistoryResponse> response = assessmentHistoryService.getAssessmentTrend(
                    phone, page, size, startDate, endDate, type);
            return ResponseEntity.ok(BaseResponse.success("获取测评趋势成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取今日测评记录
     */
    @GetMapping("/today")
    public ResponseEntity<BaseResponse<PageResponse<AssessmentHistoryResponse>>> getTodayAssessmentRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            String today = java.time.LocalDate.now().toString();
            PageResponse<AssessmentHistoryResponse> response = assessmentHistoryService.getAssessmentRecordsByDate(
                    phone, today, page, size);
            return ResponseEntity.ok(BaseResponse.success("获取今日测评记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取本周测评记录
     */
    @GetMapping("/week")
    public ResponseEntity<BaseResponse<PageResponse<AssessmentHistoryResponse>>> getWeekAssessmentRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate weekStart = now.minusDays(now.getDayOfWeek().getValue() - 1);
            String startDate = weekStart.toString();
            String endDate = now.toString();
            
            PageResponse<AssessmentHistoryResponse> response = assessmentHistoryService.getAssessmentRecords(
                    phone, page, size, startDate, endDate, null);
            return ResponseEntity.ok(BaseResponse.success("获取本周测评记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 批量删除测评记录
     */
    @DeleteMapping("/batch")
    public ResponseEntity<BaseResponse<Void>> batchDeleteAssessmentRecords(
            @RequestBody java.util.List<Long> ids,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            assessmentHistoryService.batchDeleteAssessmentRecords(ids, phone);
            return ResponseEntity.ok(BaseResponse.success("批量删除测评记录成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }
}
