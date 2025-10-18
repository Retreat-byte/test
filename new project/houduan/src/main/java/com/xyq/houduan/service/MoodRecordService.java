package com.xyq.houduan.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xyq.houduan.dto.request.DateRangeRequest;
import com.xyq.houduan.dto.request.MoodRecordRequest;
import com.xyq.houduan.dto.request.PageRequestDTO;
import com.xyq.houduan.dto.response.MoodRecordResponse;
import com.xyq.houduan.dto.response.MoodStatisticsResponse;
import com.xyq.houduan.dto.response.PageResponse;
import com.xyq.houduan.entity.MoodRecord;
import com.xyq.houduan.entity.User;
import com.xyq.houduan.repository.MoodRecordRepository;
import com.xyq.houduan.repository.UserRepository;

/**
 * 心情记录服务类
 */
@Service
@Transactional
public class MoodRecordService {

    @Autowired
    private MoodRecordRepository moodRecordRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建心情记录
     */
    public MoodRecordResponse createMoodRecord(Long userId, MoodRecordRequest request) {
        // 验证用户是否存在
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        // 检查当天是否已有记录
        LocalDate today = request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now();
        Optional<MoodRecord> existingRecord = moodRecordRepository.findByUserIdAndDateAndDeletedFalse(userId, today);
        if (existingRecord.isPresent()) {
            throw new RuntimeException("今天已经记录过心情了");
        }

        // 创建心情记录
        MoodRecord moodRecord = new MoodRecord();
        moodRecord.setUserId(userId);
        moodRecord.setMood(request.getMood());
        moodRecord.setValue(request.getValue());
        moodRecord.setDate(today);
        if (request.getTimestamp() != null) {
            try {
                // 尝试解析ISO 8601格式
                moodRecord.setTimestamp(LocalDateTime.parse(request.getTimestamp().replace("Z", "")));
            } catch (Exception e) {
                // 如果解析失败，使用当前时间
                moodRecord.setTimestamp(LocalDateTime.now());
            }
        } else {
            moodRecord.setTimestamp(LocalDateTime.now());
        }
        moodRecord.setCreatedAt(LocalDateTime.now());
        moodRecord.setUpdatedAt(LocalDateTime.now());

        MoodRecord savedRecord = moodRecordRepository.save(moodRecord);
        return convertToMoodRecordResponse(savedRecord);
    }

    /**
     * 更新心情记录
     */
    public MoodRecordResponse updateMoodRecord(Long userId, Long recordId, MoodRecordRequest request) {
        MoodRecord moodRecord = moodRecordRepository.findByIdAndUserIdAndDeletedFalse(recordId, userId)
            .orElseThrow(() -> new RuntimeException("心情记录不存在"));

        // 更新记录
        if (request.getMood() != null) {
            moodRecord.setMood(request.getMood());
        }
        if (request.getValue() != null) {
            moodRecord.setValue(request.getValue());
        }
        if (request.getDate() != null) {
            moodRecord.setDate(LocalDate.parse(request.getDate()));
        }
        if (request.getTimestamp() != null) {
            moodRecord.setTimestamp(LocalDateTime.parse(request.getTimestamp()));
        }
        moodRecord.setUpdatedAt(LocalDateTime.now());

        MoodRecord savedRecord = moodRecordRepository.save(moodRecord);
        return convertToMoodRecordResponse(savedRecord);
    }

    /**
     * 获取心情记录详情
     */
    @Transactional(readOnly = true)
    public MoodRecordResponse getMoodRecord(Long userId, Long recordId) {
        MoodRecord moodRecord = moodRecordRepository.findByIdAndUserIdAndDeletedFalse(recordId, userId)
            .orElseThrow(() -> new RuntimeException("心情记录不存在"));
        return convertToMoodRecordResponse(moodRecord);
    }

    /**
     * 获取用户心情记录列表
     */
    @Transactional(readOnly = true)
    public PageResponse<MoodRecordResponse> getUserMoodRecords(Long userId, PageRequestDTO pageRequest) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(
            pageRequest.getPage() - 1, 
            pageRequest.getSize(),
            Sort.by(Sort.Direction.DESC, "date", "timestamp")
        );

