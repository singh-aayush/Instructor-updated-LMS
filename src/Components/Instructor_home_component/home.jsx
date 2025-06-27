import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faTasks, faChartLine, faPlusCircle, faChartBar, faSpinner, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../../themeContext';

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentIncrement, setStudentIncrement] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [courseIncrement, setCourseIncrement] = useState(0);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notificationType, setNotificationType] = useState('user');
  const [formData, setFormData] = useState({
    userIds: [],
    title: '',
    message: '',
    type: 'system',
    relatedEntity: '',
    relatedEntityModel: '',
    actionUrl: '',
    courseId: '',
  });
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoadingCourses(false);
          setLoadingStudents(false);
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch courses
        setLoadingCourses(true);
        const coursesResponse = await axios.get('https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses');
        const fetchedCourses = coursesResponse.data.data || [];
        const publishedCourses = fetchedCourses.filter(course => course.status === 'published').length;
        let courseInc = 0;
        if (activeCourses === 0 && publishedCourses > 0) {
          courseInc = 100;
        } else if (activeCourses > 0) {
          courseInc = ((publishedCourses - activeCourses) / activeCourses) * 100;
        }
        setActiveCourses(publishedCourses);
        setCourseIncrement(courseInc.toFixed(1));
        setCourses(fetchedCourses);
        setLoadingCourses(false);

        // Fetch students
        setLoadingStudents(true);
        const allStudents = new Set();
        const studentDetails = [];

        for (const course of fetchedCourses) {
          const courseId = course._id;
          const courseTitle = course.title;
          try {
            const studentsResponse = await axios.get(
              `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${courseId}/students`
            );
            const courseStudents = studentsResponse.data.data || [];

            courseStudents.forEach((enrollment) => {
              const student = enrollment.student;
              if (!allStudents.has(student._id)) {
                allStudents.add(student._id);
                studentDetails.push({
                  id: student._id,
                  firstName: student.firstName,
                  lastName: student.lastName,
                  email: student.email,
                  courseTitle,
                  enrollmentDate: new Date(enrollment.enrollmentDate).toLocaleString(),
                });
              }
            });
          } catch (error) {
            console.error(`Error fetching students for course ${courseId}:`, error);
          }
        }

        const newStudentCount = allStudents.size;
        let studentInc = 0;
        if (totalStudents === 0 && newStudentCount > 0) {
          studentInc = 100;
        } else if (totalStudents > 0) {
          studentInc = ((newStudentCount - totalStudents) / totalStudents) * 100;
        }

        setTotalStudents(newStudentCount);
        setStudentIncrement(studentInc.toFixed(1));
        setStudents(studentDetails.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate)));
        setLoadingStudents(false);
      } catch (error) {
        console.error('Error fetching data:', error, error.response, error.request);
        if (error.response && error.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError('Failed to fetch data. Please try again later.');
        }
        setLoadingCourses(false);
        setLoadingStudents(false);
      }
    };

    fetchData();
  }, [totalStudents, activeCourses]);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      userIds: [],
      title: '',
      message: '',
      type: 'system',
      relatedEntity: '',
      relatedEntityModel: '',
      actionUrl: '',
      courseId: '',
    });
    setFormError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNotificationType('user');
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (e) => {
    const { value, checked } = e.target;
    if (value === 'all') {
      setFormData((prev) => ({
        ...prev,
        userIds: checked ? students.map((s) => s.id) : [],
      }));
    } else {
      setFormData((prev) => {
        const userIds = checked
          ? [...prev.userIds, value]
          : prev.userIds.filter((id) => id !== value);
        return { ...prev, userIds };
      });
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);
    setFormError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('No authentication token found. Please log in.');
      setSending(false);
      return;
    }

    try {
      if (notificationType === 'user') {
        if (!formData.userIds.length || !formData.title || !formData.message || !formData.type) {
          setFormError('Please fill all required fields: users, title, message, and type.');
          setSending(false);
          return;
        }

        const payload = {
          user: formData.userIds,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          ...(formData.relatedEntity && { relatedEntity: formData.relatedEntity }),
          ...(formData.relatedEntityModel && { relatedEntityModel: formData.relatedEntityModel }),
          ...(formData.actionUrl && { actionUrl: formData.actionUrl }),
        };

        await axios.post('https://new-lms-backend-vmgr.onrender.com/api/v1/notifications', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        if (!formData.courseId || !formData.title || !formData.message || !formData.type) {
          setFormError('Please fill all required fields: course, title, message, and type.');
          setSending(false);
          return;
        }

        const payload = {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          ...(formData.actionUrl && { actionUrl: formData.actionUrl }),
        };

        await axios.post(
          `https://new-lms-backend-vmgr.onrender.com/api/v1/notifications/course/${formData.courseId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      setShowModal(false);
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error, error.response, error.request);
      setFormError(`Failed to send notification: ${error.response?.data?.message || error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`flex-1 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-slate-900'} pt-4`}>
      <Navbar notifications={[]} profileInitial="JP" />
      <div className="px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div
            className={`group relative overflow-hidden rounded-lg p-4 sm:p-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl z-[1000] ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-blue-200'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl border border-blue-200'
            }`}
          >
            {loadingStudents ? (
              <div className="flex items-center justify-center h-24 sm:h-32">
                <FontAwesomeIcon icon={faSpinner} className={`text-xl sm:text-2xl animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-200'}`}>
                    <FontAwesomeIcon icon={faUsers} className={`text-lg sm:text-xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-200 text-green-600'}`}
                  >
                    {studentIncrement > 0 ? `+${studentIncrement}%` : '0%'}
                  </div>
                </div>
                <h3 className={`text-xs sm:text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Students</h3>
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-gray-800'}`}>{totalStudents}</p>
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    theme === 'dark' ? 'bg-blue-400/20' : 'bg-blue-600/20'
                  }`}
                ></div>
              </>
            )}
          </div>

          <div
            className={`group relative overflow-hidden rounded-lg p-4 sm:p-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl z-[1000] ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-emerald-200'
                : 'bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-xl border border-emerald-200'
            }`}
          >
            {loadingCourses ? (
              <div className="flex items-center justify-center h-24 sm:h-32">
                <FontAwesomeIcon icon={faSpinner} className={`text-xl sm:text-2xl animate-spin ${theme === 'dark' ? 'text-emerald-400' : 'text-teal-600'}`} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-green-200'}`}>
                    <FontAwesomeIcon icon={faBookOpen} className={`text-lg sm:text-xl ${theme === 'dark' ? 'text-emerald-400' : 'text-teal-600'}`} />
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-200 text-green-600'}`}
                  >
                    {courseIncrement > 0 ? `+${courseIncrement}%` : courseIncrement < 0 ? `${courseIncrement}%` : '0%'}
                  </div>
                </div>
                <h3 className={`text-xs sm:text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Active Courses</h3>
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-gray-800'}`}>{activeCourses}</p>
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    theme === 'dark' ? 'bg-emerald-400/20' : 'bg-teal-600/20'
                  }`}
                ></div>
              </>
            )}
          </div>

          <div
            className={`group relative overflow-hidden rounded-lg p-4 sm:p-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl z-[1000] ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-amber-200'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-xl border border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-200'}`}>
                <FontAwesomeIcon icon={faTasks} className={`text-lg sm:text-xl ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-200 text-red-600'}`}
              >
                -5
              </div>
            </div>
            <h3 className={`text-xs sm:text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pending Reviews</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-gray-800'}`}>6</p>
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-200 ${
                theme === 'dark' ? 'bg-amber-400/20' : 'bg-amber-600/20'
              }`}
            ></div>
          </div>

          <div
            className={`group relative overflow-hidden rounded-lg p-4 sm:p-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl z-[1000] ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-purple-200'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl border border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-200'}`}>
                <FontAwesomeIcon icon={faChartLine} className={`text-lg sm:text-xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-200 text-green-600'}`}
              >
                +8%
              </div>
            </div>
            <h3 className={`text-xs sm:text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Completion Rate</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-gray-800'}`}>87%</p>
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                theme === 'dark' ? 'bg-purple-400/20' : 'bg-purple-600/20'
              }`}
            ></div>
          </div>
        </div>

        <div
          className={`rounded-lg p-4 sm:p-6 mt-4 sm:mt-6 shadow-lg backdrop-blur-xl border ${
            theme === 'dark' ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/50'
          }`}
        >
          <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/dashboard/create-course')}
              className={`p-3 sm:p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50'
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <FontAwesomeIcon icon={faPlusCircle} className={`text-xl sm:text-2xl mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className={`font-medium text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Create Course</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Start building</div>
            </button>

            <button
              onClick={() => navigate('/dashboard/assignments')}
              className={`p-3 sm:p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50'
                  : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <FontAwesomeIcon icon={faTasks} className={`text-xl sm:text-2xl mb-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <div className={`font-medium text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Review Work</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Check submissions</div>
            </button>

            <button
              onClick={() => navigate('/dashboard/analytics')}
              className={`p-3 sm:p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50'
                  : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <FontAwesomeIcon icon={faChartBar} className={`text-xl sm:text-2xl mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <div className={`font-medium text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Analytics</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View insights</div>
            </button>

            <button
              onClick={handleOpenModal}
              className={`p-3 sm:p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/50'
                  : 'bg-pink-50 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              <FontAwesomeIcon icon={faEnvelope} className={`text-xl sm:text-2xl mb-2 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
              <div className={`font-medium text-sm sm:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Drop Message</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Send notification</div>
            </button>
          </div>
        </div>

        {showModal && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center px-[10px] md:px-0 justify-center z-[1001] mt-[8rem] mb-8 ${
              theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-200/50'
            }`}
          >
            <div
              className={`p-6 rounded-lg shadow-lg max-w-3xl p-[10px] md:p-0 w-full max-h-[80vh] overflow-y-auto ${
                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                Send Notification
              </h2>
              <div className="flex mb-4 space-x-4">
                <button
                  onClick={() => setNotificationType('user')}
                  className={`flex-1 p-2 rounded-lg text-[12px] md:text-4 ${
                    notificationType === 'user'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  Notification to Users
                </button>
                <button
                  onClick={() => setNotificationType('course')}
                  className={`flex-1 p-2 rounded-lg text-[12px] md:text-4 ${
                    notificationType === 'course'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  Course Notification
                </button>
              </div>
              {formError && (
                <div className={`mb-4 p-2 rounded-lg ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  {formError}
                </div>
              )}
              <form onSubmit={handleSendNotification} className="space-y-4">
                {notificationType === 'user' ? (
                  <>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Select Users <span className="text-red-500">*</span>
                      </label>
                      <div className={`mt-2 max-h-40 overflow-y-auto border rounded-lg p-3 ${
                        theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                      }`}>
                        <label className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            value="all"
                            checked={formData.userIds.length === students.length && students.length > 0}
                            onChange={handleUserSelect}
                            className={`h-4 w-4 rounded border ${
                              theme === 'dark' ? 'border-gray-600 bg-gray-800 text-blue-500' : 'border-gray-300 bg-white text-blue-600'
                            } focus:ring-blue-500`}
                          />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            All Users
                          </span>
                        </label>
                        {students.map((student) => (
                          <label key={student.id} className="flex items-center space-x-2 mb-2">
                            <input
                              type="checkbox"
                              value={student.id}
                              checked={formData.userIds.includes(student.id)}
                              onChange={handleUserSelect}
                              className={`h-4 w-4 rounded border ${
                                theme === 'dark' ? 'border-gray-600 bg-gray-800 text-blue-500' : 'border-gray-300 bg-white text-blue-600'
                              } focus:ring-blue-500`}
                            />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {student.firstName} {student.lastName} ({student.email})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                        }`}
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                          }`}
                          required
                        >
                          <option value="system">System</option>
                          <option value="course">Course</option>
                          <option value="payment">Payment</option>
                          <option value="support">Support</option>
                          <option value="announcement">Announcement</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Related Entity (Optional)
                        </label>
                        <input
                          type="text"
                          name="relatedEntity"
                          value={formData.relatedEntity}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Related Entity Model (Optional)
                        </label>
                        <input
                          type="text"
                          name="relatedEntityModel"
                          value={formData.relatedEntityModel}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Action URL (Optional)
                        </label>
                        <input
                          type="text"
                          name="actionUrl"
                          value={formData.actionUrl}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                          }`}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Select Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                        }`}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                        }`}
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                          }`}
                          required
                        >
                          <option value="course">Course</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Action URL (Optional)
                        </label>
                        <input
                          type="text"
                          name="actionUrl"
                          value={formData.actionUrl}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-800'
                          }`}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className={`p-2 rounded-lg ${
                      theme === 'dark'
                        ? sending
                          ? 'bg-blue-400 text-white'
                          : 'bg-blue-600 text-white'
                        : sending
                        ? 'bg-blue-300 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {sending ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div
            className={`p-4 sm:p-6 rounded-lg shadow-lg backdrop-blur-xl border ${
              theme === 'dark' ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/50'
            }`}
          >
            <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activity</h3>
            {loadingStudents ? (
              <div className="flex items-center justify-center h-24 sm:h-32">
                <FontAwesomeIcon icon={faSpinner} className={`text-xl sm:text-2xl animate-spin ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {students.length > 0 ? (
                  students.slice(0, 10).map((student) => (
                    <div key={student.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>👤</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {student.firstName} {student.lastName} enrolled in <strong>{student.courseTitle}</strong>
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{student.enrollmentDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No recent enrollments.</p>
                )}
              </div>
            )}
          </div>

          <div
            className={`p-4 sm:p-6 rounded-lg shadow-lg backdrop-blur-xl border ${
              theme === 'dark' ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white/70 border-gray-200/50'
            }`}
          >
            <h3 className={`text-base sm:text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Performance Overview</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Monthly Revenue</span>
                <span className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>₹89,750</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>New Enrollments</span>
                <span className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Average Rating</span>
                <span className={`font-bold flex items-center space-x-1 text-sm sm:text-base ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  <span>4.75</span>
                  <span>⭐</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Course Hours</span>
                <span className={`font-bold text-sm sm:text-base ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>126h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;