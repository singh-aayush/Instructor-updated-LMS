
import { useContext } from 'react';
import { ThemeContext } from '../../themeContext';

function PreviewModal({ courseData, coverImage, onClose }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${
        theme === 'dark' ? 'bg-black/50' : 'bg-white/40'
      } backdrop-blur-sm`}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 text-lg cursor-pointer ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Close preview"
        >
          ✕
        </button>


        {/* Title & Subtitle */}
        <h2
          className={`text-lg sm:text-2xl font-bold mb-1 ${
            theme === 'dark' ? 'text-gray-100' : 'text-slate-800'
          }`}
        >
          {courseData.title || 'Untitled Course'}
        </h2>
        <p
          className={`text-xs sm:text-sm mb-3 sm:mb-4 border-b pb-2 ${
            theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
          }`}
        >
          <strong>Subtitle:</strong> {courseData.subtitle || 'N/A'}<br />
          <strong>Language:</strong> {courseData.language || 'N/A'} |{' '}
          <strong>Category:</strong> {courseData.category || 'N/A'} |{' '}
          <strong>Subcategory:</strong> {courseData.subCategory || 'N/A'}
        </p>

        {/* Description */}
        <div className="mb-3 sm:mb-4">
          <h3
            className={`font-medium mb-1 text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            Description
          </h3>
          <p
            className={`text-xs sm:text-sm whitespace-pre-wrap p-2 sm:p-3 rounded-lg ${
              theme === 'dark' ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'
            }`}
          >
            {courseData.description || 'No description provided.'}
          </p>
        </div>

        {/* Course Details */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm border-t pt-3 sm:pt-4 ${
            theme === 'dark' ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
          }`}
        >
          <p>
            <strong>Level:</strong> {courseData.level || 'N/A'}
          </p>
          <p>
            <strong>Duration:</strong> {courseData.duration || 0} hours
          </p>
          <p>
            <strong>Price:</strong> ₹{courseData.price || 0}
          </p>
          <p>
            <strong>Discount Price:</strong> ₹{courseData.discountPrice || 0}
          </p>
        </div>

        {/* Prerequisites */}
        <div className="mt-3 sm:mt-4">
          <h3
            className={`font-medium mb-1 text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            Prerequisites
          </h3>
          {courseData.prerequisites?.length > 0 ? (
            <ul
              className={`list-disc pl-4 text-xs sm:text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {courseData.prerequisites.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p
              className={`text-xs sm:text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              No prerequisites provided.
            </p>
          )}
        </div>

        {/* Learning Outcomes */}
        <div className="mt-3 sm:mt-4">
          <h3
            className={`font-medium mb-1 text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            Learning Outcomes
          </h3>
          {courseData.learningOutcomes?.length > 0 ? (
            <ul
              className={`list-disc pl-4 text-xs sm:text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {courseData.learningOutcomes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p
              className={`text-xs sm:text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              No learning outcomes provided.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;