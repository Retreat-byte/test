package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "case_search_history", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class CaseSearchHistory extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 200)
    private String keyword;
    
    @Column(name = "case_type", length = 50)
    private String caseType;
    
    @Column(length = 200)
    private String court;
    
    @Column(name = "result_count", nullable = false)
    private Integer resultCount = 0;
}

