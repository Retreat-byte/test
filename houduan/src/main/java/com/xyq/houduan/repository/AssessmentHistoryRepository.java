package com.xyq.houduan.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.xyq.houduan.entity.AssessmentHistory;

/**
 * 测评历史Repository接口
 */
@Repository
public interface AssessmentHistoryRepository extends JpaRepository<AssessmentHistory, Long> {

    /**
     * 根据用户ID查找所有测评记录
     */
    List<AssessmentHistory> findByUserIdAndDeletedFalseOrderByDateDesc(Long userId);

    /**
     * 根据用户ID分页查找测评记录
     */
    Page<AssessmentHistory> findByUserIdAndDeletedFalseOrderByDateDesc(Long userId, Pageable pageable);

    /**
     * 根据用户ID和测评类型查找记录
     */
    List<AssessmentHistory> findByUserIdAndTypeAndDeletedFalseOrderByDateDesc(
        Long userId, String type);

    /**
     * 根据用户ID和日期范围查找测评记录
     */
    List<AssessmentHistory> findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 根据用户ID、测评类型和日期范围查找记录
     */
    List<AssessmentHistory> findByUserIdAndTypeAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, String type, LocalDate startDate, LocalDate endDate);

    /**
     * 根据用户ID和测评名称查找记录
     */
    List<AssessmentHistory> findByUserIdAndNameContainingAndDeletedFalseOrderByDateDesc(
        Long userId, String name);

    /**
     * 根据用户ID和分数范围查找记录
     */
    List<AssessmentHistory> findByUserIdAndScoreBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, Integer minScore, Integer maxScore);

    /**
     * 统计用户测评次数
     */
    @Query("SELECT COUNT(a) FROM AssessmentHistory a WHERE a.userId = :userId AND a.deleted = false")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 统计用户指定类型的测评次数
     */
    @Query("SELECT COUNT(a) FROM AssessmentHistory a WHERE a.userId = :userId AND a.type = :type AND a.deleted = false")
    long countByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);

    /**
     * 计算用户平均测评分数
     */
    @Query("SELECT AVG(a.score) FROM AssessmentHistory a WHERE a.userId = :userId AND a.deleted = false")
    Double getAverageScoreByUserId(@Param("userId") Long userId);

    /**
     * 计算用户指定类型的平均测评分数
     */
    @Query("SELECT AVG(a.score) FROM AssessmentHistory a WHERE a.userId = :userId AND a.type = :type AND a.deleted = false")
    Double getAverageScoreByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);

    /**
     * 获取用户最近N天的测评记录
     */
    @Query(value = "SELECT * FROM assessment_history WHERE user_id = :userId AND deleted = false " +
           "AND date >= DATE_SUB(CURDATE(), INTERVAL :days-1 DAY) " +
           "ORDER BY date DESC", nativeQuery = true)
    List<AssessmentHistory> findRecentAssessmentRecords(@Param("userId") Long userId, @Param("days") int days);

    /**
     * 获取用户最近30天的测评记录
     */
    @Query(value = "SELECT * FROM assessment_history WHERE user_id = :userId AND deleted = false " +
           "AND date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) " +
           "ORDER BY date DESC", nativeQuery = true)
    List<AssessmentHistory> findLast30DaysAssessmentRecords(@Param("userId") Long userId);

    /**
     * 获取用户最近90天的测评记录
     */
    @Query(value = "SELECT * FROM assessment_history WHERE user_id = :userId AND deleted = false " +
           "AND date >= DATE_SUB(CURDATE(), INTERVAL 89 DAY) " +
           "ORDER BY date DESC", nativeQuery = true)
    List<AssessmentHistory> findLast90DaysAssessmentRecords(@Param("userId") Long userId);

    /**
     * 获取用户测评统计信息
     */
    @Query("SELECT " +
           "COUNT(a) as totalAssessments, " +
           "AVG(a.score) as averageScore, " +
           "MAX(a.score) as maxScore, " +
           "MIN(a.score) as minScore, " +
           "COUNT(CASE WHEN a.type = 'sds' THEN 1 END) as sdsCount, " +
           "COUNT(CASE WHEN a.type = 'sas' THEN 1 END) as sasCount, " +
           "COUNT(CASE WHEN a.type = 'apeskPstr' THEN 1 END) as apeskPstrCount, " +
           "COUNT(CASE WHEN a.type = 'bai' THEN 1 END) as baiCount, " +
           "COUNT(CASE WHEN a.type = 'psqi' THEN 1 END) as psqiCount, " +
           "COUNT(CASE WHEN a.type = 'dass21' THEN 1 END) as dass21Count, " +
           "COUNT(CASE WHEN a.type = 'scl90' THEN 1 END) as scl90Count " +
           "FROM AssessmentHistory a WHERE a.userId = :userId AND a.deleted = false")
    Object[] getAssessmentStatistics(@Param("userId") Long userId);

    /**
     * 根据测评类型统计记录数
     */
    @Query("SELECT a.type, COUNT(a) FROM AssessmentHistory a WHERE a.userId = :userId AND a.deleted = false " +
           "GROUP BY a.type ORDER BY COUNT(a) DESC")
    List<Object[]> countByAssessmentType(@Param("userId") Long userId);

    /**
     * 根据测评名称统计记录数
     */
    @Query("SELECT a.name, COUNT(a) FROM AssessmentHistory a WHERE a.userId = :userId AND a.deleted = false " +
           "GROUP BY a.name ORDER BY COUNT(a) DESC")
    List<Object[]> countByAssessmentName(@Param("userId") Long userId);

    /**
     * 获取用户最近一次测评记录
     */
    @Query("SELECT a FROM AssessmentHistory a WHERE a.userId = :userId AND a.deleted = false " +
           "ORDER BY a.date DESC, a.timestamp DESC LIMIT 1")
    AssessmentHistory findLatestAssessmentRecord(@Param("userId") Long userId);

    /**
     * 获取用户指定类型的最近一次测评记录
     */
    @Query("SELECT a FROM AssessmentHistory a WHERE a.userId = :userId AND a.type = :type AND a.deleted = false " +
           "ORDER BY a.date DESC, a.timestamp DESC LIMIT 1")
    AssessmentHistory findLatestAssessmentRecordByType(@Param("userId") Long userId, 
                                                      @Param("type") String type);

    /**
     * 获取用户最近30天的测评次数趋势
     */
    @Query(value = "SELECT DATE(date) as assessment_date, COUNT(*) as count " +
           "FROM assessment_history " +
           "WHERE user_id = :userId AND deleted = false " +
           "AND date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) " +
           "GROUP BY DATE(date) " +
           "ORDER BY assessment_date ASC",
           nativeQuery = true)
    List<Object[]> getLast30DaysAssessmentTrend(@Param("userId") Long userId);

    /**
     * 根据用户ID、测评类型和日期范围查找记录(分页)
     */
    Page<AssessmentHistory> findByUserIdAndTypeAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, String type, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * 根据用户ID和日期范围查找测评记录(分页)
     */
    Page<AssessmentHistory> findByUserIdAndDateBetweenAndDeletedFalseOrderByDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * 根据用户ID和测评类型查找记录(分页)
     */
    Page<AssessmentHistory> findByUserIdAndTypeAndDeletedFalseOrderByDateDesc(
        Long userId, String type, Pageable pageable);

    /**
     * 根据用户ID和日期查找测评记录(分页)
     */
    Page<AssessmentHistory> findByUserIdAndDateAndDeletedFalseOrderByTimestampDesc(
        Long userId, LocalDate date, Pageable pageable);
}
