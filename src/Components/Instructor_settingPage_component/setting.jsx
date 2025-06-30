import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../../themeContext';
import Navbar from '../Navbar'; // Adjust path as needed
import AccountTab from './Account'; // Adjust path as needed
import NotificationsTab from './Notification'; // Adjust path as needed
import AppearanceTab from './Appearance'; // Adjust path as needed
import SecurityTab from './Safety'; // Adjust path as needed
import { Upload } from 'lucide-react';

// Notification Component
const Notification = ({ message, type, onClose }) => {
  const { theme } = useContext(ThemeContext);
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-md mt-32 shadow-lg transition-opacity duration-300 z-[1000] max-w-md ${
        type === 'error'
          ? theme === 'dark'
            ? 'bg-red-600 text-white'
            : 'bg-red-500 text-white'
          : theme === 'dark'
          ? 'bg-green-600 text-white'
          : 'bg-green-500 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base">{message}</span>
        <button
          onClick={onClose}
          className={`ml-4 ${theme === 'dark' ? 'text-gray-200 hover:text-gray-100' : 'text-white hover:text-gray-200'}`}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ formData, setFormData, editable, setEditable, handleSubmit, newExpertise, setNewExpertise, handleExpertiseAdd, handleExpertiseRemove, avatarFile, setAvatarFile }) => {
  const { theme } = useContext(ThemeContext);

  const handleChange = (field, value) => {
    if (field === 'linkedin' || field === 'twitter') {
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [field]: value },
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setFormData({ ...formData, notification: { message: 'Error: Only JPEG, PNG, or GIF images are allowed.', type: 'error' } });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormData({ ...formData, notification: { message: 'Error: Image size must be less than 5MB.', type: 'error' } });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Avatar base64 (preview):', reader.result.substring(0, 50) + '...');
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePhoto = () => {
    setAvatarFile(null);
    setFormData({ ...formData, avatar: '' });
  };

  const triggerPhotoUpload = () => {
    document.getElementById('profilePhotoInput').click();
  };

  return (
    <>
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>Profile Information</h3>
      <div className="mb-6 flex items-center">
        <div
          className={`w-24 h-24 rounded-full overflow-hidden mr-6 shadow-lg ${
            !formData.avatar ? (theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-black' : 'bg-gradient-to-r from-blue-500 to-purple-600') : ''
          }`}
        >
          {formData.avatar ? (
            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.firstName.charAt(0)}
              {formData.lastName.charAt(0)}
            </div>
          )}
        </div>
        {editable && (
          <div>
            <button
              onClick={triggerPhotoUpload}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 mb-2 block ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload New Photo
            </button>
            {formData.avatar && (
              <button
                onClick={removeProfilePhoto}
                className={`text-sm transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
              >
                <i className="fas fa-trash mr-1"></i>
                Remove Photo
              </button>
            )}
            <input
              type="file"
              id="profilePhotoInput"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!editable}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!editable}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!editable}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!editable}
          />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Bio</label>
          <textarea
            rows="4"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Tell us about yourself..."
            disabled={!editable}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>LinkedIn</label>
          <input
            type="url"
            value={formData.socialLinks?.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={!editable}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Twitter</label>
          <input
            type="url"
            value={formData.socialLinks?.twitter || ''}
            onChange={(e) => handleChange('twitter', e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
            } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="https://twitter.com/yourhandle"
            disabled={!editable}
          />
        </div>
      </div>
      <div className={`border-t pt-4 mt-4 ${theme === 'dark' ? 'border-white/20' : 'border-gray-200'}`}>
        <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4`}>Expertise</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.expertise.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-2.5 py-0.5 rounded flex items-center ${
                theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {tag}
              {editable && (
                <button
                  onClick={() => handleExpertiseRemove(tag)}
                  className={`ml-1 hover:opacity-75 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {editable && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExpertiseAdd()}
              placeholder="Add new expertise..."
              className={`flex-1 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-200' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
            <button
              type="button"
              onClick={handleExpertiseAdd}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                theme === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
              }`}
            >
              Add
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={() => setEditable(!editable)}
          className={`px-4 py-2 border rounded-md hover:bg-gray-50 ${theme === 'dark' ? 'border-white/20 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700'}`}
        >
          {editable ? 'Cancel' : 'Edit'}
        </button>
        {editable && (
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            <i className="fas fa-save mr-2"></i>
            Save Changes
          </button>
        )}
      </div>
    </>
  );
};

// Main InstructorSettings Component
const InstructorSettings = () => {
  const { theme } = useContext(ThemeContext);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    socialLinks: { linkedin: '', twitter: '' },
    avatar: '',
    expertise: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [newExpertise, setNewExpertise] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

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
        const { data } = response.data;
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          socialLinks: {
            linkedin: data.socialLinks?.linkedin || '',
            twitter: data.socialLinks?.twitter || '',
          },
          avatar: data.avatar || '',
          expertise: data.expertise || [],
        });
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (formData.avatar && formData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatar);
      }
    };
  }, [formData.avatar]);

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return 'First name and last name are required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'A valid email is required';
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      return 'Phone number must be 10 digits';
    }
    if (formData.socialLinks.linkedin && !/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(formData.socialLinks.linkedin)) {
      return 'Invalid LinkedIn URL';
    }
    if (formData.socialLinks.twitter && !/^https:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/.test(formData.socialLinks.twitter)) {
      return 'Invalid Twitter/X URL';
    }
    return null;
  };

  const handleExpertiseAdd = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, newExpertise.trim()],
      });
      setNewExpertise('');
    }
  };

  const handleExpertiseRemove = (skill) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async () => {
    try {
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update profile details (bio, expertise, socialLinks) as JSON
      const profileUpdateData = {
        bio: formData.bio,
        expertise: formData.expertise,
        socialLinks: formData.socialLinks,
      };

      console.log('Profile update payload (JSON):', profileUpdateData);

      const profileResponse = await axios.put(
        'https://lms-backend-flwq.onrender.com/api/v1/instructors/profile',
        profileUpdateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!profileResponse.data.success) {
        throw new Error(profileResponse.data.message || 'Failed to update profile details');
      }

      // Update account details (firstName, lastName, email, phone) and avatar as FormData
      const accountUpdateData = new FormData();
      accountUpdateData.append('firstName', formData.firstName);
      accountUpdateData.append('lastName', formData.lastName);
      accountUpdateData.append('email', formData.email);
      accountUpdateData.append('phone', formData.phone);
      if (avatarFile) {
        accountUpdateData.append('avatar', avatarFile);
        console.log('Uploading avatar file:', avatarFile.name, avatarFile.size, avatarFile.type);
      } else {
        console.log('No avatar file to upload');
      }

      const accountResponse = await axios.put(
        'https://lms-backend-flwq.onrender.com/api/v1/auth/updatedetails',
        accountUpdateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!accountResponse.data.success) {
        throw new Error(accountResponse.data.message || 'Failed to update account details');
      }

      // Update formData with the new avatar URL if provided, or refetch profile
      if (accountResponse.data.data?.avatar) {
        setFormData((prev) => ({ ...prev, avatar: accountResponse.data.data.avatar }));
      } else {
        await fetchProfile();
      }

      showNotification('Profile updated successfully!', 'success');
      setEditable(false);
      setAvatarFile(null);
    } catch (err) {
      showNotification(`Error: ${err.response?.data?.message || err.message || 'Something went wrong'}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <p className={`text-base ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <Navbar notifications={[]} profileInitial={`${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`} />
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
      <div className="px-[12px] py-6 pt-12 md:px-6 md:pt-10 md:pb-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
          <div className={`${theme === 'dark' ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/70 backdrop-blur-xl border border-black/10'} rounded-2xl p-[10px] sm:p-4 xl:p-6 overflow-hidden shadow-xl`}>
  <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Navigation</h3>
  </div>
  <div className="p-0">
    <ul>
      {['profile', 'account', 'appearance'].map((tab) => (
        <li key={tab} className={`border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} last:border-b-0`}>
          <button
            onClick={() => setSettingsTab(tab)}
            className={`w-full text-left p-4 transition-all duration-300 ${
              settingsTab === tab
                ? `${theme === 'dark' ? 'bg-gray-800/20 text-gray-300 border-r-2 border-gray-400' : 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'} font-medium`
                : `${theme === 'dark' ? 'xl:hover:bg-white/10 text-gray-300' : 'xl:hover:bg-black/5 text-gray-700'}`
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
          </div>
          <div className="md:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/70 backdrop-blur-xl border border-black/10'} rounded-2xl p-6 shadow-xl`}>
              {settingsTab === 'profile' && (
                <ProfileTab
                  formData={formData}
                  setFormData={setFormData}
                  editable={editable}
                  setEditable={setEditable}
                  handleSubmit={handleSubmit}
                  newExpertise={newExpertise}
                  setNewExpertise={setNewExpertise}
                  handleExpertiseAdd={handleExpertiseAdd}
                  handleExpertiseRemove={handleExpertiseRemove}
                  avatarFile={avatarFile}
                  setAvatarFile={setAvatarFile}
                />
              )}
              {settingsTab === 'account' && <AccountTab />}
              {/* {settingsTab === 'notifications' && <NotificationsTab />} */}
              {settingsTab === 'appearance' && <AppearanceTab />}
              {/* {settingsTab === 'security' && <SecurityTab />} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSettings;