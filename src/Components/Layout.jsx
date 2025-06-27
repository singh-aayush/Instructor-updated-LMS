import { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sideBar';
import Navbar from './Navbar';
import { ThemeProvider, ThemeContext } from '../themeContext';

function MainContent({ isSidebarOpen, setIsSidebarOpen, sidebarExpanded, isMobile }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`flex-1 overflow-auto relative transition-all duration-300 ease-in-out ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-100 text-slate-900'
      } ${sidebarExpanded ? 'sm:ml-72' : 'sm:ml-20'}`}
    >
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
      // console.log('Screen size changed, isMobile:', mobile); // Debug log
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
          className={`fixed top-0 left-0 h-full shadow-lg transform transition-transform duration-300 z-[50] 
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
            className="fixed inset-0 bg-opacity-10 backdrop-blur-sm backdrop-brightness-90 z-[90] sm:hidden"
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