import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Input } from '../components/ui/input'
import { Loader2, Search, MessageCircle, User, Users } from 'lucide-react'

interface Alumni {
  id: number;
  name: string;
  email: string;
  graduation_year: number;
  department: string;
  avatar?: string;
  current_company?: string;
  current_position?: string;
}

export const FindMentorPage: React.FC = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [mentors, setMentors] = useState<Alumni[]>([])
  const [filteredMentors, setFilteredMentors] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (token) {
      fetchMentors()
    } else {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase().trim()
    if (lowercasedTerm === '') {
      setFilteredMentors(mentors)
    } else {
      const filtered = mentors.filter(mentor => 
        mentor.name.toLowerCase().includes(lowercasedTerm) ||
        mentor.department.toLowerCase().includes(lowercasedTerm) ||
        mentor.current_company?.toLowerCase().includes(lowercasedTerm) ||
        mentor.current_position?.toLowerCase().includes(lowercasedTerm)
      )
      setFilteredMentors(filtered)
    }
  }, [searchTerm, mentors])

  const fetchMentors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/alumni', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setMentors(data)
        setFilteredMentors(data)
      }
    } catch (error) {
      console.error("Error fetching mentors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartConversation = async (mentorId: number) => {
    try {
      const response = await fetch('http://localhost:5001/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ other_user_id: mentorId })
      });
      if (response.ok) {
        const conversation = await response.json();
        navigate(`/messages/${conversation.id}`);
      }
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find a Mentor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our network of experienced alumni and connect with a mentor to guide your journey.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, department, or company..."
            className="pl-10 h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-md">
                  <AvatarImage src={mentor.avatar ? `http://localhost:5001/api/profile/picture/${mentor.avatar}` : undefined} alt={mentor.name} />
                  <AvatarFallback className="text-2xl">{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">Class of {mentor.graduation_year}</p>
                <p className="text-sm text-muted-foreground mb-3">{mentor.department}</p>
                
                {mentor.current_position && mentor.current_company && (
                    <Badge variant="secondary" className="mb-4">{mentor.current_position} at {mentor.current_company}</Badge>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  <Button asChild variant="outline">
                    <Link to={`/users/${mentor.id}`}><User className="h-4 w-4 mr-2" />View Profile</Link>
                  </Button>
                  <Button onClick={() => handleStartConversation(mentor.id)}>
                    <MessageCircle className="h-4 w-4 mr-2" />Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && !isLoading && (
            <div className="text-center py-16 col-span-full">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Mentors Found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your search criteria.
                </p>
            </div>
        )}
      </div>
    </div>
  )
}

