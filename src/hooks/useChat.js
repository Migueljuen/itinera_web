// hooks/useChat.js

import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import API_URL from "../constants/api";

export function useChat(conversationId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  // Load message history
  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Setup socket connection and listeners
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    let mounted = true;

    const setup = async () => {
      // Connect and join conversation
      await socketService.connect();
      socketService.joinConversation(conversationId);

      // Load existing messages
      if (mounted) {
        await loadMessages();
      }
    };

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('Received new message:', message);
      
      // Only add if it's for this conversation and component is still mounted
      if (message.conversationId === conversationId && mounted) {
        setMessages(prev => {
          // Prevent duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const handleUserTyping = ({ userId }) => {
      if (userId !== currentUserId && mounted) {
        setTypingUsers(prev =>
          prev.includes(userId) ? prev : [...prev, userId]
        );
      }
    };

    const handleUserStoppedTyping = ({ userId }) => {
      if (mounted) {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    };

    // Remove old listeners before adding new ones
    socketService.offNewMessage();

    // Add listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);

    // Run setup
    setup();

    // Cleanup
    return () => {
      mounted = false;
      socketService.offNewMessage();
      socketService.leaveConversation(conversationId);
      // Reset state when leaving conversation
      setMessages([]);
      setTypingUsers([]);
      setLoading(true);
    };
  }, [conversationId, currentUserId, loadMessages]);

  // Send a message
  const sendMessage = useCallback((content) => {
    if (!conversationId || !currentUserId) return;

    console.log('Sending message with:', {
      conversationId,
      currentUserId,
      content
    });

    socketService.sendMessage(
      conversationId,
      currentUserId,
      content,
      (response) => {
        if (!response.success) {
          console.error('Failed to send message:', response.error);
        }
      }
    );
  }, [conversationId, currentUserId]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!conversationId || !currentUserId) return;
    socketService.startTyping(conversationId, currentUserId);
  }, [conversationId, currentUserId]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !currentUserId) return;
    socketService.stopTyping(conversationId, currentUserId);
  }, [conversationId, currentUserId]);

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    refreshMessages: loadMessages
  };
}