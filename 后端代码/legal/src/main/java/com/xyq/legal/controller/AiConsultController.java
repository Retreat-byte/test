package com.xyq.legal.controller;

import com.xyq.legal.common.Result;
import com.xyq.legal.service.AiConsultService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-consult")
@RequiredArgsConstructor
public class AiConsultController {
    
    private final AiConsultService aiConsultService;

    @PostMapping("/conversations")
    public Result<Map<String, Object>> createConversation(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        var conversation = aiConsultService.createConversation(userId);
        return Result.success(Map.of(
                "conversationId", conversation.getId(),
                "createdAt", conversation.getCreatedAt().toString()
        ));
    }

    @PostMapping("/messages")
    public Result<Map<String, Object>> sendMessage(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        String conversationId = request.get("conversationId");
        String message = request.get("message");
        
        if (conversationId == null || message == null) {
            return Result.error(400, "参数错误");
        }
        
        try {
            Map<String, Object> data = aiConsultService.sendMessage(userId, conversationId, message);
            return Result.success(data);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    /**
     * 流式返回 AI 回复（SSE），前端通过 EventSource 调用
     * 示例：GET /api/ai-consult/messages/stream?conversationId=xxx&message=yyy
     */
    @GetMapping("/messages/stream")
    public SseEmitter streamMessage(
            @RequestParam String conversationId,
            @RequestParam String message,
            HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        SseEmitter emitter = new SseEmitter(60_000L);

        new Thread(() -> {
            try {
                Map<String, Object> data = aiConsultService.sendMessage(userId, conversationId, message);
                String reply = (String) data.get("reply");
                // 简单按句子拆分模拟流式推送
                String[] parts = reply.split("(?<=[。！？])");
                for (String part : parts) {
                    if (part.isBlank()) continue;
                    emitter.send(SseEmitter.event()
                            .name("message")
                            .data(part));
                    Thread.sleep(100); // 稍作延迟，模拟流式
                }
                emitter.send(SseEmitter.event()
                        .name("done")
                        .data("完成"));
                emitter.complete();
            } catch (IOException | InterruptedException e) {
                emitter.completeWithError(e);
            } catch (RuntimeException e) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(e.getMessage()));
                } catch (IOException ignored) {
                }
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

    @GetMapping("/conversations")
    public Result<Page<Map<String, Object>>> getConversations(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        Page<Map<String, Object>> data = aiConsultService.getConversations(userId, page, pageSize);
        return Result.success(data);
    }

    @GetMapping("/conversations/{conversationId}")
    public Result<List<Map<String, Object>>> getConversationDetail(
            @PathVariable String conversationId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        try {
            List<Map<String, Object>> data = aiConsultService.getConversationDetail(userId, conversationId);
            return Result.success(data);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/conversations/{conversationId}")
    public Result<?> deleteConversation(
            @PathVariable String conversationId,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        try {
            aiConsultService.deleteConversation(userId, conversationId);
            return Result.success("删除成功", null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/conversations/all")
    public Result<?> deleteAllConversations(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        try {
            aiConsultService.deleteAllConversations(userId);
            return Result.success("清空成功", null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    /**
     * 修改对话标题
     */
    @PatchMapping("/conversations/{conversationId}")
    public Result<?> updateConversationTitle(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        String title = body.get("title");
        if (title == null || title.isBlank()) {
            return Result.error(400, "标题不能为空");
        }
        try {
            aiConsultService.updateConversationTitle(userId, conversationId, title);
            return Result.success("更新成功", null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }
}

