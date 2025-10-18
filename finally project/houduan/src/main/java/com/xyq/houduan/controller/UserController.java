package com.xyq.houduan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.xyq.houduan.dto.BaseResponse;
import com.xyq.houduan.dto.request.LoginRequest;
import com.xyq.houduan.dto.request.PasswordChangeRequest;
import com.xyq.houduan.dto.request.RegisterRequest;
import com.xyq.houduan.dto.request.UserUpdateRequest;
import com.xyq.houduan.dto.response.LoginResponse;
import com.xyq.houduan.dto.response.PageResponse;
import com.xyq.houduan.dto.response.UserResponse;
import com.xyq.houduan.service.UserService;

import jakarta.validation.Valid;

/**
 * 用户管理控制器
 * 提供用户注册、登录、个人信息管理等功能
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<BaseResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserResponse userResponse = userService.register(request);
            return ResponseEntity.ok(BaseResponse.success("注册成功", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<BaseResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse loginResponse = userService.login(request);
            return ResponseEntity.ok(BaseResponse.success("登录成功", loginResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(Authentication authentication) {
        try {
            String phone = authentication.getName();
            userService.logout(phone);
            return ResponseEntity.ok(BaseResponse.success("登出成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * Token验证接口
     */
    @GetMapping("/verify")
    public ResponseEntity<BaseResponse<Object>> verifyToken(Authentication authentication) {
        try {
            String phone = authentication.getName();
            UserResponse userResponse = userService.getUserByPhone(phone);
            
            // 构建验证响应数据
            Object verifyData = new Object() {
                public final boolean valid = true;
                public final UserResponse userInfo = userResponse;
            };
            
            return ResponseEntity.ok(BaseResponse.success("Token验证成功", verifyData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error("Token验证失败"));
        }
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<BaseResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        try {
            String phone = authentication.getName();
            UserResponse userResponse = userService.getUserByPhone(phone);
            return ResponseEntity.ok(BaseResponse.success("获取用户信息成功", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/me")
    public ResponseEntity<BaseResponse<UserResponse>> updateCurrentUser(
            @Valid @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            UserResponse currentUser = userService.getUserByPhone(phone);
            UserResponse userResponse = userService.updateUser(currentUser.getId(), request);
            return ResponseEntity.ok(BaseResponse.success("更新用户信息成功", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 修改密码
     */
    @PutMapping("/me/password")
    public ResponseEntity<BaseResponse<Void>> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            UserResponse currentUser = userService.getUserByPhone(phone);
            userService.changePassword(currentUser.getId(), request);
            return ResponseEntity.ok(BaseResponse.success("密码修改成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取用户列表（管理员功能）
     */
    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<UserResponse>>> getUserList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        try {
            PageResponse<UserResponse> userList = userService.getUserList(page, size, keyword);
            return ResponseEntity.ok(BaseResponse.success("获取用户列表成功", userList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 根据ID获取用户信息（管理员功能）
     */
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<UserResponse>> getUserById(@PathVariable Long id) {
        try {
            UserResponse userResponse = userService.getUserById(id);
            return ResponseEntity.ok(BaseResponse.success("获取用户信息成功", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除用户（管理员功能）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(BaseResponse.success("删除用户成功", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 启用/禁用用户（管理员功能）
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<BaseResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        try {
            userService.updateUserStatus(id, enabled);
            String message = enabled ? "启用用户成功" : "禁用用户成功";
            return ResponseEntity.ok(BaseResponse.success(message, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }
}
