package com.xyq.houduan.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xyq.houduan.dto.request.DateRangeRequest;
import com.xyq.houduan.dto.request.PageRequestDTO;
import com.xyq.houduan.dto.request.PracticeHistoryRequest;
import com.xyq.houduan.dto.response.PageResponse;
import com.xyq.houduan.dto.response.PracticeHistoryResponse;
import com.xyq.houduan.dto.response.PracticeStatisticsResponse;
import com.xyq.houduan.entity.PracticeHistory;
import com.xyq.houduan.entity.PracticeHistory.PracticeType;
import com.xyq.houduan.entity.User;
import com.xyq.houduan.repository.PracticeHistoryRepository;
import com.xyq.houduan.repository.UserRepository;

/**
 * 练习历史服务类
 */
@Service
@Transactional
public class PracticeHistoryService {

    @Autowired
    private PracticeHistoryRepository practiceHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建练习记录
     */
    public PracticeHistoryResponse createPracticeHistory(Long userId, PracticeHistoryRequest request) {
        // 验证用户是否存在
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        // 创建练习记录
        PracticeHistory practiceHistory = new PracticeHistory();
        practiceHistory.setUserId(userId);
        practiceHistory.setType(request.getType());
        practiceHistory.setName(request.getName());
        if (request.getTitle() != null) {
            practiceHistory.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            practiceHistory.setDescription(request.getDescription());
        }
        practiceHistory.setDuration(request.getDuration());
        practiceHistory.setAudio(request.getAudio());
        practiceHistory.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now());
        practiceHistory.setTimestamp(request.getTimestamp() != null ? LocalDateTime.parse(request.getTimestamp()) : LocalDateTime.now());
        practiceHistory.setCreatedAt(LocalDateTime.now());
        practiceHistory.setUpdatedAt(LocalDateTime.now());

