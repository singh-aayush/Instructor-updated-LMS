import { useState, useContext } from 'react';
import { ThemeContext } from '../../themeContext';
import PreviewModal from './previewPage';

function GeneralInfo({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  description,
  setDescription,
  category,
  setCategory,
  subCategory,
  setSubCategory,
  language,
  setLanguage,
  level,
  setLevel,
  duration,
  setDuration,
  price,
  setPrice,
  discountPrice,
  setDiscountPrice,
  prerequisites,
  setPrerequisites,
  learningOutcomes,
  setLearningOutcomes,
  onPreview,
  onSave,
}) {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleArrayInput = (value, setter) => {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    setter(items);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

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

    const success = await onSave(courseData);
    if (success) {
      setMessage('Course saved successfully! Waiting for thumbnail upload...');
    } else {
      setMessage('Failed to save course.');
    }
    setLoading(false);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
      {/* Preview Modal */}
      {isPreviewOpen && (
        <PreviewModal
          courseData={{
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
          }}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Course Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Learn TypeScript"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Course Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Build complex applications with Typescript"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          className={`block text-xs sm:text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Course Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write course description..."
          rows={4}
          className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm resize-none focus:ring-2 focus:ring-teal-600 outline-none ${
            theme === 'dark'
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-300 bg-white text-black'
          }`}
        />
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Web Development"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Subcategory
          </label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="e.g. React"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
      </div>

      {/* Language & Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          >
            <option value="">Select Language</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          >
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Duration, Price & Discount Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Duration (hrs)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={1}
            placeholder="1"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Price (₹)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
            placeholder="0"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Discount Price (₹)
          </label>
          <input
            type="number"
            value={discountPrice}
            onChange={(e) => setDiscountPrice(Number(e.target.value))}
            min={0}
            placeholder="0"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
      </div>

      {/* Prerequisites & Learning Outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Prerequisites (comma separated)
          </label>
          <input
            type="text"
            value={prerequisites?.join(', ') || ''}
            onChange={(e) => handleArrayInput(e.target.value, setPrerequisites)}
            placeholder="e.g. Basic JavaScript, React Basics"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
        <div>
          <label
            className={`block text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Learning Outcomes (comma separated)
          </label>
          <input
            type="text"
            value={learningOutcomes?.join(', ') || ''}
            onChange={(e) => handleArrayInput(e.target.value, setLearningOutcomes)}
            placeholder="e.g. Build scalable apps, Master state"
            className={`w-full border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none ${
              theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
            theme === 'dark'
              ? 'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50'
              : 'bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50'
          }`}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handlePreview}
          className={`border px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
            theme === 'dark'
              ? 'border-teal-400 text-teal-400 hover:bg-teal-900'
              : 'border-teal-600 text-teal-600 hover:bg-teal-50'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <p
          className={`mt-3 sm:mt-4 text-xs sm:text-sm ${
            message.includes('successfully')
              ? theme === 'dark'
                ? 'text-green-400'
                : 'text-green-600'
              : theme === 'dark'
              ? 'text-red-400'
              : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default GeneralInfo;