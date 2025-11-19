package com.xyq.legal.repository;

import com.xyq.legal.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    Optional<Favorite> findByUserIdAndRegulationId(String userId, String regulationId);
    boolean existsByUserIdAndRegulationId(String userId, String regulationId);
    Page<Favorite> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
}

