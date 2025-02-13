import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useStateContext } from './contexts/ContextProvider';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import FeeRecords from './pages/FeeRecords';
import FeeReminders from './pages/FeeReminders';
import Course from './pages/Course';
import TestRecords from './pages/TestRecords';
import StudentMarks from './pages/StudentMarks';
import StudentPerformance from './pages/StudentPerformance';
import ClassPerformance from './pages/ClassPerformance';
import UserRoles from './pages/UserRoles';
import UserList from './pages/UserList';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import ViewAttendance from './pages/ViewAttendance';
import SchoolMap from './pages/SchoolMap';
import ClassRecords from './pages/ClassRecord';
import path from 'path-browserify';
const App = () => {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();

  const [userRole, setUserRole] = useState(localStorage.getItem('role') || ''); // Initialize with role from localStorage or empty
  const [isLoggedIn, setIsLoggedIn] = useState(!!userRole); // Check if user is logged in based on role

  useEffect(() => {
    if (userRole) {
      setIsLoggedIn(true); // Set to true when userRole is set
    } else {
      setIsLoggedIn(false); // If there's no role, consider the user as logged out
    }
  }, [userRole]);

  const roleRoutes = {
    admin: [
      { path: '/', element: <Dashboard /> },
      { path: '/students', element: <Students /> },
      { path: '/fee-records', element: <FeeRecords /> },
      { path: '/fee-reminders', element: <FeeReminders /> },
      { path: '/course', element: <Course /> },
      { path: '/test-records', element: <TestRecords /> },
      { path: '/user-list/:role_id', element: <UserList /> },
      { path: '/student-marks/:testId', element: <StudentMarks /> },
      { path: '/student-performance', element: <StudentPerformance /> },
      { path: '/user-roles', element: <UserRoles /> },
      { path: '/attendance', element: <Attendance /> },
      { path: '/view-attendance', element: <ViewAttendance /> },
      //{ path: '/notice', element: <Notice /> }, 
      //{ path: '/attendance', element: <Attendance /> },  
      { path: '/class-performance', element: <ClassPerformance /> },
      {path: '/school-map', element: <SchoolMap />},
      {path: '/class-records', element: <ClassRecords />}
    ],
    teacher: [
      { path: '/', element: <Dashboard /> },
      { path: '/students', element: <Students /> },
      { path: '/test-records', element: <TestRecords /> },
      { path: '/student-marks/:testId', element: <StudentMarks /> },
      { path: '/student-performance', element: <StudentPerformance /> },
      { path: '/class-performance', element: <ClassPerformance /> },
      { path: '/view-attendance', element: <ViewAttendance /> },
      { path: '/attendance', element: <Attendance /> },
    ],
    counselor: [
      { path: '/', element: <Dashboard /> },
      { path: '/test-records', element: <TestRecords /> },
      { path: '/class-performance', element: <ClassPerformance /> },
      { path: '/student-performance', element: <StudentPerformance /> },
      { path: '/fee-records', element: <FeeRecords /> },
      { path: '/fee-reminders', element: <FeeReminders /> },
      //{ path: '/notice', element: <Notice /> }, 
      { path: '/students', element: <Students /> },
      { path: '/view-attendance', element: <ViewAttendance /> },
    ],
  };

  // Logout function
  const handleLogout = () => {
    // Remove user-related data from localStorage
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');

    // Update the state and redirect to the login page
    setUserRole('');
    setIsLoggedIn(false);
  };

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <BrowserRouter>
        {isLoggedIn ? (
          <div className="flex relative dark:bg-main-dark-bg">
            <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
              <TooltipComponent content="Settings" position="Top">
                <button
                  type="button"
                  className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
                  style={{ background: currentColor, borderRadius: '50%' }}
                  onClick={() => setThemeSettings(true)}
                >
                  <FiSettings />
                </button>
              </TooltipComponent>
            </div>
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
                <Sidebar role={userRole} />
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg">
                <Sidebar role={userRole} />
              </div>
            )}
            <div
              className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${
                activeMenu ? 'md:ml-72' : 'flex-2'
              }`}
            >
              <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
                <Navbar onLogout={handleLogout} /> {/* Pass handleLogout to Navbar */}
              </div>
              <div>
                {themeSettings && <ThemeSettings />}
                <Routes>
                  {roleRoutes[userRole]?.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                  {/* Redirect to Dashboard if no route matches */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Login setUserRole={setUserRole} />} />
            {/* You can also add other routes like signup or password reset here */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
};

export default App;
