import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext'; 
import DashboardLayout from './components/Layout';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Kanban from './pages/Kanban';
import Chat from './pages/Chat';
import Members from './pages/Members';
import Admin from './pages/Admin'

// Route Guard
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Projects />} />
            <Route path="projects/:id" element={<Kanban />} />
            <Route path="chat" element={<Chat />} />
            <Route path="members" element={<Members />} /> 
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
        </ChatProvider>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}