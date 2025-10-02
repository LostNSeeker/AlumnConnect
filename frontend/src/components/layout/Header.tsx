import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GooeyNav } from '@/components/ui/gooey-nav'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, GraduationCap, Users, BookOpen, MessageCircle, LogOut, User, Settings, Briefcase } from 'lucide-react'
import logo from "@/images/logo.png"; // Corrected path

export const Header: React.FC = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)

  // Fetch profile avatar when user logs in or token changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user && token) {
        try {
          const res = await fetch('http://localhost:5001/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const profile = await res.json()
            setProfileAvatar(profile.avatar)
          }
        } catch (error) {
          console.error('Error fetching profile for avatar:', error)
        }
      } else {
        setProfileAvatar(null) // Clear avatar on logout
      }
    }
    fetchAvatar()
  }, [user, token])

  const getNavigationItems = () => {
    const commonLinks = [
      { label: 'Projects', href: '/projects' },
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
      { name: 'Projects', href: '/projects', icon: Briefcase },
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
  
  const navItems = getNavigationItems();
  const activeIndex = navItems.findIndex(item => item.href === location.pathname);

  return (
    <>
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-bold text-gray-800">KGP Launchpad</span>
            </Link>

            <div className="hidden md:flex">
               <GooeyNav 
                 items={navItems}
                 activeIndex={activeIndex === -1 ? undefined : activeIndex}
               />
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full p-0"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={profileAvatar ? `http://localhost:5001/api/profile/picture/${profileAvatar}` : undefined} 
                        alt={user.name} 
                      />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                  
                  {isProfileMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      onMouseLeave={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400" />
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            if(logout) logout();
                            setIsProfileMenuOpen(false)
                            navigate('/')
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="mr-3 h-5 w-5 text-red-400" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
    </>
  )
}

