import React, { useEffect, useState } from 'react';

const FeeReminders = () => {
  const [feeSummary, setFeeSummary] = useState(null);
  const [upcomingDues, setUpcomingDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState({});

  useEffect(() => {
    const fetchFeeSummary = async () => {
      try {
        const response = await fetch('https://api.students.sainikschoolcadet.com/api/feestatus/summary');
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
        const response = await fetch('https://api.students.sainikschoolcadet.com/api/feestatus/upcoming-dues');
        if (response.ok) {
          const data = await response.json();
          const enrichedData = await Promise.all(data.map(async (due) => {
            const userDetails = await fetchUserDetails(due.user_id);
            const batchId = await fetchBatchId(due.user_id);
            return { ...due, userDetails, batch_id: batchId };
          }));
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
        const response = await fetch(`https://api.students.sainikschoolcadet.com/api/users/user/${userId}`);
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
        const response = await fetch(`https://api.students.sainikschoolcadet.com/api/studentBatches/students/search/${userId}`);
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
        const response = await fetch('https://api.students.sainikschoolcadet.com/api/batches/');
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ textAlign: 'center' }}>Fee Status Summary</h2>
      {feeSummary && (
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', flex: '1', margin: '10px' }}>
            <h3>Total Students</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{feeSummary.totalStudents}</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', flex: '1', margin: '10px' }}>
            <h3>Total Fee Collection</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{feeSummary.totalDueFee}</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', flex: '1', margin: '10px' }}>
            <h3>Fees Due Today</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{feeSummary.totalDueToday}</p>
          </div>
        </div>
      )}

      <h2 style={{ textAlign: 'center', marginTop: '40px' }}>Upcoming Dues</h2>
      {upcomingDues.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Batch</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Admission Date</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Total Fees</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Fees Submitted</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Remaining Fees</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Next Due Date</th>
            </tr>
          </thead>
          <tbody>
            {upcomingDues.map((due) => (
              <tr key={due.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px 15px' }}>{due.userDetails ? due.userDetails.name : 'N/A'}</td>
                <td style={{ padding: '12px 15px' }}>{due.userDetails ? due.userDetails.email : 'N/A'}</td>
                <td style={{ padding: '12px 15px' }}>
                  {due.batch_id ? (
                    batches[due.batch_id] ? batches[due.batch_id].batch_name : 'N/A'
                  ) : 'N/A'}
                </td>
                <td style={{ padding: '12px 15px' }}>{due.admissionDate}</td>
                <td style={{ padding: '12px 15px' }}>₹{due.totalFees}</td>
                <td style={{ padding: '12px 15px' }}>₹{due.feesSubmitted}</td>
                <td style={{ padding: '12px 15px' }}>₹{due.remainingFees}</td>
                <td style={{ padding: '12px 15px' }}>{due.nextDueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No upcoming dues.</p>
      )}
    </div>
  );
};

export default FeeReminders;
