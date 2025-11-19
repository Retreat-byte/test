package com.xyq.legal.controller;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.common.Result;
import com.xyq.legal.dto.TemplateDownloadRequest;
import com.xyq.legal.entity.DocumentTemplate;
import com.xyq.legal.service.DocumentTemplateService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/legal-tools/templates")
@RequiredArgsConstructor
public class DocumentTemplateController {
    
    private final DocumentTemplateService documentTemplateService;
    
    @GetMapping
    public Result<PageResult<Map<String, Object>>> listTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer pageSize) {
        return Result.success(documentTemplateService.listTemplates(category, keyword, page, pageSize));
    }
    
    @GetMapping("/{id}")
    public Result<DocumentTemplate> getTemplate(@PathVariable String id) {
        return Result.success(documentTemplateService.getTemplate(id));
    }
    
    @GetMapping("/{id}/preview")
    public Result<Map<String, Object>> previewTemplate(@PathVariable String id) {
        DocumentTemplate template = documentTemplateService.getTemplate(id);
        Map<String, Object> data = Map.of(
                "templateId", id,
                "previewUrl", template.getPreviewUrl() == null ? "" : template.getPreviewUrl(),
                "fileUrl", template.getFileUrl() == null ? "" : template.getFileUrl()
        );
        return Result.success(data);
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadTemplate(@PathVariable String id) {
        DocumentTemplate template = documentTemplateService.getTemplate(id);
        Resource resource = documentTemplateService.loadTemplateResource(template);
        String filename = template.getTitle() + "." + template.getFileType();
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
        var mediaType = Objects.requireNonNull(documentTemplateService.resolveMediaType(template), "文件类型未知");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                .body(resource);
    }
    
    @GetMapping("/categories")
    public Result<List<String>> getCategories() {
        return Result.success(documentTemplateService.getCategories());
    }
    
    @GetMapping("/popular")
    public Result<List<Map<String, Object>>> getPopularTemplates(
            @RequestParam(defaultValue = "5") Integer limit) {
        return Result.success(documentTemplateService.getPopularTemplates(limit));
    }
    
    @PostMapping("/download-record")
    public Result<?> recordDownload(@Valid @RequestBody TemplateDownloadRequest requestBody,
                                    HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        documentTemplateService.recordDownload(userId, requestBody);
        return Result.success("记录成功", null);
    }
    
    @GetMapping("/download-history")
    public Result<PageResult<Map<String, Object>>> getDownloadHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(documentTemplateService.getDownloadHistory(userId, page, pageSize));
    }
}

