
import { useContext } from 'react';
import { ThemeContext } from '../../themeContext';

export default function SearchBar({ searchTerm, setSearchTerm }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by assessment title or student name..."
        className={`w-full border rounded p-3 text-sm sm:text-base focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition outline-none ${
          theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-300 bg-white text-black'
        }`}
      />
    </div>
  );
}