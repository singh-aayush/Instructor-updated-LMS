import { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faBookOpen,
  faPlusCircle,
  faTasks,
  faChartBar,
  faCog,
  faSignOutAlt,
  faGraduationCap,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ThemeContext } from '../themeContext';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div>
    </div>
  );
};

export default function Sidebar({ onLinkClick, setSidebarExpanded, setActiveSection, activeSection, isSidebarOpen, setIsSidebarOpen }) {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [instructor, setInstructor] = useState({ firstName: '', lastName: '', avatar: '' });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(
    localStorage.getItem('sidebarBehavior') === 'expanded'
  );

  const sidebarBehavior = localStorage.getItem('sidebarBehavior') || 'collapsible';

  useEffect(() => {
    setSidebarExpanded(isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen);
  }, [isSidebarExpanded, sidebarBehavior, isSidebarOpen, setSidebarExpanded]);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const navItems = [
    { name: 'dashboard', path: '/dashboard', icon: faChartLine, label: 'Dashboard' },
    { name: 'courses', path: '/dashboard/my-courses', icon: faBookOpen, label: 'Courses' },
    { name: 'create-course', path: '/dashboard/create-course', icon: faPlusCircle, label: 'Create Course' },
    { name: 'assignments', path: '/dashboard/assignments', icon: faTasks, label: 'Assignments' },
    { name: 'analytics', path: '/dashboard/analytics', icon: faChartBar, label: 'Analytics' },
    { name: 'settings', path: '/dashboard/settings', icon: faCog, label: 'Settings' },
  ];

  useEffect(() => {
    let isCurrent = true;
    const path = location.pathname.replace(/\/$/, '');
    const matchedItem = navItems.find(
      item => item.path === path || (item.name === 'dashboard' && path === '/dashboard')
    );
    const newSection = matchedItem ? matchedItem.name : 'dashboard';

    if (isCurrent && newSection !== activeSection) {
      setActiveSection(newSection);
    }

    return () => {
      isCurrent = false;
    };
  }, [location.pathname, setActiveSection, activeSection]);

  useEffect(() => {
    const fetchInstructorProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Please log in to fetch profile.');
          navigate('/');
          return;
        }

        const response = await axios.get(
          'https://lms-backend-flwq.onrender.com/api/v1/instructors/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setInstructor({
            firstName: response.data.data.firstName || '',
            lastName: response.data.data.lastName || '',
            avatar: response.data.data.avatar || '',
          });
        } else {
          showNotification('Failed to load instructor profile.');
        }
      } catch (error) {
        console.error('Error fetching instructor profile:', error);
        if (error.response?.status === 401) {
          showNotification('Session expired or invalid. Please log in again.');
          localStorage.removeItem('token');
          navigate('/');
        } else {
          showNotification('Failed to fetch instructor profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructorProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.get('https://lms-backend-flwq.onrender.com/api/v1/auth/logout', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      navigate('/');
      onLinkClick();
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      showNotification('Logout failed. Please try again.');
    }
  };

  const getFullName = () => `${instructor.firstName} ${instructor.lastName}`.trim();

  const ProfileAvatar = ({ size }) => {
    const fallbackAvatar = 'https://i.pravatar.cc/40';
    return (
      <img
        src={instructor.avatar || fallbackAvatar}
        alt="Instructor avatar"
        className={`${size} rounded-full object-cover`}
        onError={(e) => {
          e.target.src = fallbackAvatar;
        }}
      />
    );
  };

  const handleMouseEnter = () => {
    if (sidebarBehavior === 'collapsible' && window.innerWidth > 480) {
      setIsSidebarExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (sidebarBehavior === 'collapsible' && window.innerWidth > 480) {
      setIsSidebarExpanded(false);
    }
  };

  const themeIcon = theme === 'light' ? faMoon : faSun;

  return (
    <div
      className={`fixed h-full transition-all duration-300 ease-in-out ${
        isSidebarOpen || isSidebarExpanded || sidebarBehavior === 'expanded' ? 'w-64 sm:w-72' : 'w-16 sm:w-20'
      } ${theme === 'dark' ? 'bg-gray-900 border-r border-white/10' : 'bg-white/70 backdrop-blur-xl border-r border-black/10'} flex flex-col shadow-2xl z-[3000] ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      }`}
      onMouseEnter={sidebarBehavior === 'collapsible' ? handleMouseEnter : undefined}
      onMouseLeave={sidebarBehavior === 'collapsible' ? handleMouseLeave : undefined}
    >
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <div className="p-3 sm:p-4 border-b border-white/10">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 relative">
            <div
              className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-800 to-black'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              } flex items-center justify-center shadow-lg transition-all duration-300`}
            >
              <FontAwesomeIcon icon={faGraduationCap} className="text-white text-base sm:text-lg" />
            </div>
            <div
              className={`transition-all duration-300 ${
                isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
            >
              <h2
                className={`text-base sm:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} whitespace-nowrap`}
              >
                LMS
              </h2>
              <p
                className={`text-xs sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}
              >
                AI Learning Platform
              </p>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 sm:px-2 py-4 sm:py-6">
        <div className="space-y-2 sm:space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.name === 'dashboard'}
              className={({ isActive }) =>
                `group relative flex items-center ${
                  isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen ? 'px-3 sm:px-4' : 'px-2 sm:px-3'
                } py-2 sm:py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive || activeSection === item.name
                    ? `${theme === 'dark' ? 'bg-gradient-to-r from-gray-800/20 to-black/20 border border-gray-700/30' : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20'} shadow-lg`
                    : `${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} hover:scale-105`
                }`
              }
              onClick={() => {
                setActiveSection(item.name);
                showNotification(`Switched to ${item.label}`, 'info');
                onLinkClick();
                setIsSidebarOpen(false);
              }}
            >
              <div
                className={`${
                  isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen ? 'p-2 sm:p-2' : 'p-3 sm:p-3'
                } rounded-lg ${
                  isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen ? 'mr-2 sm:mr-3' : 'mx-0'
                } transition-all duration-300 ${
                  activeSection === item.name
                    ? `${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-black text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'}`
                    : `${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-black/5 text-gray-600'}`
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-sm sm:text-sm" />
              </div>
              <span
                className={`font-medium text-sm sm:text-base transition-all duration-300 ${
                  isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4 pointer-events-none'
                } ${
                  activeSection === item.name
                    ? `${theme === 'dark' ? 'text-white' : 'text-gray-800'}`
                    : `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`
                } whitespace-nowrap`}
              >
                {item.label}
              </span>
              {!(isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen) && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="mt-auto p-3 sm:p-3 pb-6 sm:pb-8">
        <div
          className={`${
            isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen ? 'p-2 sm:p-3' : 'p-2 sm:p-2'
          } rounded-2xl ${
            theme === 'dark' ? 'bg-white/5 backdrop-blur-sm' : 'bg-black/5 backdrop-blur-sm'
          } transition-all duration-300`}
        >
          {isSidebarExpanded || sidebarBehavior === 'expanded' || isSidebarOpen ? (
            <>
              <div className="flex items-center mb-2">
                <div className="relative mr-2 sm:mr-3">
                  <ProfileAvatar size="w-10 sm:w-12 h-10 sm:h-12" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div
                    className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'} whitespace-nowrap`}
                  >
                    {isLoading ? 'Loading...' : getFullName()}
                  </div>
                  <div
                    className={`text-xs sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}
                  >
                    Senior Instructor
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-center px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-sm sm:text-sm" />
                <span className="font-medium text-sm sm:text-base">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3 sm:space-y-3">
              <div className="relative group">
                <ProfileAvatar size="w-8 sm:w-10 h-8 sm:h-10" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                  {isLoading ? 'Loading...' : getFullName()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`group relative p-2 sm:p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="text-sm sm:text-sm" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                  Sign Out
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}