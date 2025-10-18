package com.xyq.houduan.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA配置类
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.xyq.houduan.repository")
@EnableJpaAuditing
public class JpaConfig {
}
