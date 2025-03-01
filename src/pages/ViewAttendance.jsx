import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewAttendance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const role = localStorage.getItem("role");
  const [year, monthNum] = month.split("-");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const userId = localStorage.getItem("user_id");
  
        // Fetch batches based on user role
        if (role === "admin" || role === "counselor") {
          try {
            const batchesRes = await axios.get("https://apistudents.sainikschoolcadet.com/api/batches");
            setBatches(batchesRes.data.filter(batch => batch.is_active));
          } catch (error) {
            console.error("Error fetching batches:", error);
            setErrorMessage("Failed to load batches. Please try again.");
          }
        } else if (role === "teacher") {
          try {
            // Teachers: Fetch only assigned batches
            const assignedBatchesRes = await axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${userId}/batches`);
            const assignedBatchIds = assignedBatchesRes.data.map(batch => batch.batch_id);
      
            // Fetch all batches and filter only assigned active ones
            const batchesRes = await axios.get("https://apistudents.sainikschoolcadet.com/api/batches");
            setBatches(batchesRes.data.filter(batch => batch.is_active && assignedBatchIds.includes(batch.batch_id)));
          } catch (error) {
            console.error("Error fetching teacher batches:", error);
            setErrorMessage("Failed to load your assigned batches. Please try again.");
          }
        }
  
        if (selectedBatch && month) {
          try {
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
          } catch (err) {
            console.error("Error fetching attendance data:", err);
            if (err.response?.status === 404) {
              setErrorMessage("No records found for the selected batch and month.");
            } else if (err.response?.status === 500) {
              setErrorMessage("Something went wrong on the server. Please try again later.");
            } else {
              setErrorMessage("Error fetching data. Please try again later.");
            }
          }
        }
      } catch (err) {
        console.error("Error in main fetchData function:", err);
        setErrorMessage("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [selectedBatch, month, role]); // Runs when batch, month, or role changes
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const renderTableHeader = () => {
    const days = getDaysInMonth(year, monthNum);
    return (
      <tr>
        <th style={headerCellStyle}>S.No</th>
        <th style={{...headerCellStyle, textAlign: 'left', minWidth: '180px', position: 'sticky', left: '40px', zIndex: 2}}>Student Name</th>
        {[...Array(days)].map((_, i) => (
          <th key={i} style={{...headerCellStyle, width: '40px'}}>{i + 1}</th>
        ))}
      </tr>
    );
  };

  const renderTableBody = () => {
    const days = getDaysInMonth(year, monthNum);

    return students.map((student, index) => (
      <tr key={student.user_id}>
        <td style={{...indexCellStyle, position: 'sticky', left: 0, zIndex: 2}}>{index + 1}</td>
        <td style={{...nameCellStyle, position: 'sticky', left: '40px', zIndex: 2}}>{student.name}</td>
        {[...Array(days)].map((_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, '0')}`;
          const record = attendanceData.find(r => r.user_id === student.user_id && r.attendance_date.startsWith(date));
          const status = record?.status || '';

          return (
            <td key={i} style={{
              ...dataCellStyle,
              backgroundColor: getStatusColor(status),
            }}>
              {status ? status.charAt(0) : '-'}
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
    }
  };

  const getStatusLabel = (status, letter) => {
    switch (status) {
      case 'Present': return 'Present';
      case 'Late': return 'Late';
      case 'Absent': return 'Absent';
      default: return 'Not Marked';
    }
  };

  return (
    <div style={containerStyle}>
      <div style={componentContainerStyle}>
        <h1 style={titleStyle}>Monthly Attendance</h1>

        {/* Error Message */}
        {errorMessage && (
          <div style={errorStyle}>
            {errorMessage}
          </div>
        )}

        {/* Selection Filters */}
        <div style={filtersContainerStyle}>
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

        {/* Legend */}
        {!isLoading && students.length > 0 && (
          <div style={legendContainerStyle}>
            {[
              { status: 'Present', color: '#dcffe4', letter: 'P' },
              { status: 'Late', color: '#fff3cd', letter: 'L' },
              { status: 'Absent', color: '#ffe7e6', letter: 'A' },
              { status: '', color: '#ffffff', letter: '-' }
            ].map(item => (
              <div key={item.status || 'not-marked'} style={legendItemStyle}>
                <span style={{...legendColorStyle, backgroundColor: item.color}}>{item.letter}</span>
                <span>{getStatusLabel(item.status, item.letter)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p>Loading attendance data...</p>
          </div>
        ) : students.length > 0 ? (
          /* Table Container - Horizontal Scroll Only */
          <div style={tableOuterContainerStyle}>
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>{renderTableHeader()}</thead>
                <tbody>{renderTableBody()}</tbody>
              </table>
            </div>
          </div>
        ) : selectedBatch ? (
          <div style={noDataStyle}>
            No student records found for this batch and month.
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* Improved Styles */
const containerStyle = {
  fontFamily: 'Arial, sans-serif',
  width: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
};

const componentContainerStyle = {
  padding: '10px',
  backgroundColor: '#f9f9f9',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
  width: '100%',
  margin: '0 auto',
  boxSizing: 'border-box',
};

const titleStyle = {
  textAlign: 'center', 
  color: '#333', 
  fontSize: '24px', 
  marginBottom: '15px',
  fontWeight: '600'
};

const filtersContainerStyle = {
  display: 'flex', 
  gap: '12px', 
  marginBottom: '15px', 
  justifyContent: 'center',
  flexWrap: 'wrap'
};

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '14px',
  border: '1px solid #ccc',
  backgroundColor: '#f8f9fa',
  minWidth: '180px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const monthInputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '14px',
  border: '1px solid #ccc',
  backgroundColor: '#f8f9fa',
  minWidth: '180px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const errorStyle = {
  backgroundColor: '#f8d7da', 
  color: '#721c24', 
  padding: '10px 15px', 
  borderRadius: '4px', 
  marginBottom: '15px',
  textAlign: 'center',
  fontWeight: '500',
  fontSize: '14px'
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px 15px',
  color: '#666',
  fontSize: '14px'
};

const spinnerStyle = {
  width: '35px',
  height: '35px',
  border: '3px solid #f3f3f3',
  borderTop: '3px solid #3498db',
  borderRadius: '50%',
  marginBottom: '12px',
  animation: 'spin 1s linear infinite'
};

const tableOuterContainerStyle = {
  width: '100%',
  position: 'relative',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 0 5px rgba(0,0,0,0.05)',
  backgroundColor: '#fff',
  overflow: 'hidden'
};

const tableContainerStyle = {
  width: '100%',
  overflowX: 'auto',  // Only horizontal scrolling
  overflowY: 'visible', // No vertical scrolling
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  scrollbarWidth: 'thin',
  scrollbarColor: '#ccc #f5f5f5',
  padding: '1px', // Tiny padding to avoid border cutoff
};

const tableStyle = {
  width: 'max-content', // Allow table to expand to full content width
  borderCollapse: 'separate',
  borderSpacing: 0,
  fontSize: '13px',
  backgroundColor: '#fff',
  tableLayout: 'fixed', // Fixed table layout for better column control
};

const headerCellStyle = {
  textAlign: 'center', 
  padding: '10px 6px', 
  fontWeight: 'bold', 
  backgroundColor: '#f5f7fa',
  border: '1px solid #dee2e6',
  position: 'sticky',
  top: 0,
  zIndex: 1,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const indexCellStyle = {
  textAlign: 'center', 
  padding: '8px 5px',
  fontWeight: '500',
  border: '1px solid #dee2e6',
  backgroundColor: '#f5f7fa',
  width: '40px',
  boxShadow: '1px 0px 2px rgba(0,0,0,0.05)'
};

const nameCellStyle = {
  textAlign: 'left', 
  padding: '8px 10px',
  fontWeight: '500',
  border: '1px solid #dee2e6',
  backgroundColor: '#fff',
  maxWidth: '180px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  boxShadow: '1px 0px 2px rgba(0,0,0,0.05)'
};

const dataCellStyle = {
  textAlign: 'center',
  padding: '8px 5px',
  border: '1px solid #dee2e6',
  fontWeight: 'bold',
  width: '40px',
  height: '35px' // Fixed row height
};

const legendContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '15px',
  justifyContent: 'center',
  padding: '8px 10px',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
  fontSize: '13px'
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px'
};

const legendColorStyle = {
  display: 'inline-block',
  width: '22px',
  height: '22px',
  borderRadius: '3px',
  textAlign: 'center',
  fontWeight: 'bold',
  lineHeight: '22px',
  border: '1px solid #dee2e6'
};

const noDataStyle = {
  padding: '25px',
  textAlign: 'center',
  color: '#666',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  margin: '15px 0',
  fontSize: '14px'
};

export default ViewAttendance;