package com.xyq.legal.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.xyq.legal.common.Result;
import com.xyq.legal.dto.LoginRequest;
import com.xyq.legal.dto.RegisterRequest;
import com.xyq.legal.dto.ResetPasswordRequest;
import com.xyq.legal.service.AuthService;
import com.xyq.legal.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Map<String, Object> data = authService.login(request);
            return Result.success("登录成功", data);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/register")
    public Result<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return Result.success("注册成功", null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/send-code")
    public Result<?> sendCode(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String type = request.get("type");
            
            if (phone == null || type == null) {
                return Result.error(400, "参数错误");
            }
            
            authService.sendVerificationCode(phone, type);
            return Result.success("验证码发送成功", null);
        } catch (Exception e) {
            return Result.error(500, e.getMessage());
        }
    }

    @PostMapping("/logout")
    public Result<?> logout() {
        // JWT是无状态的，客户端删除token即可
        return Result.success("登出成功", null);
    }

    /**
     * 验证验证码是否正确
     * 前端通常传 { phone, code, type }
     */
    @PostMapping("/verify-code")
    public Result<?> verifyCode(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String code = request.get("code");
        String type = request.get("type");

        if (phone == null || code == null || type == null) {
            return Result.error(400, "参数错误");
        }

        boolean ok = authService.verifyCode(phone, code, type);
        if (!ok) {
            return Result.error(400, "验证码错误或已过期");
        }
        return Result.success("验证成功", null);
    }

    /**
     * 使用验证码重置密码（/api/auth/reset-password）
     * 与 /api/user/reset-password 功能类似，更贴近前端接口命名
     */
    @PostMapping("/reset-password")
    public Result<?> resetPasswordByCode(@Valid @RequestBody ResetPasswordRequest requestBody) {
        try {
            authService.resetPasswordByCode(requestBody);
            return Result.success("重置成功", null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    /**
     * 刷新 Token：这里简单返回一个新的 token（无黑名单机制）
     */
    @PostMapping("/refresh-token")
    public Result<Map<String, Object>> refreshToken(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(401, "未登录");
        }
        // 生成新的 token，并返回最新用户信息
        String token = authService.loginByUserId(userId);
        Map<String, Object> userInfo = userService.getProfile(userId);
        Map<String, Object> data = Map.of(
                "token", token,
                "userInfo", userInfo
        );
        return Result.success("刷新成功", data);
    }

    /**
     * 获取当前登录用户信息（根据 token）
     */
    @GetMapping("/current-user")
    public Result<Map<String, Object>> currentUser(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId == null) {
            return Result.error(401, "未登录");
        }
        return Result.success(userService.getProfile(userId));
    }
}

