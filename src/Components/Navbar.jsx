import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faUser, faVideo, faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../themeContext';

const Navbar = ({ profileInitial = 'A', toggleSidebar }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingLiveClasses, setIsLoadingLiveClasses] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    startTime: '',
    duration: ''
  });
  const [tempDateTime, setTempDateTime] = useState('');
  const [isJoining, setIsJoining] = useState(new Set());

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
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleMobileDropdown = () => {
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await axios.get('https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert(`Failed to fetch courses: ${error.message || 'Network error. Check if the server is configured to allow requests from http://localhost:5173.'}`);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchLiveClasses = async (courseId) => {
    setIsLoadingLiveClasses(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const response = await axios.get(`https://new-lms-backend-vmgr.onrender.com/api/v1/live-classes/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLiveClasses(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      alert('Failed to fetch live classes: ' + (error.message || 'Network error'));
    } finally {
      setIsLoadingLiveClasses(false);
    }
  };

  const handleGoLiveClick = () => {
    fetchCourses();
    setIsGoLiveOpen(true);
    setIsMobileDropdownOpen(false);
  };

  const handleJoinClassClick = () => {
    fetchCourses();
    setIsJoinClassOpen(true);
    setIsMobileDropdownOpen(false);
  };

  const handleJoinLiveClass = async (liveClassId) => {
    setIsJoining((prev) => new Set(prev).add(liveClassId));
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await axios.get(
        `https://new-lms-backend-vmgr.onrender.com/api/v1/live-classes/${liveClassId}/join`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success || !response.data.data.url) {
        throw new Error(response.data.message || 'Invalid response from server');
      }

      const joinWindow = window.open(response.data.data.url, '_blank');
      if (!joinWindow) {
        alert('Popup blocked. Please allow popups for this site or click this link manually: ' + response.data.data.url);
      } else {
        setIsJoinClassOpen(false);
        setSelectedCourseId('');
        setLiveClasses([]);
      }
    } catch (error) {
      console.error('Error joining live class:', error);
      let errorMessage = 'Failed to join live class: ';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage += 'Unauthorized. Please log in again.';
        } else if (error.response.status === 404) {
          errorMessage += 'Live class not found.';
        } else {
          errorMessage += error.response.data.message || 'Server error.';
        }
      } else {
        errorMessage += error.message || 'Network error. Please try again.';
      }
      alert(errorMessage);
    } finally {
      setIsJoining((prev) => {
        const newSet = new Set(prev);
        newSet.delete(liveClassId);
        return newSet;
      });
    }
  };

  const handleGoLiveSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      await axios.post(
        'https://new-lms-backend-vmgr.onrender.com/api/v1/live-classes',
        {
          ...formData,
          courseId: formData.courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Live class started successfully!');
      setIsGoLiveOpen(false);
      setFormData({ courseId: '', title: '', description: '', startTime: '', duration: '' });
      setTempDateTime('');
    } catch (error) {
      console.error('Error starting live class:', error);
      alert('Failed to start live class: ' + (error.message || 'Network error'));
    }
  };

  const handleSetDateTime = () => {
    if (tempDateTime) {
      setFormData({ ...formData, startTime: new Date(tempDateTime).toISOString() });
    }
  };

  useEffect(() => {
    if (selectedCourseId && isJoinClassOpen) {
      fetchLiveClasses(selectedCourseId);
    }
  }, [selectedCourseId, isJoinClassOpen]);

  return (
    <header
      className={`p-4 sm:p-6 md:mr-4 shadow-lg border-b backdrop-blur-xl transition-all z-[2000] fixed w-[-webkit-fill-available] top-0 ${
        theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white/70 border-black/10'
      }`}
    >
      <div className="mx-auto flex items-center justify-between">
        {/* Menu Button for Sidebar (Mobile Only) */}
        <button
          onClick={toggleSidebar}
          className={`sm:hidden p-2 rounded-lg transition-all duration-300 ${
            theme === 'dark' ? 'bg-gray-800/20 hover:bg-gray-800/30 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="text-base" />
        </button>

        {/* Heading */}
        <div className="flex-1 min-w-0 pl-4 sm:pl-8">
          <h1
            className={`!text-[1.25rem] sm:text-[1.5rem] md:text-2xl font-bold truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            {title}
          </h1>
          <p
            className={`text-[10px] sm:text-[12px] md:text-sm mt-1 truncate ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Buttons for Tablet and Larger Screens */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={toggleTheme}
              className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${
                theme === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
              aria-label="Toggle dark mode"
            >
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-base sm:text-lg" />
            </button>

            <button
              onClick={handleGoLiveClick}
              className={`flex-1 p-2 w-[10rem] rounded-lg text-normal md:text-medium transition-all duration-300 ${
                theme === 'dark' ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-700'
              }`}
            >
              <FontAwesomeIcon icon={faVideo} className="text-sm mr-2" />
              Go Live
            </button>

            <button
              onClick={handleJoinClassClick}
              className={`flex-1 p-2 w-[10rem] rounded-lg text-normal md:text-medium transition-all duration-300 ${
                theme === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              <FontAwesomeIcon icon={faVideo} className="text-sm mr-2" />
              Join Class
            </button>
          </div>

          {/* Profile Section */}
          <div className="relative">
  <div
    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer ${
      theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
    }`}
    onClick={() => {
      toggleProfile();
      setIsMobileDropdownOpen(false);
    }}
  >
    <div
      className={`w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-full font-medium uppercase text-xs sm:text-sm ${
        theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-purple-100 text-purple-800'
      }`}
    >
      {profileInitial}
    </div>
    <span
      className={`text-xs sm:text-sm font-medium ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}
    >
      {profileInitial}
    </span>

    {/* 👇 Arrow visible on mobile only */}
    <div
      className="sm:hidden"
      onClick={(e) => {
        e.stopPropagation();
        toggleMobileDropdown();
      }}
    >
      <FontAwesomeIcon
        icon={faChevronDown}
        className={`text-xs transition-transform duration-300 ${
          isMobileDropdownOpen ? 'rotate-180' : ''
        } ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
      />
    </div>
  </div>

  {/* Mobile Dropdown */}
  {isMobileDropdownOpen && (
    <div
      className={`sm:hidden absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg z-[5100] ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      }`}
    >
      <div className="flex flex-col p-2 gap-[5px]">
        <button
          onClick={toggleTheme}
          className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="text-sm mr-2" />
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={handleGoLiveClick}
          className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              : 'bg-green-50 hover:bg-green-100 text-green-700'
          }`}
        >
          <FontAwesomeIcon icon={faVideo} className="text-sm mr-2" />
          Go Live
        </button>

        <button
          onClick={handleJoinClassClick}
          className={`w-full text-left p-2 rounded-lg text-sm transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <FontAwesomeIcon icon={faVideo} className="text-sm mr-2" />
          Join Class
        </button>
      </div>
    </div>
  )}
</div>
        </div>
      </div>

      {/* Go Live Modal */}
      {isGoLiveOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg z-[5000] flex items-center justify-center">
          <div
            className={`w-full max-w-[90%] absolute top-[90%] left-[30%] sm:max-w-md p-4 sm:p-6 rounded-2xl shadow-2xl z-[5100] ${
              theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4">Start a New Live Session</h2>
            <form onSubmit={handleGoLiveSubmit} className="space-y-4">
              <select
                className={`w-full p-2 rounded border text-sm sm:text-base ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                value={formData.courseId}
                required
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                aria-label="Select Course"
              >
                <option value="">Select Course</option>
                {isLoadingCourses ? (
                  <option value="" disabled>Loading courses...</option>
                ) : (
                  courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))
                )}
              </select>
              <input
                type="text"
                placeholder="Session Title"
                required
                className={`w-full p-2 rounded border text-sm sm:text-base ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                aria-label="Session Title"
              />
              <textarea
                placeholder="Description"
                required
                className={`w-full p-2 rounded border resize-none h-24 text-sm sm:text-base ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                aria-label="Session Description"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="datetime-local"
                  required
                  className={`w-full p-2 rounded border text-sm sm:text-base ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  value={tempDateTime}
                  onChange={(e) => setTempDateTime(e.target.value)}
                  aria-label="Select start date and time"
                />
                <button
                  type="button"
                  onClick={handleSetDateTime}
                  className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${
                    theme === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                  aria-label="Set date and time"
                >
                  Set
                </button>
              </div>
              <input
                type="number"
                placeholder="Duration (minutes)"
                required
                className={`w-full p-2 rounded border text-sm sm:text-base ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                aria-label="Duration in minutes"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGoLiveOpen(false);
                    setTempDateTime('');
                  }}
                  className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800/20 hover:bg-gray-800/30 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                  aria-label="Cancel live session"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${
                    theme === 'dark' ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-700'
                  }`}
                  aria-label="Start live session"
                >
                  Go Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      {isJoinClassOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg z-[5000] flex items-center justify-center">
          <div
            className={`w-full max-w-[90%] absolute top-[6rem] left-[16rem] sm:max-w-[600px] md:max-w-[800px] p-4 sm:p-6 rounded-2xl shadow-2xl z-[5100] ${
              theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4">Join a Live Class</h2>
            <div className="space-y-4">
              <select
                className={`w-full p-2 rounded border text-sm sm:text-base ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                aria-label="Select Course for Live Classes"
              >
                <option value="">Select Course</option>
                {isLoadingCourses ? (
                  <option value="" disabled>Loading courses...</option>
                ) : (
                  courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))
                )}
              </select>

              {selectedCourseId && (
                <div className="max-h-[400px] overflow-y-auto">
                  {isLoadingLiveClasses ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border animate-pulse ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : liveClasses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {liveClasses.map((liveClass) => (
                        <div
                          key={liveClass._id}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                        >
                          <h3 className="font-semibold text-sm sm:text-base">{liveClass.title}</h3>
                          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {liveClass.description}
                          </p>
                          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start: {new Date(liveClass.startTime).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Duration: {liveClass.duration} minutes
                          </p>
                          <button
                            onClick={() => handleJoinLiveClass(liveClass._id)}
                            disabled={isJoining.has(liveClass._id)}
                            className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${
                              theme === 'dark'
                                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                            } ${isJoining.has(liveClass._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={`Join ${liveClass.title}`}
                            aria-disabled={isJoining.has(liveClass._id)}
                          >
                            {isJoining.has(liveClass._id) ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin h-5 w-5 mr-2 text-current"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Joining...
                              </span>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faVideo} className="text-sm mr-2" />
                                Join Class
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No live classes scheduled for this course.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsJoinClassOpen(false);
                    setSelectedCourseId('');
                    setLiveClasses([]);
                    setIsJoining(new Set());
                  }}
                  className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800/20 hover:bg-gray-800/30 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                  aria-label="Cancel join class"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;