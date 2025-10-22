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

import com.xyq.houduan.dto.request.AssessmentHistoryRequest;
import com.xyq.houduan.dto.response.AssessmentHistoryResponse;
import com.xyq.houduan.dto.response.AssessmentStatisticsResponse;
import com.xyq.houduan.dto.response.PageResponse;
import com.xyq.houduan.entity.AssessmentHistory;
import com.xyq.houduan.entity.User;
import com.xyq.houduan.repository.AssessmentHistoryRepository;
import com.xyq.houduan.repository.UserRepository;

/**
 * 测评历史服务类
 */
@Service
@Transactional
public class AssessmentHistoryService {

    @Autowired
    private AssessmentHistoryRepository assessmentHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建测评记录
     */
    public AssessmentHistoryResponse createAssessmentRecord(String username, AssessmentHistoryRequest request) {
        // 验证用户是否存在
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 验证测评类型是否有效
        if (request.getType() == null || request.getType().trim().isEmpty()) {
            throw new RuntimeException("测评类型不能为空");
        }

        // 创建测评记录
        AssessmentHistory assessmentHistory = new AssessmentHistory();
        assessmentHistory.setUserId(user.getId());
        assessmentHistory.setType(request.getType());
        assessmentHistory.setName(request.getName());
        assessmentHistory.setScore(request.getScore());
        assessmentHistory.setLevel(request.getLevel());
        assessmentHistory.setAnalysis(request.getAnalysis());
        assessmentHistory.setFactorScores(request.getFactorScores());
        assessmentHistory.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now());
        assessmentHistory.setTimestamp(request.getTimestamp() != null ? LocalDateTime.parse(request.getTimestamp()) : LocalDateTime.now());
        assessmentHistory.setCreatedAt(LocalDateTime.now());
        assessmentHistory.setUpdatedAt(LocalDateTime.now());

