import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Attendance = () => {
  const [teacherName, setTeacherName] = useState(localStorage.getItem('name') || '');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [reasons, setReasons] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState(localStorage.getItem("role"));  // Get role from localStorage

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
  
    if (role === "admin") {
      // Fetch all active batches for admin
      axios.get("https://apistudents.sainikschoolcadet.com/api/batches")
        .then(res => setBatches(res.data.filter(batch => batch.is_active)))
        .catch(err => console.error("Error fetching batches:", err));
    } else if (role === "teacher") {
      // Fetch only assigned batches for teachers
      axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${userId}/batches`)
        .then(res => {
          const assignedBatchIds = res.data.map(batch => batch.batch_id);
  
          // Fetch all batches, then filter active & assigned ones
          axios.get("https://apistudents.sainikschoolcadet.com/api/batches")
            .then(batchRes => {
              const filteredBatches = batchRes.data.filter(batch => 
                batch.is_active && assignedBatchIds.includes(batch.batch_id)
              );
              setBatches(filteredBatches);
            })
            .catch(err => console.error("Error fetching batch details:", err));
        })
        .catch(err => console.error("Error fetching teacher's assigned batches:", err));
    }
  }, [role]); // Re-run when role changes
  

  // New useEffect for fetching subject first
  useEffect(() => {
    const Id = localStorage.getItem("user_id");
    
    if (role === "admin") {
      axios.get('https://apistudents.sainikschoolcadet.com/api/subjects/')
        .then(res => setSubjects(res.data))
        .catch(err => console.error('Error fetching subjects:', err));
    } else if (role === "teacher") {
      // First fetch teacher's assigned subject
      axios.get(`https://apistudents.sainikschoolcadet.com/api/subject-teachers/teacher/${Id}`)
        .then(res => {
          if (res.data.length > 0) {
            setSelectedSubject(res.data[0].subject_id);
            // Then fetch subject details
            return axios.get('https://apistudents.sainikschoolcadet.com/api/subjects/')
              .then(subjectsRes => {
                setSubjects(subjectsRes.data.filter(subject => 
                  subject.subject_id === res.data[0].subject_id
                ));
              });
          }
        })
        .catch(err => console.error("Error fetching teacher's subject:", err));
    }
  }, [role]); // Only depends on role now

  useEffect(() => {
    if (selectedBatch) {
      // Fetching students in the selected batch
      axios.get(`https://apistudents.sainikschoolcadet.com/api/studentbatches/students/batch/${selectedBatch}`)
        .then(res => {
          const studentIds = res.data.map(student => student.user_id);
          // Fetching detailed student data
          const studentPromises = studentIds.map(userId =>
            axios.get(`https://apistudents.sainikschoolcadet.com/api/users/user/${userId}`)
          );
          Promise.all(studentPromises)
            .then(responses => {
              const studentsData = responses.map(response => response.data.user);
              studentsData.sort((a, b) => a.name.localeCompare(b.name));
              setStudents(studentsData);
              const initialAttendance = studentsData.reduce((acc, student) => {
                acc[student.user_id] = 'Present';
                return acc;
              }, {});
              setAttendance(initialAttendance);
            })
            .catch(err => console.error('Error fetching student details:', err));
        })
        .catch(err => console.error('Error fetching students for the batch:', err));
    }
  }, [selectedBatch]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });

    if (status === 'Absent' || status === 'Late') {
      setReasons({ ...reasons, [studentId]: reasons[studentId] || '' });
    } else {
      const updatedReasons = { ...reasons };
      delete updatedReasons[studentId];
      setReasons(updatedReasons);
    }
  };

  const handleReasonChange = (studentId, reason) => {
    setReasons({ ...reasons, [studentId]: reason });
  };

  const submitAttendance = () => {
    if (!selectedSubject) {
      alert('Please select a subject');
      return;
    }
  
    if (!teacherName) {
      alert('Teacher name is not available');
      return;
    }
  
    const attendanceRecords = students.map(student => ({
      user_id: student.user_id,
      batch_id: selectedBatch,
      subject_id: selectedSubject, // Ensure subject is selected
      status: attendance[student.user_id] || 'Absent',
      attendance_date: attendanceDate,
      teacher_name: teacherName,  // Adding teacher's name to the request
      reason: (attendance[student.user_id] === 'Absent' || attendance[student.user_id] === 'Late') ? reasons[student.user_id] : null,
    }));
  
    // Send the bulk attendance data to the backend API
    axios.post('https://apistudents.sainikschoolcadet.com/api/attendance/bulk', { records: attendanceRecords })
      .then(() => {
        alert('Attendance submitted successfully');
        // Reload the page after successful submission
        window.location.reload();
      })
      .catch(err => {
        console.error('Error submitting attendance:', err);
        alert('Error submitting attendance');
      });
  };
  
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333', fontSize: '32px', marginBottom: '20px' }}>Attendance</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Teacher: {teacherName}</span>
        <div style={{ display: 'flex', gap: '15px' }}>
          <select
            onChange={e => setSelectedBatch(e.target.value)}
            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.batch_id} value={batch.batch_id}>{batch.batch_name}</option>
            ))}
          </select>
          {role === "teacher" ? (
            // Teachers have a locked subject input field showing their assigned subject name
            <input
              type="text"
              value={subjects[0]?.subject_name || "Loading..."}
              readOnly
              style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          ) : (
            // Admins and other roles get a dropdown for selecting a subject
            <select
              onChange={e => setSelectedSubject(e.target.value)}
              style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.subject_id} value={subject.subject_id}>{subject.subject_name}</option>
              ))}
            </select>
          )}
          <input
            type="date"
            value={attendanceDate}
            onChange={e => setAttendanceDate(e.target.value)}
            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Reason (if absent/late)</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.user_id} style={{ background: '#f9f9f9' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{student.name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student.user_id}`}
                        value="Present"
                        checked={attendance[student.user_id] === 'Present'}
                        onChange={() => handleAttendanceChange(student.user_id, 'Present')}
                      />
                      Present
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student.user_id}`}
                        value="Absent"
                        checked={attendance[student.user_id] === 'Absent'}
                        onChange={() => handleAttendanceChange(student.user_id, 'Absent')}
                      />
                      Absent
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student.user_id}`}
                        value="Late"
                        checked={attendance[student.user_id] === 'Late'}
                        onChange={() => handleAttendanceChange(student.user_id, 'Late')}
                      />
                      Late
                    </label>
                  </div>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {(attendance[student.user_id] === 'Absent' || attendance[student.user_id] === 'Late') && (
                    <input
                      type="text"
                      value={reasons[student.user_id] || ''}
                      onChange={e => handleReasonChange(student.user_id, e.target.value)}
                      placeholder="Enter reason (optional)"
                      style={{ padding: '8px', fontSize: '14px', width: '100%', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={submitAttendance}
          style={{
            padding: '12px 30px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '5px',
            transition: 'background 0.3s ease',
          }}
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
};

export default Attendance;
