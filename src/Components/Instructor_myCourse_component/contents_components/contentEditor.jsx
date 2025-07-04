import React, { useState, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "../../../themeContext";

const Notification = ({ message, type, onClose }) => {
  const { theme } = useContext(ThemeContext);
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-md shadow-lg transition-opacity duration-300 ${
        type === "error"
          ? theme === "dark"
            ? "bg-red-600 text-white"
            : "bg-red-500 text-white"
          : theme === "dark"
          ? "bg-green-600 text-white"
          : "bg-green-500 text-white"
      }`}
      style={{ zIndex: 1000 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm sm:text-base">{message}</span>
        <button
          onClick={onClose}
          className={`ml-4 ${
            theme === "dark" ? "text-gray-200 hover:text-gray-100" : "text-white hover:text-gray-200"
          }`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const TopicEditor = ({ topic, updateTopic, lectureId, sectionId }) => {
  const { theme } = useContext(ThemeContext);
  const [title, setTitle] = useState(topic.title || "");
  const [type, setType] = useState(topic.type || "video");
  const [desc, setDesc] = useState(topic.description || "");
  const [duration, setDuration] = useState(topic.duration || 0);
  const [isDownloadable, setIsDownloadable] = useState(false);
  const [resources, setResources] = useState(topic.resources || []);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const { courseId } = useParams();
  const { state } = useLocation();
  const courseTitle = state?.courseTitle || "Course Title";

  // Show notification with message and type
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  // Validate section and lecture IDs before upload
  const validateSectionAndLecture = async (sectionId, lectureId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to validate section and lecture.");
      }

      if (!sectionId || !lectureId) {
        console.error("Missing sectionId or lectureId:", { sectionId, lectureId });
        throw new Error("Section ID or Lecture ID is missing.");
      }

      const response = await axios.get(
        `https://new-lms-backend-vmgr.onrender.com/api/v1/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const curriculum = response.data.data?.curriculum || [];
      if (!Array.isArray(curriculum) || curriculum.length === 0) {
        console.error("Curriculum is empty or not an array:", curriculum);
        throw new Error("Course curriculum is empty.");
      }

      const section = curriculum.find((section) => section._id === sectionId);
      if (!section) {
        console.error("Section not found for sectionId:", sectionId);
        throw new Error("Section not found in the course.");
      }

      const lecture = section.lectures.find((lec) => lec._id === lectureId);
 if (!lecture) {
        console.error("Lecture not found for lectureId:", lectureId, "in section:", section);
        throw new Error("Lecture not found in the section.");
      }

      return true;
    } catch (error) {
      console.error("Validation Error:", error.message);
      return false;
    }
  };

  // Handle video file selection
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // Filter out non-video files
    const validFiles = files.filter((file) => file.type.includes("video"));
    if (validFiles.length !== files.length) {
      showNotification("Only video files are allowed.");
      return;
    }

    // File size and format validation
    const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
    const newVideoFiles = [];
    const newVideoPreviews = [];

    for (const file of validFiles) {
      if (file.size > maxSizeInBytes) {
        showNotification(`File "${file.name}" exceeds 100MB limit.`);
        return;
      }
      if (!file.type.includes("video/mp4")) {
        showNotification(`File "${file.name}" is not an MP4 video. Only MP4 files are allowed.`);
        return;
      }
      newVideoFiles.push(file);
      newVideoPreviews.push({
        name: file.name,
        url: URL.createObjectURL(file),
        type: "video",
      });
    }

    setVideoFiles((prev) => [...prev, ...newVideoFiles]);
    setVideoPreviews((prev) => [...prev, ...newVideoPreviews]);
  };

  // Handle saving all data
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Please log in to save lecture data.");
        return;
      }

      // Validate sectionId and lectureId
      const isValid = await validateSectionAndLecture(sectionId, lectureId);
      if (!isValid) {
        showNotification("Cannot save lecture: Section or lecture not found. Please refresh the page and try again.");
        return;
      }

      let newResources = [...resources];

      // Upload video and metadata
      if (videoFiles.length > 0) {
        const formData = new FormData();
        formData.append("sectionId", sectionId);
        formData.append("lectureId", lectureId);
        formData.append("title", title || topic.title || "Untitled Lecture");
        formData.append("description", desc || topic.description || "");
        formData.append("type", "video");
        formData.append("isDownloadable", isDownloadable);
        formData.append("isPreview", topic.isPreview || false);
        formData.append("duration", duration || 0);
        formData.append("content", videoFiles[0]);

        resources.forEach((resource, index) => {
          if (resource.videoId) {
            formData.append(`videoId[${index}]`, resource.videoId);
          }
        });

        const contentResponse = await axios.post(
          `https://new-lms-backend-vmgr.onrender.com/api/v1/instructors/courses/${courseId}/content`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const lectureResponse = await axios.get(
          `https://new-lms-backend-vmgr.onrender.com/api/v1/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const lecture = lectureResponse.data.data.curriculum
          .find((section) => section._id === sectionId)
          ?.lectures.find((lec) => lec._id === lectureId);

        newResources = [
          ...resources,
          {
            videoId: lecture?.resources?.[lecture.resources.length - 1]?.videoId || "unknown-video-id",
            type: "video",
            name: videoFiles[0].name,
            url: lecture?.resources?.[lecture.resources.length - 1]?.url || videoPreviews[videoPreviews.length - 1].url,
          },
        ];
      }

      // Update topic
      updateTopic({
        title,
        type: "video",
        description: desc,
        duration,
        isDownloadable,
        isPreview: topic.isPreview || false,
        resources: newResources,
      });

      // Clear local file states
      setVideoFiles([]);
      setVideoPreviews([]);

      showNotification("Lecture saved successfully!", "success");
    } catch (error) {
      console.error("Error saving lecture:", error);
      if (error.response) {
        if (error.response.status === 404) {
          showNotification(
            `Failed to save lecture: ${error.response.data.message || "Section or lecture not found."}`
          );
          return;
        }
        if (error.response.status === 500 && error.response.data.message === "Unexpected field") {
          showNotification(
            "Failed to save lecture: Unexpected field in the request. Please ensure only valid fields are sent."
          );
          return;
        }
      }
      showNotification("Failed to save lecture.");
    }
  };

  return (
    <div
      className={`sm:p-0 lg:py-6 lg:px-6 rounded-lg space-y-6 max-w-4xl mx-auto ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      {/* <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      /> */}
      <h1
        className={`!text-[2rem] font-bold pb-2 ${
          theme === "dark" ? "text-gray-100" : "text-slate-900"
        }`}
      >
        {courseTitle}
      </h1>
      <div className="space-y-5">
        <div className="space-y-1">
          <label
            htmlFor="title"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Lecture Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter lecture title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border rounded-md p-3 text-base focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-black"
            }`}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="type"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Lecture Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`w-full border p-3 rounded-md text-base focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-black"
            }`}
            disabled
          >
            <option value="video">Video</option>
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="description"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Description
          </label>
          <textarea
            id="description"
            rows="4"
            placeholder="Enter lecture description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={`w-full border rounded-md p-3 text-base focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition resize-none ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-black"
            }`}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="duration"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Duration (in minutes)
          </label>
          <input
            id="duration"
            type="number"
            placeholder="Duration in minutes"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className={`w-full border rounded-md p-3 text-base focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-black"
            }`}
            min="0"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="isDownloadable"
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Allow Downloads
          </label>
          <input
            id="isDownloadable"
            type="checkbox"
            checked={isDownloadable}
            onChange={(e) => setIsDownloadable(e.target.checked)}
            className={`h-4 w-4 text-[#49BBBD] border rounded focus:ring-[#49BBBD] ${
              theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"
            }`}
          />
        </div>
        <div className="space-y-1">
          <label
            className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : " text-gray-700"
            }`}
          >
            Upload Video
          </label>
          <label
            className={`inline-flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer transition ${
              theme === "dark"
                ? "border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                : "border-gray-300 text-gray-700 hover:bg-[#49BBBD] hover:text-white"
            }`}
          >
            📹 Upload Video
            <input
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
        {(videoPreviews.length > 0 || resources.length > 0) && (
          <div className="space-y-2">
            <h3
              className={`text-base font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Uploaded Videos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...resources, ...videoPreviews].map((file, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Video Preview: {file.name}
                    </p>
                    <video
                      src={file.url}
                      controls
                      className={`w-full max-w-md h-40 object-contain rounded-md border ${
                        theme === "dark" ? "border-gray-600" : "border-gray-300"
                      }`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-md text-white transition cursor-pointer ${
            theme === "dark"
              ? "bg-[#2F5D6B] hover:bg-[#4A7A8A]"
              : "bg-[#49BBBD] hover:bg-[#3a9a9b]"
          }`}
        >
          Save Lecture
        </button>
      </div>
    </div>
  );
};

export default TopicEditor;