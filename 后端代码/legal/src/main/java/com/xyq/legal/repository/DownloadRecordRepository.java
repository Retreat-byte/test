package com.xyq.legal.repository;

import com.xyq.legal.entity.DownloadRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DownloadRecordRepository extends JpaRepository<DownloadRecord, String> {
    Page<DownloadRecord> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
}

