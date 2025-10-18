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

import com.xyq.houduan.entity.MoodRecord;

/**
 * 心情记录Repository接口
 */
@Repository
public interface MoodRecordRepository extends JpaRepository<MoodRecord, Long> {

    /**
     * 根据用户ID和日期查找心情记录
     */
    Optional<MoodRecord> findByUserIdAndDateAndDeletedFalse(Long userId, LocalDate date);

    /**
     * 根据用户ID查找所有心情记录
     */
    List<MoodRecord> findByUserIdAndDeletedFalseOrderByDateDesc(Long userId);

    /**
     * 根据用户ID分页查找心情记录
     */
    Page<MoodRecord> findByUserIdAndDeletedFalseOrderByDateDesc(Long userId, Pageable pageable);

    /**
     * 根据用户ID和日期范围查找心情记录
     */
    List<MoodRecord> findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 根据用户ID和日期范围分页查找心情记录
     */
    Page<MoodRecord> findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * 根据用户ID分页查找心情记录
     */
    Page<MoodRecord> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    /**
     * 根据ID、用户ID和删除状态查找心情记录
     */
    Optional<MoodRecord> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    /**
     * 根据用户ID和心情类型查找记录
     */
    List<MoodRecord> findByUserIdAndMoodAndDeletedFalseOrderByDateDesc(Long userId, String mood);

    /**
     * 根据用户ID和心情分数范围查找记录
     */
    List<MoodRecord> findByUserIdAndValueBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, Integer minValue, Integer maxValue);

    /**
     * 统计用户打卡天数
     */
    @Query("SELECT COUNT(m) FROM MoodRecord m WHERE m.userId = :userId AND m.deleted = false")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 计算用户平均心情分数
     */
    @Query("SELECT AVG(m.value) FROM MoodRecord m WHERE m.userId = :userId AND m.deleted = false")
    Double getAverageMoodValueByUserId(@Param("userId") Long userId);

    /**
     * 获取用户最近N天的心情记录
     */
    @Query("SELECT m FROM MoodRecord m WHERE m.userId = :userId AND m.deleted = false " +
           "ORDER BY m.date DESC LIMIT :days")
    List<MoodRecord> findRecentMoodRecords(@Param("userId") Long userId, @Param("days") int days);

    /**
     * 获取用户连续打卡天数
     */
    @Query(value = "SELECT COUNT(*) FROM (" +
           "SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) as rn " +
           "FROM mood_records " +
           "WHERE user_id = :userId AND deleted = false " +
           "ORDER BY date DESC" +
           ") t WHERE DATE_SUB(CURDATE(), INTERVAL rn-1 DAY) = date",
           nativeQuery = true)
    int getConsecutiveCheckinDays(@Param("userId") Long userId);

    /**
     * 获取用户今日是否已打卡
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
           "FROM MoodRecord m WHERE m.userId = :userId AND m.date = CURRENT_DATE AND m.deleted = false")
    boolean hasCheckedInToday(@Param("userId") Long userId);

    /**
     * 获取用户心情统计信息
     */
    @Query("SELECT " +
           "COUNT(m) as totalDays, " +
           "AVG(m.value) as averageScore, " +
           "MAX(m.value) as maxScore, " +
           "MIN(m.value) as minScore, " +
           "COUNT(CASE WHEN m.value >= 8 THEN 1 END) as happyDays, " +
           "COUNT(CASE WHEN m.value <= 3 THEN 1 END) as sadDays " +
           "FROM MoodRecord m WHERE m.userId = :userId AND m.deleted = false")
    Object[] getMoodStatistics(@Param("userId") Long userId);

    /**
     * 获取用户最近7天的心情记录
     */
    @Query(value = "SELECT * FROM mood_records WHERE user_id = :userId AND deleted = false " +
           "AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) " +
           "ORDER BY date DESC", nativeQuery = true)
    List<MoodRecord> findLast7DaysMoodRecords(@Param("userId") Long userId);

    /**
     * 获取用户最近30天的心情记录
     */
    @Query(value = "SELECT * FROM mood_records WHERE user_id = :userId AND deleted = false " +
           "AND date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) " +
           "ORDER BY date DESC", nativeQuery = true)
    List<MoodRecord> findLast30DaysMoodRecords(@Param("userId") Long userId);

    /**
     * 根据心情类型统计记录数
     */
    @Query("SELECT m.mood, COUNT(m) FROM MoodRecord m WHERE m.userId = :userId AND m.deleted = false " +
           "GROUP BY m.mood ORDER BY COUNT(m) DESC")
    List<Object[]> countByMoodType(@Param("userId") Long userId);
}
