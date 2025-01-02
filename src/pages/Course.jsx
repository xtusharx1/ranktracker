import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Course = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/batches/');
        setBatches(response.data);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/users/role/2');
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchBatches();
    fetchStudents();
  }, []);

  const handleAddStudent = (batch_id) => {
    setSelectedBatch(batch_id);
    setShowStudentList(true);
  };

  const handleStudentSelect = (student_id) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(student_id)
        ? prevSelected.filter((id) => id !== student_id)
        : [...prevSelected, student_id]
    );
  };

  const handleAddStudentsToBatch = async () => {
    try {
      const selectedBatchId = selectedBatch;
      for (const user_id of selectedStudents) {
        console.log('Adding student to batch:', { batch_id: selectedBatchId, user_id });
        const response = await axios.post(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/studentBatches/students/batch/`, {
          user_id: user_id,
          batch_id: selectedBatchId
        });

        console.log(response.data);
      }
      alert('Students added to batch successfully');
      setShowStudentList(false);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error adding students to batch:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Batches</h1>
        <div className="grid grid-cols-1 gap-6">
          {batches.map((batch) => (
            <div key={batch.batch_id} className="bg-blue-50 p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold text-blue-800">{batch.batch_name}</h2>
              <button
                onClick={() => handleAddStudent(batch.batch_id)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Student
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Student List Modal */}
      {showStudentList && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/2">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Students</h2>
            <div className="mb-4">
              {students.map((student) => (
                <div key={student.user_id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.user_id)}
                    onChange={() => handleStudentSelect(student.user_id)}
                    className="mr-2"
                  />
                  <label className="text-gray-700">{student.name}</label>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddStudentsToBatch}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
            >
              Add Selected Students
            </button>
            <button
              onClick={() => setShowStudentList(false)}
              className="mt-4 w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;