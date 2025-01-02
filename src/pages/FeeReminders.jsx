import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

const FeeReminders = () => {
  // Data for the charts
  const newAdmissionsData = {
    labels: ['Jan24', 'Feb24', 'Mar24', 'Apr24', 'May24', 'Jun24'],
    datasets: [
      {
        label: 'New Admissions',
        data: [3, 2, 5, 4, 6, 5],
        backgroundColor: 'rgba(102, 51, 153, 0.6)',
        borderColor: 'rgba(102, 51, 153, 1)',
        borderWidth: 1,
      },
    ],
  };

  const boysGirlsData = {
    labels: ['Course 1', 'Course 2', 'Course 3', 'Course 4', 'Course 5', 'Course 6'],
    datasets: [
      {
        label: 'Boys',
        data: [50, 60, 70, 65, 80, 75],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Girls',
        data: [40, 50, 60, 55, 70, 65],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
    ],
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '48%' }}>
          <h3 style={{ textAlign: 'center' }}>New Admissions</h3>
          <Line data={newAdmissionsData} />
        </div>
        <div style={{ width: '48%' }}>
          <h3 style={{ textAlign: 'center' }}>Boys vs Girls</h3>
          <Bar data={boysGirlsData} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', flex: '1', marginRight: '10px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Course</label>
          <select style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="6th offline">6th offline</option>
            <option value="7th online">7th online</option>
          </select>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', flex: '1', marginRight: '10px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>No of Students</label>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>35</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', flex: '1' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Total Amount Pending</label>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#d9534f' }}>₹5,35,000/-</p>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>S No</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Installment No</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Due Date</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Follow up (Note)</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Profile</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>1</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>6th offline</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>John Doe</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>2</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>2024-01-15</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', color: '#d9534f', fontWeight: 'bold' }}>Pending</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Call parent</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}><button style={{ padding: '5px 10px', border: 'none', backgroundColor: '#0275d8', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>View</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
        <p>If complete fee is <strong>‘paid’</strong>, then name will not come here.</p>
      </div>
    </div>
  );
};

export default FeeReminders;
