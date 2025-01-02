import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRupeeSign, FaRegCalendarAlt, FaFileDownload, FaShareAlt, FaSearch } from 'react-icons/fa';
import { MdOutlineSchool, MdLocalLaundryService } from 'react-icons/md';

const AddOtherChargesForm = ({ feeStatusId, onClose }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/otherchargesrecords/add-other-charges', {
        title,
        date,
        amount,
        feeStatusId,
      });
      console.log('Other charges added:', response.data);
      onClose();
    } catch (error) {
      console.error('Error adding other charges:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
        <h2 className="text-xl font-bold mb-4">Add Other Charges</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Charge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddPaymentForm = ({ feeStatusId, onClose }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feepaymentrecords/add-payment', {
        title,
        date,
        amount,
        isPaid,
        feeStatusId,
      });
      console.log('Payment added:', response.data);
      onClose();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
        <h2 className="text-xl font-bold mb-4">Add Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Is Paid</label>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="mr-2"
            />
            <span>{isPaid ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeeRecords = () => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [feeStatusId, setFeeStatusId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeTab, setActiveTab] = useState('payments');
  const [feeRecords, setFeeRecords] = useState([]);
  const [otherChargesRecords, setOtherChargesRecords] = useState([]);
  const [newEntry, setNewEntry] = useState({
    admissionDate: '',
    totalFees: '',
    feesSubmitted: '',
    remainingFees: '',
    nextDueDate: '',
    user_id: '',
  });
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [selectedStudentForAdd, setSelectedStudentForAdd] = useState(null);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [studentBatches, setStudentBatches] = useState({});
  const [batchDetails, setBatchDetails] = useState([]);
  const [showAddChargeForm, setShowAddChargeForm] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [otherCharges, setOtherCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/users/role/2');
        setAllStudents(response.data);
        const feeStatusResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feestatus');
        const feeStatusStudentIds = feeStatusResponse.data.map(feeStatus => feeStatus.user_id);
        setStudents(response.data.filter(student => feeStatusStudentIds.includes(student.user_id)));
        console.log('Fetched Students:', students);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const batchMappingResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/studentBatches/students');
        const batchMapping = batchMappingResponse.data.reduce((acc, item) => {
          acc[item.user_id] = item.batch_id;
          return acc;
        }, {});
        setStudentBatches(batchMapping);

        const batchDetailsResponse = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/batches/');
        setBatchDetails(batchDetailsResponse.data);
      } catch (error) {
        console.error('Error fetching batch data:', error);
      }
    };

    fetchBatchData();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFeeStatuses = async () => {
      try {
        const response = await axios.get('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feestatus');
        if (isMounted) setStudents(response.data);
      } catch (error) {
        console.error('Error fetching fee statuses:', error);
      }
    };

    fetchFeeStatuses();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchFeeRecords = async (feeStatusId) => {
    if (!feeStatusId) {
        console.error('feeStatusId is null or undefined');
        return; // Exit if feeStatusId is not valid
    }
    try {
        const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feepaymentrecords/payments/${feeStatusId}`);
        setFeeRecords(response.data);
    } catch (error) {
        console.error('Error fetching fee payment records:', error);
    }
  };

  const fetchOtherChargesRecords = async (feeStatusId) => {
    if (!feeStatusId) {
        console.error('feeStatusId is null or undefined');
        return; // Exit if feeStatusId is not valid
    }
    try {
        const response = await axios.get(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/otherchargesrecords/charges/${feeStatusId}`);
        setOtherChargesRecords(response.data);
    } catch (error) {
        console.error('Error fetching other charges records:', error);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    
    // Fetch fee status for the selected student
    const feeStatus = students.find(status => status.user_id === student.user_id);
    if (feeStatus) {
        setFeeStatusId(feeStatus.id); // Set the feeStatusId to the found fee status ID
        await fetchFeeRecords(feeStatus.id); // Use feeStatus.id instead of student.user_id
        await fetchOtherChargesRecords(feeStatus.id); // Use feeStatus.id instead of student.user_id
    } else {
        console.error('No fee status found for the selected student.');
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCourseFilter = (event) => {
    setCourseFilter(event.target.value);
  };

  const handleSortOrder = (event) => {
    setSortOrder(event.target.value);
  };

  const handleNewEntryChange = (event) => {
    const { name, value } = event.target;
    setNewEntry({
      ...newEntry,
      [name]: value
    });
  };

  const handleAddEntry = async (event) => {
    event.preventDefault();
    try {
      if (activeTab === 'academy') {
        const response = await axios.post(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feepaymentrecord/status/${selectedStudent.user_id}`, newEntry);
        setFeeRecords([...feeRecords, response.data]);
      } else {
        const response = await axios.post(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/othercharges/status/${selectedStudent.user_id}`, newEntry);
        setOtherChargesRecords([...otherChargesRecords, response.data]);
      }
      setNewEntry({
        admissionDate: '',
        totalFees: '',
        feesSubmitted: '',
        remainingFees: '',
        nextDueDate: '',
        user_id: '',
      });
    } catch (error) {
      console.error('Error adding new entry:', error);
    }
  };

  const handleAddStudent = () => {
    setShowAddStudentForm(true);
  };

  const handleSelectStudentForAdd = (student) => {
    setSelectedStudentForAdd(student);
  };

  const handleCreateFeeStatus = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feestatus/', {
        ...newEntry,
        user_id: selectedStudentForAdd.user_id,
      });
      setStudents([...students, selectedStudentForAdd]);
      setShowAddStudentForm(false);
      setSelectedStudentForAdd(null);
      setNewEntry({
        admissionDate: '',
        totalFees: '',
        feesSubmitted: '',
        remainingFees: '',
        nextDueDate: '',
        user_id: '',
      });
    } catch (error) {
      console.error('Error creating fee status:', error);
    }
  };

  const getBatchName = (userId) => {
    const batchId = studentBatches[userId];
    const batch = batchDetails.find(b => b.batch_id === batchId);
    return batch ? batch.batch_name : 'N/A';
  };

  const filteredStudents = students
    .filter(student =>
      (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone_number && student.phone_number.includes(searchTerm)) &&
      (courseFilter === '' || studentBatches[student.user_id] === parseInt(courseFilter))
    )
    .sort((a, b) => {
      const balanceA = a.total_course_fees - (a.paid || 0);
      const balanceB = b.total_course_fees - (b.paid || 0);
      return sortOrder === 'asc' ? balanceA - balanceB : balanceB - balanceA;
    });

  const getTotalPaid = () => {
    return feeRecords.reduce((sum, record) => sum + record.amount, 0);
  };

  const getTotalPending = () => {
    if (!selectedStudent) return 0;
    return selectedStudent.total_course_fees - getTotalPaid();
  };

  useEffect(() => {
    if (selectedStudent) {
      const fetchOtherCharges = async () => {
        try {
          const response = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/otherchargesrecords/charges/${feeStatusId}`);
          if (response.ok) {
            const data = await response.json();
            setOtherCharges(data);
          } else {
            console.error('Failed to fetch other charges');
          }
        } catch (error) {
          console.error('Error fetching other charges:', error);
        }
      };

      const fetchPayments = async () => {
        
        try {
          const response = await fetch(`http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002/api/feepaymentrecords/payments/${feeStatusId}`);
          if (response.ok) {
            const data = await response.json();
            setPayments(data);
          } else {
            console.error('Failed to fetch payments');
          }
        } catch (error) {
          console.error('Error fetching payments:', error);
        }
      };

      fetchOtherCharges();
      fetchPayments();
    }
  }, [selectedStudent]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowAddChargeForm(false);
    setShowAddPaymentForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex">
      {/* Left Panel - List of Students */}
      <div className="w-1/3 bg-white rounded-lg shadow-md p-6 mr-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Students</h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by name or phone number"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <FaSearch className="absolute top-3 right-3 text-gray-500" />
        </div>
        <div className="mb-4">
          <select
            value={courseFilter}
            onChange={handleCourseFilter}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Filter by Batch</option>
            {batchDetails.map(batch => (
              <option key={batch.batch_id} value={batch.batch_id}>
                {batch.batch_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <select
            value={sortOrder}
            onChange={handleSortOrder}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="asc">Sort by Balance (Ascending)</option>
            <option value="desc">Sort by Balance (Descending)</option>
          </select>
        </div>
        <ul>
          {filteredStudents.map((student) => (
            <li
              key={student.user_id}
              className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
              onClick={() => handleStudentClick(student)}
            >
              <h3 className="text-lg font-bold">{student.name}</h3>
              <p className="text-gray-600">Batch: {getBatchName(student.user_id)}</p>
              <p className="text-gray-600">Balance: ₹{student.remainingFees}</p>
              
            </li>
          ))}
        </ul>
        <button onClick={handleAddStudent} className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200">
          Add Student
        </button>
      </div>

      {/* Right Panel - Fee Details */}
      <div className="w-2/3 bg-white rounded-lg shadow-md p-6">
        {selectedStudent ? (
          <div>
            <div className="flex justify-between mb-6">
              <div className="flex-1 mx-2 bg-blue-50 p-4 rounded-lg shadow-sm text-center">
                <h3 className="text-blue-700 font-semibold">Total Course Fees</h3>
                <p className="text-blue-700 text-2xl font-bold">
                  <FaRupeeSign className="inline" /> {Number(selectedStudent.total_course_fees).toFixed(2)}
                </p>
              </div>
              <div className="flex-1 mx-2 bg-green-50 p-4 rounded-lg shadow-sm text-center">
                <h3 className="text-green-700 font-semibold">Paid</h3>
                <p className="text-green-700 text-2xl font-bold">
                  <FaRupeeSign className="inline" /> {getTotalPaid().toFixed(2)}
                </p>
              </div>
              <div className="flex-1 mx-2 bg-red-50 p-4 rounded-lg shadow-sm text-center">
                <h3 className="text-red-700 font-semibold">Pending</h3>
                <p className="text-red-700 text-2xl font-bold">
                  <FaRupeeSign className="inline" /> {getTotalPending().toFixed(2)}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-700 mb-4">{selectedStudent.name}'s Fee Records</h2>
            <div className="flex border-b mb-4">
              <button
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'payments'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => handleTabChange('payments')}
              >
                Payment Records
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'other'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => handleTabChange('other')}
              >
                Other Charges
              </button>
            </div>

            {activeTab === 'payments' ? (
              <>
                <h3>Payment Records</h3>
                <ul>
                  {feeRecords.map((payment) => (
                    <li key={payment.id}>
                      {payment.title} - ₹{payment.amount} on {payment.date}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowAddPaymentForm(true)} className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-200 mt-2">
                  Add Payment
                </button>
              </>
            ) : (
              <>
                <h3>Other Charges</h3>
                <ul>
                  {otherChargesRecords.map((charge) => (
                    <li key={charge.id}>
                      {charge.title} - ₹{charge.amount} on {charge.date}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowAddChargeForm(true)} className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200">
                  Add Other Charges
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Select a student to view their fee records.</p>
        )}
      </div>

      {/* Add Student Form */}
      {showAddStudentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/2">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Student to Fee Records</h2>
            <div className="mb-4">
              <select
                onChange={(e) => handleSelectStudentForAdd(JSON.parse(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a Student</option>
                {allStudents
                  .filter(student => !students.some(s => s.user_id === student.user_id))
                  .map((student) => (
                    <option key={student.user_id} value={JSON.stringify(student)}>
                      {student.name}
                    </option>
                  ))}
              </select>
            </div>
            {selectedStudentForAdd && (
              <form onSubmit={handleCreateFeeStatus}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admission Date</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={newEntry.admissionDate}
                      onChange={handleNewEntryChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Fees</label>
                    <input
                      type="number"
                      name="totalFees"
                      value={newEntry.totalFees}
                      onChange={handleNewEntryChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fees Submitted</label>
                    <input
                      type="number"
                      name="feesSubmitted"
                      value={newEntry.feesSubmitted}
                      onChange={handleNewEntryChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remaining Fees</label>
                    <input
                      type="number"
                      name="remainingFees"
                      value={newEntry.remainingFees}
                      onChange={handleNewEntryChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
                    <input
                      type="date"
                      name="nextDueDate"
                      value={newEntry.nextDueDate}
                      onChange={handleNewEntryChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200">
                  Create Fee Status
                </button>
              </form>
            )}
            <button onClick={() => setShowAddStudentForm(false)} className="mt-4 w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Other Charges Form */}
      {showAddChargeForm && (
        <AddOtherChargesForm
          feeStatusId={feeStatusId}
          onClose={() => setShowAddChargeForm(false)}
        />
      )}
      {showAddPaymentForm && (
        <AddPaymentForm
          feeStatusId={feeStatusId}
          onClose={() => setShowAddPaymentForm(false)}
        />
      )}
    </div>
  );
};

export default FeeRecords;  