package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "legal_cases", indexes = {
    @Index(name = "idx_case_type", columnList = "case_type"),
    @Index(name = "idx_court", columnList = "court"),
    @Index(name = "idx_publish_date", columnList = "publish_date")
})
public class LegalCase extends BaseEntity {
    
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(name = "case_number", length = 100)
    private String caseNumber;
    
    @Column(name = "case_type", length = 50)
    private String caseType;
    
    @Column(length = 200)
    private String court;
    
    @Column(name = "publish_date")
    private LocalDate publishDate;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private Map<String, Object> content;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> keywords;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> relatedLaws;
}

