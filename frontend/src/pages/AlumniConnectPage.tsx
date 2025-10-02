import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { parseJsonField, formatDate } from '@/lib/dataUtils'
import { Users, Briefcase, MessageCircle, Star, Clock, MapPin, DollarSign, Calendar, ArrowRight, Loader2, Send, CheckCircle, BookOpen, Code, Building, Heart, Share2 } from 'lucide-react'

interface Project {
  id: number
  title: string
  description: string
  category: string
  status: string
  team_members: string[]
  tags: string[]
  skills_required: string[]
  stipend?: number
  duration?: string
  location?: string
  work_type?: string
  created_at: string
  created_by_name: string
  created_by_email: string
}

interface BlogPost {
  id: number
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
  author_name: string
  author_avatar?: string
  author_id: number
  likes_count?: number
  is_liked?: boolean
}

export const AlumniConnectPage: React.FC = () => {
  const { user, token } = useAuth() // Added token for API calls
  const [projects, setProjects] = useState<Project[]>([])
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsResponse, blogsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/projects'),
        fetch('http://localhost:5001/api/blog') // Corrected endpoint
      ]);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.filter((p: Project) => p.status === 'active'))
      }
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json()
        setBlogs(blogsData.slice(0, 6))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user || !selectedProject || !token) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${selectedProject.id}/apply`, { // Corrected endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: applicationMessage
        })
      });
      if (response.ok) {
        setApplicationSubmitted(true)
      } else {
        const errorData = await response.json();
        console.error('Failed to submit application', errorData);
        alert(`Failed to apply: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: number) => {
    if (!token) {
        alert("You must be logged in to like a post.");
        return;
    }

    // Optimistic UI update
    setBlogs(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            is_liked: !post.is_liked,
            likes_count: post.is_liked ? (post.likes_count || 1) - 1 : (post.likes_count || 0) + 1
          }
        : post
    ));
    
    try {
        await fetch(`http://localhost:5001/api/blog/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error("Failed to update like status", error);
        // Revert UI on failure
        fetchData();
    }
  }

  const openApplyDialog = (project: Project) => {
    setSelectedProject(project);
    setApplicationMessage('');
    setApplicationSubmitted(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Alumni Connect</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Connect with alumni, apply for projects, and get inspired by their stories.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Projects */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Available Projects</h2>
                  <p className="text-muted-foreground">Gain real-world experience with alumni-led projects.</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/projects">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 4).map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
                      
                      {/* --- ADDED IMAGE PLACEHOLDER --- */}
                      <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                      </div>

                      <div className="flex flex-col flex-grow p-6">
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>{project.status}</Badge>
                                <Badge variant="outline">{project.category}</Badge>
                            </div>
                            <CardTitle className="line-clamp-2 mb-2">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-3 mb-4">{project.description}</CardDescription>
                            <div className="flex flex-wrap gap-1">
                                {parseJsonField(project.skills_required).slice(0, 4).map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                ))}
                                {parseJsonField(project.skills_required).length > 4 && <Badge variant="outline" className="text-xs">+{parseJsonField(project.skills_required).length - 4} more</Badge>}
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{project.created_by_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                            <span className="text-sm font-medium">{project.created_by_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild><Link to={`/projects/${project.id}`}>Details</Link></Button>
                            {user?.role === 'student' && (
                                <Dialog onOpenChange={(open) => !open && setSelectedProject(null)}>
                                <DialogTrigger asChild>
                                    <Button size="sm" onClick={() => openApplyDialog(project)}>Apply</Button>
                                </DialogTrigger>
                                </Dialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12"><CardContent><Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="font-semibold">No active projects</h3><p className="text-sm text-muted-foreground">Check back later for new opportunities.</p></CardContent></Card>
              )}
            </div>
          </div>

          {/* Sidebar - Blogs */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Latest Insights</h2>
                <Button asChild variant="ghost" size="sm"><Link to="/blog">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              </div>
              {blogs.length > 0 ? (
                <div className="space-y-4">
                  {blogs.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{post.author_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                <span>{post.author_name}</span>
                            </div>
                            <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 ${post.is_liked ? 'text-red-500' : ''}`}>
                                <Heart className={`h-3 w-3 ${post.is_liked ? 'fill-current' : ''}`} />
                                {post.likes_count || 0}
                            </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8"><CardContent><BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-3" /><h3 className="text-sm font-semibold">No articles yet</h3></CardContent></Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent>
            {applicationSubmitted ? (
                <>
                    <DialogHeader>
                        <DialogTitle>Application Sent!</DialogTitle>
                        <DialogDescription>Your application for "{selectedProject?.title}" has been successfully submitted.</DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <Button onClick={() => setSelectedProject(null)}>Close</Button>
                    </div>
                </>
            ) : (
                <>
                    <DialogHeader>
                        <DialogTitle>Apply for: {selectedProject?.title}</DialogTitle>
                        <DialogDescription>Write a brief message to the project creator.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea placeholder="Introduce yourself and explain your interest..." value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} rows={5} />
                        <Button onClick={handleApply} disabled={isSubmitting || !applicationMessage.trim()} className="w-full">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Application</>}
                        </Button>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}