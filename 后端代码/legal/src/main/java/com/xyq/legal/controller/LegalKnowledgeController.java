package com.xyq.legal.controller;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.common.Result;
import com.xyq.legal.dto.FavoriteBatchCheckRequest;
import com.xyq.legal.dto.LegalRegulationSearchRequest;
import com.xyq.legal.entity.LegalRegulation;
import com.xyq.legal.service.LegalKnowledgeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/legal-knowledge")
@RequiredArgsConstructor
public class LegalKnowledgeController {
    
    private final LegalKnowledgeService legalKnowledgeService;
    
    @GetMapping("/regulations")
    public Result<PageResult<Map<String, Object>>> listRegulations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, name = "effectStatus") String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer pageSize,
            @RequestParam(required = false, name = "updateYear") Integer updateYear) {
        
        LegalRegulationSearchRequest request = new LegalRegulationSearchRequest();
        request.setCategory(blankToNull(category));
        request.setKeyword(blankToNull(keyword));
        request.setEffectStatus(blankToNull(status));
        request.setPage(page);
        request.setPageSize(pageSize);
        request.setUpdateYear(updateYear);
        return Result.success(legalKnowledgeService.listRegulations(request));
    }
    
    @PostMapping("/regulations/search")
    public Result<PageResult<Map<String, Object>>> searchRegulations(
            @Valid @RequestBody LegalRegulationSearchRequest request) {
        request.setCategory(blankToNull(request.getCategory()));
        request.setKeyword(blankToNull(request.getKeyword()));
        request.setEffectStatus(blankToNull(request.getEffectStatus()));
        return Result.success(legalKnowledgeService.listRegulations(request));
    }
    
    @GetMapping("/regulations/{id}")
    public Result<LegalRegulation> getRegulationDetail(@PathVariable String id) {
        return Result.success(legalKnowledgeService.getRegulationDetail(id));
    }
    
    @GetMapping("/regulations/{id}/content")
    public Result<Map<String, Object>> getRegulationContent(@PathVariable String id) {
        String content = legalKnowledgeService.getRegulationContent(id);
        return Result.success(Map.of("id", id, "content", content == null ? "" : content));
    }
    
    @GetMapping("/categories")
    public Result<List<String>> getCategories() {
        return Result.success(legalKnowledgeService.getCategories());
    }
    
    @GetMapping("/regulations/popular")
    public Result<List<Map<String, Object>>> getPopularRegulations(
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(legalKnowledgeService.getPopularRegulations(limit));
    }
    
    @GetMapping("/regulations/latest")
    public Result<List<Map<String, Object>>> getLatestRegulations(
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(legalKnowledgeService.getLatestRegulations(limit));
    }
    
    @PostMapping("/favorites")
    public Result<?> addFavorite(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String regulationId = body.get("regulationId");
        if (regulationId == null) {
            return Result.error(400, "regulationId不能为空");
        }
        String userId = (String) request.getAttribute("userId");
        legalKnowledgeService.addFavorite(userId, regulationId);
        return Result.success("收藏成功", null);
    }
    
    @DeleteMapping("/favorites/{regulationId}")
    public Result<?> removeFavorite(@PathVariable String regulationId, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        legalKnowledgeService.removeFavorite(userId, regulationId);
        return Result.success("取消收藏成功", null);
    }
    
    @GetMapping("/favorites")
    public Result<PageResult<Map<String, Object>>> listFavorites(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(legalKnowledgeService.listFavorites(userId, page, pageSize));
    }
    
    @GetMapping("/favorites/check/{regulationId}")
    public Result<Map<String, Object>> checkFavorite(@PathVariable String regulationId,
                                                     HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        boolean favorited = legalKnowledgeService.checkFavorite(userId, regulationId);
        return Result.success(Map.of("regulationId", regulationId, "favorited", favorited));
    }
    
    @PostMapping("/favorites/batch-check")
    public Result<Map<String, Boolean>> batchCheckFavorites(
            @Valid @RequestBody FavoriteBatchCheckRequest requestBody,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(legalKnowledgeService.batchCheckFavorites(userId, requestBody));
    }
    
    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}

