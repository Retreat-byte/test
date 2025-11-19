package com.xyq.legal.service;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.dto.CompensationCalcRequest;
import com.xyq.legal.dto.LitigationFeeCalcRequest;
import com.xyq.legal.dto.PenaltyCalcRequest;
import com.xyq.legal.dto.WorkInjuryCalcRequest;
import com.xyq.legal.entity.ToolUsageRecord;
import com.xyq.legal.entity.User;
import com.xyq.legal.repository.ToolUsageRecordRepository;
import com.xyq.legal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LegalToolService {
    
    private final ToolUsageRecordRepository toolUsageRecordRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Map<String, Object> calculateCompensation(String userId, CompensationCalcRequest request) {
        double totalYears = (request.getWorkYears() == null ? 0 : request.getWorkYears())
                + ((request.getWorkMonths() == null ? 0 : request.getWorkMonths()) / 12.0);
        totalYears = Math.max(totalYears, 1);
        double baseAmount = request.getMonthlyWage() * totalYears;
        double multiplier = "illegal".equalsIgnoreCase(request.getCalculationType()) ? 2.0 : 1.0;
        double result = baseAmount * multiplier;
        
        Map<String, Object> data = Map.of(
                "totalYears", totalYears,
                "baseAmount", round(baseAmount),
                "multiplier", multiplier,
                "compensation", round(result)
        );
        saveToolUsage(userId, "calculator", "compensation", requestToMap(request), data);
        return data;
    }
    
    @Transactional
    public Map<String, Object> calculateWorkInjury(String userId, WorkInjuryCalcRequest request) {
        double disabilityCompensation = request.getMonthlyWage() * (14 - request.getDisabilityLevel());
        double livingSubsidy = request.getLocalAvgWage() * (11 - request.getDisabilityLevel()) / 2;
        double result = disabilityCompensation + livingSubsidy + request.getMedicalCost() + request.getOtherCosts();
        
        Map<String, Object> data = Map.of(
                "disabilityCompensation", round(disabilityCompensation),
                "livingSubsidy", round(livingSubsidy),
                "medicalCost", request.getMedicalCost(),
                "otherCosts", request.getOtherCosts(),
                "totalCompensation", round(result)
        );
        saveToolUsage(userId, "calculator", "work_injury", requestToMap(request), data);
        return data;
    }
    
    @Transactional
    public Map<String, Object> calculateLitigationFee(String userId, LitigationFeeCalcRequest request) {
        double fee = calculateCivilLitigationFee(request.getDisputeAmount());
        Map<String, Object> data = Map.of(
                "caseType", request.getCaseType(),
                "disputeAmount", request.getDisputeAmount(),
                "litigationFee", round(fee)
        );
        saveToolUsage(userId, "calculator", "litigation_fee", requestToMap(request), data);
        return data;
    }
    
    @Transactional
    public Map<String, Object> calculatePenalty(String userId, PenaltyCalcRequest request) {
        double penalty = request.getContractAmount() * request.getPenaltyRate();
        penalty = Math.min(penalty, request.getActualLoss() * 2);
        Map<String, Object> data = Map.of(
                "penaltyAmount", round(penalty),
                "contractAmount", request.getContractAmount(),
                "penaltyRate", request.getPenaltyRate(),
                "actualLoss", request.getActualLoss()
        );
        saveToolUsage(userId, "calculator", "penalty", requestToMap(request), data);
        return data;
    }
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> getUsageRecords(String userId, String toolType, int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ToolUsageRecord> recordPage;
        if (toolType != null && !toolType.isBlank()) {
            recordPage = toolUsageRecordRepository.findByUserIdAndToolTypeOrderByCreatedAtDesc(userId, toolType, pageable);
        } else {
            recordPage = toolUsageRecordRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        List<Map<String, Object>> list = recordPage.getContent().stream()
                .map(record -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", record.getId());
                    map.put("toolType", record.getToolType());
                    map.put("toolName", record.getToolName());
                    map.put("inputData", record.getInputData());
                    map.put("resultData", record.getResultData());
                    map.put("createdAt", record.getCreatedAt());
                    return map;
                })
                .toList();
        return PageResult.of(list, recordPage.getTotalElements(), page, pageSize);
    }
    
    private void saveToolUsage(String userId, String toolType, String toolName,
                               Map<String, Object> inputData, Map<String, Object> resultData) {
        if (userId == null) {
            return;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        ToolUsageRecord record = new ToolUsageRecord();
        record.setUser(user);
        record.setToolType(toolType);
        record.setToolName(toolName);
        record.setInputData(inputData);
        record.setResultData(resultData);
        toolUsageRecordRepository.save(record);
    }
    
    private double calculateCivilLitigationFee(double amount) {
        double fee = 0;
        double remaining = amount;
        double[][] steps = {
                {100000, 0.025},
                {900000, 0.02},
                {4000000, 0.015},
                {5000000, 0.01},
                {Double.MAX_VALUE, 0.005}
        };
        for (double[] step : steps) {
            if (remaining <= 0) break;
            double chunk = Math.min(remaining, step[0]);
            fee += chunk * step[1];
            remaining -= chunk;
            if (step[0] == Double.MAX_VALUE) {
                break;
            }
        }
        return Math.max(fee, 50);
    }
    
    private Map<String, Object> requestToMap(Object request) {
        Map<String, Object> map = new HashMap<>();
        for (var field : request.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                map.put(field.getName(), field.get(request));
            } catch (IllegalAccessException ignored) {
            }
        }
        return map;
    }
    
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

