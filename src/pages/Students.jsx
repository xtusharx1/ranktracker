import React, { useState, useEffect } from "react";
import { Header } from "../components";
import axios from 'axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchMapping, setBatchMapping] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    role_id: 2,
    name: "",
    email: "",
    phone_number: "",
    profile_picture: null,
    password: "",
    status: "active",
    date_of_admission: "",
    present_class: "",
    date_of_birth: "",
    total_course_fees: "",
    father_name: "",
    mother_name: "",
    full_address: "",
    child_aadhar_number: "",
    mother_aadhar_number: "",
    father_aadhar_number: "",
    permanent_education_number: "",
    student_registration_number: "",
    previous_school_info: "",
    gender: "",
    state: "",
    created_at: new Date().toISOString(),
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Students and Batches in Parallel
        const [studentsResponse, batchesResponse] = await Promise.all([
          fetch("https://apistudents.sainikschoolcadet.com/api/users/role/2"),
          fetch("https://apistudents.sainikschoolcadet.com/api/batches/")
        ]);
  
        const studentsData = await studentsResponse.json();
        const batchesData = await batchesResponse.json();
  
        // Create Batch Mapping (batch_id => batch_name)
        const batchMapping = batchesData.reduce((acc, batch) => {
          acc[batch.batch_id] = batch.batch_name;
          return acc;
        }, {});
  
        setBatches(batchesData);
        setBatchMapping(batchMapping);
  
        // Fetch Batch Info and Counselor Info for Each Student
        const studentDetailsPromises = studentsData.map(async (student) => {
          try {
            // Fetch batch info
            const batchResponse = await fetch(
              `https://apistudents.sainikschoolcadet.com/api/studentBatches/students/search/${student.user_id}`
            );
            const batchData = await batchResponse.json();
            
            // Initialize student data with batch info
            let studentWithDetails = { ...student };
            
            // Map batch_id and batch_name if available
            if (batchData.length > 0) {
              const batchId = batchData[0].batch_id;
              studentWithDetails.batch_id = batchId;
              studentWithDetails.batch_name = batchMapping[batchId] || "Unknown Batch";
            } else {
              studentWithDetails.batch_id = null;
              studentWithDetails.batch_name = "No Batch Assigned";
            }
            
            // Fetch counselor info
            try {
              const counselorResponse = await fetch(
                `https://apistudents.sainikschoolcadet.com/api/student-counselor/student/${student.user_id}`
              );
              
              if (counselorResponse.ok) {
                const counselorData = await counselorResponse.json();
                
                if (counselorData && counselorData.c_id) {
                  studentWithDetails.counselor_id = counselorData.c_id;
                  
                  // Fetch counselor's name using their user_id
                  try {
                    const counselorDetailsResponse = await fetch(
                      `https://apistudents.sainikschoolcadet.com/api/users/user/${counselorData.c_id}`
                    );
                    
                    if (counselorDetailsResponse.ok) {
                      const counselorDetails = await counselorDetailsResponse.json();
                      // Fixed: Access name through the user object in the response
                      studentWithDetails.counselor_name = counselorDetails.user?.name || "Unknown Counselor";
                    } else {
                      studentWithDetails.counselor_name = "Unknown Counselor";
                    }
                  } catch (error) {
                    console.error(`Error fetching counselor details for counselor ${counselorData.c_id}:`, error);
                    studentWithDetails.counselor_name = "Error Fetching Counselor";
                  }
                } else {
                  studentWithDetails.counselor_id = null;
                  studentWithDetails.counselor_name = "Not Available";
                }
              } else {
                studentWithDetails.counselor_id = null;
                studentWithDetails.counselor_name = "Not Available";
              }
            } catch (error) {
              console.error(`Error fetching counselor for user ${student.user_id}:`, error);
              studentWithDetails.counselor_id = null;
              studentWithDetails.counselor_name = "Error Fetching Counselor";
            }
            
            return studentWithDetails;
          } catch (error) {
            console.error(`Error fetching details for user ${student.user_id}:`, error);
            return { 
              ...student, 
              batch_id: null, 
              batch_name: "Batch Fetch Error",
              counselor_id: null,
              counselor_name: "Data Fetch Error"
            };
          }
        });
  
        const updatedStudents = await Promise.all(studentDetailsPromises);
        setStudents(updatedStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({
      ...newStudent,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setNewStudent({
      ...newStudent,
      profile_picture: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all mandatory fields are filled
    if (!newStudent.name || !newStudent.email || !newStudent.phone_number || !newStudent.password || !newStudent.status || !newStudent.gender) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate total_course_fees as mandatory
    if (newStudent.total_course_fees === "" || isNaN(newStudent.total_course_fees)) {
      alert("Total course fees must be a valid number and is required.");
      return;
    }

    // Construct the studentData object in the exact format required by the API
    const studentData = {
      name: newStudent.name,
      email: newStudent.email,
      password: newStudent.password,
      role_id: 2,
      phone_number: newStudent.phone_number,
      date_of_admission: formatDateForAPI(newStudent.date_of_admission),
      present_class: newStudent.present_class,
      date_of_birth: formatDateForAPI(newStudent.date_of_birth),
      total_course_fees: parseFloat(newStudent.total_course_fees),
      father_name: newStudent.father_name || "",
      mother_name: newStudent.mother_name || "",
      full_address: newStudent.full_address || "",
      child_aadhar_number: newStudent.child_aadhar_number || "",
      mother_aadhar_number: newStudent.mother_aadhar_number || "",
      father_aadhar_number: newStudent.father_aadhar_number || "",
      permanent_education_number: newStudent.permanent_education_number || "",
      student_registration_number: newStudent.student_registration_number || "",
      previous_school_info: newStudent.previous_school_info || "",
      gender: newStudent.gender,
      state: newStudent.state || "",
      status: newStudent.status
    };

    try {
      console.log("Attempting to create student with data:", studentData);

      const response = await fetch("https://apistudents.sainikschoolcadet.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();
      console.log("Response from student creation:", data);

      // Check if user object exists in the response
      if (data.user && data.user.id) {
        setStudents([...students, data]);

        // Get user_id and selectedBatch
        const user_id = data.user.id; // Use id from the response as user_id
        const selectedBatch = newStudent.batch_id; // Get the selected batch ID

        // Log batch_id and user_id
        console.log("Batch ID:", selectedBatch);
        console.log("User ID:", user_id);

        // Use the specified API endpoint and request format to add the student to the batch
        const addStudentToBatchResponse = await axios.post(`https://apistudents.sainikschoolcadet.com/api/studentBatches/students/batch/`, {
          user_id: user_id, // Send user_id in the request body
          batch_id: selectedBatch // Send batch_id in the request body
        });

        console.log("Student added to batch:", addStudentToBatchResponse.data);
        
        // Get the counselor ID from localStorage
        const counselor_id = localStorage.getItem('user_id');
        
        if (counselor_id) {
          try {
            // Assign the counselor to the student
            const assignCounselorResponse = await axios.post('https://apistudents.sainikschoolcadet.com/api/student-counselor', {
              c_id: parseInt(counselor_id),
              s_id: user_id
            });
            
            console.log("Counselor assigned to student:", assignCounselorResponse.data);
          } catch (error) {
            console.error("Error assigning counselor to student:", error);
            // Continue with the flow even if counselor assignment fails
          }
        } else {
          console.log("No counselor ID found in localStorage, skipping counselor assignment");
        }
        
        setShowModal(false);
      } else {
        console.error("User registration failed:", data);
        alert("User registration failed. Please check the input data.");
      }
    } catch (error) {
      console.error("Error creating student or adding to batch:", error);
    }
    window.location.reload(); 
  };
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    
    // Convert from YYYY-MM-DD to DD-MM-YY
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };
  const handleEditClick = async (userId) => {
    try {
      // Fetch both student details and batch info
      const [studentDetails, studentBatch] = await Promise.all([
        fetchStudentDetails(userId),
        fetchStudentBatch(userId),
      ]);
  
      if (studentDetails) {
        // Ensure batch info is included
        setEditingStudent({
          ...studentDetails,
          batch_id: studentBatch?.batch_id || "",
        });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };
  
  // Fetch individual student details
  const fetchStudentDetails = async (userId) => {
    try {
      const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/users/user/${userId}`);
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching student details:", error);
      return null;
    }
  };
  
  // Fetch batch details for a student
  const fetchStudentBatch = async (userId) => {
    try {
      const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/studentBatches/students/search/${userId}`);
      const data = await response.json();
      return data.length > 0 ? data[0] : null; // Assume the first batch is the current one
    } catch (error) {
      console.error("Error fetching student batch:", error);
      return null;
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
        // ✅ Step 1: Update student's basic info
        const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/users/user/${editingStudent.user_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingStudent),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Student updated successfully:", data);

            // ✅ Step 2: Fetch the student's current batch
            let oldBatchId = null;
            try {
                const batchResponse = await axios.get(
                    `https://apistudents.sainikschoolcadet.com/api/studentBatches/students/search/${editingStudent.user_id}`
                );
                const batchData = batchResponse.data;
                if (batchData.length > 0) {
                    oldBatchId = batchData[0].batch_id; // Assuming the first record is the current batch
                    console.log(`Current batch found: ${oldBatchId}`);
                } else {
                    console.log("No existing batch found for the student.");
                }
            } catch (error) {
                console.warn("Failed to fetch student's current batch:", error);
            }

            const newBatchId = editingStudent.batch_id;

            if (!oldBatchId && newBatchId) {
                // 🟢 No batch assigned before, so assign the student to the new batch
                console.log(`Assigning student ${editingStudent.user_id} to batch ${newBatchId}`);
                await axios.post(`https://apistudents.sainikschoolcadet.com/api/studentBatches/students/batch/`, {
                    user_id: editingStudent.user_id, 
                    batch_id: newBatchId, 
                });
                console.log("Student successfully assigned to batch.");
            } else if (oldBatchId !== newBatchId) {
                // 🟠 Batch is different, update the assignment
                console.log(`Updating batch for student ${editingStudent.user_id} from ${oldBatchId} to ${newBatchId}`);
                await axios.put(`https://apistudents.sainikschoolcadet.com/api/studentBatches/update`, {
                    user_id: editingStudent.user_id,
                    old_batch_id: oldBatchId,
                    new_batch_id: newBatchId,
                });
                console.log("Student batch updated successfully.");
            } else {
                console.warn("No batch change detected.");
            }

            // ✅ Step 3: Refresh student list
            const refreshResponse = await fetch("https://apistudents.sainikschoolcadet.com/api/users/role/2");
            const refreshData = await refreshResponse.json();
            window.location.reload();

            setShowEditModal(false);
            setEditingStudent(null);

        } else {
            alert('Failed to update student: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Error updating student: ' + error.message);
    }
};



const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditingStudent((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const indexOfLastStudent = currentPage * studentsPerPage;
const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
const totalPages = Math.ceil(students.length / studentsPerPage);

const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}>
      <div style={{ margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Header category="" title="Students" />

        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-4"
          onClick={() => setShowModal(true)}
        >
          Create New Student
        </button>

        <div style={{ 
          overflowX: 'auto', 
          borderRadius: '8px', 
          backgroundColor: '#fff',
          padding: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <table className="min-w-full table-auto bg-white border-collapse border border-gray-300">
  <thead>
    <tr className="bg-gray-200">
      <th className="border border-gray-300 px-2 py-3 text-center" style={{ width: '40px' }}>S.No</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Name</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Email</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Phone Number</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Batch Name</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Added by</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Date of Admission</th>
      <th className="border border-gray-300 px-4 py-3 text-left">Status</th>
      <th className="border border-gray-300 px-4 py-3 text-center">Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentStudents.map((student, index) => (
      <tr key={student.user_id} className="hover:bg-gray-50">
        <td className="border border-gray-300 px-2 py-3 text-center">{indexOfFirstStudent + index + 1}</td>
        <td className="border border-gray-300 px-4 py-3">{student.name}</td>
        <td className="border border-gray-300 px-4 py-3">{student.email}</td>
        <td className="border border-gray-300 px-4 py-3">{student.phone_number}</td>
        <td className="border border-gray-300 px-4 py-3">{student.batch_name}</td>
        <td className="border border-gray-300 px-4 py-3">{student.counselor_name || "No Counselor"}</td>
        <td className="border border-gray-300 px-4 py-3">{student.date_of_admission}</td>
        <td className="border border-gray-300 px-4 py-3">
          <span className={`px-2 py-1 rounded-full ${
            student.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </span>
        </td>
        <td className="border border-gray-300 px-4 py-3 text-center">
          <button
            onClick={() => handleEditClick(student.user_id)}
            className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Edit
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>

        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{indexOfFirstStudent + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(indexOfLastStudent, students.length)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{students.length}</span>
              {' '}results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => paginate(idx + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === idx + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {showModal && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50 }}>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '50rem', height: '100%', maxHeight: '100vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>Create New Student</h2>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={newStudent.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Email <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={newStudent.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Phone Number <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="phone_number"
                    value={newStudent.phone_number}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Password <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={newStudent.password}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Status <span style={{ color: 'red' }}>*</span></label>
                  <select
                    name="status"
                    value={newStudent.status}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Date of Admission</label>
                  <input
                    type="date"
                    name="date_of_admission"
                    value={newStudent.date_of_admission}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Present Class</label>
                  <input
                    type="text"
                    name="present_class"
                    value={newStudent.present_class}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={newStudent.date_of_birth}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Total Course Fees</label>
                  <input
                    type="number"
                    name="total_course_fees"
                    value={newStudent.total_course_fees}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Gender</label>
                  <select
                    name="gender"
                    value={newStudent.gender}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={newStudent.state}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>
                    Batch
                  </label>

                  <select
                    id="batch"
                    name="batch_id"
                    value={newStudent?.batch_id || ""}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select Batch</option>

                    {batches.length > 0 ? (
                      batches.map((batch) => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                          {batch.batch_name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading Batches...</option>
                    )}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Father's Name</label>
                  <input
                    type="text"
                    name="father_name"
                    value={newStudent.father_name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Mother's Name</label>
                  <input
                    type="text"
                    name="mother_name"
                    value={newStudent.mother_name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem', gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Full Address</label>
                  <textarea
                    name="full_address"
                    value={newStudent.full_address}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  ></textarea>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Child Aadhar Number</label>
                  <input
                    type="text"
                    name="child_aadhar_number"
                    value={newStudent.child_aadhar_number}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Mother Aadhar Number</label>
                  <input
                    type="text"
                    name="mother_aadhar_number"
                    value={newStudent.mother_aadhar_number}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Father Aadhar Number</label>
                  <input
                    type="text"
                    name="father_aadhar_number"
                    value={newStudent.father_aadhar_number}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Permanent Education Number</label>
                  <input
                    type="text"
                    name="permanent_education_number"
                    value={newStudent.permanent_education_number}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Student Registration Number</label>
                  <input
                    type="text"
                    name="student_registration_number"
                    value={newStudent.student_registration_number}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem', gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Previous School Info</label>
                  <textarea
                    name="previous_school_info"
                    value={newStudent.previous_school_info}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  ></textarea>
                </div>

                <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#4a90e2',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      border: 'none',
                    }}
                  >
                    Create
                  </button>
                  <br></br>
                  <br></br>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md"
                  >
                    Cancel   
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingStudent && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50 }}>
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '50rem', height: '100%', maxHeight: '100vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>Edit Student</h2>
              <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={editingStudent.name}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Email <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={editingStudent.email}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Phone Number <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="phone_number"
                    value={editingStudent.phone_number}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Status <span style={{ color: 'red' }}>*</span></label>
                  <select
                    name="status"
                    value={editingStudent.status}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Date of Admission</label>
                  <input
                    type="date"
                    name="date_of_admission"
                    value={editingStudent.date_of_admission}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Present Class</label>
                  <input
                    type="text"
                    name="present_class"
                    value={editingStudent.present_class}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editingStudent.date_of_birth}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Total Course Fees</label>
                  <input
                    type="number"
                    name="total_course_fees"
                    value={editingStudent.total_course_fees}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Gender</label>
                  <select
                    name="gender"
                    value={editingStudent.gender}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={editingStudent.state}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>
                    Batch
                  </label>

                  <select
                    name="batch_id"
                    value={editingStudent.batch_id || ""}
                    onChange={handleEditChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                    }}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        {batch.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Father's Name</label>
                  <input
                    type="text"
                    name="father_name"
                    value={editingStudent.father_name}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Mother's Name</label>
                  <input
                    type="text"
                    name="mother_name"
                    value={editingStudent.mother_name}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem', gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Full Address</label>
                  <textarea
                    name="full_address"
                    value={editingStudent.full_address}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  ></textarea>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Child Aadhar Number</label>
                  <input
                    type="text"
                    name="child_aadhar_number"
                    value={editingStudent.child_aadhar_number}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Mother Aadhar Number</label>
                  <input
                    type="text"
                    name="mother_aadhar_number"
                    value={editingStudent.mother_aadhar_number}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Father Aadhar Number</label>
                  <input
                    type="text"
                    name="father_aadhar_number"
                    value={editingStudent.father_aadhar_number}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Permanent Education Number</label>
                  <input
                    type="text"
                    name="permanent_education_number"
                    value={editingStudent.permanent_education_number}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Student Registration Number</label>
                  <input
                    type="text"
                    name="student_registration_number"
                    value={editingStudent.student_registration_number}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem', gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Previous School Info</label>
                  <textarea
                    name="previous_school_info"
                    value={editingStudent.previous_school_info}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
                  ></textarea>
                </div>

                <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#4a90e2',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      border: 'none',
                    }}
                  >
                    Update
                  </button>
                  <br></br>
                  <br></br>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;