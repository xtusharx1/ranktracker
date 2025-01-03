import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestRecords = () => {
  const [testRecords, setTestRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTest, setNewTest] = useState({ testName: '', subject: '', date: '', batchId: '', totalMarks: '' });
  const [editTest, setEditTest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/batches/');
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

    const fetchTests = async () => {
      try {
        const response = await fetch('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/test');
        if (response.ok) {
          const data = await response.json();
          setTestRecords(data);
        } else {
          console.error('Failed to fetch tests');
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchBatches();
    fetchTests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editTest) {
      setEditTest({ ...editTest, [name]: value });
    } else {
      setNewTest({ ...newTest, [name]: value });
    }
  };

  const handleAddTest = async () => {
    try {
      const response = await fetch('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_name: newTest.testName,
          subject: newTest.subject,
          date: newTest.date,
          batch_id: parseInt(newTest.batchId, 10),
          total_marks: parseInt(newTest.totalMarks, 10),
        }),
      });

      if (response.ok) {
        const createdTest = await response.json();
        navigate(`/add-students/${createdTest.test_id}`);
      } else {
        alert('Failed to create test. Please try again.');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleEditTest = (testId) => {
    const testToEdit = testRecords.find(test => test.test_id === testId);
    setEditTest(testToEdit);
    setShowEditModal(true);
  };

  const handleUpdateTest = async () => {
    try {
      const response = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/test/${editTest.test_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_name: editTest.test_name,
          subject: editTest.subject,
          date: editTest.date,
          batch_id: parseInt(editTest.batch_id, 10),
          total_marks: parseInt(editTest.total_marks, 10),
        }),
      });

      if (response.ok) {
        const updatedTest = await response.json();
        setTestRecords(testRecords.map(test => (test.test_id === updatedTest.test_id ? updatedTest : test)));
        setShowEditModal(false);
      } else {
        alert('Failed to update test. Please try again.');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeleteTest = async (testId) => {
    try {
      const response = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/test/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTestRecords(testRecords.filter(test => test.test_id !== testId));
      } else {
        alert('Failed to delete test. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.batch_id === batchId);
    return batch ? batch.batch_name : 'Unknown';
  };

  const goToStudentMarks = (testId) => {
    navigate(`/student-marks/${testId}`);
  };

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Test Records</h1>
        <button
          style={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '16px',
          }}
          onClick={() => setShowAddModal(true)}
        >
          Add New Test
        </button>

        {/* Main Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>#</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Test Name</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Subject</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Date</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Batch</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Total Marks</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Actions</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', color: '#555' }}>Student Marks</th>
              </tr>
            </thead>
            <tbody>
              {testRecords.map((record, index) => (
                <tr key={record.test_id} style={{ borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '12px 15px' }}>{index + 1}</td>
                  <td style={{ padding: '12px 15px' }}>{record.test_name}</td>
                  <td style={{ padding: '12px 15px' }}>{record.subject}</td>
                  <td style={{ padding: '12px 15px' }}>{record.date}</td>
                  <td style={{ padding: '12px 15px' }}>{getBatchName(record.batch_id)}</td>
                  <td style={{ padding: '12px 15px' }}>{record.total_marks}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEditTest(record.test_id)} style={{ cursor: 'pointer', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 12px' }}>Edit</button>
                      <button onClick={() => handleDeleteTest(record.test_id)} style={{ cursor: 'pointer', backgroundColor: '#F44336', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 12px' }}>Delete</button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <button onClick={() => goToStudentMarks(record.test_id)} style={{ cursor: 'pointer', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 12px' }}>Student Marks</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Test Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Add New Test</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTest();
              }}
            >
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Test Name:
                <input
                  type="text"
                  name="testName"
                  value={newTest.testName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={newTest.subject}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Date:
                <input
                  type="date"
                  name="date"
                  value={newTest.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Batch:
                <select
                  name="batchId"
                  value={newTest.batchId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Total Marks:
                <input
                  type="number"
                  name="totalMarks"
                  value={newTest.totalMarks}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Add Test
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#F44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Test Modal */}
      {showEditModal && editTest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Edit Test</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTest();
              }}
            >
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Test Name:
                <input
                  type="text"
                  name="test_name"
                  value={editTest.test_name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={editTest.subject}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Date:
                <input
                  type="date"
                  name="date"
                  value={editTest.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Batch:
                <select
                  name="batch_id"
                  value={editTest.batch_id}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '15px' }}>
                Total Marks:
                <input
                  type="number"
                  name="total_marks"
                  value={editTest.total_marks}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Update Test
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#F44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
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

export default TestRecords;