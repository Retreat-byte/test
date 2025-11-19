package com.xyq.legal.service;

import com.xyq.legal.dto.LoginRequest;
import com.xyq.legal.dto.RegisterRequest;
import com.xyq.legal.dto.ResetPasswordRequest;
import com.xyq.legal.entity.User;
import com.xyq.legal.entity.VerificationCode;
import com.xyq.legal.repository.UserRepository;
import com.xyq.legal.repository.VerificationCodeRepository;
import com.xyq.legal.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }
        
        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }
        
        String token = jwtUtil.generateToken(user.getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userInfo", buildUserInfo(user));
        return result;
    }

    /**
     * 通过 userId 直接生成登录结果，用于刷新 token
     */
    public String loginByUserId(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }
        
        return jwtUtil.generateToken(user.getId());
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("手机号已注册");
        }
        
        // 验证验证码
        Optional<VerificationCode> codeOpt = verificationCodeRepository
                .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(
                        request.getPhone(), "register", 0);
        
        if (codeOpt.isEmpty() || !codeOpt.get().getCode().equals(request.getVerificationCode())) {
            throw new RuntimeException("验证码错误或已过期");
        }
        
        VerificationCode code = codeOpt.get();
        if (code.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("验证码已过期");
        }
        
        // 创建用户
        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setEmail(request.getEmail());
        if (request.getGender() != null) {
            try {
                user.setGender(User.Gender.valueOf(request.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setGender(User.Gender.UNKNOWN);
            }
        }
        user.setStatus(1);
        
        userRepository.save(user);
        
        // 标记验证码为已使用
        verificationCodeRepository.markAsUsed(request.getPhone(), "register");
    }

    public void sendVerificationCode(String phone, String type) {
        // 生成6位随机验证码
        String code = String.format("%06d", new Random().nextInt(1000000));
        
        // 保存验证码（5分钟有效期）
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setPhone(phone);
        verificationCode.setCode(code);
        verificationCode.setType(type);
        verificationCode.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        verificationCode.setUsed(0);
        
        verificationCodeRepository.save(verificationCode);
        
        // TODO: 实际项目中应该调用短信服务发送验证码
        System.out.println("验证码: " + code + " (手机号: " + phone + ", 类型: " + type + ")");
    }

    /**
     * 验证验证码是否正确且未过期（支持多种 type）
     */
    public boolean verifyCode(String phone, String codeValue, String type) {
        // 先按传入的 type 查找
        Optional<VerificationCode> codeOpt = verificationCodeRepository
                .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(phone, type, 0);

        // 如果是重置密码，兼容 "reset" 和 "reset_password" 两种类型
        if (codeOpt.isEmpty() && "reset".equalsIgnoreCase(type)) {
            codeOpt = verificationCodeRepository
                    .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(phone, "reset_password", 0);
        }

        if (codeOpt.isEmpty()) {
            return false;
        }

        VerificationCode code = codeOpt.get();
        if (code.getExpiredAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        return code.getCode().equals(codeValue);
    }

    /**
     * 通过验证码重置密码（供 /api/auth/reset-password 调用）
     */
    @Transactional
    public void resetPasswordByCode(ResetPasswordRequest request) {
        // 复用 UserService.resetPassword 的逻辑更复杂，这里实现一个简化版但语义一致
        String phone = request.getPhone();
        String verificationCode = request.getVerificationCode();

        if (phone == null || verificationCode == null) {
            throw new RuntimeException("参数错误");
        }

        // 查询用户
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 先尝试 type="reset"，再兼容 "reset_password"
        Optional<VerificationCode> codeOpt = verificationCodeRepository
                .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(phone, "reset", 0);

        if (codeOpt.isEmpty()) {
            codeOpt = verificationCodeRepository
                    .findFirstByPhoneAndTypeAndUsedOrderByCreatedAtDesc(phone, "reset_password", 0);
        }

        if (codeOpt.isEmpty()) {
            throw new RuntimeException("验证码无效或已使用，请重新获取验证码");
        }

        VerificationCode code = codeOpt.get();

        if (code.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("验证码已过期，请重新获取");
        }

        if (!code.getCode().equals(verificationCode)) {
            throw new RuntimeException("验证码错误，请检查后重试");
        }

        if (code.getUsed() != 0) {
            throw new RuntimeException("验证码已被使用，请重新获取");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 标记当前验证码为已使用
        code.setUsed(1);
        verificationCodeRepository.save(code);
    }

    private Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("phone", user.getPhone());
        userInfo.put("nickname", user.getNickname());
        userInfo.put("avatar", user.getAvatar());
        userInfo.put("email", user.getEmail());
        userInfo.put("gender", user.getGender() != null ? user.getGender().name().toLowerCase() : "unknown");
        return userInfo;
    }
}

