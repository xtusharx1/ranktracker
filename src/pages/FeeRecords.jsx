import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';

const FeeRecords = () => {
  const [feeSummary, setFeeSummary] = useState(null);
  const [upcomingDues, setUpcomingDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentFees, setSelectedStudentFees] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');
  const [feePaymentRecords, setFeePaymentRecords] = useState([]);
  const [otherChargesRecords, setOtherChargesRecords] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ title: '', date: '', amount: '', feeStatusId: '' });
  const [chargeData, setChargeData] = useState({ title: '', date: '', amount: '', feeStatusId: '' });
  const [newFeeStatus, setNewFeeStatus] = useState({
    admissionDate: '',
    totalFees: '',
    feesSubmitted: '',
    remainingFees: '',
    nextDueDate: '',
    user_id: null,
  });
  const [showFeeStatusForm, setShowFeeStatusForm] = useState(false);
  const [feeStatusExists, setFeeStatusExists] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [totalFees, setTotalFees] = useState(123123.00);
  const [feesSubmitted, setFeesSubmitted] = useState(0);
  const [remainingFees, setRemainingFees] = useState(totalFees - feesSubmitted);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const BASE_URL = 'https://apistudents.sainikschoolcadet.com';

  // Define fetchUserDetails function here
  const fetchUserDetails = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/users/admissions/${userId}`);
        setUserDetails(response.data);
        setNewFeeStatus({
            admissionDate: response.data.date_of_admission,
            totalFees: response.data.total_course_fees,
            user_id: response.data.user_id,
            remainingFees: response.data.total_course_fees,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    const fetchFeeSummary = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/feestatus/summary`);
        if (response.ok) {
          const data = await response.json();
          setFeeSummary(data);
        } else {
          console.error('Failed to fetch fee summary');
        }
      } catch (error) {
        console.error('Error fetching fee summary:', error);
      }
    };

    const fetchUpcomingDues = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/feestatus/upcoming-dues`);
        if (response.ok) {
          const data = await response.json();
          const enrichedData = await Promise.all(data.map(async (due) => {
            const userDetails = await fetchUserDetails(due.user_id);
            const batchId = await fetchBatchId(due.user_id);
            return { ...due, userDetails, batch_id: batchId };
          }));
          const sortedData = enrichedData.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
          setUpcomingDues(sortedData);
        } else {
          console.error('Failed to fetch upcoming dues');
        }
      } catch (error) {
        console.error('Error fetching upcoming dues:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBatchId = async (userId) => {
      try {
        const response = await fetch(`${BASE_URL}/api/studentBatches/students/search/${userId}`);
        if (response.ok) {
          const data = await response.json();
          return data[0]?.batch_id;
        } else {
          console.error('Failed to fetch batch ID');
          return null;
        }
      } catch (error) {
        console.error('Error fetching batch ID:', error);
        return null;
      }
    };

    const fetchAllBatches = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/batches/`);
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
        } else {
          console.error('Failed to fetch batches');
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    const fetchAllStudents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/role/2`);
        if (response.ok) {
          const data = await response.json();
          const studentsWithFees = await Promise.all(data.map(async (student) => {
            if (!student.user_id) {
              console.error('Student user_id is undefined:', student);
              return student;
            }
            const feeResponse = await fetch(`${BASE_URL}/api/feestatus/user/${student.user_id}`);
            let remainingFees = 'No fee record found';
            let nextDueDate = null;
            let totalFees = 0;
            let feesSubmitted = 0;
            let feeStatusId = null;
            let paymentCompleted = false;  // Default value
    
            if (feeResponse.ok) {
              const feeData = await feeResponse.json();
              if (feeData.message && feeData.message.includes("No fee statuses found")) {
                console.warn(`No fee statuses found for user_id ${student.user_id}`);
              } else if (Array.isArray(feeData) && feeData.length > 0) {
                const fee = feeData[0];
                remainingFees = `${fee.remainingFees}`;
                nextDueDate = fee.nextDueDate;
                totalFees = fee.totalFees;
                feesSubmitted = fee.feesSubmitted;
                feeStatusId = fee.id;
                paymentCompleted = fee.remainingFees === "0" || fee.paymentCompleted;
              }
            } else {
              console.error('Failed to fetch fee data for user_id:', student.user_id);
            }
            return { ...student, remainingFees, nextDueDate, totalFees, feesSubmitted, feeStatusId, paymentCompleted };
          }));
    
          // Separate students with and without due dates
          const studentsWithDueDates = studentsWithFees.filter(student => student.nextDueDate);
          const studentsWithoutDueDates = studentsWithFees.filter(student => !student.nextDueDate);
    
          // Sort students with due dates by nearest due date
          const sortedStudentsWithDueDates = studentsWithDueDates.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
    
          // Combine sorted students with due dates and students without due dates
          const sortedStudents = [...sortedStudentsWithDueDates, ...studentsWithoutDueDates];
          setStudents(sortedStudents);
        } else {
          console.error('Failed to fetch students');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    

    fetchFeeSummary();
    fetchAllBatches();
    fetchUpcomingDues();
    fetchAllStudents();
  }, []);

  const fetchFeePaymentRecords = async (feeStatusId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/feepaymentrecords/payments/${feeStatusId}`);
        const recordsWithType = response.data.map(record => ({ ...record, type: 'payment' }));
        setFeePaymentRecords(recordsWithType);
    } catch (error) {
        console.error('Error fetching fee payment records:', error);
    }
  };

  const fetchOtherChargesRecords = async (feeStatusId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/otherchargesrecords/charges/${feeStatusId}`);
        const recordsWithType = response.data.map(record => ({ ...record, type: 'charge' }));
        setOtherChargesRecords(recordsWithType);
    } catch (error) {
        console.error('Error fetching other charges records:', error);
    }
  };

  const handleStudentClick = async (student) => {
    console.log('Selected student:', student); // Log the selected student

    // Check if feeStatusId and user_id are defined
    if (!student.feeStatusId || !student.user_id) {
        console.warn('Selected student does not have valid fee status or user ID:', student);
        // Optionally, you can prompt the user to create a fee status
        const createFeeStatus = window.confirm('Selected student does not have a fee status. Would you like to create one?');
        if (createFeeStatus) {
            setSelectedStudent(student);
            setShowFeeStatusForm(true); // Show the form to create a fee status
            return; // Exit the function
        } else {
            return; // Exit if the user does not want to create a fee status
        }
    }

    setSelectedStudent(student);
    setSelectedStudentFees({
        totalFees: student.totalFees || 0,
        feesSubmitted: student.feesSubmitted || 0,
        remainingFees: student.remainingFees || 'No fee record found'
    });

    // Reset the records for the new student
    setFeePaymentRecords([]);
    setOtherChargesRecords([]);

    try {
        // Fetch fee payment records for the selected student's fee status ID
        await fetchFeePaymentRecords(student.feeStatusId);

        // Fetch other charges records for the selected student's fee status ID
        await fetchOtherChargesRecords(student.feeStatusId);
    } catch (error) {
        console.error('Error fetching records for selected student:', error);
    }

    // Fetch user details and fee status for the selected student
    await fetchUserDetails(student.user_id); // Ensure user details are fetched
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    // Create the payment data to send to the API
    const paymentDataToSend = {
        title: paymentData.title,
        date: paymentData.date,
        amount: paymentData.amount,
        isPaid: true,
        feeStatusId: selectedStudent.feeStatusId,
    };

    // Only add nextDueDate if payment is not complete
    if (!paymentData.paymentCompleted) {
        paymentDataToSend.nextDueDate = paymentData.nextDueDate;
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/feepaymentrecords/add-payment`, paymentDataToSend);

        if (response.status === 201) {
            // Add type to the new record
            const newRecord = { ...response.data, type: 'payment' };
            setFeePaymentRecords([...feePaymentRecords, newRecord]);

            // Update the fee status
            const updatedFeesSubmitted = parseFloat(selectedStudentFees.feesSubmitted) + parseFloat(paymentData.amount);
            const updatedRemainingFees = parseFloat(selectedStudentFees.totalFees) - updatedFeesSubmitted;

            // If payment is completed, mark paymentCompleted as true
            const paymentCompleted = updatedRemainingFees <= 0;

            // Update fee status on the server
            await axios.put(`${BASE_URL}/api/feestatus/${selectedStudent.feeStatusId}`, {
                // If payment is complete, don't update nextDueDate
                nextDueDate: paymentCompleted ? null : paymentData.nextDueDate,
                feesSubmitted: updatedFeesSubmitted,
                remainingFees: updatedRemainingFees,
                paymentCompleted: paymentCompleted, // Mark payment as complete
            });

            
            console.log('Updated Fee Status Response:', response.data); 
            // Close the modal
            
            setPaymentModalOpen(false);
            handleStudentClick(selectedStudent);
            setSelectedStudentFees({
              ...selectedStudentFees,
              feesSubmitted: updatedFeesSubmitted,
              remainingFees: updatedRemainingFees,
              paymentCompleted: paymentCompleted,
          });
        }
    } catch (error) {
        console.error('Error adding payment:', error);
    }
};

