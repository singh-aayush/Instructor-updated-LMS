import { useState, useEffect, useContext } from 'react';
import GeneralInfo from './generalInfo';
import PreviewModal from './previewPage';
import axios from 'axios';
import Navbar from '../Navbar';
import { ThemeContext } from '../../themeContext';
import { useNavigate } from 'react-router-dom';

function CreateCourse() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailStatus, setThumbnailStatus] = useState('');
  const [courseId, setCourseId] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [language, setLanguage] = useState('English');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [prerequisites, setPrerequisites] = useState([]);
  const [learningOutcomes, setLearningOutcomes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showPreview ? 'hidden' : 'auto';
  }, [showPreview]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      setThumbnailStatus('Only image files (e.g., .jpg, .png) are allowed for the thumbnail.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setThumbnail(file);
    setThumbnailPreview(previewUrl);
    setThumbnailStatus('Thumbnail selected. Will be uploaded after course creation.');
  };

  const uploadThumbnail = async (courseId) => {
    if (!thumbnail || !courseId) {
      console.log('Upload aborted: Missing thumbnail or courseId', {
        hasThumbnail: !!thumbnail,
        courseId,
      });
      setThumbnailStatus('No thumbnail selected or course ID missing. Redirecting to courses page...');
      setTimeout(() => navigate('/dashboard/my-courses'), 3000);
      return;
    }

    if (typeof courseId !== 'string' || courseId.trim() === '') {
      console.log('Invalid courseId:', courseId);
      setThumbnailStatus('Invalid course ID. Redirecting to courses page...');
      setTimeout(() => navigate('/dashboard/my-courses'), 3000);
      return;
    }

    setThumbnailStatus('Uploading thumbnail... Please wait, you will be redirected to the courses page after the upload completes.');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authorization token found in localStorage');
        setThumbnailStatus('Please log in to upload thumbnail. Redirecting to courses page...');
        setTimeout(() => navigate('/dashboard/my-courses'), 3000);
        return;
      }

      const thumbnailFormData = new FormData();
      thumbnailFormData.append('thumbnail', thumbnail, thumbnail.name);

      const response = await axios.post(
        `https://lms-backend-flwq.onrender.com/api/v1/instructors/courses/${courseId}/thumbnail`,
        thumbnailFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setThumbnailStatus('Thumbnail uploaded successfully! Redirecting to courses page...');
        setTimeout(() => navigate('/dashboard/my-courses'), 3000);
      } else {
        console.log('Unexpected API response:', response.data);
        setThumbnailStatus('Thumbnail upload failed: Invalid server response. Redirecting to courses page...');
        setTimeout(() => navigate('/dashboard/my-courses'), 3000);
      }
    } catch (error) {
      console.error('Thumbnail upload error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      setThumbnailStatus(
        `${error.response?.data?.message || 'Failed to upload thumbnail.'} Redirecting to courses page...`
      );
      setTimeout(() => navigate('/dashboard/my-courses'), 3000);
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authorization token for course creation');
        setThumbnailStatus('Authorization token is missing.');
        return false;
      }

      const response = await axios.post(
        'https://lms-backend-flwq.onrender.com/api/v1/instructors/courses',
        courseData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data?._id) {
        const newCourseId = response.data.data._id;
        setCourseId(newCourseId);
        setThumbnailStatus('Course created! Uploading thumbnail...');
        setTimeout(() => uploadThumbnail(newCourseId), 2000);
        return true;
      } else {
        console.log('Course creation failed: Invalid response', response.data);
        setThumbnailStatus('Something went wrong while creating course.');
        return false;
      }
    } catch (error) {
      console.error('Course creation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setThumbnailStatus(error.response?.data?.message || 'Failed to create course.');
      return false;
    }
  };

  const courseData = {
    title,
    subtitle,
    description,
    category,
    subCategory,
    language,
    level,
    duration,
    price,
    discountPrice,
    prerequisites,
    learningOutcomes,
  };

  return (
      <div>
      <Navbar notifications={[]} profileInitial="AP" />
    <div
      className={`min-h-screen px-4 pt-6 sm:px-6 md:px-6 py-[5px] ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-black'
      }`}
    >
      {/* Course Form Container */}
      <div
        className={`w-full mx-auto p-4 sm:p-6 rounded-xl shadow-md mt-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <h1
          className={`!text-[1.5rem] !sm:text-[1rem] font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
        >
          Create New Course
        </h1>
        {/* Thumbnail Upload */}
        <div className="space-y-4 mb-6">
          <label
            className={`block text-xs sm:text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Upload Thumbnail
          </label>
          <label
            className={`inline-flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer transition ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                : 'border-gray-300 text-gray-700 hover:bg-teal-600 hover:text-white'
            }`}
          >
            🖼️ Upload Thumbnail
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleThumbnailUpload}
            />
          </label>
          {thumbnailPreview && (
            <div className="space-y-2 mt-4">
              <h3
                className={`text-xs sm:text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Thumbnail Preview
              </h3>
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className={`w-48 h-28 object-cover rounded-md border ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}
              />
            </div>
          )}
          {thumbnailStatus && (
            <p
              className={`mt-3 text-xs sm:text-sm ${
                thumbnailStatus.includes('successfully')
                  ? theme === 'dark'
                    ? 'text-green-400'
                    : 'text-green-600'
                  : theme === 'dark'
                  ? 'text-red-400'
                  : 'text-red-600'
              }`}
            >
              {thumbnailStatus}
            </p>
          )}
        </div>
        <GeneralInfo
          title={title}
          setTitle={setTitle}
          subtitle={subtitle}
          setSubtitle={setSubtitle}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          subCategory={subCategory}
          setSubCategory={setSubCategory}
          language={language}
          setLanguage={setLanguage}
          level={level}
          setLevel={setLevel}
          duration={duration}
          setDuration={setDuration}
          price={price}
          setPrice={setPrice}
          discountPrice={discountPrice}
          setDiscountPrice={setDiscountPrice}
          prerequisites={prerequisites}
          setPrerequisites={setPrerequisites}
          learningOutcomes={learningOutcomes}
          setLearningOutcomes={setLearningOutcomes}
          onPreview={() => setShowPreview(true)}
          onSave={handleSaveCourse}
        />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          courseData={courseData}
          coverImage={coverImage}
          thumbnail={thumbnailPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
    </div>
  );
}

export default CreateCourse;