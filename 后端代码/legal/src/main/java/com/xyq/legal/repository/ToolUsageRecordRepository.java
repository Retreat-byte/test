package com.xyq.legal.repository;

import com.xyq.legal.entity.ToolUsageRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ToolUsageRecordRepository extends JpaRepository<ToolUsageRecord, String> {
    Page<ToolUsageRecord> findByUserIdAndToolTypeOrderByCreatedAtDesc(
            String userId, String toolType, Pageable pageable);
    Page<ToolUsageRecord> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
}

