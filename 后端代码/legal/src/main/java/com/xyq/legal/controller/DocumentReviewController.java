package com.xyq.legal.controller;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.common.Result;
import com.xyq.legal.service.DocumentReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/legal-tools/document-review")
@RequiredArgsConstructor
public class DocumentReviewController {
    
    private final DocumentReviewService documentReviewService;
    
    /**
     * 上传文件进行AI审查
     */
    @PostMapping
    public Result<Map<String, Object>> reviewDocument(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(401, "未授权，请先登录");
        }
        if (file == null || file.isEmpty()) {
            return Result.error(400, "文件不能为空");
        }
        Map<String, Object> result = documentReviewService.reviewDocument(userId, file);
        return Result.success("审查完成", result);
    }
    
    /**
     * 获取审查历史记录列表
     */
    @GetMapping("/history")
    public Result<PageResult<Map<String, Object>>> getReviewList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(401, "未授权，请先登录");
        }
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }
        return Result.success(documentReviewService.getReviewList(userId, page, pageSize));
    }
    
    /**
     * 获取审查记录详情
     */
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getReviewDetail(
            @PathVariable String id,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(401, "未授权，请先登录");
        }
        if (id == null || id.trim().isEmpty()) {
            return Result.error(400, "审查记录ID不能为空");
        }
        return Result.success(documentReviewService.getReviewDetail(userId, id));
    }
    
    /**
     * 删除审查记录
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteReview(
            @PathVariable String id,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(401, "未授权，请先登录");
        }
        if (id == null || id.trim().isEmpty()) {
            return Result.error(400, "审查记录ID不能为空");
        }
        documentReviewService.deleteReview(userId, id);
        return Result.success("删除成功", null);
    }
}

