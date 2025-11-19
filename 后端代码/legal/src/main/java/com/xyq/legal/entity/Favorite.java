package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "favorites", 
    uniqueConstraints = @UniqueConstraint(name = "uk_user_regulation", 
        columnNames = {"user_id", "regulation_id"}),
    indexes = @Index(name = "idx_user_id", columnList = "user_id")
)
public class Favorite extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regulation_id", nullable = false)
    private LegalRegulation regulation;
}

