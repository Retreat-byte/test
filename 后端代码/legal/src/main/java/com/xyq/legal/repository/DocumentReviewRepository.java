package com.xyq.legal.repository;

import com.xyq.legal.entity.DocumentReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentReviewRepository extends JpaRepository<DocumentReview, String> {
    Page<DocumentReview> findByUser_IdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUser_Id(String userId);
    
    @Query("SELECT COUNT(d) FROM DocumentReview d WHERE d.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
}

