import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LandingPage } from '@/pages/LandingPage'
import { AboutPage } from '@/pages/AboutPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { AlumniConnectPage } from '@/pages/AlumniConnectPage'
import { BlogPage } from '@/pages/BlogPage'
import { BlogPostPage } from '@/pages/BlogPostPage'
import { StudentDashboard } from '@/pages/StudentDashboard'
import { AlumniDashboard } from '@/pages/AlumniDashboard'
import { ProfilePage } from '@/pages/ProfilePage'
import { CreateProjectPage } from '@/pages/CreateProjectPage'
import { CreateBlogPage } from '@/pages/CreateBlogPage'
import { AlumniMenteesPage } from '@/pages/AlumniMenteesPage'
import { AlumniProjectsPage } from '@/pages/AlumniProjectsPage'
import { AlumniBlogsPage } from '@/pages/AlumniBlogsPage'
import { AllBlogsPage } from '@/pages/AllBlogsPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { ChatPage } from '@/pages/ChatPage'
import { AlumniProjectApplicationsPage } from '@/pages/AlumniProjectApplicationsPage'
import { DashboardRouter } from '@/pages/DashboardRouter'
import { AuthProvider } from '@/contexts/AuthContext'
import { UserProfilePage } from '@/pages/UserProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/alumni-connect" element={<AlumniConnectPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/alumni/create-project" element={<CreateProjectPage />} />
            <Route path="/alumni/create-blog" element={<CreateBlogPage />} />
            <Route path="/alumni/mentees" element={<AlumniMenteesPage />} />
            <Route path="/alumni/projects" element={<AlumniProjectsPage />} />
            <Route path="/alumni/blogs" element={<AlumniBlogsPage />} />
            <Route path="/all-blogs" element={<AllBlogsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:id" element={<ChatPage />} />
            <Route path="/alumni/project-applications" element={<AlumniProjectApplicationsPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
