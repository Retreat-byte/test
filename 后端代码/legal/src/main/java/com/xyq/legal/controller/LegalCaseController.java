package com.xyq.legal.controller;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.common.Result;
import com.xyq.legal.dto.CaseSearchHistoryRequest;
import com.xyq.legal.dto.CaseSearchRequest;
import com.xyq.legal.entity.LegalCase;
import com.xyq.legal.service.LegalCaseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/legal-tools/cases")
@RequiredArgsConstructor
public class LegalCaseController {
    
    private final LegalCaseService legalCaseService;
    
    @GetMapping
    public Result<PageResult<Map<String, Object>>> listCases(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(legalCaseService.listCases(page, pageSize));
    }
    
    @PostMapping("/search")
    public Result<PageResult<Map<String, Object>>> searchCases(
            @Valid @RequestBody CaseSearchRequest request,
            HttpServletRequest httpServletRequest) {
        String userId = (String) httpServletRequest.getAttribute("userId");
        return Result.success(legalCaseService.searchCases(userId, request));
    }
    
    @GetMapping("/{id}")
    public Result<LegalCase> getCaseDetail(@PathVariable String id) {
        return Result.success(legalCaseService.getCaseDetail(id));
    }
    
    @GetMapping("/types")
    public Result<List<String>> getCaseTypes() {
        return Result.success(legalCaseService.getCaseTypes());
    }
    
    @GetMapping("/courts")
    public Result<List<String>> getCourts() {
        return Result.success(legalCaseService.getCourts());
    }
    
    @GetMapping("/search-history")
    public Result<PageResult<Map<String, Object>>> getSearchHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(legalCaseService.getSearchHistory(userId, page, pageSize));
    }
    
    @PostMapping("/search-history")
    public Result<?> recordSearchHistory(@Valid @RequestBody CaseSearchHistoryRequest body,
                                         HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        legalCaseService.recordHistory(userId, body);
        return Result.success("记录成功", null);
    }
    
    @DeleteMapping("/search-history/{historyId}")
    public Result<?> deleteHistory(@PathVariable String historyId, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        legalCaseService.deleteHistory(userId, historyId);
        return Result.success("删除成功", null);
    }
    
    @DeleteMapping("/search-history/all")
    public Result<?> clearHistory(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        legalCaseService.clearHistory(userId);
        return Result.success("已清空", null);
    }
}

