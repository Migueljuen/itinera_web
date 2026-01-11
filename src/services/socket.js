// services/socket.js

import { io } from 'socket.io-client';
import API_URL from "../constants/api";

class SocketService {
  socket = null;
  joinedConversations = new Set();

  connect() {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      this.socket = io(API_URL, {
        auth: { token }
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server:', this.socket.id);

        // Rejoin all conversations after reconnect
        this.joinedConversations.forEach(convId => {
          this.socket.emit('join_conversation', convId);
        });

        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedConversations.clear();
    }
  }

  joinConversation(conversationId) {
    console.log('Joining conversation:', conversationId);
    this.joinedConversations.add(conversationId);
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId) {
    console.log('Leaving conversation:', conversationId);
    this.joinedConversations.delete(conversationId);
    this.socket?.emit('leave_conversation', conversationId);
  }

  // Join multiple conversations at once (useful for getting notifications)
  joinMultipleConversations(conversationIds) {
    conversationIds.forEach(id => {
      this.joinConversation(id);
    });
  }

  // Leave all conversations
  leaveAllConversations() {
    this.joinedConversations.forEach(convId => {
      this.socket?.emit('leave_conversation', convId);
    });
    this.joinedConversations.clear();
  }

  sendMessage(conversationId, senderId, content, callback) {
    this.socket?.emit('send_message', {
      conversationId,
      senderId,
      content
    }, callback);
  }

  onNewMessage(callback) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  startTyping(conversationId, userId) {
    this.socket?.emit('typing_start', { conversationId, userId });
  }

  stopTyping(conversationId, userId) {
    this.socket?.emit('typing_stop', { conversationId, userId });
  }

  onUserTyping(callback) {
    this.socket?.on('user_typing', callback);
  }

  offUserTyping() {
    this.socket?.off('user_typing');
  }

  onUserStoppedTyping(callback) {
    this.socket?.on('user_stopped_typing', callback);
  }

  offUserStoppedTyping() {
    this.socket?.off('user_stopped_typing');
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get list of joined conversations
  getJoinedConversations() {
    return Array.from(this.joinedConversations);
  }
}

export default new SocketService();