const handleAddCharge = async (e) => {
  e.preventDefault();
  try {
      const response = await axios.post(`${BASE_URL}/api/otherchargesrecords/add-other-charges`, {
          title: chargeData.title,
          date: chargeData.date,
          amount: chargeData.amount,
          feeStatusId: selectedStudent.feeStatusId
      });

      if (response.status === 201) {
          // Update the state with the new charge record
          setOtherChargesRecords([...otherChargesRecords, response.data]);

          // Optionally, you can also fetch the updated fee status
          fetchUserDetails(selectedStudent.user_id);

          // Ensure remainingFees is a number by removing any currency symbols and converting to float
          const currentRemainingFees = parseFloat(selectedStudentFees.remainingFees.replace(/[^0-9.-]+/g, "")); // Remove currency symbol

          console.log('Current Remaining Fees:', currentRemainingFees);
          console.log('Charge Amount:', chargeData.amount);

          // Update selected student fees after adding the charge
          const updatedTotalFees = parseFloat(selectedStudentFees.totalFees) + parseFloat(chargeData.amount);

          // Ensure remainingFees is updated correctly
          const updatedRemainingFees = currentRemainingFees + parseFloat(chargeData.amount);

          console.log('Updated Remaining Fees after Charge:', updatedRemainingFees);

          // If payment is completed, mark paymentCompleted as true
          const paymentCompleted = updatedRemainingFees <= 0;

          handleStudentClick(selectedStudent);
          // Update the selectedStudentFees state
          setSelectedStudentFees({
            ...selectedStudentFees,
            totalFees: updatedTotalFees,
            remainingFees: updatedRemainingFees,
            paymentCompleted: paymentCompleted,
          });

          // Close the charge modal
          setChargeModalOpen(false);

          // Reload student data after adding charge
      }
  } catch (error) {
      console.error('Error adding charge:', error);
  }
};




  const handleCreateFeeStatus = () => {
    setShowFeeStatusForm(true);
  };

  const handleSubmitFeeStatus = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${BASE_URL}/api/feestatus/`, {
            admissionDate: newFeeStatus.admissionDate,
            totalFees: newFeeStatus.totalFees,
            feesSubmitted: newFeeStatus.feesSubmitted,
            remainingFees: newFeeStatus.remainingFees,
            nextDueDate: newFeeStatus.nextDueDate,
            user_id: newFeeStatus.user_id,
        });

        if (response.status === 201) {
            console.log('Fee status created:', response.data);
            setShowFeeStatusForm(false);
            // Re-fetch students after adding fee status
            await fetchStudentsByBatch(selectedBatch); // Ensure you have the selected batch available
            // Optionally, you can also set the selected student to the one you just updated
            const updatedStudent = {
                ...selectedStudent,
                feeStatusId: response.data.id, // Assuming the response contains the new fee status ID
                totalFees: response.data.totalFees,
                feesSubmitted: response.data.feesSubmitted,
                remainingFees: response.data.remainingFees,
            };
            setSelectedStudent(updatedStudent); // Update the selected student state
        }
    } catch (error) {
        console.error('Error creating fee status:', error);
    }
  };

  useEffect(() => {
    const checkFeeStatus = async () => {
      if (selectedStudent) {
        // Clear stale fee status data
        setFeeStatusExists(false);
        setShowFeeStatusForm(false);

        try {
          const response = await axios.get(`${BASE_URL}/api/feestatus/${selectedStudent.feeStatusId}`);
          if (response.data.length === 0) {
            setFeeStatusExists(false);
          } else {
            setFeeStatusExists(true);
          }
        } catch (error) {
          console.error('Error fetching fee status:', error);
        }
      }
    };

    const fetchUserDetails = async () => {
      if (selectedStudent) {
        try {
          const response = await axios.get(`${BASE_URL}/api/users/admissions/${selectedStudent.user_id}`);
          setUserDetails(response.data);
          setNewFeeStatus({
            ...newFeeStatus,
            admissionDate: response.data.date_of_admission,
            totalFees: response.data.total_course_fees,
            user_id: response.data.user_id,
            remainingFees: response.data.total_course_fees,
          });
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    checkFeeStatus();
    fetchUserDetails();
  }, [selectedStudent]);

  // Reset sidebar when changing the selected student
  useEffect(() => {
    if (selectedStudent) {
      // Reset fee payment records and other charges records
      setFeePaymentRecords([]);
      setOtherChargesRecords([]);
      // Reset new fee status
      setNewFeeStatus({
        admissionDate: '',
        totalFees: '',
        feesSubmitted: '0',
        remainingFees: '',
        nextDueDate: '',
        user_id: null,
      });
      setShowFeeStatusForm(false); // Hide the form
    }
  }, [selectedStudent]);

  const handleUserSelection = (student) => {
    setSelectedStudent(student);
    window.location.reload(); // Reload the page with the selected user
  };

  useEffect(() => {
    setRemainingFees(totalFees - feesSubmitted);
  }, [totalFees, feesSubmitted]);

  // Add this useEffect to calculate remaining fees
  useEffect(() => {
    const totalFees = parseFloat(newFeeStatus.totalFees) || 0;
    const feesSubmitted = parseFloat(newFeeStatus.feesSubmitted) || 0;
    const remainingFees = totalFees - feesSubmitted;
    setNewFeeStatus((prev) => ({ ...prev, remainingFees }));
  }, [newFeeStatus.totalFees, newFeeStatus.feesSubmitted]);

  // Modal Component
  const Modal = ({ children, onClose }) => {
    return ReactDOM.createPortal(
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '5px',
          width: '400px',
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}>✖</button>
          {children}
        </div>
      </div>,
      document.body
    );
  };

  const fetchStudentsByBatch = async (batchId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/studentBatches/students/batch/${batchId}`);
        if (response.ok) {
            const studentsData = await response.json();
            console.log('Fetched students:', studentsData); // Log the fetched data

            // Fetch fee status and user details for each student
            const enrichedStudents = await Promise.all(studentsData.map(async (student) => {
                try {
                    // Fetch fee status
                    const feeResponse = await fetch(`${BASE_URL}/api/feestatus/user/${student.user_id}`);
                    let feeData = {};
                    if (feeResponse.ok) {
                        feeData = await feeResponse.json();
                    }

                    // Fetch user details
                    const userResponse = await fetch(`${BASE_URL}/api/users/user/${student.user_id}`);
                    let userName = 'Unnamed Student';
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        userName = userData.user.name; // Access the name from the user object
                    }

                    // Enrich student data
                    return {
                        ...student,
                        feeStatusId: feeData[0]?.id || null, // Assuming the fee status ID is in the first item
                        totalFees: feeData[0]?.totalFees || 0,
                        feesSubmitted: feeData[0]?.feesSubmitted || 0,
                        remainingFees: feeData[0]?.remainingFees || 0,
                        nextDueDate: feeData[0]?.nextDueDate || null,
                        name: userName // Add the user's name to the student object
                    };
                } catch (error) {
                    console.error('Error fetching fee status or user details:', error);
                }
                return student; // Return the student even if fetch fails
            }));

            setStudents(enrichedStudents); // Set enriched students with fee statuses and names
        } else {
            console.error('Failed to fetch students for the selected batch');
            setStudents([]); // Clear students if fetch fails
        }
    } catch (error) {
        console.error('Error fetching students for the selected batch:', error);
        setStudents([]); // Clear students if an error occurs
    }
  };

  const handleBatchChange = (event) => {
    const batchId = event.target.value;
    setSelectedBatch(batchId);
    if (batchId) {
        fetchStudentsByBatch(batchId);
    } else {
        setStudents([]);
    }
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  useEffect(() => {
    if (sortOrder === 'asc') {
      setStudents((prevStudents) => [...prevStudents].sort((a, b) => a.remainingFees - b.remainingFees));
    } else {
      setStudents((prevStudents) => [...prevStudents].sort((a, b) => b.remainingFees - a.remainingFees));
    }
  }, [sortOrder]);

  const mergeSortRecords = (records) => {
    if (records.length <= 1) return records;

    const mid = Math.floor(records.length / 2);
    const left = mergeSortRecords(records.slice(0, mid));
    const right = mergeSortRecords(records.slice(mid));

    return mergeRecords(left, right);
  };

  const mergeRecords = (left, right) => {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (new Date(left[leftIndex].date) > new Date(right[rightIndex].date)) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  };

  // Update the rendering of records to merge payment and charge records by date in descending order
  const combinedRecords = mergeSortRecords([...feePaymentRecords, ...otherChargesRecords]);

  if (loading) {
    return <div style={{ textAlign: 'center', fontSize: '18px' }}>Loading fee summary...</div>;
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif', color: '#333', height: '100vh' }}>
      <div style={{
  width: '300px',
  borderRight: '1px solid #ddd',
  padding: '20px',
  backgroundColor: '#f9fafb',
  overflowY: 'auto',
  boxShadow: '2px 0px 8px rgba(0, 0, 0, 0.1)',
  height: '100vh',
}}>
  <h2 style={{
    textAlign: 'center',
    color: '#1D72B8',
    fontSize: '18px',
    marginBottom: '20px',
    fontWeight: '500',
  }}>
    Search For Course
  </h2>
  <select onChange={handleBatchChange} style={{
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#555',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'border-color 0.3s',
  }}>
    <option value="">Select Course</option>
    {batches.map(batch => (
      <option key={batch.batch_id} value={batch.batch_id}>{batch.batch_name}</option>
    ))}
  </select>

  <h2 style={{
    textAlign: 'center',
    color: '#1D72B8',
    fontSize: '18px',
    marginBottom: '20px',
    fontWeight: '500',
  }}>
    Students
  </h2>
  <div style={{
    marginBottom: '20px',
    textAlign: 'center',
  }}>
    <input
      type="text"
      placeholder="Search by name"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        width: '80%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '14px',
        color: '#555',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'border-color 0.3s',
      }}
    />
  </div>

  <ul style={{
    listStyleType: 'none',
    padding: '0',
    margin: '0',
  }}>
    {students.filter(student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ).length > 0 ? (
      students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ).map((student) => (
        <li key={student.user_id} style={{
          padding: '15px',
          borderBottom: '1px solid #ddd',
          cursor: 'pointer',
          backgroundColor: '#ffffff',
          marginBottom: '10px',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }} onClick={() => handleStudentClick(student)}>
          <div style={{
            fontWeight: 'bold',
            color: '#333',
            fontSize: '16px',
            marginBottom: '5px',
          }}>
            {student.name || 'Unnamed Student'}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#888',
          }}>
            Balance : {student.remainingFees ? `${student.remainingFees}` : 'No Fees Due'}
          </div>
        </li>
      ))
    ) : (
      <li style={{
        padding: '10px',
        color: '#888',
        textAlign: 'center',
      }}>
        No students found for this batch.
      </li>
    )}
  </ul>
