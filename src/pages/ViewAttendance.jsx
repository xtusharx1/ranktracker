import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewAttendance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); // State to handle errors
  const role = localStorage.getItem("role"); // Get user role

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const userId = localStorage.getItem("user_id");
  
        let batchesRes;
        if (role === "admin" || role === "counselor") {
          try {
            const batchesRes = await axios.get("https://apistudents.sainikschoolcadet.com/api/batches");
            setBatches(batchesRes.data.filter(batch => batch.is_active));
          } catch (error) {
            console.error("Error fetching batches:", error);
          }
        } else if (role === "teacher") {
          // Teachers: Fetch only assigned batches
          const assignedBatchesRes = await axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${userId}/batches`);
          const assignedBatchIds = assignedBatchesRes.data.map(batch => batch.batch_id);
  
          // Fetch all batches and filter only assigned active ones
          batchesRes = await axios.get("https://apistudents.sainikschoolcadet.com/api/batches");
          setBatches(batchesRes.data.filter(batch => batch.is_active && assignedBatchIds.includes(batch.batch_id)));
        }
  
        if (selectedBatch && month) {
          // Fetch attendance data for the selected batch and month
          const attendanceRes = await axios.get(`https://apistudents.sainikschoolcadet.com/api/attendance/batch/${selectedBatch}/month/${month}`);
          setAttendanceData(attendanceRes.data);
          setErrorMessage(""); // Clear previous error message
  
          // Fetch all students for the selected batch
          const studentsRes = await axios.get(`https://apistudents.sainikschoolcadet.com/api/studentbatches/students/batch/${selectedBatch}`);
          const studentsData = studentsRes.data;
  
          // Fetch names for each student
          const studentsWithNames = await Promise.all(
            studentsData.map(async (student) => {
              try {
                const userRes = await axios.get(`https://apistudents.sainikschoolcadet.com/api/users/user/${student.user_id}`);
                return { ...student, name: userRes.data.user.name || "Unnamed" };
              } catch (error) {
                console.error("Error fetching user name:", error);
                return { ...student, name: "Unnamed" };
              }
            })
          );
  
          // Sort students by name
          studentsWithNames.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          setStudents(studentsWithNames);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 404) {
          setErrorMessage("No records found for the selected batch and month.");
        } else if (err.response?.status === 500) {
          setErrorMessage("Something went wrong on the server. Please try again later.");
        } else {
          setErrorMessage("Error fetching data. Please try again later.");
        }
      }
    };
  
    fetchData();
  }, [selectedBatch, month, role]); // Runs when batch, month, or role changes
  
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const renderTableHeader = () => {
    const [year, monthNum] = month.split('-');
    const days = getDaysInMonth(year, monthNum);
    return (
      <tr>
        <th style={{ 
          textAlign: 'center', 
          padding: '12px 15px', 
          fontWeight: 'bold', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          minWidth: '60px'
        }}>S.No</th>
        <th style={{ 
          textAlign: 'left', 
          padding: '12px 15px', 
          fontWeight: 'bold', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          minWidth: '200px'
        }}>Student Name</th>
        {[...Array(days)].map((_, i) => (
          <th key={i} style={{ 
            backgroundColor: '#f8f9fa', 
            fontWeight: 'bold',
            padding: '12px 8px',
            border: '1px solid #dee2e6',
            minWidth: '40px',
            textAlign: 'center'
          }}>{i + 1}</th>
        ))}
      </tr>
    );
  };

  const renderTableBody = () => {
    const [year, monthNum] = month.split('-');
    const days = getDaysInMonth(year, monthNum);

    return students.map((student, index) => (
      <tr key={student.user_id}>
        <td style={{ 
          textAlign: 'center', 
          padding: '12px 15px',
          border: '1px solid #dee2e6',
          backgroundColor: '#fff'
        }}>{index + 1}</td>
        <td style={{ 
          textAlign: 'left', 
          padding: '12px 15px',
          border: '1px solid #dee2e6',
          backgroundColor: '#fff'
        }}>{student.name}</td>
        {[...Array(days)].map((_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, '0')}`;
          const record = attendanceData.find(r => r.user_id === student.user_id && r.attendance_date.startsWith(date));

          return (
            <td key={i} style={{ 
              backgroundColor: getStatusColor(record?.status), 
              textAlign: 'center',
              padding: '12px 8px',
              border: '1px solid #dee2e6',
              fontWeight: 'bold'
            }}>
              {record ? (record.status?.charAt(0) || '') : '-'}
            </td>
          );
        })}
      </tr>
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#dcffe4';  // Lighter green
      case 'Late': return '#fff3cd';     // Lighter yellow
      case 'Absent': return '#ffe7e6';   // Lighter red
      default: return '#ffffff';         // White
    };
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#333', fontSize: '32px', marginBottom: '20px' }}>Monthly Attendance</h1>

        {/* Error Message */}
        {errorMessage && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
            {errorMessage}
          </div>
        )}

        {/* Selection Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
          <select
            style={selectStyle}
            onChange={e => setSelectedBatch(e.target.value)}
            value={selectedBatch}
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.batch_id} value={batch.batch_id}>{batch.batch_name}</option>
            ))}
          </select>

          <input
            type="month"
            style={monthInputStyle}
            value={month}
            onChange={e => setMonth(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={{ 
          overflowX: 'auto', 
          borderRadius: '8px', 
          backgroundColor: '#fff',
          padding: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <table style={tableStyle}>
            <thead>{renderTableHeader()}</thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* Styles */
const selectStyle = {
  padding: '10px',
  borderRadius: '5px',
  fontSize: '16px',
  border: '1px solid #ccc',
  backgroundColor: '#f8f9fa'
};

const monthInputStyle = {
  padding: '10px',
  borderRadius: '5px',
  fontSize: '16px',
  border: '1px solid #ccc',
  backgroundColor: '#f8f9fa'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  backgroundColor: '#fff'
};

export default ViewAttendance;
