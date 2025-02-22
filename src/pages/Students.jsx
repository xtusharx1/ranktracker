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
  
        // Fetch Batch Info for Each Student
        const studentBatchPromises = studentsData.map(async (student) => {
          try {
            const response = await fetch(
              `https://apistudents.sainikschoolcadet.com/api/studentBatches/students/search/${student.user_id}`
            );
            const data = await response.json();
  
            // Map batch_id and batch_name if available
            if (data.length > 0) {
              const batchId = data[0].batch_id;
              return { ...student, batch_id: batchId, batch_name: batchMapping[batchId] || "Unknown Batch" };
            }
  
            return { ...student, batch_id: null, batch_name: "No Batch Assigned" };
          } catch (error) {
            console.error(`Error fetching batch for user ${student.user_id}:`, error);
            return { ...student, batch_id: null, batch_name: "Batch Fetch Error" };
          }
        });
  
        const updatedStudents = await Promise.all(studentBatchPromises);
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

  return (
    <div style={{ margin: '2rem', marginTop: '6rem', padding: '2rem', backgroundColor: '#fff', borderRadius: '1.5rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <Header category="" title="Students" />

      <button
        style={{
          backgroundColor: '#4a90e2',
          color: '#fff',
          fontWeight: 'bold',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          border: 'none',
        }}
        onClick={() => setShowModal(true)}
      >
        Create New Student
      </button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>S.No</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Phone Number</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Batch Name</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Date of Admission</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.user_id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '0.5rem' }}>{index + 1}</td>
              <td style={{ padding: '0.5rem' }}>{student.name}</td>
              <td style={{ padding: '0.5rem' }}>{student.email}</td>
              <td style={{ padding: '0.5rem' }}>{student.phone_number}</td>
              <td style={{ padding: '0.5rem' }}>{student.batch_name}</td>
              <td style={{ padding: '0.5rem' }}>{student.date_of_admission}</td>
              <td style={{ padding: '0.5rem' }}>{student.status}</td>
              <td style={{ padding: '0.5rem' }}>
                <button
                  onClick={() => handleEditClick(student.user_id)}
                  style={{
                    backgroundColor: '#2196F3',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    border: 'none',
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
  <label
    htmlFor="batch"
    style={{
      display: 'block',
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#333',
      marginBottom: '0.5rem',
    }}
  >
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
  );
};

export default Students;