        Page<MoodRecord> page = moodRecordRepository.findByUserIdAndDeletedFalse(userId, pageable);
        
        List<MoodRecordResponse> records = page.getContent().stream()
            .map(this::convertToMoodRecordResponse)
            .collect(Collectors.toList());

        return new PageResponse<>(
            records,
            page.getTotalElements(),
            page.getTotalPages(),
            pageRequest.getPage(),
            pageRequest.getSize()
        );
    }

    /**
     * 获取用户心情记录列表（按日期范围）
     */
    @Transactional(readOnly = true)
    public PageResponse<MoodRecordResponse> getUserMoodRecordsByDateRange(Long userId, DateRangeRequest dateRange, PageRequestDTO pageRequest) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(
            pageRequest.getPage() - 1, 
            pageRequest.getSize(),
            Sort.by(Sort.Direction.DESC, "date", "timestamp")
        );

        Page<MoodRecord> page = moodRecordRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
            userId, 
            LocalDate.parse(dateRange.getStartDate()), 
            LocalDate.parse(dateRange.getEndDate()), 
            pageable
        );
        
        List<MoodRecordResponse> records = page.getContent().stream()
            .map(this::convertToMoodRecordResponse)
            .collect(Collectors.toList());

        return new PageResponse<>(
            records,
            page.getTotalElements(),
            page.getTotalPages(),
            pageRequest.getPage(),
            pageRequest.getSize()
        );
    }

    /**
     * 获取用户心情统计（通过手机号）
     */
    @Transactional(readOnly = true)
    public MoodStatisticsResponse getMoodStatistics(String phone, String startDate, String endDate) {
        User user = userRepository.findByPhoneAndDeletedFalse(phone)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        DateRangeRequest dateRange = new DateRangeRequest();
        if (startDate != null && endDate != null) {
            dateRange.setStartDate(startDate);
            dateRange.setEndDate(endDate);
        } else {
            // 默认查询最近30天
            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(30);
            dateRange.setStartDate(start.toString());
            dateRange.setEndDate(end.toString());
        }
        
        return getUserMoodStatistics(user.getId(), dateRange);
    }

    /**
     * 获取心情历史记录（按天数）
     */
    @Transactional(readOnly = true)
    public List<MoodRecordResponse> getMoodHistory(Long userId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        
        List<MoodRecord> records = moodRecordRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
            userId, startDate, endDate);
        
        return records.stream()
            .map(this::convertToMoodRecordResponse)
            .collect(Collectors.toList());
    }

    /**
     * 获取用户心情统计
     */
    @Transactional(readOnly = true)
    public MoodStatisticsResponse getUserMoodStatistics(Long userId, DateRangeRequest dateRange) {
        List<MoodRecord> records = moodRecordRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
            userId, 
            LocalDate.parse(dateRange.getStartDate()), 
            LocalDate.parse(dateRange.getEndDate())
        );

        if (records.isEmpty()) {
            return new MoodStatisticsResponse();
        }

        // 计算统计数据
        double averageValue = records.stream()
            .mapToInt(MoodRecord::getValue)
            .average()
            .orElse(0.0);

        int totalRecords = records.size();
        int maxValue = records.stream()
            .mapToInt(MoodRecord::getValue)
            .max()
            .orElse(0);
        int minValue = records.stream()
            .mapToInt(MoodRecord::getValue)
            .min()
            .orElse(0);

        // 统计各心情类型的数量
        long happyCount = records.stream()
            .filter(r -> r.getValue() >= 8)
            .count();
        long neutralCount = records.stream()
            .filter(r -> r.getValue() >= 5 && r.getValue() < 8)
            .count();
        long sadCount = records.stream()
            .filter(r -> r.getValue() < 5)
            .count();

        MoodStatisticsResponse response = new MoodStatisticsResponse();
        response.setTotalRecords(totalRecords);
        response.setAverageValue(averageValue);
        response.setMaxValue(maxValue);
        response.setMinValue(minValue);
        response.setHappyCount((int) happyCount);
        response.setNeutralCount((int) neutralCount);
        response.setSadCount((int) sadCount);
        response.setStartDate(dateRange.getStartDate());
        response.setEndDate(dateRange.getEndDate());

        return response;
    }

    /**
     * 获取心情统计数据（符合API文档规范）
     */
    @Transactional(readOnly = true)
    public MoodStatisticsResponse getMoodStatistics(Long userId) {
        MoodStatisticsResponse response = new MoodStatisticsResponse();
        
        // 获取累计打卡天数
        long totalDays = moodRecordRepository.countByUserId(userId);
        response.setTotalDays((int) totalDays);
        
        // 获取最近7天平均心情分数
        List<MoodRecord> recent7Days = moodRecordRepository.findLast7DaysMoodRecords(userId);
        if (recent7Days.isEmpty()) {
            response.setRecentAverage(100.0); // 前端显示为"---"
        } else {
            double recentAvg = recent7Days.stream()
                .mapToInt(MoodRecord::getValue)
                .average()
                .orElse(0.0);
            response.setRecentAverage(recentAvg);
        }
        
        // 获取近一个月平均心情分数
        List<MoodRecord> last30Days = moodRecordRepository.findLast30DaysMoodRecords(userId);
        if (last30Days.isEmpty()) {
            response.setMonthAverageScore(100.0); // 前端显示为"---"
        } else {
            double monthAvg = last30Days.stream()
                .mapToInt(MoodRecord::getValue)
                .average()
                .orElse(0.0);
            response.setMonthAverageScore(monthAvg);
        }
        
        // 计算趋势
        response.setTrend(calculateTrend(userId));
        
        return response;
    }
    
    /**
     * 计算心情趋势
     */
    private String calculateTrend(Long userId) {
        List<MoodRecord> allRecords = moodRecordRepository.findByUserIdAndDeletedFalseOrderByDateDesc(userId);
        
        if (allRecords.size() < 2) {
            return "no_data";
        }
        
        // 获取最近两次打卡的心情分数
        int latestValue = allRecords.get(0).getValue();
        int previousValue = allRecords.get(1).getValue();
        
        if (latestValue > previousValue) {
            return "improving";
        } else if (latestValue < previousValue) {
            return "declining";
        } else {
            return "stable";
        }
    }

    /**
     * 删除心情记录
     */
    public void deleteMoodRecord(Long userId, Long recordId) {
        MoodRecord moodRecord = moodRecordRepository.findByIdAndUserIdAndDeletedFalse(recordId, userId)
            .orElseThrow(() -> new RuntimeException("心情记录不存在"));

        moodRecord.setDeleted(true);
        moodRecord.setUpdatedAt(LocalDateTime.now());
        moodRecordRepository.save(moodRecord);
    }

    /**
     * 获取用户今日心情记录
     */
    @Transactional(readOnly = true)
    public MoodRecordResponse getTodayMoodRecord(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<MoodRecord> record = moodRecordRepository.findByUserIdAndDateAndDeletedFalse(userId, today);
        
        if (record.isPresent()) {
            return convertToMoodRecordResponse(record.get());
        }
        return null;
    }

    /**
     * 转换为心情记录响应DTO
     */
    private MoodRecordResponse convertToMoodRecordResponse(MoodRecord moodRecord) {
        MoodRecordResponse response = new MoodRecordResponse();
        response.setId(moodRecord.getId());
        response.setUserId(moodRecord.getUserId());
        response.setMood(moodRecord.getMood());
        response.setValue(moodRecord.getValue());
        response.setDate(moodRecord.getDate());
        response.setTimestamp(moodRecord.getTimestamp());
        response.setCreatedAt(moodRecord.getCreatedAt());
        response.setUpdatedAt(moodRecord.getUpdatedAt());
        return response;
    }
}
