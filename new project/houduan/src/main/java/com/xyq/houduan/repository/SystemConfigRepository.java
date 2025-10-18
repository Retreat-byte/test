package com.xyq.houduan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.xyq.houduan.entity.SystemConfig;

/**
 * 系统配置Repository接口
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    /**
     * 根据配置键查找配置
     */
    Optional<SystemConfig> findByConfigKey(String configKey);

    /**
     * 根据配置键检查配置是否存在
     */
    boolean existsByConfigKey(String configKey);

    /**
     * 根据配置键删除配置
     */
    void deleteByConfigKey(String configKey);
}
