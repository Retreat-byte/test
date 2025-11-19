package com.xyq.legal.service;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.dto.TemplateDownloadRequest;
import com.xyq.legal.entity.DocumentTemplate;
import com.xyq.legal.entity.DownloadRecord;
import com.xyq.legal.entity.User;
import com.xyq.legal.repository.DocumentTemplateRepository;
import com.xyq.legal.repository.DownloadRecordRepository;
import com.xyq.legal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentTemplateService {
    
    private final DocumentTemplateRepository templateRepository;
    private final DownloadRecordRepository downloadRecordRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> listTemplates(String category, String keyword, int page, int pageSize) {
        category = normalize(category);
        keyword = normalize(keyword);
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<DocumentTemplate> pageData = templateRepository.search(category, keyword, pageable);
        List<Map<String, Object>> list = pageData.getContent().stream()
                .map(this::buildTemplateSummary)
                .collect(Collectors.toList());
        return PageResult.of(list, pageData.getTotalElements(), page, pageSize);
    }
    
    @Transactional(readOnly = true)
    public DocumentTemplate getTemplate(String id) {
        String targetId = Objects.requireNonNull(id, "模板ID不能为空");
        return templateRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("模板不存在"));
    }
    
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return templateRepository.findDistinctCategories();
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularTemplates(int limit) {
        return templateRepository.findTop5ByOrderByDownloadCountDesc()
                .stream()
                .limit(limit)
                .map(this::buildTemplateSummary)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void recordDownload(String userId, TemplateDownloadRequest request) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        String templateId = Objects.requireNonNull(request.getTemplateId(), "模板ID不能为空");
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        DocumentTemplate template = getTemplate(templateId);
        
        DownloadRecord record = new DownloadRecord();
        record.setUser(user);
        record.setTemplate(template);
        downloadRecordRepository.save(record);
        
        template.setDownloadCount(template.getDownloadCount() + 1);
        templateRepository.save(template);
    }
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> getDownloadHistory(String userId, int page, int pageSize) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize);
        Page<DownloadRecord> pageData = downloadRecordRepository.findByUserIdOrderByCreatedAtDesc(targetUserId, pageable);
        List<Map<String, Object>> list = pageData.getContent().stream()
                .map(record -> {
                    Map<String, Object> map = buildTemplateSummary(record.getTemplate());
                    map.put("downloadRecordId", record.getId());
                    map.put("downloadAt", record.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        return PageResult.of(list, pageData.getTotalElements(), page, pageSize);
    }
    
    public Resource loadTemplateResource(DocumentTemplate template) {
        String fileUrl = template.getFileUrl();
        if (fileUrl == null) {
            throw new RuntimeException("模板文件未配置");
        }
        try {
            URL url = new URL(fileUrl);
            Resource resource = new UrlResource(url);
            if (!resource.exists()) {
                throw new RuntimeException("模板文件不存在");
            }
            return resource;
        } catch (MalformedURLException e) {
            // 可能是本地路径
            try {
                Path path = Paths.get(fileUrl).toAbsolutePath().normalize();
                URI uri = path.toUri();
                Resource resource = new UrlResource(Objects.requireNonNull(uri, "文件路径无效"));
                if (!resource.exists()) {
                    throw new RuntimeException("模板文件不存在");
                }
                return resource;
            } catch (MalformedURLException ex) {
                throw new RuntimeException("无法读取模板文件");
            }
        }
    }
    
    public MediaType resolveMediaType(DocumentTemplate template) {
        String fileType = template.getFileType();
        if ("docx".equalsIgnoreCase(fileType)) {
            return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }
        return MediaType.APPLICATION_PDF;
    }
    
    private Map<String, Object> buildTemplateSummary(DocumentTemplate template) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", template.getId());
        map.put("title", template.getTitle());
        map.put("description", template.getDescription());
        map.put("category", template.getCategory());
        map.put("fileType", template.getFileType());
        map.put("fileSize", template.getFileSize());
        map.put("downloadCount", template.getDownloadCount());
        map.put("previewUrl", template.getPreviewUrl());
        map.put("createdAt", template.getCreatedAt());
        map.put("updatedAt", template.getUpdatedAt());
        return map;
    }
    
    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}

