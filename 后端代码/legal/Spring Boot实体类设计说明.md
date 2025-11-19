# Spring Boot JPA 实体类设计说明

## 1. 项目依赖配置

在 `pom.xml` 中添加以下依赖：

```xml
<!-- JPA 和 MySQL -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- JSON处理（如果使用自定义转换器） -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

## 2. 数据库配置

在 `application.properties` 中添加：

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/legal_assistant?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA配置
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.use_sql_comments=true
```

## 3. 基础实体类设计

### 3.1 BaseEntity（基类）

```java
package com.xyq.legal.entity.base;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Data
@MappedSuperclass
public abstract class BaseEntity {
    
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(length = 50)
    private String id;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## 4. 实体类设计示例

### 4.1 User 实体类

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_phone", columnList = "phone"),
    @Index(name = "idx_status", columnList = "status")
})
public class User extends BaseEntity {
    
    @Column(unique = true, nullable = false, length = 11)
    private String phone;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(length = 50)
    private String nickname;
    
    @Column(length = 500)
    private String avatar;
    
    @Column(length = 100)
    private String email;
    
    @Column(length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender = Gender.UNKNOWN;
    
    @Column(nullable = false)
    private Integer status = 1; // 1-正常，0-禁用
    
    // 关联关系
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversations;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;
    
    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }
}
```

### 4.2 Conversation 实体类

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "conversations", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class Conversation extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String firstMessage;
    
    @Column(nullable = false)
    private Integer messageCount = 0;
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;
}
```

### 4.3 Message 实体类

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_conversation_id", columnList = "conversation_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class Message extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    public enum Role {
        USER, ASSISTANT
    }
}
```

### 4.4 LegalRegulation 实体类

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "legal_regulations", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_title", columnList = "title"),
    @Index(name = "idx_status", columnList = "status")
})
public class LegalRegulation extends BaseEntity {
    
    @Column(nullable = false, length = 300)
    private String title;
    
    @Column(nullable = false)
    private Integer articleCount = 0;
    
    @Column(length = 50)
    private String category;
    
    @Column(name = "effective_date")
    private LocalDate effectiveDate;
    
    @Column(name = "update_date")
    private LocalDate updateDate;
    
    @Column(length = 20)
    private String status = "有效";
    
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;
}
```

### 4.5 LegalCase 实体类（JSON字段处理）

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "legal_cases", indexes = {
    @Index(name = "idx_case_type", columnList = "case_type"),
    @Index(name = "idx_court", columnList = "court"),
    @Index(name = "idx_publish_date", columnList = "publish_date")
})
public class LegalCase extends BaseEntity {
    
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(name = "case_number", length = 100)
    private String caseNumber;
    
    @Column(name = "case_type", length = 50)
    private String caseType;
    
    @Column(length = 200)
    private String court;
    
    @Column(name = "publish_date")
    private LocalDate publishDate;
    
    // JSON字段 - 方式1：使用Hibernate的JsonType（需要添加依赖）
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private Map<String, Object> content;
    
    // JSON字段 - 方式2：使用JPA的@JdbcTypeCode（Spring Boot 3.x）
    // @JdbcTypeCode(SqlTypes.JSON)
    // @Column(columnDefinition = "json")
    // private Map<String, Object> content;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> keywords;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> relatedLaws;
}
```

**注意**：如果使用 `JsonType`，需要添加依赖：

```xml
<dependency>
    <groupId>com.vladmihalcea</groupId>
    <artifactId>hibernate-types-60</artifactId>
    <version>2.21.1</version>
</dependency>
```

### 4.6 DocumentTemplate 实体类

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "document_templates", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_download_count", columnList = "download_count")
})
public class DocumentTemplate extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String category;
    
    @Column(name = "file_url", length = 500)
    private String fileUrl;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;
    
    @Column(name = "file_type", length = 20)
    private String fileType = "pdf";
    
    @Column(name = "download_count", nullable = false)
    private Integer downloadCount = 0;
    
    @Column(name = "preview_url", length = 500)
    private String previewUrl;
}
```

### 4.7 Favorite 实体类

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "favorites", 
    uniqueConstraints = @UniqueConstraint(name = "uk_user_regulation", 
        columnNames = {"user_id", "regulation_id"}),
    indexes = @Index(name = "idx_user_id", columnList = "user_id")
)
public class Favorite extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regulation_id", nullable = false)
    private LegalRegulation regulation;
}
```

### 4.8 ToolUsageRecord 实体类（JSON字段）

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "tool_usage_records", indexes = {
    @Index(name = "idx_user_tool", columnList = "user_id, tool_type"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class ToolUsageRecord extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "tool_type", nullable = false, length = 50)
    private String toolType;
    
    @Column(name = "tool_name", length = 100)
    private String toolName;
    
    @Type(JsonType.class)
    @Column(name = "input_data", columnDefinition = "json")
    private Map<String, Object> inputData;
    
    @Type(JsonType.class)
    @Column(name = "result_data", columnDefinition = "json")
    private Map<String, Object> resultData;
}
```

### 4.9 DocumentReview 实体类（JSON字段）

```java
package com.xyq.legal.entity;

import com.xyq.legal.entity.base.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "document_reviews", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class DocumentReview extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;
    
    @Column(name = "file_url", length = 500)
    private String fileUrl;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;
    
    @Column(name = "file_type", length = 20)
    private String fileType;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<Map<String, Object>> suggestions;
    
    @Column(name = "overall_score")
    private Integer overallScore;
}
```

## 5. Repository 接口设计

### 5.1 基础Repository

```java
package com.xyq.legal.repository;

import com.xyq.legal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
}
```

### 5.2 自定义查询示例

```java
package com.xyq.legal.repository;

import com.xyq.legal.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    Page<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId, Pageable pageable);
    
    @Query("SELECT c FROM Conversation c WHERE c.user.id = :userId ORDER BY c.updatedAt DESC")
    Page<Conversation> findUserConversations(String userId, Pageable pageable);
}
```

## 6. 注意事项

### 6.1 JSON字段处理
- Spring Boot 3.x 可以使用 `@JdbcTypeCode(SqlTypes.JSON)`
- 或者使用 `hibernate-types` 库的 `@Type(JsonType.class)`
- 确保MySQL版本支持JSON类型（5.7+）

### 6.2 关联关系
- 使用 `FetchType.LAZY` 避免N+1查询问题
- 使用 `@OneToMany` 的 `cascade` 和 `orphanRemoval` 实现级联操作

### 6.3 索引优化
- 在 `@Table` 注解中定义索引
- 为常用查询字段建立索引

### 6.4 时间字段
- 使用 `LocalDateTime` 替代 `Date`
- 通过 `@PrePersist` 和 `@PreUpdate` 自动设置时间

---

**文档版本**: v1.0  
**创建日期**: 2024-01-01

