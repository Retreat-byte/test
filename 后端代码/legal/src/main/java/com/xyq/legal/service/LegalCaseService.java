package com.xyq.legal.service;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.dto.CaseSearchHistoryRequest;
import com.xyq.legal.dto.CaseSearchRequest;
import com.xyq.legal.entity.CaseSearchHistory;
import com.xyq.legal.entity.LegalCase;
import com.xyq.legal.entity.User;
import com.xyq.legal.repository.CaseSearchHistoryRepository;
import com.xyq.legal.repository.LegalCaseRepository;
import com.xyq.legal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LegalCaseService {
    
    private final LegalCaseRepository legalCaseRepository;
    private final CaseSearchHistoryRepository caseSearchHistoryRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> listCases(int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize,
                Sort.by(Sort.Direction.DESC, "publishDate"));
        Page<LegalCase> pageData = legalCaseRepository.findAll(pageable);
        List<Map<String, Object>> list = pageData.getContent()
                .stream()
                .map(this::buildCaseSummary)
                .collect(Collectors.toList());
        return PageResult.of(list, pageData.getTotalElements(), page, pageSize);
    }
    
    @Transactional
    public PageResult<Map<String, Object>> searchCases(String userId, CaseSearchRequest request) {
        Pageable pageable = PageRequest.of(Math.max(request.getPage() - 1, 0), request.getPageSize(),
                Sort.by(Sort.Direction.DESC, "publishDate"));
        
        LocalDate startDate = null;
        LocalDate endDate = null;
        if (request.getDateRange() != null && request.getDateRange().size() == 2) {
            startDate = parseDate(request.getDateRange().get(0));
            endDate = parseDate(request.getDateRange().get(1));
        }
        
        Page<LegalCase> pageData = legalCaseRepository.search(
                request.getKeyword(),
                request.getCaseType(),
                request.getCourt(),
                startDate,
                endDate,
                pageable);
        
        if (userId != null && (request.getPage() == null || request.getPage() == 1)) {
            recordSearchHistory(userId, request.getKeyword(), request.getCaseType(),
                    request.getCourt(), (int) pageData.getTotalElements());
        }
        
        List<Map<String, Object>> list = pageData.getContent()
                .stream()
                .map(this::buildCaseSummary)
                .collect(Collectors.toList());
        return PageResult.of(list, pageData.getTotalElements(), request.getPage(), request.getPageSize());
    }
    
    @Transactional(readOnly = true)
    public LegalCase getCaseDetail(String id) {
        String targetId = Objects.requireNonNull(id, "案例ID不能为空");
        return legalCaseRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("案例不存在"));
    }
    
    @Transactional(readOnly = true)
    public List<String> getCaseTypes() {
        return legalCaseRepository.findDistinctCaseTypes();
    }
    
    @Transactional(readOnly = true)
    public List<String> getCourts() {
        return legalCaseRepository.findDistinctCourts();
    }
    
    @Transactional
    public void recordHistory(String userId, CaseSearchHistoryRequest request) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        recordSearchHistory(targetUserId, request.getKeyword(), request.getCaseType(),
                request.getCourt(), request.getResultCount() == null ? 0 : request.getResultCount());
    }
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> getSearchHistory(String userId, int page, int pageSize) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize);
        Page<CaseSearchHistory> historyPage = caseSearchHistoryRepository
                .findByUserIdOrderByCreatedAtDesc(targetUserId, pageable);
        
        List<Map<String, Object>> list = historyPage.getContent()
                .stream()
                .map(history -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", history.getId());
                    map.put("keyword", history.getKeyword());
                    map.put("caseType", history.getCaseType());
                    map.put("court", history.getCourt());
                    map.put("resultCount", history.getResultCount());
                    map.put("createdAt", history.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());
        
        return PageResult.of(list, historyPage.getTotalElements(), page, pageSize);
    }
    
    @Transactional
    public void deleteHistory(String userId, String historyId) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        CaseSearchHistory history = caseSearchHistoryRepository.findById(
                        Objects.requireNonNull(historyId, "记录ID不能为空"))
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        if (!history.getUser().getId().equals(targetUserId)) {
            throw new RuntimeException("无权删除该记录");
        }
        caseSearchHistoryRepository.delete(history);
    }
    
    @Transactional
    public void clearHistory(String userId) {
        caseSearchHistoryRepository.deleteByUserId(Objects.requireNonNull(userId, "用户ID不能为空"));
    }
    
    private void recordSearchHistory(String userId, String keyword, String caseType,
                                     String court, int resultCount) {
        if ((keyword == null || keyword.isBlank()) &&
                (caseType == null || caseType.isBlank()) &&
                (court == null || court.isBlank())) {
            return;
        }
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        CaseSearchHistory history = new CaseSearchHistory();
        history.setUser(user);
        history.setKeyword(keyword);
        history.setCaseType(caseType);
        history.setCourt(court);
        history.setResultCount(Math.max(resultCount, 0));
        caseSearchHistoryRepository.save(history);
    }
    
    private LocalDate parseDate(String text) {
        try {
            return LocalDate.parse(text);
        } catch (Exception e) {
            return null;
        }
    }
    
    private Map<String, Object> buildCaseSummary(LegalCase legalCase) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", legalCase.getId());
        map.put("title", legalCase.getTitle());
        map.put("caseNumber", legalCase.getCaseNumber());
        map.put("caseType", legalCase.getCaseType());
        map.put("court", legalCase.getCourt());
        map.put("publishDate", legalCase.getPublishDate());
        map.put("keywords", legalCase.getKeywords());
        map.put("relatedLaws", legalCase.getRelatedLaws());
        return map;
    }
}

