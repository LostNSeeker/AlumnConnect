import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/dataUtils'
import { MessageCircle, Search, Plus, Loader2, Send, ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

// --- Interfaces ---
interface Conversation {
  id: number
  other_user_id: number
  other_user_name: string
  other_user_email: string
  other_user_role: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  is_online?: boolean
}

interface User {
  id: number, name: string, email: string, role: string, department?: string, graduation_year?: number, current_company?: string, current_position?: string, location?: string
}

interface Message {
  id: number, sender_id: number, receiver_id: number, content: string, created_at: string, is_read: boolean
}

// --- Reusable Child Components for List Items ---

const ConversationListItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ conversation, isSelected, onClick }) => (
  <div
    className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div className="relative">
        <Link to={`/users/${conversation.other_user_id}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
              {conversation.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        {conversation.is_online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 truncate">{conversation.other_user_name}</p>
          {conversation.unread_count > 0 && <Badge variant="destructive" className="text-xs">{conversation.unread_count}</Badge>}
        </div>
        {conversation.last_message && <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>}
        {conversation.last_message_time && <p className="text-xs text-gray-400">{formatDate(conversation.last_message_time)}</p>}
      </div>
    </div>
  </div>
);

const NewChatListItem: React.FC<{ user: User; onClick: () => void }> = ({ user, onClick }) => (
  <div
    className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 mb-2"
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <Link to={`/users/${user.id}`} onClick={(e) => e.stopPropagation()}>
        <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.name}</p>
        <p className="text-sm text-gray-500 truncate">
          {user.current_position && user.current_company ? `${user.current_position} at ${user.current_company}` : user.department || user.role}
        </p>
      </div>
      <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
    </div>
  </div>
);


// --- Main Messages Page Component ---

export const MessagesPage: React.FC = () => {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const { id: conversationIdFromUrl } = useParams<{ id: string }>()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (token) fetchData();
  }, [token])

  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(conversationIdFromUrl))
      if (conversation && conversation.id !== selectedConversation?.id) {
        selectConversation(conversation)
      }
    }
  }, [conversationIdFromUrl, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchData = async () => {
    setLoading(true);
    try {
      const [conversationsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5001/api/messages/conversations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/messages/available-users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (conversationsRes.ok) setConversations(await conversationsRes.json());
      if (usersRes.ok) setAvailableUsers(await usersRes.json());
    } catch (error) {
      console.error('Error fetching messages data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startNewConversation = async (otherUserId: number) => {
    try {
      const response = await fetch('http://localhost:5001/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ other_user_id: otherUserId })
      });

      if (response.ok) {
        const newConversationData = await response.json();
        await fetchData(); // Refetch all conversations to get the new one in the list
        setShowNewChat(false);
        navigate(`/messages/${newConversationData.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessagesLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/messages/conversations/${conversation.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setMessages(await response.json());
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
    navigate(`/messages/${conversation.id}`, { replace: true });
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const response = await fetch(`http://localhost:5001/api/messages/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        // Also update the conversation list to show the new last message
        setConversations(prev => prev.map(c => c.id === selectedConversation.id ? {...c, last_message: newMsg.content, last_message_time: newMsg.created_at} : c));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const filteredUsers = availableUsers.filter(u => 
    u.id !== user?.id && u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Please log in.</p></div>

  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="flex flex-col md:flex-row h-[80vh]">
        {/* Left Sidebar - Conversations List */}
        <div className={`${
          selectedConversation ? 'hidden md:flex' : 'flex'
        } w-full md:w-1/3 bg-white border-r border-gray-200 flex-col`}>
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Messages</h1>
              <Button 
                onClick={() => setShowNewChat(!showNewChat)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {showNewChat && <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : showNewChat ? (
              <div className="p-2">
                {filteredUsers.map((alumni) => (
                  <div
                    key={alumni.id}
                    className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 mb-2"
                    onClick={() => startNewConversation(alumni.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Link to={`/profile/${alumni.id}`} onClick={(e) => e.stopPropagation()}>
                        <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                            {alumni.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm md:text-base">{alumni.name}</p>
                        <p className="text-xs md:text-sm text-gray-500 truncate">
                          {alumni.current_position && alumni.current_company 
                            ? `${alumni.current_position} at ${alumni.current_company}`
                            : alumni.department || 'Alumni'
                          }
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs">Alumni</Badge>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No alumni found</p>
                  </div>
                )}
              </div>
            ) : conversations.length > 0 ? (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Link to={`/profile/${conversation.other_user_id}`} onClick={(e) => e.stopPropagation()}>
                          <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                              {conversation.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        {conversation.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate text-sm md:text-base">{conversation.other_user_name}</p>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {conversation.last_message}
                          </p>
                        )}
                        {conversation.last_message_time && (
                          <p className="text-xs text-gray-400">
                            {formatDate(conversation.last_message_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4 text-xs md:text-sm">
                  {user.role === 'student' 
                    ? 'Start a conversation with an alumni mentor'
                    : 'Students can reach out to you for mentorship'
                  }
                </p>
                <Button 
                  onClick={() => setShowNewChat(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className={`${
          !selectedConversation ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col w-full`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedConversation(null)
                        setMessages([])
                        window.history.pushState({}, '', '/messages')
                      }}
                      className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Link to={`/profile/${selectedConversation.other_user_id}`}>
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs md:text-sm font-semibold">
                          {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{selectedConversation.other_user_name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {selectedConversation.other_user_role === 'alumni' ? 'Alumni Mentor' : 'Student'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedConversation(null)
                      setMessages([])
                      window.history.pushState({}, '', '/messages')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-xs md:text-sm break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Start the conversation by sending a message below.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Messages</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {user.role === 'student' 
                    ? 'Select a conversation or start a new chat with an alumni mentor to get guidance and support.'
                    : 'Select a conversation or start a new chat with a student to provide mentorship.'
                  }
                </p>
                <Button 
                  onClick={() => setShowNewChat(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
