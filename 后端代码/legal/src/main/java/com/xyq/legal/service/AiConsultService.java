package com.xyq.legal.service;

import com.xyq.legal.entity.Conversation;
import com.xyq.legal.entity.Message;
import com.xyq.legal.entity.User;
import com.xyq.legal.repository.ConversationRepository;
import com.xyq.legal.repository.MessageRepository;
import com.xyq.legal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiConsultService {
    
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public Conversation createConversation(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setMessageCount(0);
        
        return conversationRepository.save(conversation);
    }

    @Transactional
    public Map<String, Object> sendMessage(String userId, String conversationId, String messageContent) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("对话不存在"));
        
        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问此对话");
        }
        
        // 保存用户消息
        Message userMessage = new Message();
        userMessage.setConversation(conversation);
        userMessage.setRole(Message.Role.USER);
        userMessage.setContent(messageContent);
        messageRepository.save(userMessage);
        
        // 如果是第一条消息，设置标题和first_message
        if (conversation.getMessageCount() == 0) {
            conversation.setFirstMessage(messageContent);
            conversation.setTitle(messageContent.length() > 20 ? 
                    messageContent.substring(0, 20) + "..." : messageContent);
        }
        
        // 生成AI回复（模拟）
        String aiReply = generateAiReply(messageContent);
        
        // 保存AI回复
        Message aiMessage = new Message();
        aiMessage.setConversation(conversation);
        aiMessage.setRole(Message.Role.ASSISTANT);
        aiMessage.setContent(aiReply);
        messageRepository.save(aiMessage);
        
        // 更新对话消息数
        conversation.setMessageCount(conversation.getMessageCount() + 2);
        conversationRepository.save(conversation);
        
        return Map.of(
                "messageId", aiMessage.getId(),
                "reply", aiReply,
                "timestamp", aiMessage.getCreatedAt().toString()
        );
    }

    public Page<Map<String, Object>> getConversations(String userId, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<Conversation> conversations = conversationRepository
                .findByUserIdOrderByUpdatedAtDesc(userId, pageable);
        
        return conversations.map(conv -> Map.of(
                "conversationId", conv.getId(),
                "title", conv.getTitle() != null ? conv.getTitle() : "新对话",
                "lastMessage", getLastMessage(conv.getId()),
                "messageCount", conv.getMessageCount(),
                "createdAt", conv.getCreatedAt().toString(),
                "updatedAt", conv.getUpdatedAt().toString()
        ));
    }

    public List<Map<String, Object>> getConversationDetail(String userId, String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("对话不存在"));
        
        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权访问此对话");
        }
        
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        
        return messages.stream().map(msg -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("messageId", msg.getId());
            map.put("role", msg.getRole().name().toLowerCase());
            map.put("content", msg.getContent());
            map.put("timestamp", msg.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteConversation(String userId, String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("对话不存在"));
        
        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权删除此对话");
        }
        
        conversationRepository.delete(conversation);
    }

    @Transactional
    public void deleteAllConversations(String userId) {
        List<Conversation> conversations = conversationRepository
                .findByUserIdOrderByUpdatedAtDesc(userId, Pageable.unpaged()).getContent();
        conversationRepository.deleteAll(conversations);
    }

    /**
     * 更新对话标题
     */
    @Transactional
    public void updateConversationTitle(String userId, String conversationId, String title) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("对话不存在"));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权修改此对话");
        }

        conversation.setTitle(title);
        conversationRepository.save(conversation);
    }

    private String generateAiReply(String userMessage) {
        // TODO: 集成真实的AI服务（如OpenAI、文心一言等）
        return "您好，我是法智顾问AI助手。关于您的问题：" + userMessage + 
               "，我建议您查阅相关法律法规或咨询专业律师。如需更详细的帮助，请提供更多信息。";
    }

    private String getLastMessage(String conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        if (messages.isEmpty()) {
            return "";
        }
        Message lastMessage = messages.get(messages.size() - 1);
        String content = lastMessage.getContent();
        return content.length() > 50 ? content.substring(0, 50) + "..." : content;
    }
}

