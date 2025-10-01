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
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Messages</h1>
              <Button onClick={() => setShowNewChat(!showNewChat)} size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
            </div>
            {showNewChat && <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {showNewChat ? (
              filteredUsers.map(u => <NewChatListItem key={u.id} user={u} onClick={() => startNewConversation(u.id)} />)
            ) : (
              conversations.map(c => <ConversationListItem key={c.id} conversation={c} isSelected={selectedConversation?.id === c.id} onClick={() => selectConversation(c)} />)
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 flex-col hidden md:flex">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                    <Link to={`/users/${selectedConversation.other_user_id}`}>
                        <Avatar className="h-10 w-10"><AvatarFallback>{selectedConversation.other_user_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                    </Link>
                    <div>
                        <h3 className="font-semibold">{selectedConversation.other_user_name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{selectedConversation.other_user_role}</p>
                    </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwn ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-3">
                  <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={sending} />
                  <Button onClick={sendMessage} disabled={!newMessage.trim() || sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Select a conversation</h3>
                <p className="text-gray-500">Or start a new one to begin chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
