package com.xyq.houduan.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.xyq.houduan.entity.UserSession;
import com.xyq.houduan.entity.UserSession.SessionStatus;
import com.xyq.houduan.entity.UserSession.SessionType;

/**
 * 用户会话数据访问层
 */
@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    /**
     * 根据用户ID查找会话列表
     */
    List<UserSession> findByUserIdOrderByStartTimeDesc(Long userId);

    /**
     * 根据用户ID分页查找会话列表
     */
    Page<UserSession> findByUserIdOrderByStartTimeDesc(Long userId, Pageable pageable);

    /**
     * 根据会话ID查找会话
     */
    Optional<UserSession> findBySessionId(String sessionId);

    /**
     * 根据用户ID和会话类型查找会话列表
     */
    List<UserSession> findByUserIdAndSessionTypeOrderByStartTimeDesc(Long userId, SessionType sessionType);

    /**
     * 根据用户ID和状态查找会话列表
     */
    List<UserSession> findByUserIdAndStatusOrderByStartTimeDesc(Long userId, SessionStatus status);

    /**
     * 根据用户ID和会话类型和状态查找会话列表
     */
    List<UserSession> findByUserIdAndSessionTypeAndStatusOrderByStartTimeDesc(
            Long userId, SessionType sessionType, SessionStatus status);

    /**
     * 查找用户活跃会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.status = 'ACTIVE' ORDER BY s.startTime DESC")
    List<UserSession> findActiveSessionsByUserId(@Param("userId") Long userId);

    /**
     * 根据时间范围查找会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.startTime BETWEEN :startTime AND :endTime ORDER BY s.startTime DESC")
    List<UserSession> findByUserIdAndTimeRange(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * 统计用户会话数量
     */
    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    /**
     * 统计用户指定类型的会话数量
     */
    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user.id = :userId AND s.sessionType = :sessionType")
    Long countByUserIdAndSessionType(@Param("userId") Long userId, @Param("sessionType") SessionType sessionType);

    /**
     * 统计用户指定状态的会话数量
     */
    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user.id = :userId AND s.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") SessionStatus status);

    /**
     * 计算用户总练习时长(秒)
     */
    @Query("SELECT COALESCE(SUM(s.duration), 0) FROM UserSession s WHERE s.user.id = :userId AND s.status = 'COMPLETED'")
    Long calculateTotalDurationByUserId(@Param("userId") Long userId);

    /**
     * 计算用户指定类型的总练习时长(秒)
     */
    @Query("SELECT COALESCE(SUM(s.duration), 0) FROM UserSession s WHERE s.user.id = :userId AND s.sessionType = :sessionType AND s.status = 'COMPLETED'")
    Long calculateTotalDurationByUserIdAndSessionType(@Param("userId") Long userId, @Param("sessionType") SessionType sessionType);

    /**
     * 查找用户最近的会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId ORDER BY s.startTime DESC")
    List<UserSession> findRecentSessionsByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 查找超时的活跃会话
     */
    @Query("SELECT s FROM UserSession s WHERE s.status = 'ACTIVE' AND s.startTime < :timeoutTime")
    List<UserSession> findTimeoutActiveSessions(@Param("timeoutTime") LocalDateTime timeoutTime);

    /**
     * 删除用户的所有会话
     */
    void deleteByUserId(Long userId);

    /**
     * 删除指定时间之前的会话
     */
    void deleteByStartTimeBefore(LocalDateTime cutoffTime);
}