</div>

      <div style={{ flex: '1', padding: '20px', overflowY: 'auto', backgroundColor: '#fff' }}>
        {selectedStudent ? (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#4A90E2' }}>{selectedStudent.name}'s Fee Details</h2>

            {!feeStatusExists ? (
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleCreateFeeStatus} style={{ padding: '10px 20px', backgroundColor: '#4A90E2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Create Fee Status
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                  <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', flex: '1', margin: '10px', textAlign: 'center', backgroundColor: '#E0F7FA', color: '#00796B' }}>
                    <h3>Total Fees</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedStudentFees.totalFees}</p>
                  </div>
                  <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', flex: '1', margin: '10px', textAlign: 'center', backgroundColor: '#E8F5E9', color: '#388E3C' }}>
                    <h3>Fees Submitted</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedStudentFees.feesSubmitted}</p>
                  </div>
                  <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', flex: '1', margin: '10px', textAlign: 'center', backgroundColor: '#FFEBEE', color: '#D32F2F' }}>
                    <h3>Remaining Fees</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedStudentFees.remainingFees}</p>
                  </div>
                  <div
  style={{
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '5px',
    flex: '1',
    margin: '10px',
    textAlign: 'center',
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  }}
>
<h3>Next Due Date</h3>
<p style={{ fontSize: '24px', fontWeight: 'bold' }}>
  {selectedStudent.nextDueDate
    ? new Date(selectedStudent.nextDueDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : selectedStudent.paymentCompleted
    ? 'Payment Completed'
    : 'No Due Date'}
</p>

</div>

                </div>

                <div style={{ marginTop: '20px' }}>
                  {combinedRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'red' }}>
                        <p>No records found for this student.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
  <thead>
    <tr>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Title</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Date</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>You Gave</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>You Got</th>
    </tr>
  </thead>
  <tbody>
    {combinedRecords.map(record => (
      <tr
        key={record.id}
        style={{
          backgroundColor: record.type === 'charge' ? '#FFEBEE' : record.type === 'payment' ? '#E8F5E9' : '#fff'
        }}
      >
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.title}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
        {new Date(record.date).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>

        {/* "You Gave" Column */}
        <td
          style={{
            border: '1px solid #ddd',
            padding: '8px',
            color: record.type === 'charge' ? 'red' : 'inherit',
            backgroundColor: record.type === 'charge' ? '#FFEBEE' : '#fff',
          }}
        >
          {record.type === 'charge' ? record.amount : '-'}
        </td>

        {/* "You Got" Column */}
        <td
          style={{
            border: '1px solid #ddd',
            padding: '8px',
            color: record.type === 'payment' ? 'green' : 'inherit',
            backgroundColor: record.type === 'payment' ? '#E8F5E9' : '#fff',
          }}
        >
          {record.type === 'payment' ? record.amount : '-'}
        </td>
      </tr>
    ))}
  </tbody>
</table>

                  )}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => setPaymentModalOpen(true)} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#388E3C', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                    You Got
                  </button>
                  <button onClick={() => setChargeModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#D32F2F', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                    You Gave
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>Select a student to view their fee details.</p>
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  }}>
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '5px', width: '400px' }}>
      <h2 style={{ marginBottom: '20px', color: '#4A90E2' }}>You Get</h2>
      <form onSubmit={handleAddPayment}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Installment</label>
          <select
            value={paymentData.title}
            onChange={(e) => setPaymentData({ ...paymentData, title: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
          >
            <option value="">Select Installment</option>
            <option value="1st Installment">1st Installment</option>
            <option value="2nd Installment">2nd Installment</option>
            <option value="3rd Installment">3rd Installment</option>
            <option value="4th Installment">4th Installment</option>
            <option value="5th Installment">5th Installment</option>
            <option value="6th Installment">6th Installment</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Payment Date</label>
          <input
            type="date"
            value={paymentData.date}
            onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
          <input
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
          />
        </div>
        
        {/* New field to mark if payment is complete */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={paymentData.paymentCompleted}
              onChange={(e) => setPaymentData({ ...paymentData, paymentCompleted: e.target.checked })}
            />
            Payment Completed
          </label>
        </div>

        {/* Conditionally render the 'Next Due Date' field */}
        {!paymentData.paymentCompleted && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Next Due Date</label>
            <input
              type="date"
              value={paymentData.nextDueDate}
              onChange={(e) => setPaymentData({ ...paymentData, nextDueDate: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => setPaymentModalOpen(false)}
            style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ padding: '10px 20px', backgroundColor: '#4A90E2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Add Payment
          </button>
        </div>
      </form>
    </div>
  </div>
)}



      {/* Charge Modal */}
      {isChargeModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h2 style={{ marginBottom: '20px', color: '#4A90E2' }}>Add Other Charges</h2>
            <form onSubmit={handleAddCharge}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input
                  type="text"
                  value={chargeData.title}
                  onChange={(e) => setChargeData({ ...chargeData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
                <input
                  type="date"
                  value={chargeData.date}
                  onChange={(e) => setChargeData({ ...chargeData, date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
                <input
                  type="number"
                  value={chargeData.amount}
                  onChange={(e) => setChargeData({ ...chargeData, amount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setChargeModalOpen(false)}
                  style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', backgroundColor: '#4A90E2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Add Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeeStatusForm && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '5px',
                width: '400px',
                position: 'relative',
            }}>
                <button onClick={() => setShowFeeStatusForm(false)} style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                }}>✖</button>
                <h2 style={{ marginBottom: '20px', color: '#4A90E2', textAlign: 'center' }}>Create Fee Status</h2>
                <form onSubmit={handleSubmitFeeStatus}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Admission Date</label>
                        <input
                            type="date"
                            value={newFeeStatus.admissionDate}
                            onChange={(e) => setNewFeeStatus({ ...newFeeStatus, admissionDate: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Total Fees</label>
                        <input
                            type="number"
                            value={newFeeStatus.totalFees}
                            onChange={(e) => setNewFeeStatus({ ...newFeeStatus, totalFees: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Fees Submitted</label>
                        <input
                            type="number"
                            value={newFeeStatus.feesSubmitted}
                            onChange={(e) => setNewFeeStatus({ ...newFeeStatus, feesSubmitted: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Remaining Fees</label>
                        <input
                            type="number"
                            value={newFeeStatus.remainingFees}
                            onChange={(e) => setNewFeeStatus({ ...newFeeStatus, remainingFees: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Next Due Date</label>
                        <input
                            type="date"
                            value={newFeeStatus.nextDueDate}
                            onChange={(e) => setNewFeeStatus({ ...newFeeStatus, nextDueDate: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button type="button" onClick={() => setShowFeeStatusForm(false)} style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}>
                            Cancel
                        </button>
                        <button type="submit" style={{
                            padding: '10px 20px',
                            backgroundColor: '#4A90E2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default FeeRecords;
