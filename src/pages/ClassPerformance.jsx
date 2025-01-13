import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const ClassPerformance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [testDetails, setTestDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      const response = await fetch('https://api.students.sainikschoolcadet.com/api/batches/');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    };

    fetchBatchDetails();
    setLoading(false);
  }, []);

  const handleBatchChange = async (event) => {
    const batchId = event.target.value;
    setSelectedBatch(batchId);
    setTestDetails([]);

    if (batchId) {
      await fetchTestsByBatchId(batchId);
    }
  };

  const fetchTestsByBatchId = async (batchId) => {
    const response = await fetch(`https://api.students.sainikschoolcadet.com/api/test/tests/batch/${batchId}`);
    if (response.ok) {
      const tests = await response.json();
      const testDetailsPromises = tests.map(test => fetchStudentRecords(test.test_id));
      const allTestDetails = await Promise.all(testDetailsPromises);
      setTestDetails(allTestDetails);
    }
  };

  const fetchStudentRecords = async (testId) => {
    const response = await fetch(`https://api.students.sainikschoolcadet.com/api/studenttestrecords/test/${testId}`);
    if (response.ok) {
      const records = await response.json();
      return { testId, records }; // Return test ID along with student records
    }
    return { testId, records: [] }; // Return empty records if fetch fails
  };

  const getBatchOverview = () => {
    const totalStudents = testDetails.reduce((acc, test) => acc + test.records.length, 0);
    const totalTests = testDetails.length;
    const totalMarks = testDetails.reduce((acc, test) => acc + test.records.reduce((sum, record) => sum + record.marks_obtained, 0), 0);
    const averageScore = totalStudents > 0 ? (totalMarks / totalStudents).toFixed(2) : 0;
    return { totalStudents, totalTests, averageScore };
  };

  const batchOverview = getBatchOverview();

  const renderTestDetails = () => {
    return testDetails.map((testDetail) => {
      const scores = testDetail.records.map(record => record.marks_obtained);
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const average = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
      

      return (
        <TableRow key={testDetail.testId} hover>
          <TableCell>{testDetail.testId}</TableCell>
          <TableCell>{highestScore}</TableCell>
          <TableCell>{lowestScore}</TableCell>
          <TableCell>{average}</TableCell>
          <TableCell>{testDetail.records.length}</TableCell>
        </TableRow>
      );
    });
  };

  const renderCharts = () => {
    const averageScoresData = {
      labels: testDetails.map(test => `Test ${test.testId}`),
      datasets: [{
        label: 'Average Score',
        data: testDetails.map(test => {
          const scores = test.records.map(record => record.marks_obtained);
          return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };

    const passFailData = {
      labels: ['Pass', 'Fail'],
      datasets: testDetails.map(test => ({
        label: `Test ${test.testId}`,
        data: [
          (test.records.filter(record => record.marks_obtained >= 50).length / test.records.length) * 100,
          (test.records.filter(record => record.marks_obtained < 50).length / test.records.length) * 100,
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      })),
    };

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Visualizations
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Average Scores for All Tests</Typography>
            <Bar data={averageScoresData} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Score Trends</Typography>
            <Line data={{
              labels: testDetails.map(test => `Test ${test.testId}`),
              datasets: testDetails.map(test => ({
                label: `Test ${test.testId}`,
                data: test.records.map(record => record.marks_obtained),
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                tension: 0.1,
              })),
            }} />
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Class Performance
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <FormControl variant="outlined" sx={{ minWidth: 240 }}>
          <InputLabel id="batch-select-label">Select Batch</InputLabel>
          <Select
            labelId="batch-select-label"
            id="batchSelect"
            value={selectedBatch}
            onChange={handleBatchChange}
            label="Select Batch"
          >
            <MenuItem value="">
              <em>--Select a Batch--</em>
            </MenuItem>
            {batches.map((batch) => (
              <MenuItem key={batch.batch_id} value={batch.batch_id}>
                {batch.batch_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Batch Overview
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Number of Students</Typography>
                <Typography variant="h4">{batchOverview.totalStudents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Tests Conducted</Typography>
                <Typography variant="h4">{batchOverview.totalTests}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Average Score for the Batch</Typography>
                <Typography variant="h4">{batchOverview.averageScore}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Test Details
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test ID</TableCell>
                <TableCell>Highest Score</TableCell>
                <TableCell>Lowest Score</TableCell>
                <TableCell>Average Scode</TableCell>
                <TableCell>Number of Students Participating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderTestDetails()}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {renderCharts()}
    </Container>
  );
};

export default ClassPerformance;