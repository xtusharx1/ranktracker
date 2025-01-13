import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Course = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(null); // Track batch with delete button
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get('https://api.students.sainikschoolcadet.com/api/batches/');
        setBatches(response.data);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get('https://api.students.sainikschoolcadet.com/api/users/role/2');
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
        await axios.post(`https://api.students.sainikschoolcadet.com/api/studentBatches/students/batch/`, {
          user_id: user_id,
          batch_id: selectedBatchId,
        });
      }
      alert('Students added to batch successfully');
      setShowStudentList(false);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error adding students to batch:', error);
    }
  };

  const handleCreateNewCourse = async () => {
    try {
      const response = await axios.post('https://api.students.sainikschoolcadet.com/api/batches/', {
        batch_name: newCourseName,
      });
      setBatches((prevBatches) => [...prevBatches, response.data]);
      alert('Course created successfully');
      setNewCourseName('');
      setShowNewCourseModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`https://api.students.sainikschoolcadet.com/api/batches/${batchToDelete}`);
      setBatches(batches.filter(batch => batch.batch_id !== batchToDelete));
      setShowDeleteConfirmation(false);
      alert('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleToggleDeleteButton = (batch_id) => {
    setShowDeleteButton((prev) => (prev === batch_id ? null : batch_id));
  };

  const handleShowDeleteConfirmation = (batch_id) => {
    setBatchToDelete(batch_id);
    setShowDeleteConfirmation(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Courses</h1>
        <button
          onClick={() => setShowNewCourseModal(true)}
          className="mb-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Create New Course
        </button>
        <div className="grid grid-cols-1 gap-6">
          {batches.map((batch) => (
            <div key={batch.batch_id} className="bg-blue-50 p-4 rounded-md shadow-md relative">
              <h2 className="text-xl font-semibold text-blue-800">{batch.batch_name}</h2>
              <button
                onClick={() => handleAddStudent(batch.batch_id)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Student
              </button>

              {/* Triple Dot (Ellipsis) Button */}
              <button
                onClick={() => handleToggleDeleteButton(batch.batch_id)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                ...
              </button>

              {/* Show Delete Button After Clicking Triple Dot */}
              {showDeleteButton === batch.batch_id && (
                <button
                  onClick={() => handleShowDeleteConfirmation(batch.batch_id)}
                  className="absolute bottom-2 right-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Create New Course</h2>
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Enter course name"
              className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              onClick={handleCreateNewCourse}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewCourseModal(false)}
              className="mt-4 w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Are you sure you want to delete this course?</h2>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteCourse}
                className="bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="mt-4 w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
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
