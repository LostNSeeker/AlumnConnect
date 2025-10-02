import { 
  Target, 
  Users, 
  Lightbulb, 
  Globe, 
  Award, 
  BookOpen,
  Briefcase,
  Heart,
  Zap,
  Shield,
  ArrowRight,
  Rocket,
  TrendingUp
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Fostering creative thinking and breakthrough solutions that address real-world challenges.",
      color: "from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Building bridges between students and alumni to create meaningful connections and mentorship opportunities.",
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Empowering our community to make a positive difference on a global scale through technology and innovation.",
      color: "from-green-50 to-green-100",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Maintaining the highest standards of quality and achievement in all our endeavors.",
      color: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    }
  ]

  const features = [
    {
      icon: Briefcase,
      title: "Project Showcase",
      description: "Discover and explore innovative projects from our talented students and alumni community.",
      color: "from-indigo-50 to-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Users,
      title: "Alumni Connect",
      description: "Connect with successful alumni for mentorship, internships, and career guidance.",
      color: "from-pink-50 to-pink-100",
      iconColor: "text-pink-600"
    },
    {
      icon: BookOpen,
      title: "Knowledge Sharing",
      description: "Access insights, experiences, and expertise through our comprehensive blog platform.",
      color: "from-cyan-50 to-cyan-100",
      iconColor: "text-cyan-600"
    },
    {
      icon: Heart,
      title: "Community Building",
      description: "Join a vibrant community of innovators, entrepreneurs, and changemakers.",
      color: "from-rose-50 to-rose-100",
      iconColor: "text-rose-600"
    }
  ]

  const stats = [
    { label: "Years of Excellence", value: "75+", icon: Award },
    { label: "Alumni Worldwide", value: "50,000+", icon: Globe },
    { label: "Active Projects", value: "150+", icon: Lightbulb },
    { label: "Success Stories", value: "200+", icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-16 pb-12">
        {/* Floating Elements - Hidden on mobile */}
        <div className="hidden sm:block absolute top-20 left-10 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="hidden sm:block absolute top-40 right-20 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="hidden md:block absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="hidden md:block absolute top-60 right-1/3 w-8 h-8 bg-gradient-to-r from-green-200 to-green-300 rounded-full opacity-40 animate-bounce"></div>
        
        <div className="container mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent px-2">
              About KGP{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Launchpad</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
              Empowering the next generation of innovators and connecting them with the wisdom of our accomplished alumni community.
            </p>
          </div>
        </div>
        
        {/* Scroll Indicator - Hidden on mobile */}
        <div className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Mission & Vision with Illustrations */}
      <section className="py-16 sm:py-20 md:py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            {/* Mission Card */}
            <div className="group">
              <div className="relative mb-8 sm:mb-12">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200 group-hover:scale-105 transition-transform duration-300">
                  <div className="relative">
                    <Target className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-blue-600" />
                    <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                      <Rocket className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-800" />
                    </div>
                  </div>
                </div>
                {/* Doodle elements - Hidden on small mobile */}
                <div className="hidden sm:block absolute top-6 -left-4 w-8 sm:w-10 h-8 sm:h-10 bg-purple-200 rounded-full opacity-60 animate-bounce"></div>
                <div className="hidden sm:block absolute bottom-6 -right-4 w-6 sm:w-8 h-6 sm:h-8 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="hidden md:block absolute top-1/2 -left-6 w-6 h-6 bg-blue-200 rounded-full opacity-60 animate-bounce"></div>
              </div>
              <div className="text-center px-4">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Our Mission</h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  To create a dynamic platform that showcases the innovative spirit of IIT Kharagpur, 
                  facilitates meaningful connections between students and alumni, and provides a space 
                  for knowledge sharing and mentorship. We aim to build a thriving ecosystem where 
                  ideas flourish, connections are forged, and the next generation of leaders emerges.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="group">
              <div className="relative mb-8 sm:mb-12">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center border-4 border-purple-200 group-hover:scale-105 transition-transform duration-300">
                  <div className="relative">
                    <Globe className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-purple-600" />
                    <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-800" />
                    </div>
                  </div>
                </div>
                {/* Doodle elements - Hidden on small mobile */}
                <div className="hidden sm:block absolute top-4 -right-4 w-6 sm:w-8 h-6 sm:h-8 bg-yellow-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="hidden sm:block absolute bottom-4 -left-4 w-8 sm:w-10 h-8 sm:h-10 bg-green-200 rounded-full opacity-60 animate-bounce"></div>
                <div className="hidden md:block absolute top-1/3 -right-8 w-6 h-6 bg-pink-200 rounded-full opacity-60 animate-bounce"></div>
              </div>
              <div className="text-center px-4">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Our Vision</h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  To become the premier platform for innovation and collaboration within the IIT Kharagpur 
                  community, recognized globally for fostering breakthrough technologies, successful startups, 
                  and meaningful mentorship relationships. We envision a world where every student has access 
                  to the guidance and resources they need to turn their ideas into reality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50 border-y border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">By The Numbers</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              A legacy of excellence and innovation spanning decades
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300 shadow-md border border-blue-100">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-blue-600">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600 px-2">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Core Values</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              The principles that guide everything we do and shape our community culture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="group text-center px-4">
                  <div className="relative mb-6 sm:mb-8">
                    <div className={`w-28 h-28 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center border-4 ${value.borderColor} group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className={`h-10 w-10 sm:h-12 sm:w-12 ${value.iconColor}`} />
                    </div>
                    {/* Decorative dots - Hidden on small screens */}
                    <div className="hidden sm:block absolute top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
                    <div className="hidden sm:block absolute bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-purple-200 rounded-full opacity-60 animate-bounce"></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Platform Features with Illustrations */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Platform Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Discover the powerful tools that make KGP Launchpad the ultimate platform for innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group px-4">
                  <div className="relative mb-6 sm:mb-8">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className={`h-10 w-10 sm:h-12 sm:w-12 ${feature.iconColor}`} />
                    </div>
                    {/* Decorative elements - Hidden on small screens */}
                    <div className="hidden sm:block absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full opacity-60 animate-bounce"></div>
                    <div className="hidden sm:block absolute -bottom-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-pink-300 rounded-full opacity-60 animate-pulse"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-20 md:py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
              Whether you're a current student with innovative ideas or an accomplished alumni looking to give back, 
              there's a place for you in our community. Together, we can build the future.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-blue-200 rounded-full bg-white flex items-center">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Secure & Trusted Platform</span>
              </div>
              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-purple-200 rounded-full bg-white flex items-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" />
                <span className="text-gray-700">Global Alumni Network</span>
              </div>
              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-green-200 rounded-full bg-white flex items-center">
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Innovation Focused</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link to="/register">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg shadow-blue-200/30 rounded-md transition-all duration-300 flex items-center justify-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </Link>
            <Link to="/projects">
                <button className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-md transition-all duration-300 flex items-center justify-center bg-white">
                  Explore Projects
                  <Briefcase className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}