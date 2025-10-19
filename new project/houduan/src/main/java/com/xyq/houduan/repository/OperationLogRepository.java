package com.xyq.houduan.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.xyq.houduan.entity.OperationLog;

/**
 * 操作日志Repository接口
 */
@Repository
public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {

    /**
     * 根据用户ID查找操作日志
     */
    List<OperationLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 根据用户ID分页查找操作日志
     */
    Page<OperationLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 根据操作类型查找日志
     */
    List<OperationLog> findByOperationOrderByCreatedAtDesc(String operation);

    /**
     * 根据操作状态查找日志
     */
    List<OperationLog> findByStatusOrderByCreatedAtDesc(OperationLog.OperationStatus status);

    /**
     * 根据用户ID和操作类型查找日志
     */
    List<OperationLog> findByUserIdAndOperationOrderByCreatedAtDesc(Long userId, String operation);

    /**
     * 根据用户ID和操作状态查找日志
     */
    List<OperationLog> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OperationLog.OperationStatus status);

    /**
     * 根据时间范围查找日志
     */
    List<OperationLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 根据用户ID和时间范围查找日志
     */
    List<OperationLog> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
        Long userId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 根据IP地址查找日志
     */
    List<OperationLog> findByIpAddressOrderByCreatedAtDesc(String ipAddress);

    /**
     * 统计用户操作次数
     */
    @Query("SELECT COUNT(ol) FROM OperationLog ol WHERE ol.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 统计用户指定操作类型的次数
     */
    @Query("SELECT COUNT(ol) FROM OperationLog ol WHERE ol.userId = :userId AND ol.operation = :operation")
    long countByUserIdAndOperation(@Param("userId") Long userId, @Param("operation") String operation);

    /**
     * 统计用户成功操作次数
     */
    @Query("SELECT COUNT(ol) FROM OperationLog ol WHERE ol.userId = :userId AND ol.status = 'SUCCESS'")
    long countSuccessOperationsByUserId(@Param("userId") Long userId);

    /**
     * 统计用户失败操作次数
     */
    @Query("SELECT COUNT(ol) FROM OperationLog ol WHERE ol.userId = :userId AND ol.status = 'FAILURE'")
    long countFailureOperationsByUserId(@Param("userId") Long userId);

    /**
     * 获取用户最近N次操作日志
     */
    @Query("SELECT ol FROM OperationLog ol WHERE ol.userId = :userId " +
           "ORDER BY ol.createdAt DESC LIMIT :limit")
    List<OperationLog> findRecentOperationsByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 根据操作类型统计日志数量
     */
    @Query("SELECT ol.operation, COUNT(ol) FROM OperationLog ol " +
           "GROUP BY ol.operation ORDER BY COUNT(ol) DESC")
    List<Object[]> countByOperationType();

    /**
     * 根据操作状态统计日志数量
     */
    @Query("SELECT ol.status, COUNT(ol) FROM OperationLog ol " +
           "GROUP BY ol.status ORDER BY COUNT(ol) DESC")
    List<Object[]> countByOperationStatus();

    /**
     * 获取用户操作统计信息
     */
    @Query("SELECT " +
           "COUNT(ol) as totalOperations, " +
           "COUNT(CASE WHEN ol.status = 'SUCCESS' THEN 1 END) as successOperations, " +
           "COUNT(CASE WHEN ol.status = 'FAILURE' THEN 1 END) as failureOperations, " +
           "MIN(ol.createdAt) as firstOperationTime, " +
           "MAX(ol.createdAt) as lastOperationTime " +
           "FROM OperationLog ol WHERE ol.userId = :userId")
    Object[] getOperationStatistics(@Param("userId") Long userId);

    /**
     * 清理指定时间之前的日志
     */
    @Query("DELETE FROM OperationLog ol WHERE ol.createdAt < :cutoffTime")
    void deleteLogsBefore(@Param("cutoffTime") LocalDateTime cutoffTime);
}
