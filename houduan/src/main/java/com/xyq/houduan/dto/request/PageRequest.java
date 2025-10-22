package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 分页请求DTO
 */
public class PageRequest {
    
    @Min(value = 0, message = "页码不能小于0")
    private int page = 0;
    
    @Min(value = 1, message = "每页大小不能小于1")
    @Max(value = 100, message = "每页大小不能超过100")
    private int size = 10;
    
    private String sort;
    private String direction = "DESC";
    
    public PageRequest() {}
    
    public PageRequest(int page, int size) {
        this.page = page;
        this.size = size;
    }
    
    public PageRequest(int page, int size, String sort, String direction) {
        this.page = page;
        this.size = size;
        this.sort = sort;
        this.direction = direction;
    }
    
    // Getters and Setters
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public String getSort() {
        return sort;
    }
    
    public void setSort(String sort) {
        this.sort = sort;
    }
    
    public String getDirection() {
        return direction;
    }
    
    public void setDirection(String direction) {
        this.direction = direction;
    }
}
