
import React, { useContext } from "react";
import { ThemeContext } from "../../../themeContext";

const FilePreview = ({ file, onDelete }) => {
  const { theme } = useContext(ThemeContext);
  if (!file) return null;

  const { type, name, url } = file;

  return (
    <div
      className={`border rounded-md p-3 shadow-sm relative ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600 text-white"
          : "bg-gray-50 border-gray-200 text-black"
      }`}
    >
      {onDelete && (
        <button
          onClick={onDelete}
          className={`absolute top-2 right-2 w-[20px] h-[20px] text-sm cursor-pointer transition ${
            theme === "dark"
              ? "text-gray-300 bg-gray-700 hover:text-white hover:bg-gray-600"
              : "text-white bg-black hover:text-black hover:bg-white"
          }`}
        >
          ✖
        </button>
      )}

      {/* Video preview */}
      {type === "video" && (
        <video
          controls
          className={`w-full h-40 object-cover rounded-md mb-2 ${
            theme === "dark" ? "border-gray-600" : "border-gray-200"
          }`}
          src={url}
        />
      )}

      {/* PDF preview */}
      {type === "pdf" && (
        <div
          className={`h-40 overflow-hidden flex items-center justify-center rounded-md mb-2 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-200"
          }`}
        >
          <embed src={url} type="application/pdf" width="100%" height="100%" />
        </div>
      )}

      {/* Image preview */}
      {type === "image" && (
        <img
          src={url}
          alt={name}
          className={`w-full h-40 object-cover rounded-md mb-2 ${
            theme === "dark" ? "border-gray-600" : "border-gray-200"
          }`}
        />
      )}

      {/* File name */}
      <p
        className={`text-sm truncate text-center ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {name}
      </p>
    </div>
  );
};

export default FilePreview;