import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarsAnimation } from '@/components/ui/stars-animation'
import { parseJsonField } from '@/lib/dataUtils'
import { 
  ArrowRight, 
  Users, 
  Loader2
} from 'lucide-react'

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

interface Alumni {
  id: number
  name: string
  email: string
  graduation_year: number
  department: string
  avatar?: string
}

export const LandingPage: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [alumniStories, setAlumniStories] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsResponse, alumniResponse] = await Promise.all([
        fetch('http://localhost:5001/api/projects'),
        fetch('http://localhost:5001/api/alumni')
      ])
      if (projectsResponse.ok) {
        const projects = await projectsResponse.json()
        setFeaturedProjects(projects.slice(0, 3))
      }
      if (alumniResponse.ok) {
        const alumni = await alumniResponse.json()
        setAlumniStories(alumni.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    { label: "Active Projects", value: "5+", icon: "💡" },
    { label: "Alumni Mentors", value: "3+", icon: "👥" },
    { label: "Blog Posts", value: "4+", icon: "🏆" },
    { label: "Departments", value: "3+", icon: "🌍" }
  ]

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-white h-screen flex items-center justify-center overflow-hidden">
        <StarsAnimation 
          className="opacity-90" 
          starCount={150}
          speed={1.5}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute top-60 right-1/3 w-8 h-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-40 animate-bounce"></div>
        
        <div className="container mx-auto px-4 w-full">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              The Future of{' '}
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent animate-pulse">Innovation</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect the brightest minds from IIT Kharagpur. Share projects, find co-founders, and build the next generation of startups.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-200/30 border-0" asChild>
                <Link to="/projects">
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold" asChild>
                <Link to="/alumni-connect">
                  Find Co-founders
                  <Users className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform connecting students and alumni for growth, learning, and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 border border-blue-100">
                    <span className="text-4xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-3">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
                <span className="text-7xl mb-6 inline-block">💼</span>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Project Collaboration</h3>
                <p className="text-gray-600 leading-relaxed">
                    Work on real-world projects with experienced alumni mentors. Gain hands-on experience and build your portfolio.
                </p>
            </div>

            <div className="text-center group">
                <span className="text-7xl mb-6 inline-block">🤝</span>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Expert Mentorship</h3>
                <p className="text-gray-600 leading-relaxed">
                    Connect with successful alumni who can guide your career path and share valuable industry insights.
                </p>
            </div>

            <div className="text-center group">
                <span className="text-7xl mb-6 inline-block">📚</span>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Knowledge Sharing</h3>
                <p className="text-gray-600 leading-relaxed">
                    Read inspiring stories, learn from experiences, and stay updated with the latest trends in technology and innovation.
                </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover groundbreaking innovations and cutting-edge research from our talented students and alumni.
            </p>
          </div>
          
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading projects...</span>
            </div>
          </div>
        ) : featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {parseJsonField(project.tags).slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {parseJsonField(project.tags).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{parseJsonField(project.tags).length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {parseJsonField(project.team_members).slice(0, 3).map((member: string, index: number) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {member.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {parseJsonField(project.team_members).length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{parseJsonField(project.team_members).length - 3}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/projects/${project.id}`}>
                        View Details
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects available</h3>
            <p className="text-muted-foreground">
              Check back later for exciting new projects!
            </p>
          </div>
        )}
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/projects">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-20 bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Alumni Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from the journeys of our successful alumni who are making a global impact.
            </p>
          </div>
          
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading alumni stories...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {alumniStories.map((alumni) => (
              <Card key={alumni.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                        {alumni.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {alumni.name}
                  </CardTitle>
                  <CardDescription>
                    IIT KGP Alumni
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    {alumni.department} • Class of {alumni.graduation_year}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    "Experienced professional sharing insights and experiences from their career journey."
                  </p>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/messages">
                      Connect
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make Your Mark?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our community of innovators, entrepreneurs, and changemakers. Whether you're a student with a brilliant idea or an alumni looking to give back, there's a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200/30 border-0" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50" asChild>
                <Link to="/blog">
                  Read Our Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
