package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "document_templates", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_download_count", columnList = "download_count")
})
public class DocumentTemplate extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String category;
    
    @Column(name = "file_url", length = 500)
    private String fileUrl;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;
    
    @Column(name = "file_type", length = 20)
    private String fileType = "pdf";
    
    @Column(name = "download_count", nullable = false)
    private Integer downloadCount = 0;
    
    @Column(name = "preview_url", length = 500)
    private String previewUrl;
}

