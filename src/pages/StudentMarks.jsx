import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const StudentMarks = () => {
  const { testId, batchId } = useParams();
  const [studentRecords, setStudentRecords] = useState([]);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        // Fetch test details to get the batchId and other info
        const testResponse = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/test/${testId}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          setTestDetails(testData); // Save test details to state
          
          // Fetch students in the batch using batchId
          fetchStudentsInBatch(testData.batch_id);
        } else {
          console.error('Failed to fetch test details');
        }
      } catch (error) {
        console.error('Error fetching test details:', error);
      }
    };

    // Function to fetch students in the batch
    const fetchStudentsInBatch = async (batchId) => {
      try {
        const batchResponse = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/studentbatches/students/batch/${batchId}`);
        if (batchResponse.ok) {
          const studentsData = await batchResponse.json();
          // Fetch student test records for each student
          fetchStudentTestRecords(studentsData);
        } else {
          console.error('Failed to fetch students in batch');
        }
      } catch (error) {
        console.error('Error fetching students in batch:', error);
      }
    };

    // Function to fetch test records for all students
    const fetchStudentTestRecords = async (studentsData) => {
      try {
        const marksResponse = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/studenttestrecords/test/${testId}`);
        let marksData = [];

        if (marksResponse.ok) {
          marksData = await marksResponse.json();
        } else {
          console.error('Failed to fetch student test records');
        }

        // Fetch student details (name) for each user_id
        const recordsWithNames = await Promise.all(studentsData.map(async (student) => {
          const userResponse = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/users/user/${student.user_id}`);
          const userData = await userResponse.json();

          let studentMarks = marksData.find(record => record.user_id === student.user_id);

          if (!studentMarks) {
            // If record doesn't exist, create a new record using POST
            studentMarks = await createStudentTestRecord(student.user_id);
          }

          return {
            ...student,
            student_name: userData.user.name, // Access name inside the 'user' object
            marks_obtained: studentMarks ? studentMarks.marks_obtained : 0, // Default to 0 if no record found
            record_id: studentMarks ? studentMarks.record_id : null
          };
        }));

        setStudentRecords(recordsWithNames);
      } catch (error) {
        console.error('Error fetching student test records:', error);
      } finally {
        setLoading(false);
      }
    };

    // Function to create a student test record if it doesn't exist
    const createStudentTestRecord = async (userId) => {
      try {
        const newRecordResponse = await fetch('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/studenttestrecords/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_id: testId,
            user_id: userId,
            marks_obtained: 0, // Default marks if record is created
          }),
        });

        if (newRecordResponse.ok) {
          const newRecord = await newRecordResponse.json();
          return newRecord;
        } else {
          console.error('Failed to create new student test record');
          return null;
        }
      } catch (error) {
        console.error('Error creating student test record:', error);
        return null;
      }
    };

    fetchTestDetails();
  }, [testId]); // Re-fetch when testId changes

  const handleMarksChange = (index, newMarks) => {
    const updatedRecords = [...studentRecords];
    updatedRecords[index].marks_obtained = newMarks;
    setStudentRecords(updatedRecords);
  };

  const updateStudentMarks = async (recordId, marks) => {
    try {
      const response = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/studenttestrecords/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks_obtained: marks }),
      });

      if (!response.ok) {
        alert('Failed to update marks. Please try again.');
      }
    } catch (error) {
      console.error('Error updating marks:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const updateAllMarks = async () => {
    for (const record of studentRecords) {
      await updateStudentMarks(record.record_id, record.marks_obtained);
    }
    alert('All marks updated successfully.');
  };

  if (loading) {
    return <div>Loading student marks...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Test Details Section */}
      {testDetails && (
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#333' }}>Test Details</h2>
          <p><strong>Test Name:</strong> {testDetails.test_name}</p>
          <p><strong>Subject:</strong> {testDetails.subject}</p>
          <p><strong>Date:</strong> {testDetails.date}</p>
          <p><strong>Total Marks:</strong> {testDetails.total_marks}</p>
        </div>
      )}

      {/* Student Marks Table */}
      <h1>Student Marks for Test ID: {testId}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Student ID</th>
            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Student Name</th>
            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Marks Obtained</th>
            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {studentRecords.map((record, index) => (
            <tr key={record.record_id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px 15px' }}>{record.user_id}</td>
              <td style={{ padding: '12px 15px' }}>{record.student_name}</td>
              <td style={{ padding: '12px 15px' }}>
                <input
                  type="number"
                  value={record.marks_obtained}
                  onChange={(e) => handleMarksChange(index, parseInt(e.target.value, 10))}
                  style={{ width: '60px', padding: '5px', fontSize: '14px', borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '12px 15px' }}>
                <button
                  onClick={() => updateStudentMarks(record.record_id, record.marks_obtained)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={updateAllMarks}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Update All
      </button>
    </div>
  );
};

export default StudentMarks;
