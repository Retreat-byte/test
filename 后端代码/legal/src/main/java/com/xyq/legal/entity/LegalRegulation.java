package com.xyq.legal.entity;

import java.time.LocalDate;

import com.xyq.legal.entity.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "legal_regulations", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_title", columnList = "title"),
    @Index(name = "idx_status", columnList = "status")
})
public class LegalRegulation extends BaseEntity {
    
    @Column(nullable = false, length = 300)
    private String title;
    
    @Column(name = "article_count", nullable = false)
    private Integer articleCount = 0;
    
    @Column(length = 50)
    private String category;
    
    @Column(name = "effective_date")
    private LocalDate effectiveDate;
    
    @Column(name = "update_date")
    private LocalDate updateDate;
    
    @Column(length = 20)
    private String status = "有效";
    
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;
}

