import React, { useState, useEffect } from 'react';
import { Send, X, CheckCircle, AlertCircle } from 'lucide-react';

// Base URL for all API requests
const BASE_URL = 'http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002';

const Notice = () => {
  // State management
  const [noticeType, setNoticeType] = useState('individual');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [studentDetails, setStudentDetails] = useState({});

  // Fetch batches when component mounts
  useEffect(() => {
    fetchBatches();
  }, []);
  
  // Fetch student names whenever selected students change
  useEffect(() => {
    fetchStudentNames();
  }, [selectedStudents]);

  // Fetch all available batches
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/batches/`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      } else {
        showNotification('error', 'Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      showNotification('error', 'Network error while fetching batches');
    } finally {
      setLoading(false);
    }
  };

  // Search student by phone number
  const searchStudent = async () => {
    if (!phoneNumber.trim()) {
      showNotification('error', 'Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/users/user/phone/${phoneNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        // Add the student to selected students
        if (data.user) {
          const studentExists = selectedStudents.some(student => student.user_id === data.user.user_id);
          if (!studentExists) {
            setSelectedStudents([...selectedStudents, data.user]);
          } else {
            showNotification('info', 'Student already added');
          }
        }
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.message || 'Student not found');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      showNotification('error', 'Failed to search student');
    } finally {
      setLoading(false);
      setPhoneNumber('');
    }
  };

  // Toggle batch selection
  const toggleBatchSelection = async (batch) => {
    const isSelected = selectedBatches.some(b => b.batch_id === batch.batch_id);
    
    if (isSelected) {
      // Remove batch
      setSelectedBatches(selectedBatches.filter(b => b.batch_id !== batch.batch_id));
      
      // Remove students from this batch
      setSelectedStudents(prevStudents => 
        prevStudents.filter(student => 
          student.batch_id !== batch.batch_id
        )
      );
    } else {
      // Add batch
      setSelectedBatches([...selectedBatches, batch]);
      
      // Fetch and add students from this batch
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/studentBatches/students/batch/${batch.batch_id}`);
        
        if (response.ok) {
          const batchStudents = await response.json();
          
          // Add batch_id to each student for reference
          const studentsWithBatchId = batchStudents.map(student => ({
            ...student,
            batch_id: batch.batch_id,
            batch_name: batch.batch_name
          }));
          
          // Add new students without duplicates
          setSelectedStudents(prevStudents => {
            const updatedStudents = [...prevStudents];
            studentsWithBatchId.forEach(newStudent => {
              if (!updatedStudents.some(existing => existing.user_id === newStudent.user_id)) {
                updatedStudents.push(newStudent);
              }
            });
            return updatedStudents;
          });
          
          // Fetch details for all new students immediately
          fetchStudentNamesForBatch(studentsWithBatchId);
          
        } else {
          showNotification('error', `Failed to fetch students for batch ${batch.batch_name}`);
        }
      } catch (error) {
        console.error('Error fetching batch students:', error);
        showNotification('error', `Error fetching students from batch`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Remove a student from the selected list
  const removeStudent = (userId) => {
    setSelectedStudents(prevStudents => 
      prevStudents.filter(student => student.user_id !== userId)
    );
  };

  // Format the payload and send notice
  const sendNotice = async () => {
    if (!title.trim()) {
      showNotification('error', 'Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      showNotification('error', 'Please enter content');
      return;
    }
    
    if (selectedStudents.length === 0) {
      showNotification('error', 'Please select at least one student');
      return;
    }
    
    // Format recipients
    const recipients = selectedStudents.map(student => student.user_id);
    
    const payload = {
      title,
      content,
      type: noticeType,
      recipients
    };
    
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/notices/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        showNotification('success', 'Notice sent successfully!');
        // Reset form
        setTitle('');
        setContent('');
        setSelectedStudents([]);
        setSelectedBatches([]);
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.message || 'Failed to send notice');
      }
    } catch (error) {
      console.error('Error sending notice:', error);
      showNotification('error', 'Network error while sending notice');
    } finally {
      setLoading(false);
    }
  };

  // Display notification message
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Fetch names for batch students immediately after adding the batch
  const fetchStudentNamesForBatch = async (batchStudents) => {
    const studentsToFetch = batchStudents.filter(student => !studentDetails[student.user_id]);
    
    if (studentsToFetch.length === 0) return;
    
    const newStudentDetails = {...studentDetails};
    
    for (const student of studentsToFetch) {
      try {
        const response = await fetch(`${BASE_URL}/api/users/user/${student.user_id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            newStudentDetails[student.user_id] = data.user;
          }
        }
      } catch (error) {
        console.error(`Error fetching student ${student.user_id}:`, error);
      }
    }
    
    setStudentDetails(newStudentDetails);
  };

  // Fetch names for all student IDs
  const fetchStudentNames = async () => {
    // Only fetch names for students that don't have name property
    const studentsToFetch = selectedStudents.filter(student => 
      !student.name && student.user_id && !studentDetails[student.user_id]
    );
    
    if (studentsToFetch.length === 0) return;
    
    const newStudentDetails = {...studentDetails};
    
    for (const student of studentsToFetch) {
      try {
        const response = await fetch(`${BASE_URL}/api/users/user/${student.user_id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            newStudentDetails[student.user_id] = data.user;
          }
        }
      } catch (error) {
        console.error(`Error fetching student ${student.user_id}:`, error);
      }
    }
    
    setStudentDetails(newStudentDetails);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 px-6 py-4 text-white">
          <h1 className="text-xl font-medium">Send Notices</h1>
        </div>
        
        {/* Form */}
        <div className="p-6">
          {/* Notice Type Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1 max-w-xs">
            <button
              className={`flex-1 py-2 px-4 text-center rounded-md transition-all ${
                noticeType === 'individual' 
                  ? 'bg-white shadow-sm text-blue-600 font-medium' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => {
                setNoticeType('individual');
                setSelectedBatches([]);
              }}
            >
              Individual
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center rounded-md transition-all ${
                noticeType === 'batch' 
                  ? 'bg-white shadow-sm text-blue-600 font-medium' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => setNoticeType('batch')}
            >
              Batch
            </button>
          </div>
          
          {/* Notice Info */}
          <div className="space-y-4 mb-6">
            <div>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Notice Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <textarea
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Notice Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          {/* Recipients Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Recipients</h2>
            
            {/* Individual selection */}
            {noticeType === 'individual' && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={searchStudent}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Add'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Batch selection */}
            {noticeType === 'batch' && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {batches.map((batch) => (
                    <div
                      key={batch.batch_id}
                      onClick={() => toggleBatchSelection(batch)}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        selectedBatches.some(b => b.batch_id === batch.batch_id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {batch.batch_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Selected Students */}
            {selectedStudents.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg text-gray-700">
                    {selectedStudents.length} students selected
                  </span>
                  <button 
                    onClick={() => setSelectedStudents([])} 
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedStudents.map((student) => (
                      <div
                        key={student.user_id}
                        className="flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1"
                      >
                        <span className="text-sm mr-1">
                          {student.name || (studentDetails[student.user_id] && studentDetails[student.user_id].name) || `Student ${student.user_id}`}
                        </span>
                        <button
                          onClick={() => removeStudent(student.user_id)}
                          className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 text-gray-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Send Button */}
          <div className="flex justify-end">
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2 transition-colors"
              onClick={sendNotice}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Notice'}
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
          'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
        } transition-opacity`}>
          {notification.type === 'success' ? (
            <CheckCircle className="mr-3 text-green-500" size={20} />
          ) : (
            <AlertCircle className="mr-3 text-red-500" size={20} />
          )}
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default Notice;