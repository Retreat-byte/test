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

import com.xyq.houduan.entity.User;

/**
 * 用户Repository接口
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据手机号查找用户
     */
    Optional<User> findByPhoneAndDeletedFalse(String phone);

    /**
     * 根据手机号查找用户(包括已删除的)
     */
    Optional<User> findByPhone(String phone);

    /**
     * 检查手机号是否存在
     */
    boolean existsByPhoneAndDeletedFalse(String phone);

    /**
     * 根据昵称查找用户
     */
    List<User> findByNicknameContainingAndDeletedFalse(String nickname);
    
    /**
     * 根据昵称查找用户（分页）
     */
    Page<User> findByNicknameContainingAndDeletedFalse(String nickname, Pageable pageable);

    /**
     * 根据性别查找用户
     */
    List<User> findByGenderAndDeletedFalse(User.Gender gender);

    /**
     * 根据创建时间范围查找用户
     */
    List<User> findByCreatedAtBetweenAndDeletedFalse(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 分页查询未删除的用户
     */
    Page<User> findByDeletedFalse(Pageable pageable);

    /**
     * 统计用户总数(未删除)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deleted = false")
    long countActiveUsers();

    /**
     * 根据生日范围查找用户
     */
    @Query("SELECT u FROM User u WHERE u.birthday BETWEEN :startDate AND :endDate AND u.deleted = false")
    List<User> findByBirthdayRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * 查找最近注册的用户
     */
    @Query("SELECT u FROM User u WHERE u.deleted = false ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(Pageable pageable);
}
