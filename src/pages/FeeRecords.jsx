import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Constants
const BASE_URL = 'https://apistudents.sainikschoolcadet.com';

// Utility functions
const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : 'No Date';
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
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
        borderRadius: '10px',
        width: '400px',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#555',
        }}>✖</button>
        <h2 style={{ 
          marginBottom: '20px', 
          color: '#1D72B8', 
          textAlign: 'center',
          fontSize: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

// Student List Component
const StudentList = ({ students, searchTerm, onStudentClick, selectedStudent }) => {
  const filteredStudents = useMemo(() => {
    const seenIds = new Set();
    return students
      .filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(student => {
        // Deduplicate by user_id
        if (seenIds.has(student.user_id)) return false;
        seenIds.add(student.user_id);
        return true;
      });
  }, [students, searchTerm]);

  return (
    <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
      {filteredStudents.length > 0 ? (
        filteredStudents.map((student) => (
          <li 
            key={student.user_id} 
            style={{
              padding: '15px',
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
              backgroundColor: selectedStudent?.user_id === student.user_id ? '#E3F2FD' : '#ffffff',
              marginBottom: '10px',
              transition: 'all 0.2s ease',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }} 
            onClick={() => onStudentClick(student)}
          >
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
              color: student.remainingFees > 0 ? '#D32F2F' : '#388E3C',
              fontWeight: '500',
            }}>
              Balance: {student.remainingFees || 'No Fees Due'}
            </div>
          </li>
        ))
      ) : (
        <li style={{
          padding: '15px',
          color: '#888',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          No students found.
        </li>
      )}
    </ul>
  );
};

// Fee Summary Cards Component
const FeeSummaryCards = ({ studentFees, nextDueDate, paymentCompleted }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '10px', 
        flex: '1', 
        margin: '10px', 
        textAlign: 'center', 
        backgroundColor: '#E0F7FA', 
        color: '#00796B',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h3>Total Fees</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{studentFees.totalFees || 0}</p>
      </div>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '10px', 
        flex: '1', 
        margin: '10px', 
        textAlign: 'center', 
        backgroundColor: '#E8F5E9', 
        color: '#388E3C',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h3>Fees Submitted</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{studentFees.feesSubmitted || 0}</p>
      </div>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '10px', 
        flex: '1', 
        margin: '10px', 
        textAlign: 'center', 
        backgroundColor: '#FFEBEE', 
        color: '#D32F2F',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' 
      }}>
        <h3>Remaining Fees</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{studentFees.remainingFees || 0}</p>
      </div>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '10px', 
        flex: '1', 
        margin: '10px', 
        textAlign: 'center', 
        backgroundColor: '#FFF3E0', 
        color: '#E65100',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h3>Next Due Date</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {nextDueDate ? formatDate(nextDueDate) : 
           paymentCompleted ? 'Payment Completed' : 'No Due Date'}
        </p>
      </div>
    </div>
  );
};

