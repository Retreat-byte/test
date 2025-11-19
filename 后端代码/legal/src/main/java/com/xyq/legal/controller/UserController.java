package com.xyq.legal.controller;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.common.Result;
import com.xyq.legal.dto.ChangePasswordRequest;
import com.xyq.legal.dto.ResetPasswordRequest;
import com.xyq.legal.dto.UserProfileUpdateRequest;
import com.xyq.legal.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/profile")
    public Result<Map<String, Object>> getProfile(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(userService.getProfile(userId));
    }
    
    @PutMapping("/profile")
    public Result<Map<String, Object>> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest requestBody,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(userService.updateProfile(userId, requestBody));
    }
    
    @PostMapping("/avatar")
    public Result<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file,
                                                    HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String url = userService.uploadAvatar(userId, file);
        return Result.success(Map.of("avatarUrl", url));
    }
    
    @PostMapping("/change-password")
    public Result<?> changePassword(@Valid @RequestBody ChangePasswordRequest requestBody,
                                    HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        userService.changePassword(userId, requestBody);
        return Result.success("修改成功", null);
    }
    
    @PostMapping("/reset-password")
    public Result<?> resetPassword(@Valid @RequestBody ResetPasswordRequest requestBody) {
        userService.resetPassword(requestBody);
        return Result.success("重置成功", null);
    }
    
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(userService.getStatistics(userId));
    }
    
    @GetMapping("/activities/recent")
    public Result<List<Map<String, Object>>> getRecentActivities(
            @RequestParam(defaultValue = "5") Integer limit,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(userService.getRecentActivities(userId, limit));
    }
    
    @GetMapping("/tool-usage")
    public Result<PageResult<Map<String, Object>>> getToolUsageRecords(
            @RequestParam(required = false) String toolType,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.success(userService.getToolUsageRecords(userId, toolType, page, pageSize));
    }
}