        AssessmentHistory savedRecord = assessmentHistoryRepository.save(assessmentHistory);
        return convertToAssessmentHistoryResponse(savedRecord);
    }

    /**
     * 更新测评记录
     */
    public AssessmentHistoryResponse updateAssessmentRecord(Long id, String username, AssessmentHistoryRequest request) {
        AssessmentHistory assessmentHistory = assessmentHistoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("测评记录不存在"));

        // 验证用户权限
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (!assessmentHistory.getUserId().equals(user.getId())) {
            throw new RuntimeException("无权限修改此记录");
        }

        // 更新记录
        assessmentHistory.setType(request.getType());
        assessmentHistory.setName(request.getName());
        assessmentHistory.setScore(request.getScore());
        assessmentHistory.setLevel(request.getLevel());
        assessmentHistory.setAnalysis(request.getAnalysis());
        assessmentHistory.setFactorScores(request.getFactorScores());
        assessmentHistory.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : assessmentHistory.getDate());
        assessmentHistory.setTimestamp(request.getTimestamp() != null ? LocalDateTime.parse(request.getTimestamp()) : assessmentHistory.getTimestamp());
        assessmentHistory.setUpdatedAt(LocalDateTime.now());

        AssessmentHistory savedRecord = assessmentHistoryRepository.save(assessmentHistory);
        return convertToAssessmentHistoryResponse(savedRecord);
    }

    /**
     * 删除测评记录
     */
    public void deleteAssessmentRecord(Long id, String username) {
        AssessmentHistory assessmentHistory = assessmentHistoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("测评记录不存在"));

        // 验证用户权限
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (!assessmentHistory.getUserId().equals(user.getId())) {
            throw new RuntimeException("无权限删除此记录");
        }

        assessmentHistory.setDeleted(true);
        assessmentHistory.setUpdatedAt(LocalDateTime.now());
        assessmentHistoryRepository.save(assessmentHistory);
    }

    /**
     * 根据ID获取测评记录
     */
    public AssessmentHistoryResponse getAssessmentRecordById(Long id, String username) {
        AssessmentHistory assessmentHistory = assessmentHistoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("测评记录不存在"));

        // 验证用户权限
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (!assessmentHistory.getUserId().equals(user.getId())) {
            throw new RuntimeException("无权限查看此记录");
        }

        return convertToAssessmentHistoryResponse(assessmentHistory);
    }

    /**
     * 获取用户的测评记录列表
     */
    public PageResponse<AssessmentHistoryResponse> getAssessmentRecords(
            String username, int page, int size, String startDate, String endDate, String type) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date", "timestamp"));
        Page<AssessmentHistory> assessmentPage;

        if (startDate != null && endDate != null && type != null) {
            assessmentPage = assessmentHistoryRepository.findByUserIdAndTypeAndDateBetweenAndDeletedFalseOrderByDateDesc(
                user.getId(), type, LocalDate.parse(startDate), LocalDate.parse(endDate), pageable);
        } else if (startDate != null && endDate != null) {
            assessmentPage = assessmentHistoryRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
                user.getId(), LocalDate.parse(startDate), LocalDate.parse(endDate), pageable);
        } else if (type != null) {
            assessmentPage = assessmentHistoryRepository.findByUserIdAndTypeAndDeletedFalseOrderByDateDesc(
                user.getId(), type, pageable);
        } else {
            assessmentPage = assessmentHistoryRepository.findByUserIdAndDeletedFalseOrderByDateDesc(user.getId(), pageable);
        }

        List<AssessmentHistoryResponse> responses = assessmentPage.getContent()
            .stream()
            .map(this::convertToAssessmentHistoryResponse)
            .collect(Collectors.toList());

        return new PageResponse<>(
            responses,
            assessmentPage.getTotalElements(),
            assessmentPage.getTotalPages(),
            page,
            size
        );
    }

    /**
     * 获取指定日期的测评记录
     */
    public PageResponse<AssessmentHistoryResponse> getAssessmentRecordsByDate(
            String username, String date, int page, int size) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        LocalDate targetDate = LocalDate.parse(date);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        
        Page<AssessmentHistory> assessmentPage = assessmentHistoryRepository.findByUserIdAndDateAndDeletedFalseOrderByTimestampDesc(
            user.getId(), targetDate, pageable);

        List<AssessmentHistoryResponse> responses = assessmentPage.getContent()
            .stream()
            .map(this::convertToAssessmentHistoryResponse)
            .collect(Collectors.toList());

        return new PageResponse<>(
            responses,
            assessmentPage.getTotalElements(),
            assessmentPage.getTotalPages(),
            page,
            size
        );
    }

    /**
     * 获取测评统计信息
     */
    public AssessmentStatisticsResponse getAssessmentStatistics(String phone, String startDate, String endDate) {
        User user = userRepository.findByPhoneAndDeletedFalse(phone)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        List<AssessmentHistory> assessments;
        if (startDate != null && endDate != null) {
            assessments = assessmentHistoryRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
                user.getId(), LocalDate.parse(startDate), LocalDate.parse(endDate));
        } else {
            assessments = assessmentHistoryRepository.findByUserIdAndDeletedFalseOrderByDateDesc(user.getId());
        }

        AssessmentStatisticsResponse response = new AssessmentStatisticsResponse();
        response.setTotalCount(assessments.size());
        
        // 按类型统计
        long apeskCount = assessments.stream().filter(a -> "apeskPstr".equals(a.getType())).count();
        long sasCount = assessments.stream().filter(a -> "sas".equals(a.getType())).count();
        long sdsCount = assessments.stream().filter(a -> "sds".equals(a.getType())).count();
        long baiCount = assessments.stream().filter(a -> "bai".equals(a.getType())).count();
        long psqiCount = assessments.stream().filter(a -> "psqi".equals(a.getType())).count();
        long dass21Count = assessments.stream().filter(a -> "dass21".equals(a.getType())).count();
        long scl90Count = assessments.stream().filter(a -> "scl90".equals(a.getType())).count();

        response.setApeskCount(apeskCount);
        response.setSasCount(sasCount);
        response.setSdsCount(sdsCount);
        response.setBaiCount(baiCount);
        response.setPsqiCount(psqiCount);
        response.setDass21Count(dass21Count);
        response.setScl90Count(scl90Count);

        // 计算平均分数
        if (!assessments.isEmpty()) {
            double avgScore = assessments.stream().mapToInt(AssessmentHistory::getScore).average().orElse(0.0);
            response.setAverageScore(avgScore);
        }

        return response;
    }

    /**
     * 获取测评历史记录（前端专用接口）
     */
    public List<AssessmentHistoryResponse> getAssessmentHistory(
            String username, String startDate, String endDate, String type) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        List<AssessmentHistory> assessments;
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        if (type != null && !type.isEmpty()) {
            assessments = assessmentHistoryRepository.findByUserIdAndTypeAndDateBetweenAndDeletedFalseOrderByDateDesc(
                user.getId(), type, start, end);
        } else {
            assessments = assessmentHistoryRepository.findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
                user.getId(), start, end);
        }

        return assessments.stream()
            .map(this::convertToAssessmentHistoryResponse)
            .collect(Collectors.toList());
    }

    /**
     * 获取测评趋势数据
     */
    public PageResponse<AssessmentHistoryResponse> getAssessmentTrend(
            String username, int page, int size, String startDate, String endDate, String type) {
        return getAssessmentRecords(username, page, size, startDate, endDate, type);
    }

    /**
     * 批量删除测评记录
     */
    public void batchDeleteAssessmentRecords(List<Long> ids, String username) {
        User user = userRepository.findByPhoneAndDeletedFalse(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        List<AssessmentHistory> assessments = assessmentHistoryRepository.findAllById(ids);
        for (AssessmentHistory assessment : assessments) {
            if (!assessment.getUserId().equals(user.getId())) {
                throw new RuntimeException("无权限删除记录ID: " + assessment.getId());
            }
            assessment.setDeleted(true);
            assessment.setUpdatedAt(LocalDateTime.now());
        }
        assessmentHistoryRepository.saveAll(assessments);
    }

    /**
     * 转换为响应对象
     */
    private AssessmentHistoryResponse convertToAssessmentHistoryResponse(AssessmentHistory assessmentHistory) {
        AssessmentHistoryResponse response = new AssessmentHistoryResponse();
        response.setId(assessmentHistory.getId());
        response.setUserId(assessmentHistory.getUserId());
        response.setType(assessmentHistory.getType());
        response.setName(assessmentHistory.getName());
        response.setScore(assessmentHistory.getScore());
        response.setLevel(assessmentHistory.getLevel());
        response.setAnalysis(assessmentHistory.getAnalysis());
        response.setFactorScores(assessmentHistory.getFactorScores());
        response.setDate(assessmentHistory.getDate());
        response.setTimestamp(assessmentHistory.getTimestamp());
        response.setCreatedAt(assessmentHistory.getCreatedAt());
        response.setUpdatedAt(assessmentHistory.getUpdatedAt());
        return response;
    }
}
