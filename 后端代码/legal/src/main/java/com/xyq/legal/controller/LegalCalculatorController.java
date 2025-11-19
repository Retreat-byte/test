package com.xyq.legal.controller;

import com.xyq.legal.common.Result;
import com.xyq.legal.dto.CompensationCalcRequest;
import com.xyq.legal.dto.LitigationFeeCalcRequest;
import com.xyq.legal.dto.PenaltyCalcRequest;
import com.xyq.legal.dto.WorkInjuryCalcRequest;
import com.xyq.legal.service.LegalToolService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/legal-tools/calculator")
@RequiredArgsConstructor
public class LegalCalculatorController {
    
    private final LegalToolService legalToolService;
    
    @PostMapping("/compensation")
    public Result<Map<String, Object>> calculateCompensation(
            @Valid @RequestBody CompensationCalcRequest request,
            HttpServletRequest httpServletRequest) {
        String userId = (String) httpServletRequest.getAttribute("userId");
        return Result.success(legalToolService.calculateCompensation(userId, request));
    }
    
    @PostMapping("/work-injury")
    public Result<Map<String, Object>> calculateWorkInjury(
            @Valid @RequestBody WorkInjuryCalcRequest request,
            HttpServletRequest httpServletRequest) {
        String userId = (String) httpServletRequest.getAttribute("userId");
        return Result.success(legalToolService.calculateWorkInjury(userId, request));
    }
    
    @PostMapping("/litigation-fee")
    public Result<Map<String, Object>> calculateLitigationFee(
            @Valid @RequestBody LitigationFeeCalcRequest request,
            HttpServletRequest httpServletRequest) {
        String userId = (String) httpServletRequest.getAttribute("userId");
        return Result.success(legalToolService.calculateLitigationFee(userId, request));
    }
    
    @PostMapping("/penalty")
    public Result<Map<String, Object>> calculatePenalty(
            @Valid @RequestBody PenaltyCalcRequest request,
            HttpServletRequest httpServletRequest) {
        String userId = (String) httpServletRequest.getAttribute("userId");
        return Result.success(legalToolService.calculatePenalty(userId, request));
    }
}

