package com.xyq.legal.repository;

import com.xyq.legal.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    Page<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId, Pageable pageable);
}

