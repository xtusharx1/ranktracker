import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiUsers, FiFileText, FiBarChart, FiBook, FiClock, FiSettings, FiClipboard, FiCalendar, FiMap } from 'react-icons/fi';

const Sidebar = ({ role }) => {
  const adminRoutes = [
    { path: '/', name: 'Dashboard', icon: <FiHome /> },
    { path: '/test-records', name: 'Test Records', icon: <FiFileText /> },
    { path: '/class-performance', name: 'Class Performance', icon: <FiBarChart /> },
    { path: '/student-performance', name: 'Student Performance', icon: <FiUsers /> },
    { path: '/fee-records', name: 'Fee Records', icon: <FiClipboard /> },
    { path: '/fee-reminders', name: 'Fee Reminders', icon: <FiClock /> },
    { path: '/notice', name: 'Notice', icon: <FiClipboard /> },
    { path: '/attendance', name: 'Attendance', icon: <FiCalendar /> },
    
    { path: '/view-attendance', name: 'View Attendance', icon: <FiCalendar /> },
    { path: '/students', name: 'Students', icon: <FiUsers /> },
    { path: '/course', name: 'Course', icon: <FiBook /> },
    { path: '/user-roles', name: 'User Roles', icon: <FiSettings /> },
    { path: '/school-map', name: 'School Map', icon: <FiMap/> },
    {path: '/class-records', name: 'Classwork Records', icon: <FiBook />}
  ];

  const teacherRoutes = [
    { path: '/', name: 'Dashboard', icon: <FiHome /> },
    { path: '/test-records', name: 'Test Records', icon: <FiFileText /> },
    { path: '/class-performance', name: 'Class Performance', icon: <FiBarChart /> },
    { path: '/student-performance', name: 'Student Performance', icon: <FiUsers /> },
    { path: '/attendance', name: 'Attendance', icon: <FiClipboard /> },
    {path: '/class-records', name: 'Classwork Records', icon: <FiBook />},
    { path: '/view-attendance', name: 'View Attendance', icon: <FiCalendar /> },
  ];

  const counselorRoutes = [
    { path: '/', name: 'Dashboard', icon: <FiHome /> },
    { path: '/test-records', name: 'Test Records', icon: <FiFileText /> },
    { path: '/class-performance', name: 'Class Performance', icon: <FiBarChart /> },
    { path: '/student-performance', name: 'Student Performance', icon: <FiUsers /> },
    { path: '/fee-records', name: 'Fee Records', icon: <FiClipboard /> },
    { path: '/fee-reminders', name: 'Fee Reminders', icon: <FiClock /> },
    { path: '/notice', name: 'Notice', icon: <FiClipboard /> },
    
    { path: '/view-attendance', name: 'View Attendance', icon: <FiCalendar /> },
    { path: '/students', name: 'Students', icon: <FiUsers /> },
  ];

  const getRoutes = () => {
    switch (role) {
      case 'admin':
        return adminRoutes;
      case 'teacher':
        return teacherRoutes;
      case 'counselor':
        return counselorRoutes;
      default:
        return [];
    }
  };

  const routes = getRoutes();

  return (
    <div className="w-72 fixed sidebar bg-white text-black shadow-none z-50">
      <div className="h-full overflow-auto">
        <div className="flex items-center p-6">
          <h2 className="text-xl font-semibold">Dabad Academy</h2>
        </div>
        <div className="mt-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="flex items-center p-4 text-black hover:bg-gray-100 transition-all duration-300 ease-in-out rounded-md mb-2"
            >
              <div className="mr-3 text-xl">{route.icon}</div>
              <span className="text-lg">{route.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
