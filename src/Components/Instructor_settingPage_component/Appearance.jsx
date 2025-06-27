import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../themeContext';

const AppearanceTab = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [sidebarBehavior, setSidebarBehavior] = useState(localStorage.getItem('sidebarBehavior') || 'collapsible');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleThemeChange = (newTheme) => {
    console.log(`Setting theme to: ${newTheme}`);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Persist theme to localStorage
  };

  const handleSidebarBehaviorChange = (behavior) => {
    setSidebarBehavior(behavior);
    localStorage.setItem('sidebarBehavior', behavior); // Persist to localStorage
  };

  const handleSubmit = () => {
    console.log('Appearance settings saved:', { theme, sidebarBehavior });
    localStorage.setItem('theme', theme); // Ensure theme is saved
    localStorage.setItem('sidebarBehavior', sidebarBehavior); // Ensure sidebarBehavior is saved
    showNotification('Appearance settings saved successfully!', 'success');
  };

  const handleResetToDefault = () => {
    setTheme('auto');
    setSidebarBehavior('collapsible');
    localStorage.setItem('theme', 'auto');
    localStorage.setItem('sidebarBehavior', 'collapsible');
    showNotification('Settings reset to default.', 'info');
  };

  return (
    <>
      {notification.message && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            notification.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-blue-500/90 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
      <h3
        className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}
      >
        Appearance Settings
      </h3>
      <div className="space-y-6">
        <div>
          <label
            className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}
          >
            Theme
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50'
                  : theme === 'dark'
                  ? 'border-white/20 bg-white/5 hover:border-white/30'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-full h-16 bg-white rounded border mb-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-100 rounded"></div>
              </div>
              <span
                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Light
              </span>
            </div>
            <div
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-full h-16 bg-gray-800 rounded border mb-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
              </div>
              <span
                className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Dark
              </span>
            </div>
          </div>
        </div>
        <div>
          <label
            className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}
          >
            Sidebar Behavior
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="sidebar"
                checked={sidebarBehavior === 'collapsible'}
                onChange={() => handleSidebarBehaviorChange('collapsible')}
                className="mr-3 text-blue-500 focus:ring-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Collapsible (hover to expand)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sidebar"
                checked={sidebarBehavior === 'expanded'}
                onChange={() => handleSidebarBehaviorChange('expanded')}
                className="mr-3 text-blue-500 focus:ring-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Always expanded
              </span>
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={handleResetToDefault}
            className={`px-4 py-2 border text-[12px] rounded-xl md:font-medium transition-all duration-300 hover:scale-105 ${
              theme === 'dark'
                ? 'border-white/20 text-gray-300 hover:bg-white/5'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Reset to Default
          </button>
          <button
            onClick={handleSubmit}
            className={`px-3 py-3 rounded-xl text-[12px] md:font-medium transition-all duration-300 hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            Save Appearance
          </button>
        </div>
      </div>
    </>
  );
};

export default AppearanceTab;