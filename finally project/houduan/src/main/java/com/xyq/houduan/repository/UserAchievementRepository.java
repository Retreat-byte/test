package com.xyq.houduan.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.xyq.houduan.entity.UserAchievement;

/**
 * 用户成就Repository接口
 */
@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    /**
     * 根据用户ID查找所有成就
     */
    List<UserAchievement> findByUserIdOrderByUnlockedDateDesc(Long userId);

    /**
     * 根据用户ID和成就ID查找成就
     */
    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, String achievementId);

    /**
     * 根据成就ID查找所有用户成就
     */
    List<UserAchievement> findByAchievementIdOrderByUnlockedDateDesc(String achievementId);

    /**
     * 根据用户ID和成就ID检查是否已解锁
     */
    boolean existsByUserIdAndAchievementId(Long userId, String achievementId);

    /**
     * 统计用户已解锁的成就数量
     */
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 根据解锁日期范围查找成就
     */
    List<UserAchievement> findByUserIdAndUnlockedDateBetweenOrderByUnlockedDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取用户最近解锁的成就
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.userId = :userId " +
           "ORDER BY ua.unlockedDate DESC LIMIT :limit")
    List<UserAchievement> findRecentAchievements(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 获取用户指定成就类型的成就
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.userId = :userId " +
           "AND ua.achievementId LIKE :pattern ORDER BY ua.unlockedDate DESC")
    List<UserAchievement> findByUserIdAndAchievementIdPattern(@Param("userId") Long userId, 
                                                             @Param("pattern") String pattern);

    /**
     * 统计各成就类型的解锁数量
     */
    @Query("SELECT ua.achievementId, COUNT(ua) FROM UserAchievement ua WHERE ua.userId = :userId " +
           "GROUP BY ua.achievementId ORDER BY COUNT(ua) DESC")
    List<Object[]> countByAchievementType(@Param("userId") Long userId);

    /**
     * 获取用户成就解锁统计
     */
    @Query("SELECT " +
           "COUNT(ua) as totalAchievements, " +
           "MIN(ua.unlockedDate) as firstAchievementDate, " +
           "MAX(ua.unlockedDate) as lastAchievementDate " +
           "FROM UserAchievement ua WHERE ua.userId = :userId")
    Object[] getAchievementStatistics(@Param("userId") Long userId);

    /**
     * 获取用户连续打卡相关成就
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.userId = :userId " +
           "AND ua.achievementId LIKE 'streak_%' ORDER BY ua.unlockedDate DESC")
    List<UserAchievement> findStreakAchievements(@Param("userId") Long userId);

    /**
     * 获取用户练习相关成就
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.userId = :userId " +
           "AND (ua.achievementId LIKE 'practice_%' OR ua.achievementId LIKE 'meditation_%') " +
           "ORDER BY ua.unlockedDate DESC")
    List<UserAchievement> findPracticeAchievements(@Param("userId") Long userId);

    /**
     * 获取用户测评相关成就
     */
    @Query("SELECT ua FROM UserAchievement ua WHERE ua.userId = :userId " +
           "AND ua.achievementId LIKE 'assessment_%' ORDER BY ua.unlockedDate DESC")
    List<UserAchievement> findAssessmentAchievements(@Param("userId") Long userId);
}
