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
import com.xyq.houduan.dto.request.PracticeHistoryRequest;
import com.xyq.houduan.dto.response.PageResponse;
import com.xyq.houduan.dto.response.PracticeHistoryResponse;
import com.xyq.houduan.dto.response.PracticeStatisticsResponse;
import com.xyq.houduan.entity.PracticeHistory.PracticeType;
import com.xyq.houduan.service.PracticeHistoryService;

import jakarta.validation.Valid;

/**
 * 练习记录管理控制器
 * 提供练习记录的增删改查和统计功能
 */
@RestController
@RequestMapping("/api/practices")
public class PracticeController {

    @Autowired
    private PracticeHistoryService practiceHistoryService;

    /**
     * 创建练习记录
     */
    @PostMapping
    public ResponseEntity<BaseResponse<PracticeHistoryResponse>> createPracticeRecord(
            @Valid @RequestBody PracticeHistoryRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PracticeHistoryResponse response = practiceHistoryService.createPracticeRecord(username, request);
            return ResponseEntity.ok(BaseResponse.success("创建练习记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 更新练习记录
     */
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<PracticeHistoryResponse>> updatePracticeRecord(
            @PathVariable Long id,
            @Valid @RequestBody PracticeHistoryRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PracticeHistoryResponse response = practiceHistoryService.updatePracticeRecord(id, username, request);
            return ResponseEntity.ok(BaseResponse.success("更新练习记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除练习记录
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deletePracticeRecord(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            practiceHistoryService.deletePracticeRecord(id, username);
            return ResponseEntity.ok(BaseResponse.success("删除练习记录成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 根据ID获取练习记录
     */
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<PracticeHistoryResponse>> getPracticeRecordById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PracticeHistoryResponse response = practiceHistoryService.getPracticeRecordById(id, username);
            return ResponseEntity.ok(BaseResponse.success("获取练习记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取当前用户的练习记录列表
     */
    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<PracticeHistoryResponse>>> getPracticeRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            @RequestParam(required = false) PracticeType practiceType,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PageResponse<PracticeHistoryResponse> response = practiceHistoryService.getPracticeRecords(
                    username, page, size, startDate, endDate, practiceType);
            return ResponseEntity.ok(BaseResponse.success("获取练习记录列表成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取指定日期的练习记录
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<BaseResponse<PageResponse<PracticeHistoryResponse>>> getPracticeRecordsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PageResponse<PracticeHistoryResponse> response = practiceHistoryService.getPracticeRecordsByDate(
                    username, date, page, size);
            return ResponseEntity.ok(BaseResponse.success("获取指定日期练习记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取练习统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<BaseResponse<PracticeStatisticsResponse>> getPracticeStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PracticeStatisticsResponse response = practiceHistoryService.getPracticeStatistics(username, startDate, endDate);
            return ResponseEntity.ok(BaseResponse.success("获取练习统计成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取练习趋势数据
     */
    @GetMapping("/trend")
    public ResponseEntity<BaseResponse<PageResponse<PracticeHistoryResponse>>> getPracticeTrend(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            @RequestParam(required = false) PracticeType practiceType,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PageResponse<PracticeHistoryResponse> response = practiceHistoryService.getPracticeTrend(
                    username, page, size, startDate, endDate, practiceType);
            return ResponseEntity.ok(BaseResponse.success("获取练习趋势成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取今日练习记录
     */
    @GetMapping("/today")
    public ResponseEntity<BaseResponse<PageResponse<PracticeHistoryResponse>>> getTodayPracticeRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PageResponse<PracticeHistoryResponse> response = practiceHistoryService.getTodayPracticeRecords(
                    username, page, size);
            return ResponseEntity.ok(BaseResponse.success("获取今日练习记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取本周练习记录
     */
    @GetMapping("/week")
    public ResponseEntity<BaseResponse<PageResponse<PracticeHistoryResponse>>> getWeekPracticeRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            PageResponse<PracticeHistoryResponse> response = practiceHistoryService.getWeekPracticeRecords(
                    username, page, size);
            return ResponseEntity.ok(BaseResponse.success("获取本周练习记录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 批量删除练习记录
     */
    @DeleteMapping("/batch")
    public ResponseEntity<BaseResponse<Void>> batchDeletePracticeRecords(
            @RequestBody java.util.List<Long> ids,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            practiceHistoryService.batchDeletePracticeRecords(ids, username);
            return ResponseEntity.ok(BaseResponse.success("批量删除练习记录成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }
}
