package com.xyq.houduan.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.xyq.houduan.dto.BaseResponse;
import com.xyq.houduan.dto.request.ProfileUpdateRequest;
import com.xyq.houduan.dto.response.ProfileInfoResponse;
import com.xyq.houduan.dto.response.ProfileUpdateResponse;
import com.xyq.houduan.service.ProfileService;

import jakarta.validation.Valid;

/**
 * 个人设置控制器
 * 提供用户个人信息管理、头像上传、成就查询等功能
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    /**
     * 获取用户完整个人信息
     */
    @GetMapping("/info")
    public ResponseEntity<BaseResponse<ProfileInfoResponse>> getUserProfile(Authentication authentication) {
        try {
            String phone = authentication.getName();
            ProfileInfoResponse profileInfo = profileService.getUserProfile(phone);
            return ResponseEntity.ok(BaseResponse.success("获取个人信息成功", profileInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 更新个人设置
     */
    @PutMapping("/update")
    public ResponseEntity<BaseResponse<ProfileUpdateResponse>> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            ProfileUpdateResponse updateResponse = profileService.updateProfile(phone, request);
            return ResponseEntity.ok(BaseResponse.success("设置保存成功", updateResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    public ResponseEntity<BaseResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("avatar") MultipartFile file,
            Authentication authentication) {
        try {
            String phone = authentication.getName();
            String avatarUrl = profileService.uploadAvatar(phone, file);
            
            // 构建响应数据
            Map<String, String> avatarData = new HashMap<>();
            avatarData.put("avatar", avatarUrl);
            
            return ResponseEntity.ok(BaseResponse.success("头像上传成功", avatarData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取成就勋章列表
     */
    @GetMapping("/achievements")
    public ResponseEntity<BaseResponse<Object>> getAchievements(Authentication authentication) {
        try {
            String phone = authentication.getName();
            Object achievements = profileService.getAchievements(phone);
            return ResponseEntity.ok(BaseResponse.success("获取成就成功", achievements));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BaseResponse.error(e.getMessage()));
        }
    }
}
