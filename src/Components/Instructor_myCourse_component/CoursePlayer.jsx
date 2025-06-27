import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ThemeContext } from '../../themeContext';

export default function CoursePlayer() {
  const { theme: darkMode } = useContext(ThemeContext);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [courseTitle, setCourseTitle] = useState('Course Player');
  const [instructorName, setInstructorName] = useState('Unknown Instructor');
  const [activeLecture, setActiveLecture] = useState({ moduleIndex: null, lessonIndex: null });
  const [contentError, setContentError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const courseRes = await axios.get(`https://lms-backend-flwq.onrender.com/api/v1/instructors/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (courseRes.data.success && courseRes.data.data) {
          setCourseTitle(courseRes.data.data.title || 'Course Not Found');
          const formattedModules = courseRes.data.data.curriculum.map((section) => ({
            title: section.sectionTitle || 'Untitled Section',
            lessons: (section.lectures || []).map((lecture, index) => ({
              title: lecture.title || `Lesson ${index + 1}`,
              time: lecture.duration
                ? `${Math.floor(lecture.duration / 60)}:${(lecture.duration % 60).toString().padStart(2, '0')}`
                : '0:00',
              content: lecture.content || {},
            })),
            active: false,
          }));

          setModules(formattedModules);

          if (formattedModules.length > 0 && formattedModules[0].lessons.length > 0) {
            const firstLecture = formattedModules[0].lessons[0];
            if (firstLecture.content?.url) {
              setSelectedVideo({
                title: firstLecture.content.title || firstLecture.title,
                description: firstLecture.content.description || 'No description available.',
                url: firstLecture.content.url,
              });
              setActiveLecture({ moduleIndex: 0, lessonIndex: 0 });
              setModules((prev) => [
                { ...prev[0], active: true },
                ...prev.slice(1),
              ]);
            } else {
              setContentError('No playable videos available for this course.');
            }
          } else {
            setContentError('No lessons available for this course.');
          }
        } else {
          setContentError('Failed to load course content.');
        }
      } catch (error) {
        setContentError('Failed to load course data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const toggleModule = (index) => {
    setModules((prevModules) =>
      prevModules.map((mod, i) => ({
        ...mod,
        active: i === index ? !mod.active : mod.active,
      }))
    );
  };

  if (isLoading) {
    return (
      <div className={`p-4 flex flex-col min-h-[calc(100vh-3.5rem)] w-full pt-16 md:pt-0 items-center justify-center ${
        darkMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-900'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base font-semibold">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 flex flex-col min-h-[calc(100vh-3.5rem)] w-full pt-16 md:pt-10 ${
      darkMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-900'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 rounded-xl shadow-lg w-full gap-y-2 ${
          darkMode === 'dark' ? 'bg-gradient-to-r from-gray-800 to-black text-white' : 'bg-gradient-to-r from-white to-white text-black'
        }`} text-black
        
      >
        <div className="flex items-center gap-3 min-w-0 w-full sm:flex-1">
          <div className="min-w-0 flex-1">
            <h1 className={`!text-[1.5rem] font-bold truncate ${darkMode === 'dark' ? 'text-white' : 'text-black'}`}>
              Course: {courseTitle}
            </h1>
          </div>
        </div>
        <Link
          to={`/dashboard/course-editor/${courseId}`}
          className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
            darkMode === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white shadow-lg shadow-gray-800/25' : 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25'
          }`}
        >
          Edit Course
        </Link>
      </motion.div>

      {contentError && (
        <div className={`p-3 rounded-xl mt-4 text-sm text-center shadow ${
          darkMode === 'dark' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {contentError}
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mt-6 w-full max-w-7xl mx-auto flex-1">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 flex flex-col gap-4"
        >
          <div className={`rounded-xl overflow-hidden shadow-xl p-4 flex flex-col ${
            darkMode === 'dark' ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/70 backdrop-blur-none border border-gray-200'
          }`}>
            {selectedVideo?.url ? (
              <video
                src={selectedVideo.url}
                controls
                controlsList="nodownload"
                className="rounded-xl object-cover w-full max-h-[500px] border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className={`rounded-xl w-full h-[400px] flex items-center justify-center ${
                darkMode === 'dark' ? 'bg-white/10' : 'bg-gray-200'
              }`}>
                <p className={`text-sm ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select a lesson to play the video.
                </p>
              </div>
            )}
            {selectedVideo && (
              <div className="mt-4">
                <h2 className={`text-xl font-semibold ${darkMode === 'dark' ? 'text-cyan-400' : 'text-blue-900'}`}>
                  {selectedVideo.title || 'Untitled Video'}
                </h2>
                <p className={`text-sm ${darkMode === 'dark' ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                  {selectedVideo.description || 'No description available.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 flex flex-col"
        >
          <div className={`p-4 rounded-xl shadow-xl h-fit flex flex-col overflow-hidden ${
            darkMode === 'dark' ? 'bg-gradient-to-b from-gray-800 to-black text-white border border-white/10' : 'bg-gradient-to-b from-white to-gray-100 text-gray-900 border border-gray-200'
          }`}>
            <p className={`text-sm font-semibold ${darkMode === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
              {modules.length} Modules
            </p>
            <div className="flex-1 overflow-y-auto mt-4 pr-2" style={{ maxHeight: 'calc(100vh - 230px)' }}>
              {modules.length === 0 ? (
                <p className={`text-sm ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No modules available.
                </p>
              ) : (
                modules.map((mod, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="mb-4"
                  >
                    <div className={`border rounded-lg p-3 transition-all hover:shadow-md ${
                      darkMode === 'dark' ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-white/70'
                    }`}>
                      <div
                        className={`flex justify-between items-center cursor-pointer font-semibold text-sm ${
                          darkMode === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}
                        onClick={() => toggleModule(i)}
                      >
                        <span className="truncate flex items-center gap-2">
                          <Play className="w-4 h-4 text-teal-500" />
                          {mod.title}
                        </span>
                        {mod.active ? (
                          <ChevronDown className={`w-4 h-4 ${darkMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                        ) : (
                          <span className={`text-xs ${darkMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {mod.lessons.length} Lessons
                          </span>
                        )}
                      </div>
                      <AnimatePresence>
                        {mod.active && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-2 space-y-2 text-sm"
                          >
                            {mod.lessons.map((lesson, idx) => (
                              <motion.div
                                key={idx}
                                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                                  activeLecture.moduleIndex === i && activeLecture.lessonIndex === idx
                                    ? darkMode === 'dark'
                                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg animate-pulse'
                                      : 'bg-gradient-to-r from-teal-400 to-cyan-400 text-white shadow-lg animate-pulse'
                                    : darkMode === 'dark'
                                    ? 'bg-white/10 hover:bg-white/20 text-cyan-400'
                                    : 'bg-gray-50 hover:bg-gray-100 text-teal-600'
                                }`}
                                onClick={() => {
                                  if (lesson.content?.url) {
                                    setSelectedVideo({
                                      title: lesson.content.title || lesson.title,
                                      description: lesson.content.description || 'No description available.',
                                      url: lesson.content.url,
                                    });
                                    setActiveLecture({ moduleIndex: i, lessonIndex: idx });
                                  }
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className="flex items-center gap-2">
                                  <Play className={`w-3 h-3 ${
                                    activeLecture.moduleIndex === i && activeLecture.lessonIndex === idx
                                      ? 'text-white'
                                      : darkMode === 'dark' ? 'text-cyan-400' : 'text-teal-600'
                                  }`} />
                                  <span className="truncate">{lesson.title || `Lesson ${idx + 1}`}</span>
                                </span>
                                <span className={`text-xs ${
                                  activeLecture.moduleIndex === i && activeLecture.lessonIndex === idx
                                    ? 'text-white'
                                    : darkMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {lesson.time || '0:00'}
                                </span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}