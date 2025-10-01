import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' // Import useParams to get URL ID
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, Building, MapPin, Briefcase, Award, Globe, Code, MessageCircle, Star, Home, Calendar, Phone, User } from 'lucide-react'
import { Loader2 } from 'lucide-react'

// You can reuse the same interfaces from ProfilePage.tsx
interface Skill {
  name: string
  type: 'technical' | 'soft' | 'language'
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}
interface Achievement {
  title: string, description?: string, type: 'award' | 'certification' | 'project' | 'publication' | 'other', date_earned?: string, issuer?: string
}
interface Language {
  name: string, proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'
}
interface Profile {
  id: number, name: string, email: string, role: 'student' | 'alumni', graduation_year?: number, department?: string, avatar?: string, bio?: string, hall?: string, branch?: string, current_company?: string, current_position?: string, location?: string, work_preference?: 'onsite' | 'remote' | 'hybrid', skills?: Skill[], achievements?: Achievement[], languages?: Language[], phone?: string, website?: string, linkedin?: string, github?: string
}

export const UserProfilePage: React.FC = () => {
  const { token } = useAuth()
  const { userId } = useParams<{ userId: string }>() // Get the user ID from the URL
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId || !token) {
          setLoading(false);
          return;
      }
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
            console.error("Failed to fetch user profile");
            setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [userId, token])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User profile not found.</p>
      </div>
    )
  }

  // This is the READ-ONLY JSX. No forms, no edit buttons.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={profile.avatar ? `http://localhost:5001/api/profile/picture/${profile.avatar}` : undefined} 
                  alt={profile.name} 
                />
                <AvatarFallback className="text-2xl bg-white text-blue-600">
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <p className="text-blue-100 mb-4">{profile.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {profile.role === 'alumni' ? 'Alumni' : 'Student'}
                  </Badge>
                  {profile.graduation_year && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Class of {profile.graduation_year}
                    </Badge>
                  )}
                  {profile.department && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.department}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {profile.bio && (<p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>)}
                  <div className="space-y-3">
                    {profile.phone && (<div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-blue-600" /><span>{profile.phone}</span></div>)}
                    {profile.website && (<div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-blue-600" /><a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.website}</a></div>)}
                    {profile.linkedin && (<div className="flex items-center gap-2 text-sm"><Code className="h-4 w-4 text-blue-600" /><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a></div>)}
                    {profile.github && (<div className="flex items-center gap-2 text-sm"><Code className="h-4 w-4 text-blue-600" /><a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Profile</a></div>)}
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"><MessageCircle className="h-4 w-4 mr-2" />Message</Button>
                    <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"><Star className="h-4 w-4 mr-2" />Follow</Button>
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Professional Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {profile.department && (<div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50"><div className="p-2 rounded-full bg-blue-100"><GraduationCap className="h-4 w-4 text-blue-600" /></div><div><p className="text-sm font-medium">Department</p><p className="text-sm text-muted-foreground">{profile.department}</p></div></div>)}
                {profile.hall && (<div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50"><div className="p-2 rounded-full bg-purple-100"><Home className="h-4 w-4 text-purple-600" /></div><div><p className="text-sm font-medium">Hall</p><p className="text-sm text-muted-foreground">{profile.hall}</p></div></div>)}
                {profile.branch && (<div className="flex items-center gap-3 p-3 rounded-lg bg-green-50"><div className="p-2 rounded-full bg-green-100"><Code className="h-4 w-4 text-green-600" /></div><div><p className="text-sm font-medium">Branch</p><p className="text-sm text-muted-foreground">{profile.branch}</p></div></div>)}
                {profile.current_company && (<div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50"><div className="p-2 rounded-full bg-orange-100"><Building className="h-4 w-4 text-orange-600" /></div><div><p className="text-sm font-medium">Company</p><p className="text-sm text-muted-foreground">{profile.current_company}</p></div></div>)}
                {profile.current_position && (<div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50"><div className="p-2 rounded-full bg-indigo-100"><Briefcase className="h-4 w-4 text-indigo-600" /></div><div><p className="text-sm font-medium">Position</p><p className="text-sm text-muted-foreground">{profile.current_position}</p></div></div>)}
                {profile.location && (<div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50"><div className="p-2 rounded-full bg-pink-100"><MapPin className="h-4 w-4 text-pink-600" /></div><div><p className="text-sm font-medium">Location</p><p className="text-sm text-muted-foreground">{profile.location}</p></div></div>)}
                {profile.work_preference && (<div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50"><div className="p-2 rounded-full bg-teal-100"><Globe className="h-4 w-4 text-teal-600" /></div><div><p className="text-sm font-medium">Work Preference</p><p className="text-sm text-muted-foreground capitalize">{profile.work_preference}</p></div></div>)}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" />Skills & Expertise</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {profile.skills?.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                                <div className={`w-2 h-2 rounded-full ${skill.type === 'technical' ? 'bg-blue-500' : skill.type === 'soft' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                                <span className="text-sm font-medium">{skill.name}</span>
                                <Badge variant="outline" className="text-xs">{skill.proficiency}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {/* Other sections like Languages and Achievements follow the same read-only pattern */}
          </div>
        </div>
      </div>
    </div>
  )
}
