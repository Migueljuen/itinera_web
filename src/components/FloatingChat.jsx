// components/FloatingChat.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Send, Minus, ArrowLeft } from 'lucide-react';
import Chat from './Chat';
import API_URL from '../constants/api';
import socketService from '../services/socket';

function FloatingChat({ currentUser }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMinimized, setIsMinimized] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch user's conversations
    const fetchConversations = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            const response = await fetch(`${API_URL}/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    // Mark messages as read
    const markMessagesAsRead = useCallback(async (conversationId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            await fetch(`${API_URL}/messages/${conversationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update local state to clear unread count
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                )
            );
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Listen for new messages to update conversation list
    useEffect(() => {
        if (!currentUser?.id) return;

        const handleNewMessage = (message) => {
            setConversations(prev => {
                const updated = prev.map(conv => {
                    if (conv.id === message.conversationId) {
                        // Don't increment unread if we're currently viewing this conversation
                        const isViewing = activeConversation?.id === message.conversationId;
                        const isOwnMessage = message.senderId === currentUser.id;

                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageAt: message.createdAt,
                            unreadCount: isViewing || isOwnMessage
                                ? conv.unreadCount
                                : conv.unreadCount + 1
                        };
                    }
                    return conv;
                });

                // Sort by most recent
                return updated.sort((a, b) => {
                    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
                    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
                    return dateB - dateA;
                });
            });

            // If viewing the conversation where message came from, mark as read
            if (activeConversation?.id === message.conversationId && message.senderId !== currentUser.id) {
                markMessagesAsRead(message.conversationId);
            }
        };

        // Connect and listen
        const setup = async () => {
            await socketService.connect();

            // Join all conversations to receive updates
            conversations.forEach(conv => {
                socketService.joinConversation(conv.id);
            });

            // Remove old listener and add new one
            socketService.socket?.off('new_message', handleNewMessage);
            socketService.socket?.on('new_message', handleNewMessage);
        };

        setup();

        return () => {
            socketService.socket?.off('new_message', handleNewMessage);
        };
    }, [currentUser?.id, conversations.length, activeConversation?.id, markMessagesAsRead]);

    // Handle selecting a conversation
    const handleSelectConversation = useCallback((conversation) => {
        setActiveConversation(conversation);

        // Mark messages as read when opening conversation
        if (conversation.unreadCount > 0) {
            markMessagesAsRead(conversation.id);
        }
    }, [markMessagesAsRead]);

    // Handle going back to list
    const handleBackToList = useCallback(() => {
        setActiveConversation(null);
        // Refresh to get accurate data from server
        fetchConversations();
    }, [fetchConversations]);

    if (!currentUser?.id) return null;

    return (
        <div className="fixed bottom-12 right-6 z-50 flex items-end gap-2">
            {isOpen && (
                <div
                    className={`
            bg-white 
            flex flex-col overflow-hidden 
            ${isMinimized ? 'h-16 justify-center rounded-full' : 'h-[500px] rounded-2xl'}
            w-[420px]
            shadow-[0_4px_20px_rgba(0,0,0,0.15)]
          `}
                >
                    {/* Header */}
                    <div
                        className={`
              bg-white text-black/90 px-4 
              ${isMinimized ? '' : 'h-fit py-3 border-b border-gray-300'}  
              flex items-center justify-between cursor-pointer
            `}
                        onClick={() => isMinimized && setIsMinimized(false)}
                    >
                        <div className="flex items-center gap-2">
                            {activeConversation && !isMinimized ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBackToList();
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Send size={18} />
                                </div>
                            )}
                            <span className="font-medium">
                                {activeConversation
                                    ? `${activeConversation.participants?.[0]?.firstName || ''} ${activeConversation.participants?.[0]?.lastName || ''}`.trim() || 'Chat'
                                    : 'Messages'
                                }
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMinimized(!isMinimized);
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <Minus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <div className="flex-1 overflow-hidden">
                            {activeConversation ? (
                                <Chat
                                    conversationId={activeConversation.id}
                                    currentUser={currentUser}
                                    isFloating={true}
                                />
                            ) : (
                                <ConversationList
                                    conversations={conversations}
                                    loading={loading}
                                    onSelect={handleSelectConversation}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Conversation List Component
function ConversationList({ conversations, loading, onSelect }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Send size={40} className="text-gray-300 mb-2" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-gray-400 text-sm">Start a conversation with someone!</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full">
            {conversations.map((conversation) => {
                const otherUser = conversation.participants?.[0];
                const hasUnread = conversation.unreadCount > 0;

                return (
                    <div
                        key={conversation.id}
                        onClick={() => onSelect(conversation)}
                        className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${hasUnread ? 'bg-blue-50/50' : ''
                            }`}
                    >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {otherUser?.profilePic ? (
                                <img
                                    src={`${API_URL}/${otherUser.profilePic}`}
                                    alt={otherUser.firstName}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-500 text-lg">
                                    {otherUser?.firstName?.[0] || '?'}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={`${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {otherUser?.firstName} {otherUser?.lastName}
                                </span>
                                {conversation.lastMessageAt && (
                                    <span className="text-xs text-gray-400">
                                        {formatTime(conversation.lastMessageAt)}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm truncate ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                {conversation.lastMessage || 'No messages yet'}
                            </p>
                        </div>

                        {/* Unread Badge */}
                        {hasUnread && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-white font-medium">
                                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Helper function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
}

export default FloatingChat;