import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GooeyNav } from '@/components/ui/gooey-nav'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, GraduationCap, Users, BookOpen, MessageCircle, Briefcase } from 'lucide-react' // Added Briefcase

export const Header: React.FC = () => {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

 

  const getNavigationItems = () => {
    // Links visible to everyone
    const commonLinks = [
      { label: 'Projects', href: '/projects' }, // ADDED THIS LINK
      { label: 'Alumni Connect', href: '/alumni-connect' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
    ];

    if (!user) {
      return commonLinks;
    }

    if (user.role === 'alumni') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        ...commonLinks,
        { label: 'My Projects', href: '/alumni/projects' },
        { label: 'Messages', href: '/messages' },
      ];
    } else if (user.role === 'student') {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        ...commonLinks,
        { label: 'Messages', href: '/messages' },
      ];
    }
    
    return commonLinks;
  }

  const getMobileNavigationItems = () => {
    const commonMobileLinks = [
      { name: 'Projects', href: '/projects', icon: Briefcase }, // ADDED THIS LINK
      { name: 'Alumni Connect', href: '/alumni-connect', icon: Users },
      { name: 'Blog', href: '/blog', icon: BookOpen },
      { name: 'About', href: '/about', icon: GraduationCap },
    ];

    if (!user) {
      return commonMobileLinks;
    }
    
    if (user.role === 'alumni') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: GraduationCap },
        ...commonMobileLinks,
        { name: 'My Projects', href: '/alumni/projects', icon: Briefcase },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ];
    } else if (user.role === 'student') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: GraduationCap },
        ...commonMobileLinks,
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ];
    }
    
    return commonMobileLinks;
  }

  return (
     <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">IIT KGP Launchpad</span>
          </Link>

          <div className="hidden md:flex">
             <GooeyNav 
               items={getNavigationItems()}
             />
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" asChild>
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar ? `http://localhost:5001/api/profile/picture/${user.avatar}` : ''} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            ) : (
               <div className="flex items-center space-x-3">
                 <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
                 <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white" asChild><Link to="/register">Get Started</Link></Button>
               </div>
            )}

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {getMobileNavigationItems().map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-2 text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  {!user && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                       <Button variant="outline" asChild><Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link></Button>
                       <Button asChild><Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link></Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
