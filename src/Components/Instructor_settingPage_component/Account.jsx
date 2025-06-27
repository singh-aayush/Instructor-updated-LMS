import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../../themeContext';

const AccountTab = () => {
  const { theme } = useContext(ThemeContext);
  const [accountForm, setAccountForm] = useState({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  // Fetch initial data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('https://lms-backend-flwq.onrender.com/api/v1/instructors/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.data) {
          const { firstName, lastName } = response.data.data;
          setAccountForm((prev) => ({
            ...prev,
            fullName: `${firstName} ${lastName}`.trim(),
          }));
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setAccountForm({ ...accountForm, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Split fullName into firstName and lastName
      const [firstName, ...lastNameParts] = accountForm.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // Update account details
      const accountUpdateData = {
        firstName,
        lastName,
        email: accountForm.email || '', // Include if required by endpoint
      };

      const accountResponse = await axios.put(
        'https://lms-backend-flwq.onrender.com/api/v1/auth/updatedetails',
        accountUpdateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!accountResponse.data.success) {
        throw new Error(accountResponse.data.message || 'Failed to update account details');
      }

      // Update password if provided
      if (accountForm.currentPassword && accountForm.newPassword) {
        const passwordUpdateData = {
          currentPassword: accountForm.currentPassword,
          newPassword: accountForm.newPassword,
        };

        const passwordResponse = await axios.put(
          'https://lms-backend-flwq.onrender.com/api/v1/auth/changepassword',
          passwordUpdateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!passwordResponse.data.success) {
          throw new Error(passwordResponse.data.message || 'Failed to update password');
        }
      }

      showNotification('Account updated successfully!', 'success');
      setAccountForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      showNotification(`Error: ${err.response?.data?.message || err.message || 'Something went wrong'}`);
    }
  };

  if (loading) {
    return <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>;
  }

  if (error) {
    return <p className={`text-base ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error: {error}</p>;
  }

  return (
    <>
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Account Settings</h3>
      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Full Name</label>
          <input
            type="text"
            value={accountForm.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Current Password</label>
          <input
            type="password"
            value={accountForm.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            placeholder="Enter current password"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>New Password</label>
            <input
              type="password"
              value={accountForm.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Confirm Password</label>
            <input
              type="password"
              value={accountForm.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-800'} mb-2`}>Danger Zone</h4>
          <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'} mb-3`}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
            Delete Account
          </button>
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
          className={`px-6 py-3 rounded-xl text-sm md:text-base font-normal md:font-medium transition-all duration-300 hover:scale-105 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
          }`}
          
        >
          Update Account
        </button>
      </div>
      {notification.message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md shadow-lg max-w-md ${
            notification.type === 'error'
              ? theme === 'dark'
                ? 'bg-red-600 text-white'
                : 'bg-red-500 text-white'
              : theme === 'dark'
              ? 'bg-green-600 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
        </div>
      )}
    </>
  );
};

export default AccountTab;