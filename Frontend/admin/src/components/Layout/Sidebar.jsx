import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👥', label: 'Users' },
    { path: '/courses', icon: '📚', label: 'Courses' },
    { path: '/lessons', icon: '📝', label: 'Lessons' },
    { path: '/learning-paths', icon: '🛣️', label: 'Learning Paths' },
    { path: '/exercises', icon: '✏️', label: 'Exercises' },
    { path: '/flashcards', icon: '🔤', label: 'Flashcards' },
    { path: '/news', icon: '📰', label: 'News' },
    { path: '/forum-stats', icon: '💬', label: 'Forum' },
  ];

  return (
    <div className={`bg-dark text-white h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 fixed left-0 top-0 shadow-lg`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button onClick={toggleSidebar} className="text-white p-2 rounded hover:bg-gray-700">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center p-3 ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                } rounded mx-2 transition-colors duration-200`}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && (
                  <div className="ml-3 flex items-center">
                    <span>{item.label}</span>
                    {item.dev && (
                      <span className="ml-2 text-xs bg-yellow-500 text-dark px-1 rounded">Dev</span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 