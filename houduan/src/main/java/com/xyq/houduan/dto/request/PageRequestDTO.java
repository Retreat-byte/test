package com.xyq.houduan.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 分页请求DTO
 */
public class PageRequestDTO {
    
    @Min(value = 1, message = "页码不能小于1")
    private int page = 1;
    
    @Min(value = 1, message = "每页大小不能小于1")
    @Max(value = 100, message = "每页大小不能超过100")
    private int size = 10;
    
    private String sort;
    private String direction = "DESC";
    
    public PageRequestDTO() {}
    
    public PageRequestDTO(int page, int size) {
        this.page = page;
        this.size = size;
    }
    
    public PageRequestDTO(int page, int size, String sort, String direction) {
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