// Records Table Component
const RecordsTable = ({ records }) => {
  if (records.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        color: '#555',
        padding: '30px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <p>No transaction records found.</p>
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', marginTop: '20px' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2', borderTopLeftRadius: '8px' }}>Title</th>
          <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2' }}>Date</th>
          <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2' }}>You Gave</th>
          <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2', borderTopRightRadius: '8px' }}>You Got</th>
        </tr>
      </thead>
      <tbody>
        {records.map(record => (
          <tr
            key={record.id}
            style={{
              backgroundColor: record.type === 'charge' ? '#FFEBEE' : record.type === 'payment' ? '#E8F5E9' : '#fff',
              transition: 'background-color 0.2s'
            }}
          >
            <td style={{ border: '1px solid #ddd', padding: '12px' }}>{record.title}</td>
            <td style={{ border: '1px solid #ddd', padding: '12px' }}>{formatDate(record.date)}</td>
            <td style={{ 
              border: '1px solid #ddd', 
              padding: '12px',
              color: record.type === 'charge' ? '#D32F2F' : 'inherit',
              fontWeight: record.type === 'charge' ? '600' : 'normal'
            }}>
              {record.type === 'charge' ? `₹${record.amount}` : '-'}
            </td>
            <td style={{ 
              border: '1px solid #ddd', 
              padding: '12px',
              color: record.type === 'payment' ? '#388E3C' : 'inherit',
              fontWeight: record.type === 'payment' ? '600' : 'normal'
            }}>
              {record.type === 'payment' ? `₹${record.amount}` : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Main Component
const FeeRecords = () => {
  // State declarations
  // State declarations
const [feeSummary, setFeeSummary] = useState(null);
const [batches, setBatches] = useState([]);
const [students, setStudents] = useState([]);
const [selectedStudent, setSelectedStudent] = useState(null);
const [selectedStudentFees, setSelectedStudentFees] = useState({
  totalFees: 0,
  feesSubmitted: 0,
  remainingFees: 0
});
const [feePaymentRecords, setFeePaymentRecords] = useState([]);
const [otherChargesRecords, setOtherChargesRecords] = useState([]);
const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
const [isChargeModalOpen, setChargeModalOpen] = useState(false);
const [showFeeStatusForm, setShowFeeStatusForm] = useState(false);
const [feeStatusExists, setFeeStatusExists] = useState(false);
const [selectedBatch, setSelectedBatch] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [loading, setLoading] = useState(true);

// Form state
const [paymentData, setPaymentData] = useState({ 
  title: '', 
  date: '', 
  amount: '', 
  paymentCompleted: false, 
  nextDueDate: '' 
});

const [chargeData, setChargeData] = useState({ 
  title: '', 
  date: '', 
  amount: '' 
});

const [newFeeStatus, setNewFeeStatus] = useState({
  admissionDate: '',
  totalFees: '',
  feesSubmitted: '0',
  remainingFees: '',
  nextDueDate: '',
  user_id: null,
});

// API Functions
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    
    // Parallel API requests for better performance
    const [batchesRes, feeSummaryRes] = await Promise.all([
      fetch(`${BASE_URL}/api/batches/`),
      fetch(`${BASE_URL}/api/feestatus/summary`)
    ]);
    
    if (batchesRes.ok) {
      const batchesData = await batchesRes.json();
      setBatches(batchesData);
    }
    
    if (feeSummaryRes.ok) {
      const summaryData = await feeSummaryRes.json();
      setFeeSummary(summaryData);
    }
  } catch (error) {
    console.error('Error fetching initial data:', error);
  } finally {
    setLoading(false);
  }
}, []);

// First define fetchStudentRecords which doesn't depend on other functions
const fetchStudentRecords = useCallback(async (student) => {
  if (!student || !student.feeStatusId) return;
  
  try {
    const [paymentsRes, chargesRes] = await Promise.all([
      fetch(`${BASE_URL}/api/feepaymentrecords/payments/${student.feeStatusId}`),
      fetch(`${BASE_URL}/api/otherchargesrecords/charges/${student.feeStatusId}`)
    ]);
    
    if (paymentsRes.ok) {
      const payments = await paymentsRes.json();
      setFeePaymentRecords(payments.map(record => ({ ...record, type: 'payment' })));
    }
    
    if (chargesRes.ok) {
      const charges = await chargesRes.json();
      setOtherChargesRecords(charges.map(record => ({ ...record, type: 'charge' })));
    }
  } catch (error) {
    console.error('Error fetching student records:', error);
  }
}, []);

// Create a function to select a student without dependencies on fetchStudentsByBatch
const selectStudent = useCallback(async (student) => {
  // Save the selected student's ID and batch to localStorage
  localStorage.setItem('lastSelectedStudentId', student.user_id);
  if (selectedBatch) {
    localStorage.setItem('lastSelectedBatchId', selectedBatch);
  }
  
  setSelectedStudent(student);
  
  // Reset the records when a new student is selected
  setFeePaymentRecords([]);
  setOtherChargesRecords([]);
  
  if (!student.feeStatusId) {
    setFeeStatusExists(false);
    setShowFeeStatusForm(true);
    return;
  }
  
  setFeeStatusExists(true);
  setSelectedStudentFees({
    totalFees: student.totalFees || 0,
    feesSubmitted: student.feesSubmitted || 0,
    remainingFees: student.remainingFees || 0
  });
  
  await fetchStudentRecords(student);
  
  // Reset forms
  setNewFeeStatus({
    admissionDate: '',
    totalFees: student.totalFees || '',
    feesSubmitted: '0',
    remainingFees: student.remainingFees || '',
    nextDueDate: '',
    user_id: student.user_id,
  });
}, [fetchStudentRecords, selectedBatch]);

// Now create handleStudentClick using selectStudent
const handleStudentClick = useCallback((student) => {
  selectStudent(student);
}, [selectStudent]);

// Finally define fetchStudentsByBatch using selectStudent
const fetchStudentsByBatch = useCallback(async (batchId) => {
  if (!batchId) {
    setStudents([]);
    return;
  }
  
  try {
    setLoading(true);
    const response = await fetch(`${BASE_URL}/api/studentBatches/students/batch/${batchId}`);
    
    if (response.ok) {
      const studentsData = await response.json();
      
      // Process all students in parallel for better performance
      const enrichedStudents = await Promise.all(studentsData.map(async (student) => {
        try {
          // Parallel requests for each student
          const [feeResponse, userResponse] = await Promise.all([
            fetch(`${BASE_URL}/api/feestatus/user/${student.user_id}`),
            fetch(`${BASE_URL}/api/users/user/${student.user_id}`)
          ]);
          
          let feeData = {};
          let userName = 'Unnamed Student';
          
          if (feeResponse.ok) {
            const feeResult = await feeResponse.json();
            if (Array.isArray(feeResult) && feeResult.length > 0) {
              feeData = feeResult[0];
            }
          }
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userName = userData.user?.name || 'Unnamed Student';
          }
          
          return {
            ...student,
            name: userName,
            feeStatusId: feeData.id || null,
            totalFees: feeData.totalFees || 0,
            feesSubmitted: feeData.feesSubmitted || 0,
            remainingFees: feeData.remainingFees || 0,
            nextDueDate: feeData.nextDueDate || null,
            paymentCompleted: feeData.paymentCompleted || false
          };
        } catch (error) {
          console.error(`Error enriching student data for ID: ${student.user_id}`, error);
          return student;
        }
      }));
      
      // Sort by next due date, null dates at the end
      const sortedStudents = enrichedStudents.sort((a, b) => {
        if (a.nextDueDate && b.nextDueDate) {
          return new Date(a.nextDueDate) - new Date(b.nextDueDate);
        }
        return a.nextDueDate ? -1 : 1;
      });
      
      setStudents(sortedStudents);
      
      // Check if we need to restore the previously selected student
      const lastSelectedStudentId = localStorage.getItem('lastSelectedStudentId');
      if (lastSelectedStudentId) {
        const lastStudent = sortedStudents.find(s => s.user_id === lastSelectedStudentId);
        if (lastStudent) {
          selectStudent(lastStudent);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    setStudents([]);
  } finally {
    setLoading(false);
  }
}, [selectStudent]);

const handleBatchChange = useCallback((event) => {
  const batchId = event.target.value;
  setSelectedBatch(batchId);
  
  // Save the selected batch to localStorage
  localStorage.setItem('lastSelectedBatchId', batchId);
  
  // Clear the selected student when batch changes
  setSelectedStudent(null);
  
  fetchStudentsByBatch(batchId);
}, [fetchStudentsByBatch]);

const handleAddPayment = useCallback(async (e) => {
  e.preventDefault();
  
  if (!selectedStudent?.feeStatusId) return;
  
  try {
    const paymentDataToSend = {
      title: paymentData.title,
      date: paymentData.date,
      amount: paymentData.amount,
      isPaid: true,
      feeStatusId: selectedStudent.feeStatusId,
    };
    
    if (!paymentData.paymentCompleted) {
      paymentDataToSend.nextDueDate = paymentData.nextDueDate;
    }
    
    const response = await fetch(`${BASE_URL}/api/feepaymentrecords/add-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentDataToSend),
    });
    
    if (response.ok) {
      const newRecord = await response.json();
      
      // Calculate new values
      const updatedFeesSubmitted = parseFloat(selectedStudentFees.feesSubmitted) + parseFloat(paymentData.amount);
      const updatedRemainingFees = parseFloat(selectedStudentFees.totalFees) - updatedFeesSubmitted;
      const paymentCompleted = updatedRemainingFees <= 0;
      
      // Update fee status on server
      await fetch(`${BASE_URL}/api/feestatus/${selectedStudent.feeStatusId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nextDueDate: paymentCompleted ? null : paymentData.nextDueDate,
          feesSubmitted: updatedFeesSubmitted,
          remainingFees: updatedRemainingFees,
          paymentCompleted: paymentCompleted,
        }),
      });
      
      // Update local state
      setFeePaymentRecords(prev => [...prev, { ...newRecord, type: 'payment' }]);
      setSelectedStudentFees({
        ...selectedStudentFees,
        feesSubmitted: updatedFeesSubmitted,
        remainingFees: updatedRemainingFees,
      });
      
      // Reset form and close modal
      setPaymentData({ title: '', date: '', amount: '', paymentCompleted: false, nextDueDate: '' });
      setPaymentModalOpen(false);
      
      // Update the selected student
      setSelectedStudent({
        ...selectedStudent,
        feesSubmitted: updatedFeesSubmitted,
        remainingFees: updatedRemainingFees,
        nextDueDate: paymentCompleted ? null : paymentData.nextDueDate,
        paymentCompleted
      });
    }
  } catch (error) {
    console.error('Error adding payment:', error);
  }
}, [selectedStudent, paymentData, selectedStudentFees]);

const handleAddCharge = useCallback(async (e) => {
  e.preventDefault();
  
  if (!selectedStudent?.feeStatusId) return;
  
  try {
    const response = await fetch(`${BASE_URL}/api/otherchargesrecords/add-other-charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: chargeData.title,
        date: chargeData.date,
        amount: chargeData.amount,
        feeStatusId: selectedStudent.feeStatusId
      }),
    });
    
    if (response.ok) {
      const newCharge = await response.json();
      
      // Calculate new values
      const updatedTotalFees = parseFloat(selectedStudentFees.totalFees) + parseFloat(chargeData.amount);
      const updatedRemainingFees = parseFloat(selectedStudentFees.remainingFees) + parseFloat(chargeData.amount);
      
      // Update fee status on server
      await fetch(`${BASE_URL}/api/feestatus/${selectedStudent.feeStatusId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalFees: updatedTotalFees,
          remainingFees: updatedRemainingFees,
          paymentCompleted: updatedRemainingFees <= 0,
        }),
      });
      
      // Update local state
      setOtherChargesRecords(prev => [...prev, { ...newCharge, type: 'charge' }]);
      setSelectedStudentFees({
        ...selectedStudentFees,
        totalFees: updatedTotalFees,
        remainingFees: updatedRemainingFees,
      });
      
      // Update the selected student
      setSelectedStudent({
        ...selectedStudent,
        totalFees: updatedTotalFees,
        remainingFees: updatedRemainingFees,
      });
      
      // Reset form and close modal
      setChargeData({ title: '', date: '', amount: '' });
      setChargeModalOpen(false);
    }
  } catch (error) {
    console.error('Error adding charge:', error);
  }
}, [selectedStudent, chargeData, selectedStudentFees]);
const handleSubmitFeeStatus = useCallback(async (e) => {
  e.preventDefault();

  if (!selectedStudent?.user_id) return;

  const total = parseFloat(newFeeStatus.totalFees) || 0;

  try {
    const response = await fetch(`${BASE_URL}/api/feestatus/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admissionDate: newFeeStatus.admissionDate,
        totalFees: 0,
        feesSubmitted: 0, // force to 0
        remainingFees: 0, // remaining = total
        nextDueDate: null,  // set nextDueDate to null
        user_id: selectedStudent.user_id,
      }),
    });

    if (response.ok) {
      const newFeeStatusData = await response.json();

      // Update the selected student with new fee status
      setSelectedStudent({
        ...selectedStudent,
        feeStatusId: newFeeStatusData.id,
        totalFees: newFeeStatusData.totalFees,
        feesSubmitted: newFeeStatusData.feesSubmitted,
        remainingFees: newFeeStatusData.remainingFees,
        nextDueDate: newFeeStatusData.nextDueDate,  // it will be null
      });

      setSelectedStudentFees({
        totalFees: newFeeStatusData.totalFees,
        feesSubmitted: newFeeStatusData.feesSubmitted,
        remainingFees: newFeeStatusData.remainingFees,
      });

      setFeeStatusExists(true);
      setShowFeeStatusForm(false);

      // Refresh student list to reflect changes
      if (selectedBatch) {
        fetchStudentsByBatch(selectedBatch);
      }
    }
  } catch (error) {
    console.error('Error creating fee status:', error);
  }
}, [selectedStudent, newFeeStatus.admissionDate, newFeeStatus.totalFees, newFeeStatus.nextDueDate, selectedBatch, fetchStudentsByBatch]);

// Calculate derived values
const combinedRecords = useMemo(() => {
  const allRecords = [...feePaymentRecords, ...otherChargesRecords];
  return allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
}, [feePaymentRecords, otherChargesRecords]);

// Initial data fetch with localStorage restore
useEffect(() => {
  fetchData().then(() => {
    // After initial data is loaded, check if we had a previously selected batch
    const lastSelectedBatchId = localStorage.getItem('lastSelectedBatchId');
    if (lastSelectedBatchId) {
      setSelectedBatch(lastSelectedBatchId);
      fetchStudentsByBatch(lastSelectedBatchId);
    }
  });
}, [fetchData, fetchStudentsByBatch]);

// Update remaining fees when total fees or fees submitted change
useEffect(() => {
  const totalFees = parseFloat(newFeeStatus.totalFees) || 0;
  const feesSubmitted = parseFloat(newFeeStatus.feesSubmitted) || 0;
  const remainingFees = totalFees - feesSubmitted;
  setNewFeeStatus(prev => ({ ...prev, remainingFees: remainingFees.toString() }));
}, [newFeeStatus.totalFees, newFeeStatus.feesSubmitted]);
  if (loading && !batches.length) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '30px', 
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#1D72B8' }}>Loading...</h2>
          <p>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Roboto, Arial, sans-serif', 
      backgroundColor: '#f9f9f9',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ 
        margin: '0 auto', 
        borderRadius: '12px', 
        backgroundColor: '#fff', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', 
          color: '#333', 
          height: 'calc(100vh - 40px)'
        }}>
          {/* Sidebar */}
          <div style={{
            width: '300px',
            borderRight: '1px solid #eaeaea',
            padding: '20px',
            backgroundColor: '#f9fafb',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{
              textAlign: 'center',
              color: '#1D72B8',
              fontSize: '18px',
              marginBottom: '20px',
              fontWeight: '500',
            }}>
              Select Course
            </h2>
            
            <select 
              onChange={handleBatchChange} 
              value={selectedBatch || ''}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#555',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              }}
            >
              <option value="">Select Course</option>
              {batches.map(batch => (
                <option key={batch.batch_id} value={batch.batch_id}>{batch.batch_name}</option>
              ))}
            </select>

            <h2 style={{
              textAlign: 'center',
              color: '#1D72B8',
              fontSize: '18px',
              marginBottom: '15px',
              fontWeight: '500',
            }}>
              Students
            </h2>
            
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  color: '#555',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              />
            </div>
            
            <StudentList 
              students={students}
              searchTerm={searchTerm}
              onStudentClick={handleStudentClick}
              selectedStudent={selectedStudent}
            />
          </div>

          {/* Main Content */}
          <div style={{ 
            flex: '1', 
            padding: '25px', 
            overflowY: 'auto', 
            backgroundColor: '#fff' 
          }}>
            {selectedStudent ? (
              <div>
                <h2 style={{ 
                  textAlign: 'center', 
                  marginBottom: '25px', 
                  color: '#1D72B8',
                  fontSize: '24px',
                  fontWeight: '500'
                }}>
                  {selectedStudent.name}'s Fee Details
                </h2>

                {!feeStatusExists ? (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '10px',
                    marginTop: '30px'
                  }}>
                   <p style={{ marginBottom: '20px', fontSize: '16px', color: '#555' }}>
                      No fee status record found for this student. Create one to start tracking fees.
                    </p>
                    <button 
                      onClick={() => setShowFeeStatusForm(true)} 
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#1D72B8', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(29, 114, 184, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Create Fee Status
                    </button>
                  </div>
                ) : (
                  <div>
                    <FeeSummaryCards 
                      studentFees={selectedStudentFees}
                      nextDueDate={selectedStudent.nextDueDate}
                      paymentCompleted={selectedStudent.paymentCompleted}
                    />

                    <RecordsTable records={combinedRecords} />

                    <div style={{ 
                      marginTop: '30px', 
                      display: 'flex', 
                      justifyContent: 'center',
                      gap: '15px' 
                    }}>
                      <button 
                        onClick={() => setPaymentModalOpen(true)} 
                        style={{ 
                          padding: '12px 35px', 
                          backgroundColor: '#388E3C', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '15px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(56, 142, 60, 0.25)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>+</span> You Got
                      </button>
                      <button 
                        onClick={() => setChargeModalOpen(true)} 
                        style={{ 
                          padding: '12px 35px', 
                          backgroundColor: '#D32F2F', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '15px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(211, 47, 47, 0.25)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>+</span> You Gave
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80%',
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f4f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '36px', color: '#1D72B8' }}>👤</span>
                </div>
                <h3 style={{ marginBottom: '10px', color: '#1D72B8', fontWeight: '500' }}>No Student Selected</h3>
                <p>Select a course and then a student from the sidebar to view their fee details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)}
        title="Add Payment"
      >
        <form onSubmit={handleAddPayment}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Payment Type
            </label>
            <select
              value={paymentData.title}
              onChange={(e) => setPaymentData({ ...paymentData, title: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '14px' 
              }}
            >
              <option value="">Select Payment Type</option>
<option value="1st Installment">1st Installment</option>
<option value="2nd Installment">2nd Installment</option>
<option value="3rd Installment">3rd Installment</option>
<option value="4th Installment">4th Installment</option>
<option value="5th Installment">5th Installment</option>
<option value="6th Installment">6th Installment</option>
<option value="tshirt">Tshirt</option>
<option value="laundry">Laundry</option>
<option value="hoodies">Hoodies</option>
<option value="food">Food</option>

            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Payment Date
            </label>
            <input
              type="date"
              value={paymentData.date}
              onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '14px' 
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Amount
            </label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '14px' 
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500' 
            }}>
              <input
                type="checkbox"
                checked={paymentData.paymentCompleted}
                onChange={(e) => setPaymentData({ ...paymentData, paymentCompleted: e.target.checked })}
                style={{ marginRight: '8px', width: '16px', height: '16px' }}
              />
              Payment Completed
            </label>
          </div>

          {!paymentData.paymentCompleted && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Next Due Date
              </label>
              <input
                type="date"
                value={paymentData.nextDueDate}
                onChange={(e) => setPaymentData({ ...paymentData, nextDueDate: e.target.value })}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd',
                  fontSize: '14px' 
                }}
              />
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            marginTop: '20px' 
          }}>
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500' 
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#1D72B8', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(29, 114, 184, 0.25)' 
              }}
            >
              Add Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Charge Modal */}
      <Modal 
        isOpen={isChargeModalOpen} 
        onClose={() => setChargeModalOpen(false)}
        title="Add Charge"
      >
        <form onSubmit={handleAddCharge}>
          <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
  Type
</label>

<select style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}>
  <option value="admissionAcademicFee">Admission + Academic Fee</option>
  <option value="food">Food</option>
  <option value="tshirt">Tshirt</option>
  <option value="hoodie">Hoodie</option>
  <option value="laundry">Laundry</option>
</select>

            
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Date
            </label>
            <input
              type="date"
              value={chargeData.date}
              onChange={(e) => setChargeData({ ...chargeData, date: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '14px' 
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Amount
            </label>
            <input
              type="number"
              value={chargeData.amount}
              onChange={(e) => setChargeData({ ...chargeData, amount: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '14px' 
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            marginTop: '20px' 
          }}>
            <button
              type="button"
              onClick={() => setChargeModalOpen(false)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500' 
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#1D72B8', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(29, 114, 184, 0.25)' 
              }}
            >
              Add Charge
            </button>
          </div>
        </form>
      </Modal>

      {/* Fee Status Modal */}
      <Modal 
        isOpen={showFeeStatusForm} 
        onClose={() => setShowFeeStatusForm(false)}
        title="Create Fee Status"
      >
        <form onSubmit={handleSubmitFeeStatus}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Admission Date
            </label>
            <input
              type="date"
              value={newFeeStatus.admissionDate}
              onChange={(e) => setNewFeeStatus({ ...newFeeStatus, admissionDate: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '14px' 
              }}
            />
          </div>
          
          
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            marginTop: '20px' 
          }}>
            <button
              type="button"
              onClick={() => setShowFeeStatusForm(false)}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                border: '1px solid #ddd', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500' 
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#1D72B8', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(29, 114, 184, 0.25)' 
              }}
            >
              Create Fee Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeRecords;