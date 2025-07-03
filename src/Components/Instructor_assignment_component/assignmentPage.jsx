import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import SearchBar from './searchBar';
import { ThemeContext } from '../../themeContext';

const Notification = ({ message, type, onClose }) => {
  const { theme } = useContext(ThemeContext);
  if (!message) return null;

  return (
    <div
      className={`fixed top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-3 lg:p-4 rounded-md shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      } transition-opacity duration-300 z-[1000] max-w-[90%] sm:max-w-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm lg:text-base">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 sm:ml-4 text-white hover:text-gray-200 text-xs sm:text-sm"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

function Assignments() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const assignmentsPerPage = 10;

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Please log in to fetch courses.');
          navigate('/');
          return;
        }

        const response = await axios.get(
          'https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setCourses(response.data.data);
          setSelectedCourseId('all');
        } else {
          showNotification('No courses found.');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        if (error.response?.status === 401) {
          showNotification('Session expired or invalid. Please log in again.');
          localStorage.removeItem('token');
          navigate('/');
        } else {
          showNotification('Failed to fetch courses.');
        }
      } finally {
        setIsCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          showNotification('Please log in to fetch assessments.');
          navigate('/');
          return;
        }

        let allAssessments = [];
        if (selectedCourseId === 'all') {
          for (const course of courses) {
            const response = await axios.get(
              `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${course._id}/assessments/submitted`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data.success) {
              allAssessments = [...allAssessments, ...response.data.data.map(assessment => ({
                ...assessment,
                courseId: course._id,
                courseTitle: course.title
              }))];
            }
          }
        } else {
          const response = await axios.get(
            `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${selectedCourseId}/assessments/submitted`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            const course = courses.find(c => c._id === selectedCourseId);
            allAssessments = response.data.data.map(assessment => ({
              ...assessment,
              courseId: selectedCourseId,
              courseTitle: course ? course.title : 'Unknown Course'
            }));
          }
        }

        setAssessments(allAssessments);
        if (allAssessments.length === 0) {
          showNotification('No submitted assessments found.');
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
        if (error.response?.status === 401) {
          showNotification('Session expired or invalid. Please log in again.');
          localStorage.removeItem('token');
          navigate('/');
        } else {
          showNotification('Failed to fetch assessments.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (courses.length > 0 && selectedCourseId) {
      fetchAssessments();
    }
  }, [selectedCourseId, courses, navigate]);

  const handleDelete = async (assessmentId, courseId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please log in to delete assessment.');
        return;
      }

      await axios.delete(
        `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${courseId}/assessments/${assessmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssessments((prev) => prev.filter((assessment) => assessment.assessmentId !== assessmentId));
      showNotification('Assessment deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting assessment:', error);
      if (error.response?.status === 401) {
        showNotification('Session expired or invalid. Please log in again.');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      showNotification('Failed to delete assessment.');
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${assessment.student.firstName} ${assessment.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      assignmentFilter === 'all' ||
      (assignmentFilter === 'active' && assessment.submission.status.toLowerCase() === 'submitted') ||
      (assignmentFilter === 'past-due' && assessment.submission.status.toLowerCase() === 'late') ||
      (assignmentFilter === 'completed' && assessment.submission.score !== null);

    const matchesDueDate = dueDateFilter
      ? format(new Date(assessment.dueDate), 'yyyy-MM-dd') === dueDateFilter
      : true;

    return matchesSearch && matchesFilter && matchesDueDate;
  });

  const formattedAssessments = filteredAssessments.map((assessment) => ({
    assessmentId: assessment.assessmentId,
    studentId: assessment.student.id,
    studentFullName: `${assessment.student.firstName} ${assessment.student.lastName}`,
    assessmentTitle: assessment.assessmentTitle,
    dueDate: assessment.dueDate
      ? format(new Date(assessment.dueDate), 'dd/MM/yyyy')
      : 'Not set',
    submissionDate: assessment.submission.submissionDate
      ? format(new Date(assessment.submission.submissionDate), 'dd/MM/yyyy')
      : 'Not set',
    score: assessment.submission.score,
    status: assessment.submission.status,
    studentEmail: assessment.student.email,
    courseId: assessment.courseId,
    courseTitle: assessment.courseTitle,
  }));

  const totalPages = Math.ceil(formattedAssessments.length / assignmentsPerPage);
  const startIndex = (currentPage - 1) * assignmentsPerPage;
  const endIndex = startIndex + assignmentsPerPage;
  const paginatedAssessments = formattedAssessments.slice(startIndex, endIndex);

  const viewSubmission = (assessment) => {
    navigate(`/dashboard/course-editor/${assessment.courseId}/assessments`);
  };

  const editAssessment = (assessment) => {
    navigate(`/dashboard/course-editor/${assessment.courseId}/assessments/${assessment.assessmentId}`, {
      state: { courseTitle: assessment.courseTitle }
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <Navbar notifications={[]} profileInitial="JP" />
      <div className={`flex-1 pt-16 sm:pt-20 lg:pt-12 px-3 sm:px-4 lg:px-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Assignment Management
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'active', 'past-due', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAssignmentFilter(filter)}
                    className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm lg:text-base transition-all duration-300 ${
                      assignmentFilter === filter
                        ? `${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-black text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'}`
                        : `${theme === 'dark' ? 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate(`/dashboard/course-editor/${selectedCourseId !== 'all' ? selectedCourseId : courses[0]?._id}/assessments/new`)}
                className={`w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm lg:text-base transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-800/25' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                } ${isCoursesLoading || courses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isCoursesLoading || courses.length === 0}
              >
                Create Assignment
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="w-full sm:w-1/2 lg:w-1/3">
                <label className={`block text-xs sm:text-sm lg:text-base font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Course
                </label>
                {isCoursesLoading ? (
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading courses...
                  </p>
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className={`w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Courses</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title || 'Unnamed Course'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="w-full sm:w-1/2 lg:w-1/3">
                <label className={`block text-xs sm:text-sm lg:text-base font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  className={`w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>

          {isLoading ? (
            <p className={`text-center text-xs sm:text-sm lg:text-base mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading assessments...
            </p>
          ) : paginatedAssessments.length === 0 ? (
            <p className={`text-center text-xs sm:text-sm lg:text-base mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No submitted assessments found.
            </p>
          ) : (
            <>
              {/* Card Layout for Mobile and Tablet (200px–840px) */}
              <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {paginatedAssessments.map((assessment) => (
                  <div
                    key={assessment.assessmentId}
                    className={`p-3 sm:p-4 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                  >
                    <div className="space-y-2">
                      <div>
                        <h3 className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} line-clamp-2`}>
                          {assessment.assessmentTitle}
                        </h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Student: {assessment.studentFullName}
                        </p>
                      </div>
                      <div className="flex justify-between text-xs my-[10px] sm:text-sm">
                        <div className='flex flex-col gap-[10px]'>
                          <span className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Course: {assessment.courseTitle}</span>
                          <span className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Due: {assessment.dueDate}</span>
                        </div>
                        <div className='flex flex-col gap-[10px]'>
                          <span className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Submitted: {assessment.submissionDate}</span>
                          <span className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Score: {assessment.score ?? 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex justify-start my-[14px]">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            assessment.status.toLowerCase() === 'submitted'
                              ? 'bg-green-100 text-green-800'
                              : assessment.status.toLowerCase() === 'late'
                              ? 'bg-red-100 text-red-800'
                              : assessment.status.toLowerCase() === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {assessment.status}
                        </span>
                      </div>
                      <div className="flex flex-row gap-1 sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => viewSubmission(assessment)}
                          className={`flex-1 p-1.5 sm:p-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                            theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                          title="View submission"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                        <button
                          onClick={() => editAssessment(assessment)}
                          className={`flex-1 p-1.5 sm:p-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                            theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}
                          title="Edit assessment"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(assessment.assessmentId, assessment.courseId)}
                          className={`flex-1 p-1.5 sm:p-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                            theme === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title="Delete assessment"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Layout for Desktop (841px+) */}
              <div className="hidden xl:block overflow-x-auto">
                <table className={`min-w-full rounded-xl overflow-hidden text-sm lg:text-base ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                  <thead>
                    <tr className={`${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'} uppercase text-xs lg:text-sm leading-normal`}>
                      <th className="py-3 px-4 lg:px-6 text-left">Title</th>
                      <th className="py-3 px-4 lg:px-6 text-left">Course</th>
                      <th className="py-3 px-4 lg:px-6 text-center">Due Date</th>
                      <th className="py-3 px-4 lg:px-6 text-center">Submission Date</th>
                      <th className="py-3 px-4 lg:px-6 text-center">Score</th>
                      <th className="py-3 px-4 lg:px-6 text-center">Status</th>
                      <th className="py-3 px-4 lg:px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm lg:text-base`}>
                    {paginatedAssessments.map((assessment) => (
                      <tr
                        key={assessment.assessmentId}
                        className={`border-b ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <td className="py-3 px-4 lg:px-6 text-left">
                          <div className="font-medium">{assessment.assessmentTitle}</div>
                          <div className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Student: {assessment.studentFullName}
                          </div>
                        </td>
                        <td className="py-3 px-4 lg:px-6 text-left">{assessment.courseTitle}</td>
                        <td className="py-3 px-4 lg:px-6 text-center">{assessment.dueDate}</td>
                        <td className="py-3 px-4 lg:px-6 text-center">{assessment.submissionDate}</td>
                        <td className="py-3 px-4 lg:px-6 text-center">{assessment.score ?? 'N/A'}</td>
                        <td className="py-3 px-4 lg:px-6 text-center">
                          <span
                            className={`text-xs lg:text-sm font-medium px-2.5 py-0.5 rounded ${
                              assessment.status.toLowerCase() === 'submitted'
                                ? 'bg-green-100 text-green-800'
                                : assessment.status.toLowerCase() === 'late'
                                ? 'bg-red-100 text-red-800'
                                : assessment.status.toLowerCase() === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {assessment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 lg:px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => viewSubmission(assessment)}
                              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors min-h-[44px] ${
                                theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                              title="View submission"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View
                            </button>
                            <button
                              onClick={() => editAssessment(assessment)}
                              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors min-h-[44px] ${
                                theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              }`}
                              title="Edit assessment"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(assessment.assessmentId, assessment.courseId)}
                              className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium transition-colors min-h-[44px] ${
                                theme === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                              title="Delete assessment"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3 sm:gap-0">
                <div className={`text-xs sm:text-sm lg:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {startIndex + 1}-{Math.min(endIndex, formattedAssessments.length)} of {formattedAssessments.length} assignments
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm lg:text-base transition-colors min-h-[44px] ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                    } ${theme === 'dark' ? 'border-white/20 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm lg:text-base transition-colors min-h-[44px] ${
                        currentPage === pageNum
                          ? `${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-black text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'}`
                          : `border ${theme === 'dark' ? 'border-white/20 text-gray-300 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm lg:text-base transition-colors min-h-[44px] ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                    } ${theme === 'dark' ? 'border-white/20 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assignments;