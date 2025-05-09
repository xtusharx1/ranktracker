import React, { useEffect, useState } from 'react';

const FeeReminders = () => {
  const [feeSummary, setFeeSummary] = useState(null);
  const [upcomingDues, setUpcomingDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState({});
  const [error, setError] = useState(null);

  const getDueStatusInfo = (dueDate) => {
    if (!dueDate) {
      return {
        color: 'rgba(158, 158, 158, 0.1)',
        bgColor: 'bg-gray-50',
        status: 'Not Specified',
        statusColor: 'text-gray-600 bg-gray-100'
      };
    }
    
    // Check if the date is valid
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return {
        color: 'rgba(158, 158, 158, 0.1)',
        bgColor: 'bg-gray-50',
        status: 'Not Specified',
        statusColor: 'text-gray-600 bg-gray-100'
      };
    }
    
    const today = new Date();
    
    if (dueDateObj.toDateString() === today.toDateString()) {
      return {
        color: 'rgba(76, 175, 80, 0.2)',
        bgColor: 'bg-green-50',
        status: 'Due Today',
        statusColor: 'text-green-700 bg-green-100'
      };
    } else if (dueDateObj > today) {
      const diffTime = Math.abs(dueDateObj - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        return {
          color: 'rgba(255, 193, 7, 0.2)',
          bgColor: 'bg-yellow-50',
          status: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
          statusColor: 'text-yellow-700 bg-yellow-100'
        };
      } else {
        return {
          color: 'rgba(3, 169, 244, 0.1)',
          bgColor: 'bg-blue-50',
          status: `Due in ${diffDays} days`,
          statusColor: 'text-blue-700 bg-blue-100'
        };
      }
    } else {
      const diffTime = Math.abs(today - dueDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        color: 'rgba(244, 67, 54, 0.2)',
        bgColor: 'bg-red-50',
        status: `Overdue by ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        statusColor: 'text-red-700 bg-red-100'
      };
    }
  };

  const formatCurrency = (amount) => {
    // If amount is undefined, null, or not a number
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      return '';
    }
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // If converted amount is NaN or zero, return empty string
    if (isNaN(numAmount) || numAmount === 0) {
      return '';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  useEffect(() => {
    const fetchFeeSummary = async () => {
      try {
        const response = await fetch('https://apistudents.sainikschoolcadet.com/api/feestatus/summary');
        if (response.ok) {
          const data = await response.json();
          setFeeSummary(data);
        } else {
          setError('Failed to fetch fee summary');
        }
      } catch (error) {
        setError('Error fetching fee summary');
        console.error('Error fetching fee summary:', error);
      }
    };

    const fetchAllBatches = async () => {
      try {
        const response = await fetch('https://apistudents.sainikschoolcadet.com/api/batches/');
        if (response.ok) {
          const data = await response.json();
          const batchMap = {};
          data.forEach(batch => {
            if (batch && batch.batch_id) {
              batchMap[batch.batch_id] = batch;
            }
          });
          setBatches(batchMap);
        } else {
          console.error('Failed to fetch batches');
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    fetchFeeSummary();
    fetchAllBatches();
  }, []);

  useEffect(() => {
    // Only fetch dues when batches are loaded
    if (Object.keys(batches).length > 0) {
      fetchUpcomingDues();
    }
  }, [batches]);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/users/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        console.error('Failed to fetch user details');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const fetchBatchId = async (userId) => {
    try {
      const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/studentBatches/students/search/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0]?.batch_id) {
          return data[0].batch_id;
        } else {
          return null;
        }
      } else {
        console.error('Failed to fetch batch ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching batch ID:', error);
      return null;
    }
  };

  const fetchUpcomingDues = async () => {
    try {
      const response = await fetch('https://apistudents.sainikschoolcadet.com/api/feestatus/upcoming-dues');
      if (response.ok) {
        const data = await response.json();

        // Filter out dues where payment is completed
        const filteredData = data.filter(due => !due.paymentCompleted);

        const enrichedData = await Promise.all(
          filteredData.map(async (due) => {
            const userDetails = await fetchUserDetails(due.user_id);
            const batchId = await fetchBatchId(due.user_id);
            return { ...due, userDetails, batch_id: batchId };
          })
        );

        // Apply filter: Only show students with valid batches
        const validDues = enrichedData.filter(student => {
          // Only keep students who have a valid batch ID that exists in our batches
          const hasBatchId = !!student.batch_id;
          const isBatchValid = hasBatchId && !!batches[student.batch_id];
          
          return isBatchValid;
        });
        
        setUpcomingDues(validDues);
      } else {
        setError('Failed to fetch upcoming dues');
      }
    } catch (error) {
      setError('Error fetching upcoming dues');
      console.error('Error fetching upcoming dues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBatchName = (batchId) => {
    if (!batchId || !batches[batchId]) return null;
    return batches[batchId]?.batch_name || null;
  };

  const calculateSummaryStats = () => {
    if (!upcomingDues.length) return null;
    
    const overdueCount = upcomingDues.filter(due => {
      if (!due.nextDueDate) return false;
      const dueDate = new Date(due.nextDueDate);
      return !isNaN(dueDate.getTime()) && dueDate < new Date();
    }).length;
    
    const dueTodayCount = upcomingDues.filter(due => {
      if (!due.nextDueDate) return false;
      const dueDate = new Date(due.nextDueDate);
      return !isNaN(dueDate.getTime()) && dueDate.toDateString() === new Date().toDateString();
    }).length;
    
    return {
      overdueCount,
      dueTodayCount,
      totalStudents: upcomingDues.length
    };
  };

  const summaryStats = calculateSummaryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fee information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  const formattedFilterDate = '';  // Remove this line completely if not needed

  return (
    <div className="bg-gray-50 min-h-screen p-2 md:p-4">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Fee Management Dashboard</h1>
        
        {/* Display note about batch filtering */}
        <p className="text-base text-gray-500 mb-4">
          <span className="block text-gray-600">
            Note: Only students with valid batch assignments are displayed
          </span>
        </p>
        
        {/* Summary Stats Cards */}
        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-base text-gray-500 uppercase">Total Students with Dues</p>
              <p className="text-3xl font-bold text-gray-800">{summaryStats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-base text-gray-500 uppercase">Due Today</p>
              <p className="text-3xl font-bold text-gray-800">{summaryStats.dueTodayCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <p className="text-base text-gray-500 uppercase">Overdue</p>
              <p className="text-3xl font-bold text-gray-800">{summaryStats.overdueCount}</p>
            </div>
          </div>
        )}

        {/* Upcoming Dues Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">Upcoming Dues</h2>
            <p className="text-base text-gray-500 mt-1">Students with pending fee payments</p>
          </div>
          
          {upcomingDues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-base leading-normal">
                    <th className="py-3 px-3 text-left font-semibold">S.No</th>
                    <th className="py-3 px-3 text-left font-semibold">Student</th>
                    <th className="py-3 px-3 text-left font-semibold">Batch</th>
                    <th className="py-3 px-3 text-left font-semibold">Admission Date</th>
                    <th className="py-3 px-3 text-left font-semibold">Fees Details</th>
                    <th className="py-3 px-3 text-left font-semibold">Next Due Date</th>
                    <th className="py-3 px-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-base">
                  {upcomingDues.map((due, index) => {
                    const statusInfo = getDueStatusInfo(due.nextDueDate);
                    const batchName = getBatchName(due.batch_id);
                    
                    return (
                      <tr 
                        key={due.id || index}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${statusInfo.bgColor}`}
                      >
                        <td className="py-3 px-3">{index + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{due.userDetails?.name || 'N/A'}</span>
                            <span className="text-sm text-gray-500">{due.userDetails?.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {batchName && (
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                              {batchName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {due.admissionDate ? formatDate(due.admissionDate) : ''}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            {due.totalFees ? (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Total:</span>
                                <span className="text-sm font-medium">{formatCurrency(due.totalFees)}</span>
                              </div>
                            ) : null}
                            
                            {due.feesSubmitted ? (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Paid:</span>
                                <span className="text-sm font-medium">{formatCurrency(due.feesSubmitted)}</span>
                              </div>
                            ) : null}
                            
                            {due.remainingFees ? (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Remaining:</span>
                                <span className="text-sm font-medium text-red-600">{formatCurrency(due.remainingFees)}</span>
                              </div>
                            ) : null}
                            
                            {!due.totalFees && !due.feesSubmitted && !due.remainingFees && (
                              <div className="text-sm text-gray-500 text-center">No fee details available</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {due.nextDueDate ? formatDate(due.nextDueDate) : ''}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusInfo.statusColor}`}>
                            {statusInfo.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming dues</h3>
              <p className="mt-1 text-sm text-gray-500">All students are up to date with their fee payments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeReminders;