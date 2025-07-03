import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Added motion and AnimatePresence
import Navbar from '../Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faSpinner, faClock, faEdit, faUpload, faPause, faTrash, faStar, faPlusCircle, faPlay } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../themeContext';

export default function MyCourses() {
  const { theme: darkMode = 'light' } = useContext(ThemeContext); // Added default value
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const coursesData = response.data.data;

        // Fetch detailed data for each course
        const detailedCourses = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const courseResponse = await axios.get(
                `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${course._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const courseData = courseResponse.data.data;
              // Calculate total duration from curriculum lectures
              const totalDuration = courseData.curriculum.reduce((total, section) => {
                return total + section.lectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);
              }, 0);
              return {
                ...course,
                duration: totalDuration || 0, // Added fallback
                rating: courseData.rating || 0,
                totalRatings: courseData.totalRatings || 0,
              };
            } catch (error) {
              console.error(`Error fetching details for course ${course._id}:`, error);
              return course; // Fallback to original course data if fetch fails
            }
          })
        );

        setCourses(detailedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handlePlay = (courseId) => {
    navigate(`/dashboard/course-player/${courseId}`);
  };

  const handleCardClick = (courseId, courseTitle) => {
    navigate(`/dashboard/course-editor/${courseId}`, { state: { courseTitle } });
  };

  const handleStatusToggle = async (courseId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await axios.put(
        `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${courseId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCourses(courses.map(course =>
        course._id === courseId ? { ...course, status: newStatus } : course
      ));
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCourses(courses.filter(course => course._id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = courseFilter === 'all' || course.status === courseFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Navbar notifications={[]} profileInitial="JP" />
      <div className={`flex-1 h-full ${darkMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-900'} pt-4`}>
        <div className="p-[10px] md:p-6 h-full overflow-auto pt-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Course Management</h2>
              <p className={`text-sm ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Manage and organize your courses</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={`w-full sm:w-64 md:w-72 lg:w-80 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        darkMode === 'dark'
          ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      }`}
    />

    <select
      value={courseFilter}
      onChange={(e) => setCourseFilter(e.target.value)}
      className={`w-full sm:w-44 md:w-52 lg:w-60 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        darkMode === 'dark'
          ? 'bg-gray-800 border-white/20 text-white'
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    >
      <option value="all" className={darkMode === 'dark' ? 'text-white' : 'text-gray-900'}>All Status</option>
      <option value="published" className={darkMode === 'dark' ? 'text-white' : 'text-gray-900'}>Published</option>
      <option value="draft" className={darkMode === 'dark' ? 'text-white' : 'text-gray-900'}>Draft</option>
    </select>
  </div>

  <button
    onClick={() => navigate('/dashboard/create-course')}
    className={`w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 ${
      darkMode === 'dark'
        ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25'
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
    }`}
  >
    <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
    Create New Course
  </button>
</div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <FontAwesomeIcon icon={faSpinner} spin className={`text-4xl mb-4 ${darkMode === 'dark' ? 'text-gray-600' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Loading courses...</h3>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FontAwesomeIcon icon={faBookOpen} className={`text-4xl mb-4 ${darkMode === 'dark' ? 'text-gray-600' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>No courses found</h3>
                <p className={`text-sm ${darkMode === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  {searchTerm || courseFilter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first course to get started'}
                </p>
              </div>
            ) : (
              <AnimatePresence> {/* Added AnimatePresence for exit animations */}
                {filteredCourses.map(course => {
                  const totalPrice = course.price - (course.discountPrice || 0);
                  // Convert total duration (in minutes) to hours and minutes
                  const totalHours = Math.floor((course.duration || 0) / 60); // Added fallback
                  const totalMinutes = (course.duration || 0) % 60; // Added fallback
                  const durationDisplay = totalHours > 0
                    ? `${totalHours}h ${totalMinutes}m`
                    : `${totalMinutes}m`;

                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 10, transition: { duration: 0.5, ease: 'easeInOut' } }} // Cool exit animation
                      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${darkMode === 'dark' ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/70 backdrop-blur-none border border-gray-200'} shadow-xl hover:shadow-2xl`}
                      onClick={() => handleCardClick(course._id, course.title)}
                    >
                      <div className={`relative h-48 bg-gradient-to-br ${darkMode === 'dark' ? 'from-gray-800 to-black' : (course._id % 3 === 0 ? 'from-purple-200 to-pink-300' : course._id % 2 === 0 ? 'from-emerald-200 to-teal-300' : 'from-blue-200 to-purple-300')} overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-t ${darkMode === 'dark' ? 'from-black/50 to-transparent' : 'from-white/50 to-transparent'}`}></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(course._id, course.title);
                          }}
                          className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-300 ${darkMode === 'dark' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-700'} group-hover:opacity-100 opacity-0`}
                          aria-label={`Delete ${course.title}`} // Added for accessibility
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 backdrop-blur-sm text-white text-xs font-medium rounded-full ${
                            course.status === 'published' ? 'bg-green-500/90' : 'bg-yellow-500/90'
                          }`}>
                            {course.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className={`font-bold text-xl ${darkMode === 'dark' ? 'text-white' : 'text-gray-900'} mb-1 line-clamp-2`}>
                            {course.title}
                          </h3>
                          <p className={`text-sm ${darkMode === 'dark' ? 'text-white/80' : 'text-gray-700'} line-clamp-1`}>{course.subtitle}</p>
                        </div>
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={`${course.title} thumbnail`}
                            className="w-full h-full object-cover opacity-25"
                          />
                        )}
                      </div>
                      <div className="p-[10px] md:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${darkMode === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                              <FontAwesomeIcon icon={faUsers} className={`text-sm ${darkMode === 'dark' ? 'text-blue-400' : 'text-blue-700'}`} />
                            </div>
                            <span className={`text-sm font-medium ${darkMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{course.totalStudents || 0} Students</span>
                          </div>
                          <div className={`text-sm ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            {durationDisplay}
                          </div>
                        </div>
                        <p className={`text-sm mb-4 ${darkMode === 'dark' ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                          {course.subtitle || 'No description'}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-bold ${darkMode === 'dark' ? 'text-green-400' : 'text-green-700'}`}>₹{totalPrice}</span>
                            {course.discountPrice && (
                              <span className={`text-sm line-through ${darkMode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>₹{course.price}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`text-sm font-medium ${darkMode === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{course.rating}</span>
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
                            <span className={`text-xs ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>({course.totalRatings})</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlay(course._id);
                            }}
                            className={`flex-1 p-2 rounded-lg text-normal md:text-medium transition-all duration-300 ${darkMode === 'dark' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
                          >
                            <FontAwesomeIcon icon={faPlay} className="text-sm mr-2" />
                            Play
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(course._id, course.title);
                            }}
                            className={`flex-1 p-2 rounded-lg transition-all duration-300 ${darkMode === 'dark' ? 'bg-gray-800/20 hover:bg-gray-800/30 text-gray-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
                          >
                            <FontAwesomeIcon icon={faEdit} className="text-sm mr-2" />
                            Edit
                          </button>
                          {course.status === 'draft' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusToggle(course._id, course.status);
                              }}
                              className={`flex-1 p-2 rounded-lg transition-all duration-300 ${darkMode === 'dark' ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}
                            >
                              <FontAwesomeIcon icon={faUpload} className="text-sm mr-2" />
                              Publish
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusToggle(course._id, course.status);
                              }}
                              className={`flex-1 p-2 rounded-lg transition-all duration-300 ${darkMode === 'dark' ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'}`}
                            >
                              <FontAwesomeIcon icon={faPause} className="text-sm mr-2" />
                              Unpublish
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  );
}