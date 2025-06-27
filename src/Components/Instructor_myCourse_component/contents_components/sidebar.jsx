import React, { useContext } from "react";
import { ThemeContext } from "../../../themeContext";

const UnitSidebar = ({
  units,
  selectedUnitId,
  selectedTopicId,
  setSelectedUnitId,
  setSelectedTopicId,
  deleteUnit,
  deleteTopic,
  onAddUnitClick,
  onAddTopicClick,
  closeSidebar,
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
    className={`border-r-2 pt-4 h-full overflow-y-auto rounded-[0px] md:rounded-[11px] ${
      theme === "dark"
        ? "bg-gray-800 border-gray-600 text-white"
        : "bg-slate-100 border-gray-200 text-black"
    } md:pt-4 pt-16`}
  >
  
      <div className="h-6 sm:h-4 px-4 flex justify-end items-center lg:hidden">
        <button
          onClick={closeSidebar}
          className={`text-xl cursor-pointer transition ${
            theme === "dark"
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-black"
          }`}
        >
          ✕
        </button>
      </div>

      <div
        className={`sidebar-header px-4 flex gap-3 ${
          theme === "dark" ? "text-teal-400" : "text-blue-900"
        }`}
      >
        <button
          onClick={onAddUnitClick}
          className={`cursor-pointer transition ${
            theme === "dark" ? "text-teal-300 hover:text-teal-200" : "text-blue-900 hover:text-blue-700"
          }`}
        >
          + Unit
        </button>
        <button
          onClick={onAddTopicClick}
          disabled={!selectedUnitId}
         className={`cursor-pointer transition ${
            theme === "dark"
              ? selectedUnitId
                ? "text-teal-300 hover:text-teal-200"
                : "text-gray-500 opacity-50"
              : selectedUnitId
              ? "text-blue-900 hover:text-blue-700"
              : "text-gray-400 opacity-50"
          }`}
        >
          + Lecture
        </button>
      </div>

      <div className="unit-list py-[5px] px-[10px]">
        {units.map((unit) => (
          <div key={unit.id} className="unit-item">
            <div
              className={`unit-title font-bold flex justify-between items-center py-[5px] px-[7px] cursor-pointer ${
                unit.id === selectedUnitId
                  ? theme === "dark"
                    ? "bg-gray-700 rounded px-2"
                    : "bg-gray-300 rounded px-2"
                  : ""
              }`}
              onClick={() => {
                setSelectedUnitId(unit.id === selectedUnitId ? null : unit.id);
                setSelectedTopicId(null);
              }}
            >
              <span
                className={`flex items-center gap-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                <span className="text-sm">
                  {unit.id === selectedUnitId ? "▾" : "▸"}
                </span>
                {unit.name}
              </span>
              <button
                onClick={() => deleteUnit(unit.id)}
                className={`transition ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-red-400"
                    : "text-gray-600 hover:text-red-600"
                }`}
              >
                🗑
              </button>
            </div>

            {unit.id === selectedUnitId &&
              unit.topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`topic-item pl-[2rem] py-[3px] px-[7px] flex justify-between items-center cursor-pointer ${
                    topic.id === selectedTopicId
                      ? theme === "dark"
                        ? "bg-gray-700 rounded px-2"
                        : "bg-gray-300 rounded px-2"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                  }}
                >
                  <span
                    className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                  >
                    {topic.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTopic(unit.id, topic.id);
                    }}
                    className={`transition ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-red-400"
                        : "text-gray-600 hover:text-red-600"
                    }`}
                  >
                    🗑
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitSidebar;