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
            if (feeResponse.ok) {
              const feeData = await feeResponse.json();
              if (feeData.message && feeData.message.includes("No fee statuses found")) {
                console.warn(`No fee statuses found for user_id ${student.user_id}`);
              } else if (Array.isArray(feeData) && feeData.length > 0) {
                remainingFees = `₹${feeData[0].remainingFees}`;
                nextDueDate = feeData[0].nextDueDate;
                totalFees = feeData[0].totalFees;
                feesSubmitted = feeData[0].feesSubmitted;
                feeStatusId = feeData[0].id;
              }
            } else {
              console.error('Failed to fetch fee data for user_id:', student.user_id);
            }
            return { ...student, remainingFees, nextDueDate, totalFees, feesSubmitted, feeStatusId };
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
        const feePaymentResponse = await axios.get(`${BASE_URL}/api/feepaymentrecords/payments/${student.feeStatusId}`);
        setFeePaymentRecords(feePaymentResponse.data);

        // Fetch other charges records for the selected student's fee status ID
        const otherChargesResponse = await axios.get(`${BASE_URL}/api/otherchargesrecords/charges/${student.feeStatusId}`);
        setOtherChargesRecords(otherChargesResponse.data);
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
    try {
        const response = await axios.post(`${BASE_URL}/api/feepaymentrecords/add-payment`, {
            title: paymentData.title,
            date: paymentData.date,
            amount: paymentData.amount,
            isPaid: true, // Assuming the payment is marked as paid by default
            feeStatusId: selectedStudent.feeStatusId // Use the selected student's fee status ID
        });

        if (response.status === 201) {
            // Update the selected student's fee status
            const updatedStudent = {
                ...selectedStudent,
                feesSubmitted: response.data.feeStatus.feesSubmitted,
                remainingFees: response.data.feeStatus.remainingFees
            };
            setSelectedStudent(updatedStudent);
            setSelectedStudentFees({
                totalFees: updatedStudent.totalFees,
                feesSubmitted: updatedStudent.feesSubmitted,
                remainingFees: updatedStudent.remainingFees
            });
            // Refresh the fee payment records
            setFeePaymentRecords([...feePaymentRecords, response.data]);
            // Close the modal
            setPaymentModalOpen(false);
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
            feeStatusId: selectedStudent.feeStatusId // Use the selected student's fee status ID
        });

        if (response.status === 201) {
            // Refresh the other charges records
            setOtherChargesRecords([...otherChargesRecords, response.data]);
            // Close the modal
            setChargeModalOpen(false);
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

  if (loading) {
    return <div style={{ textAlign: 'center', fontSize: '18px' }}>Loading fee summary...</div>;
  }

  return (
    <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif', color: '#333', height: '100vh' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ddd', padding: '20px', backgroundColor: '#f8f8f8', overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center', color: '#4A90E2' }}>Batch Filter</h2>
        <select onChange={handleBatchChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '20px' }}>
          <option value="">Select Batch</option>
          {batches.map(batch => (
            <option key={batch.batch_id} value={batch.batch_id}>{batch.batch_name}</option>
          ))}
        </select>

        

        <h2 style={{ textAlign: 'center', color: '#4A90E2' }}>Students</h2>
        <ul style={{ listStyleType: 'none', padding: '0' }}>
          {students.length > 0 ? (
            students.map((student) => (
              <li key={student.user_id} style={{ padding: '10px', borderBottom: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#f0f0f0', marginBottom: '5px', transition: 'background-color 0.3s' }} onClick={() => handleStudentClick(student)}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{student.name || 'Unnamed Student'}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{student.remainingFees}</div>
              </li>
            ))
          ) : (
            <li style={{ padding: '10px', color: '#888' }}>No students found for this batch.</li>
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
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => handleTabChange('payments')} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: activeTab === 'payments' ? '#4A90E2' : '#f0f0f0', color: activeTab === 'payments' ? '#fff' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                    Fee Payment Records
                  </button>
                  <button onClick={() => handleTabChange('charges')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'charges' ? '#4A90E2' : '#f0f0f0', color: activeTab === 'charges' ? '#fff' : '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                    Other Charges Record
                  </button>
                </div>
                {activeTab === 'payments' ? (
                  <div style={{ marginTop: '20px' }}>
                    {feePaymentRecords.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'red' }}>
                        <p>No fee payment records found for this student.</p>
                      </div>
                    ) : (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Title</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Date</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Amount</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feePaymentRecords.map(record => (
                              <tr key={record.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.title}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.date}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.amount}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.isPaid ? 'Paid' : 'Pending'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <button onClick={() => setPaymentModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#388E3C', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', display: 'block', margin: '20px auto' }}>
                      Add Payment Record
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '20px' }}>
                    {otherChargesRecords.length === 0 ? (
                      <div>
                        <center><p>No other charges records found for this student.</p></center>
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Title</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Date</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {otherChargesRecords.map(record => (
                            <tr key={record.id}>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.title}</td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.date}</td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <button onClick={() => setChargeModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#388E3C', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', display: 'block', margin: '20px auto' }}>
                      Add Other Charges
                    </button>
                  </div>
                )}
              </div>
            )}

            {showFeeStatusForm && (
              <Modal onClose={() => setShowFeeStatusForm(false)}>
                <form onSubmit={handleSubmitFeeStatus} style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>User ID:</label>
                    <input type="text" value={newFeeStatus.user_id} readOnly style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Admission Date:</label>
                    <input type="text" value={newFeeStatus.admissionDate} readOnly style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Total Fees:</label>
                    <input
                      type="text"
                      value={newFeeStatus.totalFees}
                      onChange={(e) => {
                        // Update the state with the new value
                        setNewFeeStatus((prev) => ({
                          ...prev,
                          totalFees: e.target.value, // Use the current input value
                        }));
                      }}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Fees Submitted:</label>
                    <input
                      type="text"
                      value={newFeeStatus.feesSubmitted}
                      onChange={(e) => setNewFeeStatus({ ...newFeeStatus, feesSubmitted: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Remaining Fees:</label>
                    <input
                      type="text"
                      value={newFeeStatus.remainingFees}
                      readOnly
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Next Due Date:</label>
                    <input
                      type="date"
                      value={newFeeStatus.nextDueDate}
                      onChange={(e) => setNewFeeStatus({ ...newFeeStatus, nextDueDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#388E3C', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Submit Fee Status
                  </button>
                </form>
              </Modal>
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
          <h2 style={{ marginBottom: '20px', color: '#4A90E2' }}>Add Payment Record</h2>
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
                <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
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
    </div>
  );
};

export default FeeRecords;