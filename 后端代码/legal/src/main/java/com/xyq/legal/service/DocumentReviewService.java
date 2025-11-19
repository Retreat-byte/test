package com.xyq.legal.service;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.entity.DocumentReview;
import com.xyq.legal.entity.User;
import com.xyq.legal.repository.DocumentReviewRepository;
import com.xyq.legal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentReviewService {
    
    private final DocumentReviewRepository documentReviewRepository;
    private final UserRepository userRepository;
    
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;
    
    @Transactional
    public Map<String, Object> reviewDocument(String userId, MultipartFile file) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("用户ID不能为空");
        }
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }
        
        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("文件名不能为空");
        }
        
        String extension = StringUtils.getFilenameExtension(originalFilename);
        if (extension == null || (!extension.equalsIgnoreCase("pdf") && !extension.equalsIgnoreCase("docx"))) {
            throw new RuntimeException("仅支持 PDF 或 DOCX 格式的文件");
        }
        
        // 验证文件大小（10MB）
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("文件大小不能超过 10MB");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 保存文件
        String filename = userId + "_" + System.currentTimeMillis() + "." + extension;
        try {
            Path documentDir = Paths.get(uploadDir, "documents").toAbsolutePath().normalize();
            Files.createDirectories(documentDir);
            Path target = documentDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "/uploads/documents/" + filename;
            
            // 执行AI审查（模拟）
            Map<String, Object> reviewResult = performAIReview(file, originalFilename);
            
            // 保存审查记录
            DocumentReview review = new DocumentReview();
            review.setUser(user);
            review.setFileName(originalFilename);
            review.setFileUrl(fileUrl);
            review.setFileSize(file.getSize());
            review.setFileType(extension.toLowerCase());
            review.setSuggestions((List<Map<String, Object>>) reviewResult.get("suggestions"));
            review.setOverallScore((Integer) reviewResult.get("overallScore"));
            
            documentReviewRepository.save(review);
            
            // 返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("id", review.getId());
            result.put("fileName", review.getFileName());
            result.put("fileUrl", review.getFileUrl());
            result.put("fileSize", review.getFileSize());
            result.put("fileType", review.getFileType());
            result.put("suggestions", review.getSuggestions());
            result.put("overallScore", review.getOverallScore());
            result.put("createdAt", review.getCreatedAt());
            
            return result;
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }
    
    /**
     * 模拟AI审查逻辑
     * 实际项目中应该调用真实的AI服务
     */
    private Map<String, Object> performAIReview(MultipartFile file, String fileName) {
        // 模拟AI审查结果
        List<Map<String, Object>> suggestions = new ArrayList<>();
        
        // 生成一些示例建议
        Random random = new Random();
        int suggestionCount = 3 + random.nextInt(5); // 3-7条建议
        
        String[] suggestionTypes = {"warning", "error", "info"};
        String[] suggestionTitles = {
            "违约责任条款不明确",
            "合同期限表述模糊",
            "缺少争议解决条款",
            "金额数字大小写不一致",
            "缺少签字盖章位置",
            "条款编号不规范",
            "引用法律条文不准确"
        };
        String[] descriptions = {
            "第5条违约责任条款描述过于笼统，建议明确具体违约情形和赔偿标准",
            "合同期限表述不够清晰，建议使用明确的起止日期",
            "合同中缺少争议解决方式条款，建议补充仲裁或诉讼条款",
            "金额数字存在大小写不一致的情况，建议统一格式",
            "合同末尾缺少明确的签字盖章位置，建议标注清楚",
            "条款编号存在跳跃或不规范的情况，建议重新编号",
            "引用的法律条文可能已失效或更新，建议核实最新版本"
        };
        String[] severities = {"low", "medium", "high"};
        
        int totalScore = 100;
        
        for (int i = 0; i < suggestionCount; i++) {
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("type", suggestionTypes[random.nextInt(suggestionTypes.length)]);
            suggestion.put("title", suggestionTitles[random.nextInt(suggestionTitles.length)]);
            suggestion.put("description", descriptions[random.nextInt(descriptions.length)]);
            suggestion.put("severity", severities[random.nextInt(severities.length)]);
            suggestion.put("position", "第" + (i + 1) + "条");
            
            // 根据严重程度扣分
            String severity = (String) suggestion.get("severity");
            if ("high".equals(severity)) {
                totalScore -= 15;
            } else if ("medium".equals(severity)) {
                totalScore -= 10;
            } else {
                totalScore -= 5;
            }
            
            suggestions.add(suggestion);
        }
        
        // 确保分数在合理范围内
        totalScore = Math.max(60, Math.min(100, totalScore));
        
        Map<String, Object> result = new HashMap<>();
        result.put("suggestions", suggestions);
        result.put("overallScore", totalScore);
        
        return result;
    }
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> getReviewList(String userId, int page, int pageSize) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("用户ID不能为空");
        }
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize);
        Page<DocumentReview> pageData = documentReviewRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        
        List<Map<String, Object>> list = pageData.getContent().stream()
                .map(this::buildReviewSummary)
                .collect(Collectors.toList());
        
        return PageResult.of(list, pageData.getTotalElements(), page, pageSize);
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getReviewDetail(String userId, String reviewId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("用户ID不能为空");
        }
        if (reviewId == null || reviewId.trim().isEmpty()) {
            throw new RuntimeException("审查记录ID不能为空");
        }
        DocumentReview review = documentReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("审查记录不存在"));
        
        // 验证权限：只能查看自己的记录
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问该记录");
        }
        
        return buildReviewDetail(review);
    }
    
    @Transactional
    public void deleteReview(String userId, String reviewId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("用户ID不能为空");
        }
        if (reviewId == null || reviewId.trim().isEmpty()) {
            throw new RuntimeException("审查记录ID不能为空");
        }
        DocumentReview review = documentReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("审查记录不存在"));
        
        // 验证权限：只能删除自己的记录
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除该记录");
        }
        
        // 删除文件（如果存在）
        if (review.getFileUrl() != null && !review.getFileUrl().isEmpty()) {
            try {
                String filePath = review.getFileUrl().replace("/uploads/", "");
                Path file = Paths.get(uploadDir, filePath).toAbsolutePath().normalize();
                if (Files.exists(file)) {
                    Files.delete(file);
                }
            } catch (IOException e) {
                // 文件删除失败不影响记录删除
                System.err.println("删除文件失败: " + e.getMessage());
            }
        }
        
        documentReviewRepository.delete(review);
    }
    
    private Map<String, Object> buildReviewSummary(DocumentReview review) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", review.getId());
        map.put("fileName", review.getFileName());
        map.put("fileSize", review.getFileSize());
        map.put("fileType", review.getFileType());
        map.put("overallScore", review.getOverallScore());
        map.put("suggestionCount", review.getSuggestions() != null ? review.getSuggestions().size() : 0);
        map.put("createdAt", review.getCreatedAt());
        return map;
    }
    
    private Map<String, Object> buildReviewDetail(DocumentReview review) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", review.getId());
        map.put("fileName", review.getFileName());
        map.put("fileUrl", review.getFileUrl());
        map.put("fileSize", review.getFileSize());
        map.put("fileType", review.getFileType());
        map.put("suggestions", review.getSuggestions());
        map.put("overallScore", review.getOverallScore());
        map.put("createdAt", review.getCreatedAt());
        map.put("updatedAt", review.getUpdatedAt());
        return map;
    }
}

