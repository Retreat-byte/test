package com.xyq.legal.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.dto.ChangePasswordRequest;
import com.xyq.legal.dto.ResetPasswordRequest;
import com.xyq.legal.dto.UserProfileUpdateRequest;
import com.xyq.legal.entity.CaseSearchHistory;
import com.xyq.legal.entity.DownloadRecord;
import com.xyq.legal.entity.Favorite;
import com.xyq.legal.entity.ToolUsageRecord;
import com.xyq.legal.entity.User;
import com.xyq.legal.entity.VerificationCode;
import com.xyq.legal.repository.CaseSearchHistoryRepository;
import com.xyq.legal.repository.DocumentReviewRepository;
import com.xyq.legal.repository.DownloadRecordRepository;
import com.xyq.legal.repository.FavoriteRepository;
import com.xyq.legal.repository.ToolUsageRecordRepository;
import com.xyq.legal.repository.UserRepository;
import com.xyq.legal.repository.VerificationCodeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final DownloadRecordRepository downloadRecordRepository;
    private final ToolUsageRecordRepository toolUsageRecordRepository;
    private final CaseSearchHistoryRepository caseSearchHistoryRepository;
    private final DocumentReviewRepository documentReviewRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;
    
    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(String userId) {
        User user = getUser(userId);
        return buildUserInfo(user);
    }
    
    @Transactional
    public Map<String, Object> updateProfile(String userId, UserProfileUpdateRequest request) {
        User user = getUser(userId);
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getGender() != null) {
            try {
                user.setGender(User.Gender.valueOf(request.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setGender(User.Gender.UNKNOWN);
            }
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        userRepository.save(user);
        return buildUserInfo(user);
    }
    
    @Transactional
    public String uploadAvatar(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String filename = targetUserId + "_" + System.currentTimeMillis();
        if (extension != null && !extension.isBlank()) {
            filename += "." + extension;
        }
        try {
            Path avatarDir = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
            Files.createDirectories(avatarDir);
            Path target = avatarDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/avatars/" + filename;
            User user = getUser(targetUserId);
            user.setAvatar(url);
            userRepository.save(user);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("上传失败");
        }
    }
    
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = getUser(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("旧密码不正确");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 支持 "reset" 和 "reset_password" 两种格式，优先使用 "reset"
        // 先尝试查询 type="reset" 的验证码
        Optional<VerificationCode> codeOpt = verificationCodeRepository
                .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(request.getPhone(), "reset", 0);
        
        // 如果找不到，再尝试查询 type="reset_password" 的验证码
        if (codeOpt.isEmpty()) {
            codeOpt = verificationCodeRepository
                    .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(request.getPhone(), "reset_password", 0);
        }
        
        // 如果还是找不到，抛出异常
        if (codeOpt.isEmpty()) {
            // 添加调试信息：检查是否有验证码记录（无论是否已使用）
            long totalCount = verificationCodeRepository.count();
            System.out.println("调试信息: 查询验证码失败 - 手机号: " + request.getPhone() + 
                    ", 验证码: " + request.getVerificationCode() + 
                    ", 数据库中验证码总数: " + totalCount);
            throw new RuntimeException("验证码无效或已使用，请重新获取验证码");
        }
        
        VerificationCode code = codeOpt.get();
        
        // 先检查是否过期
        if (code.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("验证码已过期，请重新获取");
        }
        
        // 再检查验证码是否匹配
        if (!code.getCode().equals(request.getVerificationCode())) {
            System.out.println("调试信息: 验证码不匹配 - 数据库中的验证码: " + code.getCode() + 
                    ", 请求中的验证码: " + request.getVerificationCode() + 
                    ", 验证码类型: " + code.getType() + 
                    ", 是否已使用: " + code.getUsed());
            throw new RuntimeException("验证码错误，请检查后重试");
        }
        
        // 检查验证码是否已被使用（双重检查，防止并发问题）
        if (code.getUsed() != 0) {
            throw new RuntimeException("验证码已被使用，请重新获取");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // 标记当前验证码为已使用（只标记这一个，而不是所有匹配的）
        code.setUsed(1);
        verificationCodeRepository.save(code);
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics(String userId) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        Map<String, Object> stats = new HashMap<>();
        stats.put("favoriteCount", favoriteRepository.countByUserId(targetUserId));
        stats.put("downloadCount", downloadRecordRepository.countByUserId(targetUserId));
        stats.put("toolUsageCount", toolUsageRecordRepository.countByUserId(targetUserId));
        stats.put("searchHistoryCount", caseSearchHistoryRepository.countByUserId(targetUserId));
        stats.put("documentReviewCount", documentReviewRepository.countByUserId(targetUserId));
        return stats;
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentActivities(String userId, int limit) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        List<Map<String, Object>> activities = new ArrayList<>();
        addFavoriteActivities(targetUserId, activities, limit);
        addDownloadActivities(targetUserId, activities, limit);
        addToolUsageActivities(targetUserId, activities, limit);
        addSearchHistoryActivities(targetUserId, activities, limit);
        activities.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("time");
            LocalDateTime timeB = (LocalDateTime) b.get("time");
            return timeB.compareTo(timeA);
        });
        return activities.stream().limit(limit).toList();
    }
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> getToolUsageRecords(String userId, String toolType, int page, int pageSize) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        Page<ToolUsageRecord> pageData;
        PageRequest pageRequest = PageRequest.of(Math.max(page - 1, 0), pageSize);
        if (toolType != null && !toolType.isBlank()) {
            pageData = toolUsageRecordRepository.findByUserIdAndToolTypeOrderByCreatedAtDesc(targetUserId, toolType, pageRequest);
        } else {
            pageData = toolUsageRecordRepository.findByUserIdOrderByCreatedAtDesc(targetUserId, pageRequest);
        }
        List<Map<String, Object>> list = pageData.getContent().stream()
                .map(record -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", record.getId());
                    map.put("toolType", record.getToolType());
                    map.put("toolName", record.getToolName());
                    map.put("inputData", record.getInputData());
                    map.put("resultData", record.getResultData());
                    map.put("createdAt", record.getCreatedAt());
                    return map;
                }).toList();
        return PageResult.of(list, pageData.getTotalElements(), page, pageSize);
    }
    
    private @NonNull User getUser(String userId) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        return Objects.requireNonNull(
                userRepository.findById(targetUserId)
                        .orElseThrow(() -> new RuntimeException("用户不存在")));
    }
    
    private Map<String, Object> buildUserInfo(User user) {
        User entity = Objects.requireNonNull(user, "用户不存在");
        Map<String, Object> map = new HashMap<>();
        map.put("id", entity.getId());
        map.put("phone", entity.getPhone());
        map.put("nickname", entity.getNickname());
        map.put("avatar", entity.getAvatar());
        map.put("email", entity.getEmail());
        map.put("gender", entity.getGender() != null ? entity.getGender().name().toLowerCase() : "unknown");
        map.put("status", entity.getStatus());
        map.put("createdAt", entity.getCreatedAt());
        return map;
    }
    
    private void addFavoriteActivities(String userId, List<Map<String, Object>> activities, int limit) {
        Page<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(0, limit));
        favorites.forEach(favorite -> {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "favorite");
            map.put("title", favorite.getRegulation().getTitle());
            map.put("time", favorite.getCreatedAt());
            activities.add(map);
        });
    }
    
    private void addDownloadActivities(String userId, List<Map<String, Object>> activities, int limit) {
        Page<DownloadRecord> downloads = downloadRecordRepository.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(0, limit));
        downloads.forEach(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "download");
            map.put("title", record.getTemplate().getTitle());
            map.put("time", record.getCreatedAt());
            activities.add(map);
        });
    }
    
    private void addToolUsageActivities(String userId, List<Map<String, Object>> activities, int limit) {
        Page<ToolUsageRecord> usages = toolUsageRecordRepository.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(0, limit));
        usages.forEach(record -> {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "tool");
            map.put("title", record.getToolName());
            map.put("time", record.getCreatedAt());
            activities.add(map);
        });
    }
    
    private void addSearchHistoryActivities(String userId, List<Map<String, Object>> activities, int limit) {
        Page<CaseSearchHistory> histories = caseSearchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(0, limit));
        histories.forEach(history -> {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "search");
            map.put("title", history.getKeyword());
            map.put("time", history.getCreatedAt());
            activities.add(map);
        });
    }
}

