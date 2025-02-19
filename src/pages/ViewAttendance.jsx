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
        if (role === "admin") {
          // Admins: Fetch all active batches
          batchesRes = await axios.get("https://apistudents.sainikschoolcadet.com/api/batches");
          setBatches(batchesRes.data.filter(batch => batch.is_active));
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
        <th style={{ textAlign: 'left', paddingLeft: '15px', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Student Name</th>
        {[...Array(days)].map((_, i) => (
          <th key={i} style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>{i + 1}</th>
        ))}
      </tr>
    );
  };

  const renderTableBody = () => {
    const [year, monthNum] = month.split('-');
    const days = getDaysInMonth(year, monthNum);

    return students.map(student => (
      <tr key={student.user_id}>
        <td style={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '15px' }}>{student.name}</td>
        {[...Array(days)].map((_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, '0')}`;
          const record = attendanceData.find(r => r.user_id === student.user_id && r.attendance_date.startsWith(date));

          return (
            <td key={i} style={{ backgroundColor: getStatusColor(record?.status), textAlign: 'center' }}>
              {record ? (record.status?.charAt(0) || '') : '-'}
            </td>
          );
        })}
      </tr>
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#e0f7e0';
      case 'Late': return '#fff9c4';
      case 'Absent': return '#ffccbc';
      default: return '#f9f9f9';
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
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
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #ddd', padding: '5px' }}>
        <table style={tableStyle}>
          <thead>{renderTableHeader()}</thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
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
  fontSize: '14px'
};

export default ViewAttendance;
