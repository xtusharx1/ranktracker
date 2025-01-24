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
    const fetchStudents = async () => {
      try {
        const response = await fetch("https://apistudents.sainikschoolcadet.com/api/users/role/2");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await fetch("https://apistudents.sainikschoolcadet.com/api/batches/");
        const data = await response.json();
        setBatches(data);
        const mapping = {};
        data.forEach(batch => {
          mapping[batch.batch_id] = batch.batch_name;
        });
        setBatchMapping(mapping);
      } catch (error) {
        console.error("Error fetching batch data:", error);
      }
    };

    fetchStudents();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (students.length > 0 && Object.keys(batchMapping).length > 0) {
      fetchStudentBatches();
    }
  }, [students, batchMapping]);

  const fetchStudentBatches = async () => {
    try {
      const studentBatchPromises = students.map(student =>
        fetch(`https://apistudents.sainikschoolcadet.com/api/studentBatches/students/search/${student.user_id}`)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              return { user_id: student.user_id, batch_id: data[0].batch_id };
            }
            return { user_id: student.user_id, batch_id: null };
          })
      );

      const studentBatches = await Promise.all(studentBatchPromises);
      const updatedStudents = students.map(student => {
        const batchInfo = studentBatches.find(b => b.user_id === student.user_id);
        return {
          ...student,
          batch_id: batchInfo.batch_id,
          batch_name: batchInfo.batch_id ? batchMapping[batchInfo.batch_id] : "No Batch Assigned"
        };
      });
      setStudents(updatedStudents);
    } catch (error) {
      console.error("Error fetching student batches:", error);
    }
  };

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

    if (!newStudent.name || !newStudent.email || !newStudent.phone_number || !newStudent.password || !newStudent.status || !newStudent.gender) {
      alert("Please fill in all required fields.");
      return;
    }

    if (newStudent.total_course_fees === "" || isNaN(newStudent.total_course_fees)) {
      alert("Total course fees must be a valid number and is required.");
      return;
    }

    const studentData = {
      name: newStudent.name,
      email: newStudent.email,
      password: newStudent.password,
      role_id: 2,
      phone_number: newStudent.phone_number,
      date_of_admission: newStudent.date_of_admission,
      present_class: newStudent.present_class,
      date_of_birth: newStudent.date_of_birth,
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
      const response = await fetch("https://apistudents.sainikschoolcadet.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();

      if (data.user && data.user.id) {
        setStudents([...students, data]);

        const user_id = data.user.id;
        const selectedBatch = newStudent.batch_id;

        await axios.post(`https://apistudents.sainikschoolcadet.com/api/studentBatches/students/batch/`, {
          user_id: user_id,
          batch_id: selectedBatch
        });

        setShowModal(false);
      } else {
        alert("User registration failed. Please check the input data.");
      }
    } catch (error) {
      console.error("Error creating student or adding to batch:", error);
    }
  };

  const handleEditClick = async (userId) => {
    const studentDetails = await fetchStudentDetails(userId);
    if (studentDetails) {
      setEditingStudent(studentDetails);
      setShowEditModal(true);
    }
  };

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/users/user/${editingStudent.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStudent),
      });

      const data = await response.json();

      if (response.ok) {
        setStudents(students.map(student => 
          student.user_id === editingStudent.user_id ? editingStudent : student
        ));
        setShowEditModal(false);
        setEditingStudent(null);
        
        const refreshResponse = await fetch("https://apistudents.sainikschoolcadet.com/api/users/role/2");
        const refreshData = await refreshResponse.json();
        setStudents(refreshData);
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
    setEditingStudent(prev => ({
      ...prev,
      [name]: value
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
                <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Batch </label>
                <select
                  name="batch_id"
                  value={newStudent.batch_id}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
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
                <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 'medium', color: '#333' }}>Batch ID</label>
                <select
                  name="batch_id"
                  value={editingStudent.batch_id}
                  onChange={handleEditChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.3s ease' }}
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