        PracticeHistory savedRecord = practiceHistoryRepository.save(practiceHistory);
        return convertToPracticeHistoryResponse(savedRecord);
    }

    /**
     * 更新练习记录
     */
    public PracticeHistoryResponse updatePracticeHistory(Long userId, Long recordId, PracticeHistoryRequest request) {
        PracticeHistory practiceHistory = practiceHistoryRepository.findByIdAndUserIdAndDeletedFalse(recordId, userId)
            .orElseThrow(() -> new RuntimeException("练习记录不存在"));

        // 更新记录
        if (request.getType() != null) {
            practiceHistory.setType(request.getType());
        }
        if (request.getName() != null) {
            practiceHistory.setName(request.getName());
        }
        if (request.getTitle() != null) {
            practiceHistory.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            practiceHistory.setDescription(request.getDescription());
        }
        if (request.getDuration() != null) {
            practiceHistory.setDuration(request.getDuration());
        }
        if (request.getAudio() != null) {
            practiceHistory.setAudio(request.getAudio());
        }
        if (request.getDate() != null) {
            practiceHistory.setDate(LocalDate.parse(request.getDate()));
        }
        if (request.getTimestamp() != null) {
            practiceHistory.setTimestamp(LocalDateTime.parse(request.getTimestamp()));
        }
        practiceHistory.setUpdatedAt(LocalDateTime.now());

        PracticeHistory savedRecord = practiceHistoryRepository.save(practiceHistory);
        return convertToPracticeHistoryResponse(savedRecord);
    }

    /**
     * 获取练习记录详情
     */
    @Transactional(readOnly = true)
    public PracticeHistoryResponse getPracticeHistory(Long userId, Long recordId) {
        PracticeHistory practiceHistory = practiceHistoryRepository.findByIdAndUserIdAndDeletedFalse(recordId, userId)
            .orElseThrow(() -> new RuntimeException("练习记录不存在"));
        return convertToPracticeHistoryResponse(practiceHistory);
    }

    /**
     * 获取用户练习记录列表
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getUserPracticeHistories(Long userId, PageRequestDTO pageRequest) {
        Pageable pageable = PageRequest.of(
            pageRequest.getPage() - 1, 
            pageRequest.getSize(),
            Sort.by(Sort.Direction.DESC, "date", "timestamp")
        );

        Page<PracticeHistory> page = practiceHistoryRepository.findByUserIdAndDeletedFalse(userId, pageable);
        
        List<PracticeHistoryResponse> records = page.getContent().stream()
            .map(this::convertToPracticeHistoryResponse)
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
     * 获取用户练习记录列表（按日期范围）
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getUserPracticeHistoriesByDateRange(Long userId, DateRangeRequest dateRange, PageRequestDTO pageRequest) {
        Pageable pageable = PageRequest.of(
            pageRequest.getPage() - 1, 
            pageRequest.getSize(),
            Sort.by(Sort.Direction.DESC, "date", "timestamp")
        );

        Page<PracticeHistory> page = practiceHistoryRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
            userId, 
            LocalDate.parse(dateRange.getStartDate()), 
            LocalDate.parse(dateRange.getEndDate()), 
            pageable
        );
        
        List<PracticeHistoryResponse> records = page.getContent().stream()
            .map(this::convertToPracticeHistoryResponse)
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
     * 获取用户练习记录列表（按类型）
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getUserPracticeHistoriesByType(Long userId, String type, PageRequestDTO pageRequest) {
        Pageable pageable = PageRequest.of(
            pageRequest.getPage() - 1, 
            pageRequest.getSize(),
            Sort.by(Sort.Direction.DESC, "date", "timestamp")
        );

        Page<PracticeHistory> page = practiceHistoryRepository.findByUserIdAndTypeAndDeletedFalse(
            userId, 
            PracticeType.fromCode(type), 
            pageable
        );
        
        List<PracticeHistoryResponse> records = page.getContent().stream()
            .map(this::convertToPracticeHistoryResponse)
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
     * 获取用户练习统计（通过手机号）
     */
    @Transactional(readOnly = true)
    public PracticeStatisticsResponse getPracticeStatistics(String phone, String startDate, String endDate) {
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
        
        return getUserPracticeStatistics(user.getId(), dateRange);
    }

    /**
     * 获取用户练习统计
     */
    @Transactional(readOnly = true)
    public PracticeStatisticsResponse getUserPracticeStatistics(Long userId, DateRangeRequest dateRange) {
        List<PracticeHistory> records = practiceHistoryRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
            userId, 
            LocalDate.parse(dateRange.getStartDate()), 
            LocalDate.parse(dateRange.getEndDate())
        );

        if (records.isEmpty()) {
            return new PracticeStatisticsResponse();
        }

        // 计算统计数据
        int totalRecords = records.size();
        int totalDuration = records.stream()
            .mapToInt(PracticeHistory::getDuration)
            .sum();
        double averageDuration = records.stream()
            .mapToInt(PracticeHistory::getDuration)
            .average()
            .orElse(0.0);

        // 统计各类型的数量
        long meditationCount = records.stream()
            .filter(r -> r.getType() == PracticeType.meditation)
            .count();
        long breathingCount = records.stream()
            .filter(r -> r.getType() == PracticeType.breathing)
            .count();
        long relaxationCount = records.stream()
            .filter(r -> r.getType() == PracticeType.relaxation)
            .count();

        PracticeStatisticsResponse response = new PracticeStatisticsResponse();
        response.setTotalRecords(totalRecords);
        response.setTotalDuration((long) totalDuration);
        response.setAverageDuration(averageDuration);
        response.setMeditationCount((int) meditationCount);
        response.setBreathingCount((int) breathingCount);
        response.setRelaxationCount((int) relaxationCount);
        response.setStartDate(dateRange.getStartDate());
        response.setEndDate(dateRange.getEndDate());

        return response;
    }

    /**
     * 删除练习记录
     */
    public void deletePracticeHistory(Long userId, Long recordId) {
        PracticeHistory practiceHistory = practiceHistoryRepository.findByIdAndUserIdAndDeletedFalse(recordId, userId)
            .orElseThrow(() -> new RuntimeException("练习记录不存在"));

        practiceHistory.setDeleted(true);
        practiceHistory.setUpdatedAt(LocalDateTime.now());
        practiceHistoryRepository.save(practiceHistory);
    }

    /**
     * 获取用户今日练习记录
     */
    @Transactional(readOnly = true)
    public List<PracticeHistoryResponse> getTodayPracticeHistories(Long userId) {
        LocalDate today = LocalDate.now();
        List<PracticeHistory> records = practiceHistoryRepository.findByUserIdAndDateAndDeletedFalse(userId, today);
        
        return records.stream()
            .map(this::convertToPracticeHistoryResponse)
            .collect(Collectors.toList());
    }

    /**
     * 创建练习记录 (Controller兼容方法)
     */
    @Transactional
    public PracticeHistoryResponse createPracticeRecord(String username, PracticeHistoryRequest request) {
        // 通过username获取userId
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return createPracticeHistory(user.getId(), request);
    }

    /**
     * 更新练习记录 (Controller兼容方法)
     */
    @Transactional
    public PracticeHistoryResponse updatePracticeRecord(Long recordId, String username, PracticeHistoryRequest request) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return updatePracticeHistory(user.getId(), recordId, request);
    }

    /**
     * 删除练习记录 (Controller兼容方法)
     */
    @Transactional
    public void deletePracticeRecord(Long recordId, String username) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        deletePracticeHistory(user.getId(), recordId);
    }

    /**
     * 根据ID获取练习记录 (Controller兼容方法)
     */
    @Transactional(readOnly = true)
    public PracticeHistoryResponse getPracticeRecordById(Long recordId, String username) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return getPracticeHistory(user.getId(), recordId);
    }

    /**
     * 获取练习记录列表 (Controller兼容方法)
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getPracticeRecords(String username, int page, int size, 
            String startDate, String endDate, PracticeHistory.PracticeType type) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        PageRequestDTO pageRequest = new PageRequestDTO();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        
        if (startDate != null && endDate != null) {
            DateRangeRequest dateRange = new DateRangeRequest();
            dateRange.setStartDate(startDate);
            dateRange.setEndDate(endDate);
            return getUserPracticeHistoriesByDateRange(user.getId(), dateRange, pageRequest);
        } else if (type != null) {
            return getUserPracticeHistoriesByType(user.getId(), type.getCode(), pageRequest);
        } else {
            return getUserPracticeHistories(user.getId(), pageRequest);
        }
    }

    /**
     * 根据日期获取练习记录 (Controller兼容方法)
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getPracticeRecordsByDate(String username, String date, int page, int size) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        PageRequestDTO pageRequest = new PageRequestDTO();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        
        DateRangeRequest dateRange = new DateRangeRequest();
        dateRange.setStartDate(date);
        dateRange.setEndDate(date);
        
        return getUserPracticeHistoriesByDateRange(user.getId(), dateRange, pageRequest);
    }

    /**
     * 获取练习趋势 (Controller兼容方法)
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getPracticeTrend(String username, int page, int size, 
            String startDate, String endDate, PracticeHistory.PracticeType type) {
        return getPracticeRecords(username, page, size, startDate, endDate, type);
    }

    /**
     * 获取今日练习记录 (Controller兼容方法)
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getTodayPracticeRecords(String username, int page, int size) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        List<PracticeHistoryResponse> todayRecords = getTodayPracticeHistories(user.getId());
        
        // 手动分页
        int start = (page - 1) * size;
        int end = Math.min(start + size, todayRecords.size());
        List<PracticeHistoryResponse> pageRecords = todayRecords.subList(start, end);
        
        PageResponse<PracticeHistoryResponse> response = new PageResponse<>();
        response.setContent(pageRecords);
        response.setTotalElements((long) todayRecords.size());
        response.setTotalPages((int) Math.ceil((double) todayRecords.size() / size));
        response.setCurrentPage(page);
        response.setPageSize(size);
        
        return response;
    }

    /**
     * 获取本周练习记录 (Controller兼容方法)
     */
    @Transactional(readOnly = true)
    public PageResponse<PracticeHistoryResponse> getWeekPracticeRecords(String username, int page, int size) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.minusDays(now.getDayOfWeek().getValue() - 1);
        LocalDate weekEnd = weekStart.plusDays(6);
        
        DateRangeRequest dateRange = new DateRangeRequest();
        dateRange.setStartDate(weekStart.toString());
        dateRange.setEndDate(weekEnd.toString());
        
        PageRequestDTO pageRequest = new PageRequestDTO();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        
        return getUserPracticeHistoriesByDateRange(user.getId(), dateRange, pageRequest);
    }

    /**
     * 批量删除练习记录 (Controller兼容方法)
     */
    @Transactional
    public void batchDeletePracticeRecords(List<Long> recordIds, String username) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        for (Long recordId : recordIds) {
            deletePracticeHistory(user.getId(), recordId);
        }
    }

    /**
     * 转换为练习记录响应DTO
     */
    private PracticeHistoryResponse convertToPracticeHistoryResponse(PracticeHistory practiceHistory) {
        PracticeHistoryResponse response = new PracticeHistoryResponse();
        response.setId(practiceHistory.getId());
        response.setUserId(practiceHistory.getUserId());
        response.setType(practiceHistory.getType().getCode());
        response.setName(practiceHistory.getName());
        response.setTitle(practiceHistory.getTitle());
        response.setDescription(practiceHistory.getDescription());
        response.setDuration(practiceHistory.getDuration());
        response.setAudio(practiceHistory.getAudio());
        response.setDate(practiceHistory.getDate());
        response.setTimestamp(practiceHistory.getTimestamp());
        response.setCreatedAt(practiceHistory.getCreatedAt());
        response.setUpdatedAt(practiceHistory.getUpdatedAt());
        return response;
    }
}
