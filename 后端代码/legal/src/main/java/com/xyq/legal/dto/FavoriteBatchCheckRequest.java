package com.xyq.legal.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class FavoriteBatchCheckRequest {
    
    @NotEmpty(message = "regulationIds不能为空")
    private List<String> regulationIds;
}

