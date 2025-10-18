package com.xyq.houduan.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.xyq.houduan.config.JwtConfig;
import com.xyq.houduan.dto.request.LoginRequest;
import com.xyq.houduan.dto.request.PasswordChangeRequest;
import com.xyq.houduan.dto.request.RegisterRequest;
import com.xyq.houduan.dto.request.UserUpdateRequest;
import com.xyq.houduan.dto.response.LoginResponse;
import com.xyq.houduan.dto.response.UserResponse;
import com.xyq.houduan.entity.User;
import com.xyq.houduan.entity.UserSession;
import com.xyq.houduan.repository.UserRepository;
import com.xyq.houduan.repository.UserSessionRepository;

/**
 * 用户服务类
 */
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtConfig jwtConfig;

    /**
     * 用户注册
     */
    public UserResponse register(RegisterRequest request) {
        // 检查手机号是否已存在
        if (userRepository.existsByPhoneAndDeletedFalse(request.getPhone())) {
            throw new RuntimeException("手机号已存在");
        }

        // 创建新用户
        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : "情绪岛居民");
        // 暂时不设置性别，使用默认值
        // if (request.getGender() != null) {
        //     user.setGender("男".equals(request.getGender()) ? User.Gender.MALE : User.Gender.FEMALE);
        // }
        if (request.getBirthday() != null) {
            user.setBirthday(LocalDate.parse(request.getBirthday()));
        }
        user.setStatus(User.UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        // 查找用户
        User user = userRepository.findByPhoneAndDeletedFalse(request.getPhone())
            .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 检查用户状态
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("用户状态异常");
        }

        // 更新登录信息
        user.setLastLoginAt(LocalDateTime.now());
        user.setLoginCount(user.getLoginCount() + 1);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成JWT token
        String token = jwtConfig.generateToken(user.getPhone());

        // 创建用户会话
        UserSession session = new UserSession();
        session.setUser(user);
        session.setSessionId(token);
        session.setSessionType(UserSession.SessionType.PRACTICE);
        session.setSessionName("登录会话");
        session.setStartTime(LocalDateTime.now());
        session.setStatus(UserSession.SessionStatus.ACTIVE);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        userSessionRepository.save(session);

        // 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7天过期
        response.setUser(convertToUserResponse(user));
        return response;
    }

    /**
     * 根据ID获取用户信息
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }
        return convertToUserResponse(user);
    }

    /**
     * 根据手机号获取用户信息
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByPhone(String phone) {
        User user = userRepository.findByPhoneAndDeletedFalse(phone)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToUserResponse(user);
    }

    /**
     * 更新用户信息
     */
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        // 更新用户信息
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getGender() != null) {
            user.setGender("男".equals(request.getGender()) ? User.Gender.MALE : User.Gender.FEMALE);
        }
        if (request.getBirthday() != null) {
            user.setBirthday(LocalDate.parse(request.getBirthday()));
        }
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    /**
     * 修改密码
     */
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        // 验证旧密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("旧密码错误");
        }

        // 设置新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * 用户登出
     */
    public void logout(String token) {
        Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(token);
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.setStatus(UserSession.SessionStatus.CANCELLED);
            session.setUpdatedAt(LocalDateTime.now());
            userSessionRepository.save(session);
        }
    }

    /**
     * 验证用户会话
     */
    @Transactional(readOnly = true)
    public UserResponse validateSession(String token) {
        UserSession session = userSessionRepository.findBySessionId(token)
            .orElseThrow(() -> new RuntimeException("无效的会话"));

        // 检查会话状态
        if (session.getStatus() != UserSession.SessionStatus.ACTIVE) {
            throw new RuntimeException("会话已失效");
        }

        // 获取用户信息
        User user = session.getUser();
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        return convertToUserResponse(user);
    }

    /**
     * 删除用户
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        user.setDeleted(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * 转换为用户响应DTO
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setGender(user.getGender() != null ? user.getGender().getCode() : null);
        response.setBirthday(user.getBirthday() != null ? user.getBirthday().toString() : null);
        response.setLastLoginAt(user.getLastLoginAt());
        response.setLoginCount(user.getLoginCount());
        response.setStatus(user.getStatus().getCode());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }


    /**
     * 获取用户列表（管理员功能）
     */
    public com.xyq.houduan.dto.response.PageResponse<UserResponse> getUserList(int page, int size, String keyword) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<User> userPage;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            userPage = userRepository.findByNicknameContainingAndDeletedFalse(keyword.trim(), pageable);
        } else {
            userPage = userRepository.findByDeletedFalse(pageable);
        }
        
        java.util.List<UserResponse> responses = userPage.getContent()
            .stream()
            .map(this::convertToUserResponse)
            .collect(java.util.stream.Collectors.toList());
        
        return new com.xyq.houduan.dto.response.PageResponse<>(
            responses,
            userPage.getTotalElements(),
            userPage.getTotalPages(),
            page,
            size
        );
    }

    /**
     * 更新用户状态（管理员功能）
     */
    public void updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (user.getDeleted()) {
            throw new RuntimeException("用户不存在");
        }
        
        user.setEnabled(enabled);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
