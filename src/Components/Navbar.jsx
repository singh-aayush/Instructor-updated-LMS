import React, { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBell, faUser, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../themeContext';

const Navbar = ({ notifications = [], profileInitial = 'A' }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const location = useLocation();

  const sectionContent = {
    '/dashboard': {
      title: 'Dashboard',
      subtitle: 'Welcome back! Here’s your learning overview',
    },
    '/dashboard/my-courses': {
      title: 'My Courses',
      subtitle: 'Manage and view your courses',
    },
    '/dashboard/create-course': {
      title: 'Create Course',
      subtitle: 'Build a new learning experience',
    },
    '/dashboard/assignments': {
      title: 'Assignments',
      subtitle: 'Track and manage your assignments',
    },
    '/dashboard/analytics': {
      title: 'Analytics',
      subtitle: 'View performance and insights',
    },
    '/dashboard/settings': {
      title: 'Settings',
      subtitle: 'Customize your preferences',
    },
  };

  const normalizePath = (path) => path.replace(/\/$/, '');
  const currentPath = normalizePath(location.pathname);
  const { title, subtitle } = sectionContent[currentPath] || sectionContent['/dashboard'];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    showNotification(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false); // Close notifications if profile is opened
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false); // Close profile dropdown if notifications are opened
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  return (
    <header
      className={`p-6 md:mr-4 shadow-lg border-b backdrop-blur-xl transition-all z-[2000] fixed w-[-webkit-fill-available] top-0 ${
        theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/70 border-black/10'
      }`}
    >
      <div className="mx-auto flex items-center justify-between">
        <div className="flex-1 min-w-0 pl-8">
          <h1
            className={`!text-[1.5rem] md:text-10 font-bold truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            {title}
          </h1>
          <p
            className={`text-[12px] md:text-sm mt-1 truncate ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Desktop View (md and above) */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => {
                toggleTheme();
                setIsNotificationsOpen(false);
                showNotification(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
              }}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-black/5 hover:bg-black/10 text-gray-600'
              }`}
              aria-label="Toggle dark mode"
            >
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-lg" />
            </button>

            <div className="relative">
              <button
                onClick={toggleNotifications}
                className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-black/5 hover:bg-black/10 text-gray-600'
                }`}
                aria-label="Notifications"
              >
                <FontAwesomeIcon icon={faBell} className="mr-2" />
                <span className="text-sm font-medium">{notifications.length} New</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-[3000] transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-800/90 border-gray-700/50 text-gray-200'
                      : 'bg-white/90 border-gray-200/50 text-gray-800'
                  }`}
                >
                  <div className="p-4">
                    <h3
                      className={`text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      Notifications
                    </h3>
                    {notifications.length > 0 ? (
                      <ul className="space-y-2 max-h-60 overflow-auto">
                        {notifications.map((notification, index) => (
                          <li
                            key={index}
                            className={`p-2 rounded-lg text-sm transition-all duration-200 hover:bg-opacity-80 ${
                              theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                            }`}
                          >
                            {notification.message || 'Notification message'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        No notifications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-medium uppercase ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {profileInitial}
              </div>
              <span
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {profileInitial}
              </span>
            </div>
          </div>

          {/* Mobile View (below md) */}
          <div className="md:hidden relative">
            <button
              onClick={toggleProfile}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-gray-600'
              }`}
              aria-label="Toggle profile menu"
            >
              <FontAwesomeIcon icon={faUser} className="text-lg" />
              <FontAwesomeIcon icon={faCaretDown} className="text-xs" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}

            </button>

            {isProfileOpen && (
              <div
                className={`md:hidden absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-[3000] transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800/90 border-gray-700/50 text-gray-200'
                    : 'bg-white/90 border-gray-200/50 text-gray-800'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      Options
                    </h3>
                    <button
                      onClick={() => {
                        toggleTheme();
                        showNotification(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 'info');
                      }}
                      className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                        theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-black/5 hover:bg-black/10 text-gray-600'
                      }`}
                      aria-label="Toggle dark mode"
                    >
                      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-lg" />
                    </button>
                  </div>

                  <h3
                    className={`text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    Notifications
                  </h3>
                  {notifications.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-auto">
                      {notifications.map((notification, index) => (
                        <li
                          key={index}
                          className={`p-2 rounded-lg text-sm transition-all duration-200 hover:bg-opacity-80 ${
                            theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                          }`}
                        >
                          {notification.message || 'Notification message'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No notifications
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;