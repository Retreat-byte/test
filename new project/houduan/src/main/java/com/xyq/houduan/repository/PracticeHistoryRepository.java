package com.xyq.houduan.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.xyq.houduan.entity.PracticeHistory;

/**
 * 练习历史Repository接口
 */
@Repository
public interface PracticeHistoryRepository extends JpaRepository<PracticeHistory, Long> {

    /**
     * 根据用户ID查找所有练习记录
     */
    List<PracticeHistory> findByUserIdAndDeletedFalseOrderByDateDesc(Long userId);

    /**
     * 根据用户ID分页查找练习记录
     */
    Page<PracticeHistory> findByUserIdAndDeletedFalseOrderByDateDesc(Long userId, Pageable pageable);

    /**
     * 根据用户ID和练习类型查找记录
     */
    List<PracticeHistory> findByUserIdAndTypeAndDeletedFalseOrderByDateDesc(
        Long userId, PracticeHistory.PracticeType type);

    /**
     * 根据用户ID和日期范围查找练习记录
     */
    List<PracticeHistory> findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 根据用户ID和日期范围分页查找练习记录
     */
    Page<PracticeHistory> findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * 根据用户ID分页查找练习记录
     */
    Page<PracticeHistory> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    /**
     * 根据ID、用户ID和删除状态查找练习记录
     */
    Optional<PracticeHistory> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    /**
     * 根据用户ID和练习类型分页查找记录
     */
    Page<PracticeHistory> findByUserIdAndTypeAndDeletedFalse(
        Long userId, PracticeHistory.PracticeType type, Pageable pageable);

    /**
     * 根据用户ID和日期查找练习记录
     */
    List<PracticeHistory> findByUserIdAndDateAndDeletedFalse(Long userId, LocalDate date);

    /**
     * 根据用户ID、练习类型和日期范围查找记录
     */
    List<PracticeHistory> findByUserIdAndTypeAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, PracticeHistory.PracticeType type, LocalDate startDate, LocalDate endDate);

    /**
     * 根据用户ID和练习名称查找记录
     */
    List<PracticeHistory> findByUserIdAndNameContainingAndDeletedFalseOrderByDateDesc(
        Long userId, String name);

    /**
     * 统计用户练习次数
     */
    @Query("SELECT COUNT(p) FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 统计用户指定类型的练习次数
     */
    @Query("SELECT COUNT(p) FROM PracticeHistory p WHERE p.userId = :userId AND p.type = :type AND p.deleted = false")
    long countByUserIdAndType(@Param("userId") Long userId, @Param("type") PracticeHistory.PracticeType type);

    /**
     * 计算用户累计练习时长(秒)
     */
    @Query("SELECT SUM(p.duration) FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false")
    Long getTotalDurationByUserId(@Param("userId") Long userId);

    /**
     * 计算用户指定类型的累计练习时长(秒)
     */
    @Query("SELECT SUM(p.duration) FROM PracticeHistory p WHERE p.userId = :userId AND p.type = :type AND p.deleted = false")
    Long getTotalDurationByUserIdAndType(@Param("userId") Long userId, @Param("type") PracticeHistory.PracticeType type);

    /**
     * 计算用户平均练习时长(秒)
     */
    @Query("SELECT AVG(p.duration) FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false")
    Double getAverageDurationByUserId(@Param("userId") Long userId);

    /**
     * 获取用户最近N天的练习记录
     */
    @Query("SELECT p FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "AND p.date >= :startDate " +
           "ORDER BY p.date DESC")
    List<PracticeHistory> findRecentPracticeRecords(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    /**
     * 获取用户最近7天的练习记录
     */
    @Query("SELECT p FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "AND p.date >= :startDate " +
           "ORDER BY p.date DESC")
    List<PracticeHistory> findLast7DaysPracticeRecords(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    /**
     * 获取用户最近30天的练习记录
     */
    @Query("SELECT p FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "AND p.date >= :startDate " +
           "ORDER BY p.date DESC")
    List<PracticeHistory> findLast30DaysPracticeRecords(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    /**
     * 获取用户练习统计信息
     */
    @Query("SELECT " +
           "COUNT(p) as totalPractices, " +
           "SUM(p.duration) as totalDuration, " +
           "AVG(p.duration) as avgDuration, " +
           "COUNT(CASE WHEN p.type = 'breathing' THEN 1 END) as breathingCount, " +
           "COUNT(CASE WHEN p.type = 'meditation' THEN 1 END) as meditationCount, " +
           "SUM(CASE WHEN p.type = 'breathing' THEN p.duration ELSE 0 END) as breathingDuration, " +
           "SUM(CASE WHEN p.type = 'meditation' THEN p.duration ELSE 0 END) as meditationDuration " +
           "FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false")
    Object[] getPracticeStatistics(@Param("userId") Long userId);

    /**
     * 根据练习类型统计记录数
     */
    @Query("SELECT p.type, COUNT(p) FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "GROUP BY p.type ORDER BY COUNT(p) DESC")
    List<Object[]> countByPracticeType(@Param("userId") Long userId);

    /**
     * 根据练习名称统计记录数
     */
    @Query("SELECT p.name, COUNT(p) FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "GROUP BY p.name ORDER BY COUNT(p) DESC")
    List<Object[]> countByPracticeName(@Param("userId") Long userId);

    /**
     * 获取用户最常练习的类型
     */
    @Query("SELECT p.type, COUNT(p) as count FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "GROUP BY p.type ORDER BY count DESC LIMIT 1")
    Object[] getMostFrequentPracticeType(@Param("userId") Long userId);

    /**
     * 获取用户最近一次练习记录
     */
    @Query("SELECT p FROM PracticeHistory p WHERE p.userId = :userId AND p.deleted = false " +
           "ORDER BY p.date DESC, p.timestamp DESC LIMIT 1")
    PracticeHistory findLatestPracticeRecord(@Param("userId") Long userId);
}
