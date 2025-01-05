import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Sort,
  Search,
  Inject,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import { Header } from "../components";
import axios from 'axios';

const formatDateToIST = (dateString) => {
  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
  };
  
  // Format the date to DD-MM-YYYY HH:MM:SS
  const formattedDate = date.toLocaleString('en-IN', options);
  
  // Replace the default formatting with the desired format
  const [datePart, timePart] = formattedDate.split(', ');
  const [day, month, year] = datePart.split('/');
  return `${day}-${month}-${year} ${timePart}`;
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]); // State for batches
  const [showModal, setShowModal] = useState(false); // State for controlling modal visibility
  const [newStudent, setNewStudent] = useState({
    role_id: 2, // Default role_id for student
    name: "",
    email: "",
    phone_number: "",
    profile_picture: null,
    password: "",
    status: "active", // default status
    date_of_admission: "",
    present_class: "",
    date_of_birth: "",
    total_course_fees: "", // Ensure this is a number
    father_name: "",
    mother_name: "",
    full_address: "",
    child_aadhar_number: "",
    mother_aadhar_number: "",
    father_aadhar_number: "",
    permanent_education_number: "",
    student_registration_number: "",
    previous_school_info: "",
    gender: "", // New field
    state: "", // New field
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/users/role/2");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/batches/");
        const data = await response.json();
        setBatches(data); // Set batches data
      } catch (error) {
        console.error("Error fetching batch data:", error);
      }
    };

    fetchStudents();
    fetchBatches(); // Fetch batches on component mount
  }, []);

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({
      ...newStudent,
      [name]: value,
    });
  };

  // Handle file upload for profile picture
  const handleFileChange = (e) => {
    setNewStudent({
      ...newStudent,
      profile_picture: e.target.files[0],
    });
  };

  // Handle form submission
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

    // Construct the studentData object to match the specified format
    const studentData = {
      name: newStudent.name,
      email: newStudent.email,
      password: newStudent.password,
      role_id: newStudent.role_id,
      phone_number: newStudent.phone_number,
      date_of_admission: formatDateToIST(newStudent.date_of_admission), // Format date of admission
      present_class: newStudent.present_class,
      date_of_birth: formatDateToIST(newStudent.date_of_birth), // Format date of birth
      total_course_fees: parseFloat(newStudent.total_course_fees), // Ensure this is a number
      father_name: newStudent.father_name,
      mother_name: newStudent.mother_name,
      full_address: newStudent.full_address,
      child_aadhar_number: newStudent.child_aadhar_number,
      mother_aadhar_number: newStudent.mother_aadhar_number,
      father_aadhar_number: newStudent.father_aadhar_number,
      permanent_education_number: newStudent.permanent_education_number,
      student_registration_number: newStudent.student_registration_number,
      previous_school_info: newStudent.previous_school_info,
      gender: newStudent.gender,
      state: newStudent.state,
      status: newStudent.status, // Ensure status is included
      created_at: formatDateToIST(newStudent.created_at), // Format created_at
    };

    try {
      // Create the new student
      const response = await fetch("http://localhost:3002/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      const data = await response.json();
      console.log("New student created:", data);

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
        const addStudentToBatchResponse = await axios.post(`http://localhost:3002/api/studentBatches/students/batch/`, {
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
  };

  return (
    <div className="m-2 mt-24 md:m-10 p-2 md:p-10 bg-gray-100 rounded-3xl">
      <Header category="Page" title="Students" />

      {/* Button to Open the Modal */}
      <button
        className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setShowModal(true)}
      >
        Create New Student
      </button>

      {/* Syncfusion Grid to display student data */}
      <GridComponent
        dataSource={students.map(student => ({
          ...student,
          created_at: formatDateToIST(student.created_at), // Format created_at here
        }))}
        allowPaging
        allowSorting
        toolbar={["Search"]}
        width="auto"
      >
        <ColumnsDirective>
          <ColumnDirective field="name" headerText="Name" width="150" textAlign="Center" />
          <ColumnDirective field="email" headerText="Email" width="200" textAlign="Center" />
          <ColumnDirective field="phone_number" headerText="Phone Number" width="150" textAlign="Center" />
          <ColumnDirective field="status" headerText="Status" width="100" textAlign="Center" />
          <ColumnDirective field="created_at" headerText="Date Created" width="180" textAlign="Center" />
        </ColumnsDirective>
        <Inject services={[Page, Search, Toolbar, Sort]} />
      </GridComponent>

      {/* Modal for Creating New Student */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl h-full max-h-screen overflow-y-auto">
            <h2 className="text-3xl font-semibold text-center mb-8">Create New Student</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Phone Number Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="phone_number"
                  value={newStudent.phone_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={newStudent.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Status Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                <select
                  name="status"
                  value={newStudent.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Other Fields */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Date of Admission</label>
                <input
                  type="date"
                  name="date_of_admission"
                  value={newStudent.date_of_admission}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Present Class</label>
                <input
                  type="text" 
                  name="present_class"
                  value={newStudent.present_class}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={newStudent.date_of_birth}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Total Course Fees */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Total Course Fees</label>
                <input
                  type="number"
                  name="total_course_fees"
                  value={newStudent.total_course_fees}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Gender Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* State Field */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={newStudent.state}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Batch ID Dropdown */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Batch ID</label>
                <select
                  name="batch_id"
                  value={newStudent.batch_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Father's Name */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Father's Name</label>
                <input
                  type="text"
                  name="father_name"
                  value={newStudent.father_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Mother's Name */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Mother's Name</label>
                <input
                  type="text"
                  name="mother_name"
                  value={newStudent.mother_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Full Address */}
              <div className="mb-4 md:col-span-2">
                <label className="block text-lg font-medium text-gray-700">Full Address</label>
                <textarea
                  name="full_address"
                  value={newStudent.full_address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Aadhar Numbers */}
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Child Aadhar Number</label>
                <input
                  type="text"
                  name="child_aadhar_number"
                  value={newStudent.child_aadhar_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Permanent Education Number</label>
                <input
                  type="text"
                  name="permanent_education_number"
                  value={newStudent.permanent_education_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">Student Registration Number</label>
                <input
                  type="text"
                  name="student_registration_number"
                  value={newStudent.student_registration_number}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4 md:col-span-2">
                <label className="block text-lg font-medium text-gray-700">Previous School Information</label>
                <textarea
                  name="previous_school_info"
                  value={newStudent.previous_school_info}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 mt-6 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-800 text-white py-2 px-4 rounded-md"
                >
                  Save
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