import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button, Grid } from '@mui/material';

const StudentPerformance = () => {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [testRecords, setTestRecords] = useState([]);
  const [testStatistics, setTestStatistics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      setLoading(true);
      const response = await fetch('http://localhost:3002/api/batches/');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
        setLoading(false);
      }
    };

    fetchBatchDetails();
  }, []);

  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedStudent('');
    setStudents([]);
    setTestRecords([]);
    setStudentDetails(null);
    setTestStatistics({});

    if (batchId) {
      await fetchStudentsByBatchId(batchId);
    }
  };

  const fetchStudentsByBatchId = async (batchId) => {
    setLoading(true);
    const response = await fetch(`http://localhost:3002/api/studentBatches/students/batch/${batchId}`);
    if (response.ok) {
      const data = await response.json();
      // Fetch details for each student in the batch
      const studentsWithDetails = await Promise.all(data.map(async (student) => {
        const studentDetails = await fetchStudentDetails(student.user_id);
        return { ...student, ...studentDetails };
      }));
      setStudents(studentsWithDetails);
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (userId) => {
    const response = await fetch(`http://localhost:3002/api/users/user/${userId}`);
    if (response.ok) {
      return (await response.json()).user;
    }
    return {};
  };

  const handleStudentSelect = async (userId) => {
    setSelectedStudent(userId);
    const student = students.find(student => student.user_id === userId);
    setStudentDetails(student);
    await fetchTestRecords(student.user_id);
  };

  const fetchTestRecords = async (userId) => {
    const response = await fetch(`http://localhost:3002/api/studenttestrecords/user/${userId}`);
    if (response.ok) {
      const data = await response.json();
      setTestRecords(data);
      // Fetch statistics for each test record
      data.forEach(record => {
        fetchTestStatistics(record.test_id);
      });
    }
  };

  const fetchTestStatistics = async (testId) => {
    const response = await fetch(`http://localhost:3002/api/studenttestrecords/statistics/${testId}`);
    if (response.ok) {
      const data = await response.json();
      setTestStatistics(prevStats => ({ ...prevStats, [testId]: data }));
    }
  };

  const calculateCumulativeMetrics = () => {
    if (testRecords.length === 0) return {};

    const totalTests = testRecords.length;
    const averageMarks = (testRecords.reduce((sum, record) => sum + record.marks_obtained, 0) / totalTests).toFixed(2);
    const firstTestMarks = testRecords[0].marks_obtained;
    const lastTestMarks = testRecords[testRecords.length - 1].marks_obtained;
    const percentageImprovement = (((lastTestMarks - firstTestMarks) / firstTestMarks) * 100).toFixed(2);

    return {
      totalTests,
      averageMarks,
      percentageImprovement
    };
  };

  const cumulativeMetrics = calculateCumulativeMetrics();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>;
  }

  const lineChartData = {
    labels: testRecords.map(record => new Date(record.created_at).toLocaleDateString()), // Convert created_at to locale date string
    datasets: [
      {
        label: 'Marks Obtained',
        data: testRecords.map(record => record.marks_obtained),
        fill: false,
        backgroundColor: 'blue',
        borderColor: 'blue',
      }
    ],
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <Typography variant="h4" align="center" gutterBottom>Student Performance</Typography>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Typography variant="h5">Select Batch:</Typography>
        <Grid container spacing={2} justifyContent="center">
          {batches.map(batch => (
            <Grid item key={batch.batch_id}>
              <Button variant="contained" color={selectedBatch === batch.batch_id ? 'primary' : 'default'} onClick={() => handleBatchChange(batch.batch_id)}>
                {batch.batch_name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </div>

      {selectedBatch && (
        <div style={{ marginBottom: '20px' }}>
          <Typography variant="h5">Students in Batch:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.user_id} onClick={() => handleStudentSelect(student.user_id)} style={{ cursor: 'pointer' }}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.phone_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {studentDetails && (
        <div>
          <Typography variant="h5" gutterBottom>Student Details</Typography>
          <p><strong>Name:</strong> {studentDetails.name}</p>
          <p><strong>Phone Number:</strong> {studentDetails.phone_number}</p>
          <p><strong>Email:</strong> {studentDetails.email}</p>
        </div>
      )}

      {testRecords.length > 0 && (
        <div>
          <Typography variant="h5" gutterBottom>Test Records for Student ID: {selectedStudent}</Typography>
          <Line data={lineChartData} />
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#f0f0f0' }}>
                  <TableCell>Test ID</TableCell>
                  <TableCell>Marks Obtained</TableCell>
                  <TableCell>Highest Marks</TableCell>
                  <TableCell>Lowest Marks</TableCell>
                  <TableCell>Average Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testRecords.map(record => (
                  <TableRow key={record.record_id}>
                    <TableCell>{record.test_id}</TableCell>
                    <TableCell>{record.marks_obtained}</TableCell>
                    <TableCell>{testStatistics[record.test_id]?.highest_marks}</TableCell>
                    <TableCell>{testStatistics[record.test_id]?.lowest_marks}</TableCell>
                    <TableCell>{testStatistics[record.test_id]?.average_marks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {cumulativeMetrics.totalTests && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Cumulative Metrics</Typography>
          <p>Total tests participated in: {cumulativeMetrics.totalTests}</p>
          <p>Average marks across all tests: {cumulativeMetrics.averageMarks}</p>
          <p>Percentage improvement over time: {cumulativeMetrics.percentageImprovement}%</p>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;