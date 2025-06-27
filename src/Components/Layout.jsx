import { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sideBar';
import Navbar from './Navbar';
import { ThemeProvider, ThemeContext } from '../themeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function MainContent({ isSidebarOpen, setIsSidebarOpen, sidebarExpanded, isMobile }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`flex-1 overflow-auto relative transition-all duration-300 ease-in-out ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-slate-900'
      } ${sidebarExpanded ? 'sm:ml-72' : 'sm:ml-20'}`}
    >
      {isMobile && !isSidebarOpen && (
        <button
          className={`fixed top-6 left-4 z-[100011] p-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-800 hover:bg-gray-100'
          } border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
          onClick={() => {
            console.log('Menu button clicked, toggling sidebar'); // Debug log
            setIsSidebarOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>
      )}
      <Navbar setIsSidebarOpen={setIsSidebarOpen} isMobile={isMobile} />
      <div className="mt-16 sm:mt-20">
        <Outlet />
      </div>
    </div>
  );
}

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(
    localStorage.getItem('sidebarBehavior') === 'expanded'
  );
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile && isSidebarOpen) {
        setIsSidebarOpen(false); // Close sidebar on non-mobile screens
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen relative overflow-hidden">
        <div
          className={`fixed top-0 left-0 h-full shadow-lg transform transition-transform duration-300 z-[100010] 
            ${isMobile && isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:static sm:block`}
        >
          <Sidebar
            onLinkClick={() => setIsSidebarOpen(false)}
            setSidebarExpanded={setSidebarExpanded}
            setActiveSection={setActiveSection}
            activeSection={activeSection}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isMobile={isMobile}
          />
        </div>

        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-opacity-10 backdrop-blur-sm backdrop-brightness-90 z-[100009] sm:hidden"
            onClick={() => {
              console.log('Backdrop clicked, closing sidebar'); // Debug log
              setIsSidebarOpen(false);
            }}
          />
        )}

        <MainContent
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          sidebarExpanded={sidebarExpanded}
          isMobile={isMobile}
        />
      </div>
    </ThemeProvider>
  );
}