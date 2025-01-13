// src/App.js

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useStateContext } from "./contexts/ContextProvider";

import { Navbar, Footer, Sidebar, ThemeSettings } from "./components";
import {
  Calendar,
  Employees,
  Stacked,
  Pyramid,
  Customers,
  Kanban,
  Area,
  Bar,
  Pie,
  Line,
  Financial,
  ColorPicker,
  ColorMapping,
  Editor,
} from "./pages";
import Dashboard from "./pages/Dashboard";
import Batch from "./pages/Batch";
import "./App.css";
import ClassAnalytics from "./pages/ClassAnalytics";
import Students from "./pages/Students";
import FeeRecords from "./pages/FeeRecords";
import FeeReminders from "./pages/FeeReminders";
import Course from "./pages/Course";
import TestRecords from "./pages/TestRecords";
import StudentMarks from "./pages/StudentMarks";
import StudentPerformance from "./pages/StudentPerformance";
import ClassPerformance from "./pages/ClassPerformance";


const App = () => {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <BrowserRouter>
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
            <TooltipComponent content="Settings" position="Top">
              <button
                type="button"
                className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
                style={{ background: currentColor, borderRadius: "50%" }}
                onClick={() => setThemeSettings(true)}
              >
                <FiSettings />
              </button>
            </TooltipComponent>
          </div>
          {activeMenu ? (
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
              <Sidebar />
            </div>
          ) : (
            <div className="w-0 dark:bg-secondary-dark-bg">
              <Sidebar />
            </div>
          )}
          <div
            className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${
              activeMenu ? "md:ml-72" : "flex-2"
            }`}
          >
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
              <Navbar />
            </div>
            <div>
              {themeSettings && <ThemeSettings />}
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard/>} />
                <Route path="/Dashboard" element={<Dashboard/>} />
                <Route path="/students" element={<Students />} />
                <Route path="/fee-records" element={<FeeRecords/>}/>
                <Route path="/fee-reminders" element={<FeeReminders/>}/>
                <Route path="/Course" element={<Course/>}/>
                <Route path="/Test-Records" element={<TestRecords/>}/>
                <Route path="/student-marks/:testId" element={<StudentMarks />} />
                <Route path="/Student-Performance" element={<StudentPerformance />} />
                {/* Pages */}
                <Route path="/ClassAnalytics" element={<ClassAnalytics/>} />
                <Route path="/batch" element={<Batch />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/customers" element={<Customers />} />

                {/* Apps */}
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/color-picker" element={<ColorPicker />} />

                {/* Charts */}
                <Route path="/line" element={<Line />} />
                <Route path="/area" element={<Area />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/color-mapping" element={<ColorMapping />} />
                <Route path="/pyramid" element={<Pyramid />} />
                <Route path="/stacked" element={<Stacked />} />
                <Route path="/Class-Performance" element={<ClassPerformance />} />
              </Routes>
            </div>{" "}
            <Footer />
          </div>
        </div>
        
      </BrowserRouter>
    </div>
  );
};

export default App;
