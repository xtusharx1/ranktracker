import React, { useEffect, useState } from "react";
import { 
  FaUserTie, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaUserMd, 
  FaUserLock,
  FaChartLine
} from "react-icons/fa";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({
    admin: 0,
    student: 0,
    teacher: 0,
    counselor: 0,
    totalUsers: 0,
    course: 0,
  });
  const [batches, setBatches] = useState([]);
  const [batchData, setBatchData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format the student count data for the chart
  const formatStudentCountData = (data) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      student_count: parseInt(item.student_count, 10)
    }));
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch roles
        const rolesResponse = await fetch("https://apistudents.sainikschoolcadet.com/api/role");
        const rolesData = await rolesResponse.json();
  
        // Fetch user counts by role
        const userCountsResponse = await fetch("https://apistudents.sainikschoolcadet.com/api/users/roles/count");
        const userCountsData = await userCountsResponse.json();
  
        // Fetch course count
        let courseCount = 0;
        try {
          const courseResponse = await fetch("https://apistudents.sainikschoolcadet.com/api/batches/count");
          const courseData = await courseResponse.json();
          courseCount = courseData.active_batch_count || 0;
        } catch (error) {
          console.log("Course API not available:", error);
        }
  
        // Process user count data
        const roleCountsMap = userCountsData.reduce((acc, item) => {
          if (item.role_id) {
            acc[item.role_id] = item.count;
          }
          if (item.total_users) {
            acc.totalUsers = item.total_users;
          }
          return acc;
        }, {});
  
        const updatedData = rolesData.reduce((acc, role) => {
          const roleName = role.role_name.toLowerCase();
          acc[roleName] = roleCountsMap[role.role_id] || 0;
          return acc;
        }, {});
  
        updatedData.totalUsers = roleCountsMap.totalUsers || 0;
        updatedData.course = courseCount;
  
        setData(updatedData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      }
    };
  
    fetchDashboardData();
  }, []);

  // Fetch batches and all student count data
  useEffect(() => {
    const fetchBatchesAndStudentData = async () => {
      setIsLoading(true);
      try {
        // Fetch batches
        const batchesResponse = await fetch("https://apistudents.sainikschoolcadet.com/api/batches");
        const batchesData = await batchesResponse.json();
        setBatches(batchesData);
        
        // Fetch student count data for all batches
        const batchDataPromises = batchesData.map(async (batch) => {
          try {
            const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/studentBatches/student-counts/${batch.batch_id}`);
            const data = await response.json();
            return { 
              batchId: batch.batch_id, 
              data: formatStudentCountData(data)
            };
          } catch (error) {
            console.error(`Error fetching data for batch ${batch.batch_id}:`, error);
            return { 
              batchId: batch.batch_id, 
              data: [],
              error: `Failed to load data for ${batch.batch_name}`
            };
          }
        });
        
        const results = await Promise.all(batchDataPromises);
        
        // Convert array of results to object with batch_id as keys
        const batchDataMap = results.reduce((acc, item) => {
          acc[item.batchId] = {
            data: item.data,
            error: item.error || null
          };
          return acc;
        }, {});
        
        setBatchData(batchDataMap);
      } catch (error) {
        console.error("Error fetching batches:", error);
        setError("Failed to load batches data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchesAndStudentData();
  }, []);

  const fields = [
    { title: "Total Users", value: data.totalUsers, icon: <FaUserTie /> },
    { title: "Admin", value: data.admin, icon: <FaUserLock /> },
    { title: "Students", value: data.student, icon: <FaUserGraduate /> },
    { title: "Teachers", value: data.teacher, icon: <FaChalkboardTeacher /> },
    { title: "Counselors", value: data.counselor, icon: <FaUserMd /> },
    { title: "Courses", value: data.course, icon: <FaBook /> },
  ];

  // Get a random color for each batch graph
  const getColor = (index) => {
    const colors = ['#4361ee', '#3a86ff', '#4cc9f0', '#38b000', '#f72585', '#7209b7', '#f77f00', '#d62828'];
    return colors[index % colors.length];
  };

  return (
    <div className="mt-8 mb-12 px-6">
      {/* Stats cards */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {fields.map((item) => (
          <div
            key={item.title}
            className="bg-white dark:bg-secondary-dark-bg dark:text-gray-200 w-56 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center flex flex-col items-center border border-gray-100"
          >
            <div className="text-4xl mb-4 text-blue-500 opacity-85">{item.icon}</div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{item.value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Student Count Graphs Section */}
      <div className="mt-12 mb-6">
        <div className="bg-white dark:bg-secondary-dark-bg dark:text-gray-200 p-6 rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-2xl text-blue-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Student Count Over Time By Batch</h2>
          </div>
          <div className="w-full h-0.5 bg-gray-100 dark:bg-gray-700 mb-6"></div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-blue-500 flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading batch data...
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {batches.map((batch, index) => {
                const batchGraphData = batchData[batch.batch_id];
                
                return (
                  <div 
                    key={batch.batch_id}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{batch.batch_name}</h3>
                    
                    {batchGraphData?.error ? (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        <span className="block sm:inline">{batchGraphData.error}</span>
                      </div>
                    ) : batchGraphData?.data?.length === 0 ? (
                      <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="text-gray-500 dark:text-gray-400 text-center px-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2">No data available for this batch</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={batchGraphData?.data || []}
                            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              tickMargin={10}
                              stroke="#9ca3af"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              tickMargin={10}
                              stroke="#9ca3af"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36}
                              iconType="circle"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="student_count" 
                              name="Student Count" 
                              stroke={getColor(index)} 
                              strokeWidth={3}
                              dot={{ stroke: getColor(index), strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;