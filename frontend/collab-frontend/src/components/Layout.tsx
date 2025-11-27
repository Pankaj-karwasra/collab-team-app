import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { Layout, MessageSquare, Users, LogOut, Sun, Moon } from 'lucide-react'; 
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext'; 

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { unreadCount } = useChat();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItem = ({ isActive }: any) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition relative
     ${isActive 
       ? 'bg-blue-600 text-white shadow' 
       : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 px-4 py-6 flex flex-col shadow-sm transition-colors duration-300">
        <h1 className="text-2xl font-bold text-blue-600 mb-10 px-2">
          CollabTeam
        </h1>

        <nav className="flex-1 space-y-1">
          <NavLink to="/" className={navItem}>
            <Layout size={20} /> Projects
          </NavLink>
          
          <NavLink to="/chat" className={navItem}>
            <div className="relative">
              <MessageSquare size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white dark:border-gray-800">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            Team Chat
          </NavLink>

          <NavLink to="/members" className={navItem}>
            <Users size={20} /> Members
          </NavLink>
        </nav>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition mb-2"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}