import React, { useEffect, useState } from 'react';

const FeeReminders = () => {
  const [feeSummary, setFeeSummary] = useState(null);
  const [upcomingDues, setUpcomingDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState({});

  const getDueDateColor = (dueDate) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);

    if (dueDateObj.toDateString() === today.toDateString()) {
      return 'rgba(76, 175, 80, 0.2)'; // Light green for due today
    } else if (dueDateObj > today) {
      return 'rgba(255, 193, 7, 0.2)'; // Light yellow for due in the future
    } else {
      return 'rgba(244, 67, 54, 0.2)'; // Light red for due date has passed
    }
  };

  useEffect(() => {
    const fetchFeeSummary = async () => {
      try {
        const response = await fetch('https://apistudents.sainikschoolcadet.com/api/feestatus/summary');
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
          setUpcomingDues(enrichedData);
        } else {
          console.error('Failed to fetch upcoming dues');
        }
      } catch (error) {
        console.error('Error fetching upcoming dues:', error);
      } finally {
        setLoading(false);
      }
    };

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
        const response = await fetch('https://apistudents.sainikschoolcadet.com/api/batches/');
        if (response.ok) {
          const data = await response.json();
          const batchMap = {};
          data.forEach(batch => {
            batchMap[batch.batch_id] = batch;
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
    fetchUpcomingDues();
  }, []);

  if (loading) {
    return <div>Loading fee summary...</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginTop: '20px' }}>Upcoming Dues</h2>
        {upcomingDues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-base mt-5 bg-white dark:bg-gray-800 border border-gray-300">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">S.No</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Student Name</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Batch</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Admission Date</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Total Fees</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Fees Submitted</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Remaining Fees</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Next Due Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDues.map((due, index) => (
                  <tr
                    key={due.id}
                    className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}
                    style={{ backgroundColor: getDueDateColor(due.nextDueDate) }}
                  >
                    <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                    <td className="px-4 py-3 border border-gray-300">{due.userDetails ? due.userDetails.name : 'N/A'}</td>
                    <td className="px-4 py-3 border border-gray-300">{due.userDetails ? due.userDetails.email : 'N/A'}</td>
                    <td className="px-4 py-3 border border-gray-300">{due.batch_id ? (batches[due.batch_id] ? batches[due.batch_id].batch_name : 'N/A') : 'N/A'}</td>
                    <td className="px-4 py-3 border border-gray-300">{due.admissionDate}</td>
                    <td className="px-4 py-3 border border-gray-300">₹{due.totalFees}</td>
                    <td className="px-4 py-3 border border-gray-300">₹{due.feesSubmitted}</td>
                    <td className="px-4 py-3 border border-gray-300">₹{due.remainingFees}</td>
                    <td className="px-4 py-3 border border-gray-300">{due.nextDueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>No upcoming dues.</p>
        )}
      </div>
    </div>
  );
};

export default FeeReminders;
