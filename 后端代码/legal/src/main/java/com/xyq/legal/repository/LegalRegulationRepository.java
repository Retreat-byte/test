package com.xyq.legal.repository;

import com.xyq.legal.entity.LegalRegulation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LegalRegulationRepository extends JpaRepository<LegalRegulation, String> {
    
    @Query("SELECT r FROM LegalRegulation r WHERE " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR (r.content IS NOT NULL AND LOWER(r.content) LIKE LOWER(CONCAT('%', :keyword, '%')))) AND " +
           "(:updateYear IS NULL OR FUNCTION('YEAR', r.updateDate) = :updateYear)")
    Page<LegalRegulation> search(@Param("category") String category,
                                 @Param("status") String status,
                                 @Param("keyword") String keyword,
                                 @Param("updateYear") Integer updateYear,
                                 Pageable pageable);
    
    @Query("SELECT DISTINCT r.category FROM LegalRegulation r WHERE r.category IS NOT NULL ORDER BY r.category")
    List<String> findDistinctCategories();
    
    List<LegalRegulation> findTop10ByOrderByArticleCountDesc();
    
    List<LegalRegulation> findTop10ByOrderByUpdateDateDesc();
}

