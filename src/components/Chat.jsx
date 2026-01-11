// components/Chat.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

function Chat({ conversationId, currentUser, isFloating = false }) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const {
        messages,
        loading,
        typingUsers,
        sendMessage,
        startTyping,
        stopTyping
    } = useChat(conversationId, currentUser.id);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        startTyping();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        sendMessage(inputValue.trim());
        setInputValue('');
        stopTyping();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">Loading messages...</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${isFloating ? 'h-full' : 'h-screen'}`}>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                  max-w-[70%] px-4 py-2 rounded-2xl
                  ${message.senderId === currentUser.id
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-gray-200 text-gray-900 rounded-bl-md'
                                    }
                `}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${message.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                    Someone is typing...
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Chat;