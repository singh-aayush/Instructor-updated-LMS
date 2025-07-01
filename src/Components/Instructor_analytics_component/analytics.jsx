import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../../themeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBookOpen,
  faTasks,
  faChartBar,
  faSpinner,
  faEnvelope,
  faCertificate,
  faStar,
  faFileCsv,
  faFileCode,
  faRupeeSign,
} from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  const [analyticsTimePeriod, setAnalyticsTimePeriod] = useState('7');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [earningsData, setEarningsData] = useState(null);
  const [coursesData, setCoursesData] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [certificateData, setCertificateData] = useState([]);
  const [showCertificatePopup, setShowCertificatePopup] = useState(false);
  const [approvingCertificates, setApprovingCertificates] = useState(new Set());
  const [loading, setLoading] = useState({
    earnings: true,
    courses: true,
    progress: true,
    certificates: true,
  });
  const [error, setError] = useState({
    earnings: null,
    courses: null,
    progress: null,
    certificates: null,
  });

  const addNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 6000);
  };

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('https://lms-backend-flwq.onrender.com/api/v1/instructors/earnings', {
          headers: { Authorization: `Bearer ${token}` },
          params: { period: analyticsTimePeriod },
        });
        if (response.data.success) {
          setEarningsData(response.data.data);
        } else {
          throw new Error('Earnings API request was not successful');
        }
      } catch (err) {
        setError((prev) => ({ ...prev, earnings: 'Failed to fetch earnings data' }));
        addNotification('Failed to fetch earnings data', 'error');
      } finally {
        setLoading((prev) => ({ ...prev, earnings: false }));
      }
    };
    fetchEarningsData();
  }, [analyticsTimePeriod]);

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('https://lms-backend-flwq.onrender.com/api/v1/instructors/courses', {
          headers: { Authorization: `Bearer ${token}` },
          params: { period: analyticsTimePeriod },
        });
        if (response.data.success) {
          setCoursesData(response.data.data);
        } else {
          throw new Error('Courses API request was not successful');
        }
      } catch (err) {
        setError((prev) => ({ ...prev, courses: 'Failed to fetch courses data' }));
        addNotification('Failed to fetch courses data', 'error');
      } finally {
        setLoading((prev) => ({ ...prev, courses: false }));
      }
    };
    fetchCoursesData();
  }, [analyticsTimePeriod]);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!coursesData) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        setCertificateData([]);
        const progressPromises = coursesData.map(async (course) => {
          const response = await axios.get(
            `https://new-lms-backend-vmgr.onrender.com/api/v1/progress/course/${course._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!response.data.success) {
            throw new Error(`Failed to fetch progress for course ${course._id}`);
          }
          const completedStudents = response.data.data
            .filter((progress) => progress.overallProgress === 100)
            .map((progress) => ({
              studentId: progress.student._id,
              studentName: `${progress.student.firstName} ${progress.student.lastName}`,
              courseId: course._id,
              courseTitle: course.title,
              enrollmentId: progress._id,
            }));
          return { courseId: course._id, completedStudents };
        });
        const progressResults = await Promise.all(progressPromises);
        const progressMap = progressResults.reduce((acc, { courseId }) => {
          acc[courseId] = progressData[courseId] || {};
          return acc;
        }, {});
        const allCompletedStudents = progressResults.flatMap((result) => result.completedStudents);
        setCertificateData(allCompletedStudents);
        setProgressData(progressMap);
      } catch (err) {
        setError((prev) => ({ ...prev, progress: 'Failed to fetch progress data' }));
        addNotification('Failed to fetch progress data', 'error');
      } finally {
        setLoading((prev) => ({ ...prev, progress: false, certificates: false }));
      }
    };
    fetchProgressData();
  }, [coursesData]);

  const handleCertificateApproval = async (certificate) => {
    setApprovingCertificates((prev) => new Set([...prev, certificate.enrollmentId]));
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.post(
        'https://new-lms-backend-vmgr.onrender.com/api/v1/certificates',
        {
          studentId: certificate.studentId,
          courseId: certificate.courseId,
          enrollmentId: certificate.enrollmentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCertificateData((prev) => prev.filter((c) => c.enrollmentId !== certificate.enrollmentId));
        addNotification(`Certificate approved for ${certificate.studentName}`, 'success');
      } else {
        throw new Error('Failed to issue certificate');
      }
    } catch (err) {
      addNotification('Failed to approve certificate', 'error');
    } finally {
      setApprovingCertificates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(certificate.enrollmentId);
        return newSet;
      });
    }
  };

  const calculateAverageRating = () => {
    if (!coursesData || coursesData.length === 0) return { rating: 0, satisfaction: 0 };
  
    const totalRating = coursesData.reduce((sum, course) => sum + course.rating, 0);
    const ratedCourses = coursesData.filter((course) => course.rating > 0).length;
  
    const averageRating = ratedCourses > 0 ? (totalRating / ratedCourses).toFixed(1) : 0;
    const satisfaction = ratedCourses > 0 ? ((totalRating / ratedCourses / 5) * 100).toFixed(0) : 0;
  
    return { rating: averageRating, satisfaction };
  };
  

  const calculateCompletionRate = (courseId) => {
    if (!progressData[courseId]) return 0;
    const progressValues = Object.values(progressData[courseId]);
    if (progressValues.length === 0) return 0;
    const averageProgress = progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length;
    return Math.round(averageProgress);
  };

  const calculateCourseRevenue = (course) => {
    return ((course.price - course.discountPrice) * course.totalStudents).toFixed(2);
  };

  const calculateTotalRevenue = () => {
    if (earningsData && earningsData.totalEarnings > 0) return earningsData.totalEarnings;
    if (!coursesData || coursesData.length === 0) return 0;
    return coursesData
      .reduce((sum, course) => sum + (course.price - course.discountPrice) * course.totalStudents, 0)
      .toFixed(2);
  };

  const getTopPerformingCourses = () => {
    if (!coursesData) return [];
    return [...coursesData]
      .sort((a, b) => {
        if (b.totalStudents === a.totalStudents) return b.rating - a.rating;
        return b.totalStudents - a.totalStudents;
      })
      .slice(0, 5);
  };

  const exportAnalyticsData = (format) => {
    addNotification(`Analytics exported as ${format.toUpperCase()}`, 'success');
    console.log(`Exporting data as ${format} for ${analyticsTimePeriod} days`);
  };

  const getTimePeriodLabel = (days) => {
    if (days === 7) return 'Last 7 days';
    if (days === 30) return 'Last 30 days';
    if (days === 90) return 'Last 3 months';
    if (days === 365) return 'Last year';
    return `${days} days`;
  };

  const getRevenueChartData = () => {
    if (!coursesData) return { labels: [], datasets: [] };
    const labels = coursesData.map(course => course.title);
    const revenueData = coursesData.map(course => parseFloat(calculateCourseRevenue(course)));
    return {
      labels,
      datasets: [
        {
          label: 'Course Revenue (₹)',
          data: revenueData,
          backgroundColor: darkMode ? '#10B981' : '#2563EB',
          borderColor: darkMode ? '#10B981' : '#2563EB',
          borderWidth: 1,
          hoverBackgroundColor: darkMode ? '#34D399' : '#3B82F6',
          hoverBorderColor: darkMode ? '#34D399' : '#3B82F6',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#D1D5DB' : '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        titleColor: darkMode ? '#FFFFFF' : '#1F2937',
        bodyColor: darkMode ? '#D1D5DB' : '#374151',
        borderColor: darkMode ? '#4B5563' : '#D1D5DB',
        borderWidth: 1,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
        },
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
          callback: (value) => `₹${value.toLocaleString()}`,
          stepSize: 5000,
        },
        beginAtZero: true,
      },
    },
  };

  const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    return (
      <div
        className={`fixed top-20 right-2 xs:right-4 p-3 xs:p-4 rounded-xl shadow-lg z-[1000] ${
          type === 'error'
            ? darkMode
              ? 'bg-red-500/20 text-red-400'
              : 'bg-red-100 text-red-600'
            : darkMode
            ? 'bg-green-500/20 text-green-400'
            : 'bg-green-100 text-green-600'
        }`}
      >
        <span className="text-sm xs:text-base">{message}</span>
        <button onClick={onClose} className="ml-2 xs:ml-4 text-lg font-bold">
          ×
        </button>
      </div>
    );
  };

  const CertificatePopup = () => {
    return (
      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        <div
          className={`rounded-2xl p-4 xs:p-6 w-full max-w-[50%] xs:max-w-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl overflow-y-auto max-h-[80vh]`}
        >
          <h3 className="text-base xs:text-lg font-semibold mb-4">Certificate Approvals</h3>
          {certificateData.length === 0 ? (
            <p className="text-xs xs:text-sm text-gray-500">No certificates pending approval</p>
          ) : (
            <div className="space-y-4">
              {certificateData.map((cert, index) => (
                <div
                  key={index}
                  className={`p-3 xs:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <p className="text-xs xs:text-sm">
                    <strong>Student:</strong> {cert.studentName}
                  </p>
                  <p className="text-xs xs:text-sm">
                    <strong>Course:</strong> {cert.courseTitle}
                  </p>
                  <p className="text-xs xs:text-sm">
                    <strong>Progress:</strong> 100%
                  </p>
                  <button
                    onClick={() => handleCertificateApproval(cert)}
                    disabled={approvingCertificates.has(cert.enrollmentId)}
                    className={`mt-2 px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium text-xs xs:text-sm transition-all duration-300 ${
                      approvingCertificates.has(cert.enrollmentId)
                        ? 'bg-gray-500 cursor-not-allowed'
                        : darkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {approvingCertificates.has(cert.enrollmentId) ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1 xs:mr-2" />
                    ) : (
                      'Approve Certificate'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowCertificatePopup(false)}
            className={`mt-4 px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium text-xs xs:text-sm transition-all duration-300 ${
              darkMode
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 xs:space-y-6 p-4 xs:p-6 pt-[3rem] md:pt-[2rem]">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      {showCertificatePopup && <CertificatePopup />}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 xs:gap-4">
        <div>
          <h2
            className={`text-xl xs:text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Analytics Dashboard
          </h2>
          <p
            className={`text-xs xs:text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Comprehensive insights into your teaching performance
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
          <select
            value={analyticsTimePeriod}
            onChange={(e) => {
              setAnalyticsTimePeriod(e.target.value);
              setLoading({ earnings: true, courses: true, progress: true, certificates: true });
              addNotification(`Analytics updated for ${getTimePeriodLabel(parseInt(e.target.value))}`, 'info');
            }}
            className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-sm border text-xs xs:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
              ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} value="7">Last 7 days</option>
            <option className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} value="30">Last 30 days</option>
            <option className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} value="90">Last 3 months</option>
            <option className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} value="365">Last year</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
        <div
          className={`group relative overflow-hidden rounded-2xl p-4 xs:p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-white/10'
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-blue-200/50'
          } shadow-xl hover:shadow-2xl`}
          onClick={() => setShowCertificatePopup(true)}
        >
          {loading.certificates ? (
            <div className="flex justify-center items-center h-full">
              <FontAwesomeIcon icon={faSpinner} className="text-xl xs:text-2xl animate-spin" />
            </div>
          ) : error.certificates ? (
            <p
              className={`text-xs xs:text-sm ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}
            >
              {error.certificates}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <div
                  className={`p-2 xs:p-3 rounded-xl ${
                    darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faCertificate}
                    className={`text-lg xs:text-xl ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                </div>
              </div>
              <h3
                className={`text-xs xs:text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Certificate Approvals
              </h3>
              <p
                className={`text-2xl xs:text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                {certificateData.length}
              </p>
              <div
                className={`absolute inset-0 ${
                  darkMode
                    ? 'bg-gradient-to-r from-gray-800/10 to-black/10'
                    : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </>
          )}
        </div>
        <div
          className={`group relative overflow-hidden rounded-2xl p-4 xs:p-6 transition-all duration-300 hover:scale-105 ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-white/10'
              : 'bg-gradient-to-br from-amber-50 to-yellow-50 backdrop-blur-xl border border-amber-200/50'
          } shadow-xl hover:shadow-2xl`}
        >
          {loading.earnings ? (
            <div className="flex justify-center items-center h-full">
              <FontAwesomeIcon icon={faSpinner} className="text-xl xs:text-2xl animate-spin" />
            </div>
          ) : error.earnings ? (
            <p
              className={`text-xs xs:text-sm ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}
            >
              {error.earnings}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <div
                  className={`p-2 xs:p-3 rounded-xl ${
                    darkMode ? 'bg-amber-500/20' : 'bg-amber-100'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faRupeeSign}
                    className={`text-lg xs:text-xl ${
                      darkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}
                  />
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                  }`}
                >
                  +{analyticsTimePeriod === '7' ? '15' : analyticsTimePeriod === '30' ? '32' : analyticsTimePeriod === '90' ? '28' : '45'}%
                </div>
              </div>
              <h3
                className={`text-xs xs:text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Revenue
              </h3>
              <p
                className={`text-2xl xs:text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                ₹{calculateTotalRevenue().toLocaleString()}
              </p>
              <div
                className={`absolute inset-0 ${
                  darkMode
                    ? 'bg-gradient-to-r from-gray-800/10 to-black/10'
                    : 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </>
          )}
        </div>
        <div
          className={`group relative overflow-hidden rounded-2xl p-4 xs:p-6 transition-all duration-300 hover:scale-105 ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800/20 to-black/20 backdrop-blur-xl border border-white/10'
              : 'bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl border border-purple-200/50'
          } shadow-xl hover:shadow-2xl`}
        >
          {loading.courses ? (
            <div className="flex justify-center items-center h-full">
              <FontAwesomeIcon icon={faSpinner} className="text-xl xs:text-2xl animate-spin" />
            </div>
          ) : error.courses ? (
            <p
              className={`text-xs xs:text-sm ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}
            >
              {error.courses}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <div
                  className={`p-2 xs:p-3 rounded-xl ${
                    darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`text-lg xs:text-xl ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  />
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                  }`}
                >
                  +0.{analyticsTimePeriod === '7' ? '1' : analyticsTimePeriod === '30' ? '3' : analyticsTimePeriod === '90' ? '2' : '4'}
                </div>
              </div>
              <h3
                className={`text-xs xs:text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Avg Rating
              </h3>
              <p
                className={`text-2xl xs:text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                {calculateAverageRating().rating || '0'}
              </p>
              <div
                className={`absolute inset-0 ${
                  darkMode
                    ? 'bg-gradient-to-r from-gray-800/10 to-black/10'
                    : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
        <div
          className={`rounded-2xl p-4 xs:p-6 ${
            darkMode
              ? 'bg-white/5 backdrop-blur-xl border border-white/10'
              : 'bg-white/70 backdrop-blur-xl border border-black/10'
          } shadow-xl`}
        >
          <h3
            className={`text-base xs:text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Revenue Trends
          </h3>
          <div className="h-48 xs:h-64">
            {loading.courses ? (
              <div className="flex justify-center items-center h-full">
                <FontAwesomeIcon icon={faSpinner} className="text-xl xs:text-2xl animate-spin" />
              </div>
            ) : error.courses ? (
              <p
                className={`text-xs xs:text-sm ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}
              >
                {error.courses}
              </p>
            ) : (
              <Bar data={getRevenueChartData()} options={chartOptions} />
            )}
          </div>
        </div>
        <div
          className={`rounded-2xl p-4 xs:p-6 ${
            darkMode
              ? 'bg-white/5 backdrop-blur-xl border border-white/10'
              : 'bg-white/70 backdrop-blur-xl border border-black/10'
          } shadow-xl`}
        >
          <h3
            className={`text-base xs:text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Student Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs xs:text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Course Completion Rate
              </span>
              <span
                className={`font-bold text-xs xs:text-sm ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}
              >
                {loading.progress
                  ? 'Loading...'
                  : error.progress
                  ? '0'
                  : `${calculateCompletionRate(coursesData?.[0]?._id) || 0}%`}
              </span>
            </div>
            <div
              className={`w-full bg-gray-200 rounded-full h-1.5 xs:h-2 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <div
                className="bg-green-500 h-1.5 xs:h-2 rounded-full"
                style={{
                  width: loading.progress ? '0%' : `${calculateCompletionRate(coursesData?.[0]?._id) || 0}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs xs:text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Student Satisfaction
              </span>
              <span
                className={`font-bold text-xs xs:text-sm ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}
              >
                {loading.courses
                  ? 'Loading...'
                  : error.courses
                  ? '0'
                  : `${calculateAverageRating().satisfaction}%`}
              </span>
            </div>
            <div
              className={`w-full bg-gray-200 rounded-full h-1.5 xs:h-2 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <div
                className="bg-purple-500 h-1.5 xs:h-2 rounded-full"
                style={{
                  width: loading.courses ? '0%' : `${calculateAverageRating().satisfaction}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`rounded-2xl p-4 xs:p-6 ${
          darkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10'
            : 'bg-white/70 backdrop-blur-xl border border-black/10'
        } shadow-xl`}
      >
        <h3
          className={`text-base xs:text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Top Performing Courses
        </h3>
        {loading.courses ? (
          <div className="flex justify-center items-center h-24 xs:h-32">
            <FontAwesomeIcon icon={faSpinner} className="text-xl xs:text-2xl animate-spin" />
          </div>
        ) : error.courses ? (
          <p
            className={`text-xs xs:text-sm ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}
          >
            {error.courses}
          </p>
        ) : (
          <>
            <div className="md:hidden space-y-4">
              {getTopPerformingCourses().map((course, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'border-white/10 bg-gray-800/50' : 'border-gray-200 bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-xs xs:text-sm">{course.title}</div>
                  <div
                    className={`text-xs ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    } mb-2`}
                  >
                    {course.subtitle || '0'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs xs:text-sm">
                    <div>
                      <span className="font-semibold">Students:</span> {course.totalStudents}
                    </div>
                    <div>
                      <span className="font-semibold">Revenue:</span> ₹{calculateCourseRevenue(course).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Rating:</span>{' '}
                      {course.rating > 0 ? (
                        <>
                          {course.rating} <FontAwesomeIcon icon={faStar} />
                        </>
                      ) : (
                        '0'
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Completion:</span>{' '}
                      <span
                        className={`${
                          darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'
                        } text-xs px-2 py-0.5 rounded`}
                      >
                        {loading.progress ? 'Loading...' : `${calculateCompletionRate(course._id) || 0}%`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs xs:text-sm`}>
                    <th className="text-left py-2 xs:py-3 px-3 xs:px-4">Course</th>
                    <th className="text-center py-2 xs:py-3 px-3 xs:px-4">Students</th>
                    <th className="text-center py-2 xs:py-3 px-3 xs:px-4">Revenue</th>
                    <th className="text-center py-2 xs:py-3 px-3 xs:px-4">Rating</th>
                    <th className="text-center py-2 xs:py-3 px-3 xs:px-4">Completion</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs xs:text-sm`}>
                  {getTopPerformingCourses().map((course, index) => (
                    <tr
                      key={index}
                      className={`border-t ${
                        darkMode ? 'border-white/10' : 'border-gray-200'
                      }`}
                    >
                      <td className="py-2 xs:py-3 px-3 xs:px-4">
                        <div className="font-medium">{course.title}</div>
                        <div
                          className={`text-xs ${
                            darkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}
                        >
                          {course.subtitle || '0'}
                        </div>
                      </td>
                      <td className="text-center py-2 xs:py-3 px-3 xs:px-4">
                        {course.totalStudents}
                      </td>
                      <td className="text-center py-2 xs:py-3 px-3 xs:px-4">
                        ₹{calculateCourseRevenue(course).toLocaleString()}
                      </td>
                      <td className="text-center py-2 xs:py-3 px-3 xs:px-4">
                        {course.rating > 0 ? (
                          <>
                            {course.rating} <FontAwesomeIcon icon={faStar} />
                          </>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="text-center py-2 xs:py-3 px-3 xs:px-4">
                        <span
                          className={`${
                            darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'
                          } text-xs px-2.5 py-0.5 rounded`}
                        >
                          {loading.progress ? 'Loading...' : `${calculateCompletionRate(course._id) || 0}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;