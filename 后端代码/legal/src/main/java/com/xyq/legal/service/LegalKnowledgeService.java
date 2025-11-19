package com.xyq.legal.service;

import com.xyq.legal.common.PageResult;
import com.xyq.legal.dto.FavoriteBatchCheckRequest;
import com.xyq.legal.dto.LegalRegulationSearchRequest;
import com.xyq.legal.entity.Favorite;
import com.xyq.legal.entity.LegalRegulation;
import com.xyq.legal.entity.User;
import com.xyq.legal.repository.FavoriteRepository;
import com.xyq.legal.repository.LegalRegulationRepository;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LegalKnowledgeService {
    
    private final LegalRegulationRepository regulationRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> listRegulations(LegalRegulationSearchRequest request) {
        Pageable pageable = PageRequest.of(
                Math.max(request.getPage() - 1, 0),
                request.getPageSize(),
                Sort.by(Sort.Direction.DESC, "updatedAt"));
        
        Page<LegalRegulation> pageData = regulationRepository.search(
                normalize(request.getCategory()),
                normalize(request.getEffectStatus()),
                normalize(request.getKeyword()),
                request.getUpdateYear(),
                pageable);
        
        List<Map<String, Object>> list = pageData.getContent()
                .stream()
                .map(this::buildRegulationSummary)
                .collect(Collectors.toList());
        
        return PageResult.of(list, pageData.getTotalElements(), request.getPage(), request.getPageSize());
    }
    
    @Transactional(readOnly = true)
    public LegalRegulation getRegulationDetail(String id) {
        String targetId = Objects.requireNonNull(id, "法规ID不能为空");
        return regulationRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("法规不存在"));
    }
    
    @Transactional(readOnly = true)
    public String getRegulationContent(String id) {
        LegalRegulation regulation = getRegulationDetail(id);
        return regulation.getContent();
    }
    
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return regulationRepository.findDistinctCategories();
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularRegulations(int limit) {
        return regulationRepository.findTop10ByOrderByArticleCountDesc()
                .stream()
                .limit(limit)
                .map(this::buildRegulationSummary)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLatestRegulations(int limit) {
        return regulationRepository.findTop10ByOrderByUpdateDateDesc()
                .stream()
                .limit(limit)
                .map(this::buildRegulationSummary)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public Favorite addFavorite(String userId, String regulationId) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        String targetRegulationId = Objects.requireNonNull(regulationId, "法规ID不能为空");
        if (favoriteRepository.existsByUserIdAndRegulationId(targetUserId, targetRegulationId)) {
            throw new RuntimeException("已收藏该法规");
        }
        
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        LegalRegulation regulation = regulationRepository.findById(targetRegulationId)
                .orElseThrow(() -> new RuntimeException("法规不存在"));
        
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setRegulation(regulation);
        return favoriteRepository.save(favorite);
    }
    
    @Transactional
    public void removeFavorite(String userId, String regulationId) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        String targetRegulationId = Objects.requireNonNull(regulationId, "法规ID不能为空");
        Favorite favorite = favoriteRepository.findByUserIdAndRegulationId(targetUserId, targetRegulationId)
                .orElseThrow(() -> new RuntimeException("收藏记录不存在"));
        favoriteRepository.delete(Objects.requireNonNull(favorite));
    }
    
    @Transactional(readOnly = true)
    public PageResult<Map<String, Object>> listFavorites(String userId, int page, int pageSize) {
        String targetUserId = Objects.requireNonNull(userId, "用户ID不能为空");
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize);
        Page<Favorite> favoritePage = favoriteRepository.findByUserIdOrderByCreatedAtDesc(targetUserId, pageable);
        
        List<Map<String, Object>> list = favoritePage.getContent().stream()
                .filter(Objects::nonNull)
                .map(favorite -> buildFavoriteInfo(favorite))
                .collect(Collectors.toList());
        
        return PageResult.of(list, favoritePage.getTotalElements(), page, pageSize);
    }
    
    @Transactional(readOnly = true)
    public boolean checkFavorite(String userId, String regulationId) {
        return favoriteRepository.existsByUserIdAndRegulationId(
                Objects.requireNonNull(userId, "用户ID不能为空"),
                Objects.requireNonNull(regulationId, "法规ID不能为空"));
    }
    
    @Transactional(readOnly = true)
    public Map<String, Boolean> batchCheckFavorites(String userId, FavoriteBatchCheckRequest request) {
        Objects.requireNonNull(userId, "用户ID不能为空");
        Map<String, Boolean> result = new HashMap<>();
        for (String regulationId : request.getRegulationIds()) {
            result.put(regulationId, checkFavorite(userId, regulationId));
        }
        return result;
    }
    
    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value;
    }
    
    private Map<String, Object> buildRegulationSummary(LegalRegulation regulation) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", regulation.getId());
        map.put("title", regulation.getTitle());
        map.put("category", regulation.getCategory());
        map.put("status", regulation.getStatus());
        map.put("articleCount", regulation.getArticleCount());
        map.put("effectiveDate", regulation.getEffectiveDate());
        map.put("updateDate", regulation.getUpdateDate());
        map.put("createdAt", regulation.getCreatedAt());
        return map;
    }
    
    private Map<String, Object> buildFavoriteInfo(Favorite favorite) {
        Favorite entity = Objects.requireNonNull(favorite, "收藏记录不存在");
        LegalRegulation regulation = entity.getRegulation();
        Map<String, Object> map = buildRegulationSummary(regulation);
        map.put("favoriteId", entity.getId());
        map.put("favoriteAt", entity.getCreatedAt());
        return map;
    }
}

