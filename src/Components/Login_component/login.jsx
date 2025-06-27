
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginUser } from '../../utils/auth';
import { FaEye, FaEyeSlash, FaSun, FaMoon } from 'react-icons/fa';
import { ThemeContext } from '../../themeContext';

const Notification = ({ message, type, onClose }) => {
  const { theme } = useContext(ThemeContext);
  if (!message) return null;

  return (
    <div
      className={`fixed top-2 sm:top-4 right-2 sm:right-4 p-3 sm:p-4 rounded-md shadow-lg transition-opacity duration-300 z-[1000] max-w-[90%] sm:max-w-md ${
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
        <span className="text-sm sm:text-base">{message}</span>
        <button
          onClick={onClose}
          className={`ml-2 sm:ml-4 ${
            theme === 'dark' ? 'text-gray-200 hover:text-gray-100' : 'text-white hover:text-gray-200'
          }`}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const Login = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const res = await axios.post(
        'https://lms-backend-flwq.onrender.com/api/v1/auth/login',
        formData
      );

      const { token, role } = res.data.data;

      if (role !== 'instructor') {
        showNotification(
          `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)}s are not allowed on this page.`
        );
        return;
      }

      loginUser(token);
      showNotification('Login successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`min-h-screen w-screen flex flex-col sm:flex-row ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-[1100]">
        <button
          onClick={toggleTheme}
          className={`relative inline-flex cursor-pointer items-center h-6 sm:h-8 w-12 sm:w-16 rounded-full transition-colors duration-300 focus:outline-none ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
<span
  className={`inline-flex h-4 sm:h-6 w-4 sm:w-6 items-center justify-center cursor-pointer rounded-full bg-white transform transition-transform duration-300 text-xs sm:text-sm ${
    theme === 'dark' ? 'translate-x-6 sm:translate-x-8' : 'translate-x-1'
  }`}
          >
            {theme === 'dark' ? (
              <FaMoon className="text-gray-800" />
            ) : (
              <FaSun className="text-yellow-500" />
            )}
          </span>
        </button>
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {/* Left side image */}
      <div
        className="sm:w-1/2 w-full h-48 sm:h-auto bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/login_img.jpg')`,
        }}
      >
        <div
          className={`h-full w-full flex items-center justify-center bg-opacity-70 backdrop-blur-sm ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-transparent'
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl lg:text-3xl font-bold text-center px-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-white'
            }`}
          >
            Welcome Back, Instructor
          </h2>
        </div>
      </div>

      {/* Right side login form */}
      <div
        className={`sm:w-1/2 w-full flex items-center justify-center p-4 sm:p-8 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-xl shadow-md ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            Login to Your Account
          </h2>

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className={`block text-xs sm:text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-xs sm:text-sm ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white text-black'
              }`}
              aria-describedby="email-error"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4 relative">
            <label
              htmlFor="password"
              className={`block text-xs sm:text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-xs sm:text-sm pr-10 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white text-black'
              }`}
              aria-describedby="password-error"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`absolute right-3 top-9 sm:top-10 cursor-pointer ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 sm:py-3 rounded-lg transition duration-300 flex items-center justify-center text-xs sm:text-sm disabled:opacity-50 ${
              theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label="Login"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;