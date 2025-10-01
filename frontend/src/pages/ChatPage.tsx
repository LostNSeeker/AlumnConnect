import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom' // Link is added
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dataUtils'
import { ArrowLeft, Send, Loader2, MessageCircle, Clock } from 'lucide-react'

// Interfaces remain the same
interface Message {
  id: number; sender_id: number; receiver_id: number; content: string; created_at: string; is_read: boolean;
}
interface ConversationUser {
  id: number; name: string; email: string; role: string; department?: string; graduation_year?: number; is_online?: boolean; avatar?: string;
}

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<ConversationUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id && token) {
      fetchConversationData()
    } else {
      setLoading(false);
    }
  }, [id, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversationData = async () => {
    setLoading(true);
    try {
      const [messagesRes, conversationRes] = await Promise.all([
        fetch(`http://localhost:5001/api/messages/conversations/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5001/api/messages/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      if (messagesRes.ok) setMessages(await messagesRes.json());
      if (conversationRes.ok) {
        const conversationData = await conversationRes.json();
        setOtherUser(conversationData.other_user);
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !id) return

    setSending(true)
    try {
      const response = await fetch(`http://localhost:5001/api/messages/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage.trim() })
      })
      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access messages.</p>
      </div>
    )
  }
  
  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Conversation Not Found</h3>
            <p className="text-muted-foreground mb-4">This chat may no longer exist.</p>
            <Button variant="outline" onClick={() => navigate('/messages')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Messages
            </Button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-white p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')} className="text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Link to={`/users/${otherUser.id}`}>
                  <Avatar className="h-12 w-12 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer">
                    <AvatarImage src={otherUser.avatar ? `http://localhost:5001/api/profile/picture/${otherUser.avatar}` : undefined} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                {otherUser.is_online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div>
                <h1 className="text-lg font-bold">{otherUser.name}</h1>
                <p className="text-sm text-gray-500 capitalize">{otherUser.role}</p>
              </div>
            </div>
          </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === user.id
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'
                }`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  <div className={`flex items-center space-x-1 mt-1 text-xs ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <Clock className="h-3 w-3" />
                    <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="bg-blue-600 hover:bg-blue-700">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
