import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../themeContext';

const NotificationsTab = () => {
  const { theme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState({
    emailNewStudents: true,
    emailAssignments: true,
    emailReviews: false,
    pushMessages: true,
    pushReports: false,
  });

  const handleChange = (field) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  const handleSubmit = () => {
    // Implement notification preferences save logic here
    console.log('Notification preferences:', notifications);
  };

  return (
    <>
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Notification Preferences</h3>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Email Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.emailNewStudents}
                onChange={() => handleChange('emailNewStudents')}
                className="mr-3 text-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>New student enrollments</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.emailAssignments}
                onChange={() => handleChange('emailAssignments')}
                className="mr-3 text-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Assignment submissions</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.emailReviews}
                onChange={() => handleChange('emailReviews')}
                className="mr-3 text-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Course reviews and ratings</span>
            </label>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-3`}>Push Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.pushMessages}
                onChange={() => handleChange('pushMessages')}
                className="mr-3 text-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Real-time messages</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.pushReports}
                onChange={() => handleChange('pushReports')}
                className="mr-3 text-blue-500"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Weekly summary reports</span>
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <button
          className={`px-4 py-2 border font-normal md:font-medium rounded-md hover:bg-gray-50 ${theme === 'dark' ? 'border-white/20 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700'}`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`px-3 py-3 rounded-xl font-normal md:font-medium transition-all duration-300 hover:scale-105 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
          }`}
          
        >
          Save Preferences
        </button>
      </div>
    </>
  );
};

export default NotificationsTab;