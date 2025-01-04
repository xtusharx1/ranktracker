import React, { useEffect, useState } from "react";
import { FaUserTie, FaUserGraduate, FaChalkboardTeacher, FaBook, FaUserMd, FaUserLock } from "react-icons/fa"; // Icons for fields

const Dashboard = () => {
  const [data, setData] = useState({
    admin: 0,
    student: 0,
    teacher: 0,
    counselor: 0,
    totalUsers: 0,  // Add total user count
    course: 0,  // Add course count
  });

  // Fetch data from both the roles and roles count APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const rolesResponse = await fetch("http://localhost:3002/api/role");
        const rolesData = await rolesResponse.json();
  
        // Fetch user counts by role
        const userCountsResponse = await fetch("http://localhost:3002/api/users/roles/count");
        const userCountsData = await userCountsResponse.json();
  
        // Fetch course count (optional, if the endpoint exists)
        let courseCount = 0;
        try {
          const courseResponse = await fetch("http://localhost:3002/api/courses/count");
          const courseData = await courseResponse.json();
          courseCount = courseData.count || 0;
        } catch (error) {
          console.log("Course API not available:", error);
        }
  
        // Process user count data
        const roleCountsMap = userCountsData.reduce((acc, item) => {
          if (item.role_id) {
            acc[item.role_id] = item.count;
          }
          if (item.total_users) {
            acc.totalUsers = item.total_users; // Add total users
          }
          return acc;
        }, {});
  
        const updatedData = rolesData.reduce((acc, role) => {
          const roleName = role.role_name.toLowerCase();
          acc[roleName] = roleCountsMap[role.role_id] || 0;
          return acc;
        }, {});
  
        updatedData.totalUsers = roleCountsMap.totalUsers || 0;
        updatedData.course = courseCount; // Set course count (which can be 0)
  
        setData(updatedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  
  const fields = [
    { title: "Total Users", value: data.totalUsers, icon: <FaUserTie /> },
    { title: "Admin", value: data.admin, icon: <FaUserLock /> },
    { title: "Students", value: data.student, icon: <FaUserGraduate /> },
    { title: "Teachers", value: data.teacher, icon: <FaChalkboardTeacher /> },
    { title: "Counselors", value: data.counselor, icon: <FaUserMd /> },
    { title: "Courses", value: data.course, icon: <FaBook /> },
  ];

  return (
    <div className="mt-12 flex flex-wrap justify-center gap-4">
      {fields.map((item) => (
        <div
          key={item.title} // Ensure key is unique
          className="bg-white dark:bg-secondary-dark-bg dark:text-gray-200 w-56 p-6 rounded-xl shadow-lg text-center"
        >
          <div className="text-4xl mb-4 text-blue-500">{item.icon}</div>
          <p className="text-xl font-semibold">{item.value}</p>
          <p className="text-gray-500 mt-2">{item.title}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
