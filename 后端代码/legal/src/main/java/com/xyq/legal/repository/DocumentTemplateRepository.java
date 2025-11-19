package com.xyq.legal.repository;

import com.xyq.legal.entity.DocumentTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, String> {
    
    @Query("SELECT t FROM DocumentTemplate t WHERE " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<DocumentTemplate> search(@Param("category") String category,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);
    
    @Query("SELECT DISTINCT t.category FROM DocumentTemplate t WHERE t.category IS NOT NULL ORDER BY t.category")
    List<String> findDistinctCategories();
    
    List<DocumentTemplate> findTop5ByOrderByDownloadCountDesc();
}

