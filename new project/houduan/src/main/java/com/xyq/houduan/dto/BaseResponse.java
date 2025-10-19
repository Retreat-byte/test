package com.xyq.houduan.dto;

import java.time.LocalDateTime;

/**
 * 基础响应DTO
 */
public class BaseResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String code;
    
    public BaseResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public BaseResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public BaseResponse(boolean success, String message, T data) {
        this(success, message);
        this.data = data;
    }
    
    public BaseResponse(boolean success, String message, T data, String code) {
        this(success, message, data);
        this.code = code;
    }
    
    // 成功响应
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(true, "操作成功", data);
    }
    
    public static <T> BaseResponse<T> success(String message, T data) {
        return new BaseResponse<>(true, message, data);
    }
    
    public static <T> BaseResponse<T> success() {
        return new BaseResponse<>(true, "操作成功");
    }
    
    // 失败响应
    public static <T> BaseResponse<T> error(String message) {
        return new BaseResponse<>(false, message);
    }
    
    public static <T> BaseResponse<T> error(String message, String code) {
        return new BaseResponse<>(false, message, null, code);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
}
