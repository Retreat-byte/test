package com.xyq.legal.repository;

import com.xyq.legal.entity.LegalCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LegalCaseRepository extends JpaRepository<LegalCase, String> {
    @Query("SELECT c FROM LegalCase c WHERE " +
           "(:keyword IS NULL OR c.title LIKE %:keyword%) AND " +
           "(:caseType IS NULL OR c.caseType = :caseType) AND " +
           "(:court IS NULL OR c.court = :court) AND " +
           "(:startDate IS NULL OR c.publishDate >= :startDate) AND " +
           "(:endDate IS NULL OR c.publishDate <= :endDate)")
    Page<LegalCase> search(@Param("keyword") String keyword,
                          @Param("caseType") String caseType,
                          @Param("court") String court,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate,
                          Pageable pageable);
    
    @Query("SELECT DISTINCT c.caseType FROM LegalCase c WHERE c.caseType IS NOT NULL ORDER BY c.caseType")
    List<String> findDistinctCaseTypes();
    
    @Query("SELECT DISTINCT c.court FROM LegalCase c WHERE c.court IS NOT NULL ORDER BY c.court")
    List<String> findDistinctCourts();
}

