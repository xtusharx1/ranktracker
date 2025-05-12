import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const StudentMarks = () => {
  const { testId } = useParams();
  const [studentRecords, setStudentRecords] = useState([]);
  const [testDetails, setTestDetails] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        // Fetch test details to get the batchId and other info
        const testResponse = await fetch(`https://apistudents.sainikschoolcadet.com/api/test/${testId}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          setTestDetails(testData); // Save test details to state
          
          // Fetch batch details to get the batch name
          fetchBatchName(testData.batch_id);
          
          // Fetch students in the batch using batchId
          fetchStudentsInBatch(testData.batch_id);
        } else {
          console.error('Failed to fetch test details');
        }
      } catch (error) {
        console.error('Error fetching test details:', error);
      }
    };

    // Function to fetch batch name
    const fetchBatchName = async (batchId) => {
      try {
        const batchResponse = await fetch(`https://apistudents.sainikschoolcadet.com/api/batches/${batchId}`);
        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          setBatchName(batchData.batch_name);
        } else {
          console.error('Failed to fetch batch details');
        }
      } catch (error) {
        console.error('Error fetching batch details:', error);
      }
    };

    // Function to fetch students in the batch
    const fetchStudentsInBatch = async (batchId) => {
      try {
        const batchResponse = await fetch(`https://apistudents.sainikschoolcadet.com/api/studentbatches/students/batch/${batchId}`);
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
        const marksResponse = await fetch(`https://apistudents.sainikschoolcadet.com/api/studenttestrecords/test/${testId}`);
        let marksData = [];

        if (marksResponse.ok) {
          marksData = await marksResponse.json();
        } else {
          console.error('Failed to fetch student test records');
        }

        // Fetch student details (name) for each user_id
        const recordsWithNames = await Promise.all(studentsData.map(async (student) => {
          const userResponse = await fetch(`https://apistudents.sainikschoolcadet.com/api/users/user/${student.user_id}`);
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
        const newRecordResponse = await fetch('https://apistudents.sainikschoolcadet.com/api/studenttestrecords/', {
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

  const updateStudentMarks = async (recordId, marks, index) => {
    setSavingIndex(index);
    try {
      const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/studenttestrecords/${recordId}`, {
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
    } finally {
      setSavingIndex(null);
    }
  };

  const updateAllMarks = async () => {
    setUpdatingAll(true);
    try {
      for (const record of studentRecords) {
        await updateStudentMarks(record.record_id, record.marks_obtained);
      }
      alert('All marks updated successfully.');
    } catch (error) {
      console.error('Error updating all marks:', error);
      alert('An error occurred while updating all marks.');
    } finally {
      setUpdatingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 px-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-base">Loading student marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-3 py-3">
      {/* Test Details Card */}
      {testDetails && (
        <div className="mb-4 bg-white shadow-sm">
          <div className="bg-blue-600 text-white px-4 py-3">
            <h2 className="text-xl font-semibold">{testDetails.test_name}</h2>
            <p className="text-base text-blue-100">{testDetails.subject}</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-base">{testDetails.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="font-medium text-base">{testDetails.total_marks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch</p>
              <p className="font-medium text-base">{batchName || 'Loading...'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Student Marks Table */}
      <div className="bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Student Marks</h3>
          <button
            onClick={updateAllMarks}
            disabled={updatingAll}
            className={`px-4 py-2 rounded text-white text-base font-medium ${
              updatingAll ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition duration-200 flex items-center`}
          >
            {updatingAll ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                Updating...
              </>
            ) : (
              'Update All'
            )}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Marks Obtained
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentRecords.map((record, index) => (
                <tr key={record.record_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-500">
                    {record.user_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-900">
                    {record.student_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-base text-gray-700">
                    <input
                      type="number"
                      min="0"
                      max={testDetails?.total_marks || 100}
                      value={record.marks_obtained}
                      onChange={(e) => handleMarksChange(index, parseInt(e.target.value, 10))}
                      className="w-20 px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      / {testDetails?.total_marks || 100}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => updateStudentMarks(record.record_id, record.marks_obtained, index)}
                      disabled={savingIndex === index}
                      className={`inline-flex items-center px-4 py-2 rounded text-sm font-medium ${
                        savingIndex === index
                          ? 'bg-green-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white transition-colors duration-200`}
                    >
                      {savingIndex === index ? (
                        <>
                          <span className="animate-spin h-3 w-3 mr-2 border-b-2 border-white rounded-full"></span>
                          Saving
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {studentRecords.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-base">
            No student records found for this test.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMarks;