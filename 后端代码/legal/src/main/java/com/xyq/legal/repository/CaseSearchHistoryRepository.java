package com.xyq.legal.repository;

import com.xyq.legal.entity.CaseSearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseSearchHistoryRepository extends JpaRepository<CaseSearchHistory, String> {
    Page<CaseSearchHistory> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    void deleteByUserId(String userId);
    long countByUserId(String userId);
}

