import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, MenuItem, FormControl, Select, InputLabel, Container, Box, Chip, Grid, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

const ClassPerformance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [testDetails, setTestDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      const response = await fetch('https://apistudents.sainikschoolcadet.com/api/batches/');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    };

    fetchBatchDetails();
    setLoading(false);
  }, []);

  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setTestDetails([]);

    if (batchId) {
      await fetchTestsByBatchId(batchId);
    }
  };

  const fetchTestsByBatchId = async (batchId) => {
    setLoading(true);
    const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/test/tests/batch/${batchId}`);
    if (response.ok) {
      const tests = await response.json();
      const testDetailsPromises = tests.map(test => fetchStudentRecords(test.test_id));
      const allTestDetails = await Promise.all(testDetailsPromises);
      setTestDetails(allTestDetails);
      setLoading(false);
    }
  };

  const fetchStudentRecords = async (testId) => {
    const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/studenttestrecords/test/${testId}`);
    const testDetailsResponse = await fetch(`https://apistudents.sainikschoolcadet.com/api/test/${testId}`);
    
    let records = [];
    let testInfo = {};
    
    if (response.ok) {
      records = await response.json();
    }
    
    if (testDetailsResponse.ok) {
      testInfo = await testDetailsResponse.json();
    }
    
    return { 
      testId, 
      records,
      testName: testInfo.test_name || `Test ${testId}`,
      subject: testInfo.subject || 'N/A',
      date: testInfo.date || 'N/A',
      totalMarks: testInfo.total_marks || 100,
      batchId: testInfo.batch_id || 'N/A'
    };
  };

  const getBatchOverview = () => {
    if (testDetails.length === 0) {
      return { totalStudents: 0, totalTests: 0, averageScore: 0 };
    }
    
    const allStudentIds = new Set();
    testDetails.forEach(test => {
      test.records.forEach(record => {
        allStudentIds.add(record.user_id);
      });
    });
    
    const totalStudents = allStudentIds.size;
    const totalTests = testDetails.length;
    
    let totalMarks = 0;
    let totalEntries = 0;
    
    testDetails.forEach(test => {
      test.records.forEach(record => {
        totalMarks += record.marks_obtained;
        totalEntries++;
      });
    });
    
    const averageScore = totalEntries > 0 ? (totalMarks / totalEntries).toFixed(2) : 0;
    
    return { totalStudents, totalTests, averageScore };
  };

  const getPerformanceColor = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 80) return '#4caf50'; // Green for excellent
    if (percentage >= 60) return '#2196f3'; // Blue for good
    if (percentage >= 40) return '#ff9800'; // Orange for average
    return '#f44336'; // Red for below average
  };

  // Function to safely format numbers
  const formatNumber = (value, decimalPlaces = 1) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return typeof value === 'number' ? value.toFixed(decimalPlaces) : value;
  };

  const handleOpenReportDialog = async (testDetail) => {
    setSelectedTestDetails(testDetail);
    
    // Fetch student details for each record
    const studentDetailsPromises = testDetail.records.map(async (record) => {
      try {
        const response = await fetch(`https://apistudents.sainikschoolcadet.com/api/users/user/${record.user_id}`);
        const userData = await response.json();
        
        // Calculate rank
        const allScores = [...testDetail.records].sort((a, b) => b.marks_obtained - a.marks_obtained);
        const rank = allScores.findIndex(r => r.user_id === record.user_id) + 1;
        
        return {
          ...record,
          name: userData.user?.name || `Student ${record.user_id}`,
          rank
        };
      } catch (error) {
        console.error("Error fetching student details:", error);
        return {
          ...record,
          name: `Student ${record.user_id}`,
          rank: 'N/A'
        };
      }
    });
    
    const detailedStudents = await Promise.all(studentDetailsPromises);
    setStudentDetails(detailedStudents.sort((a, b) => a.rank - b.rank));
    setOpenReportDialog(true);
  };

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setSelectedTestDetails(null);
  };

  const batchOverview = getBatchOverview();

  const averageScoresData = {
    labels: testDetails.map(test => test.testName || `Test ${test.testId}`),
    datasets: [{
      label: 'Average Score (%)',
      data: testDetails.map(test => {
        const scores = test.records.map(record => record.marks_obtained);
        const average = scores.length > 0 
          ? (scores.reduce((sum, score) => sum + score, 0) / scores.length) 
          : 0;
        return (average / test.totalMarks * 100).toFixed(2);
      }),
      backgroundColor: '#3f51b5',
      borderColor: '#3f51b5',
      borderWidth: 1,
    }],
  };

  const scoreDistributionData = {
    labels: ['Excellent (80-100%)', 'Good (60-79%)', 'Average (40-59%)', 'Below Average (0-39%)'],
    datasets: testDetails.map((test, index) => {
      // Count students in each performance category
      const excellent = test.records.filter(r => (r.marks_obtained / test.totalMarks * 100) >= 80).length;
      const good = test.records.filter(r => (r.marks_obtained / test.totalMarks * 100) >= 60 && (r.marks_obtained / test.totalMarks * 100) < 80).length;
      const average = test.records.filter(r => (r.marks_obtained / test.totalMarks * 100) >= 40 && (r.marks_obtained / test.totalMarks * 100) < 60).length;
      const belowAverage = test.records.filter(r => (r.marks_obtained / test.totalMarks * 100) < 40).length;
      
      return {
        label: test.testName || `Test ${test.testId}`,
        data: [excellent, good, average, belowAverage],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',
          'rgba(33, 150, 243, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(244, 67, 54, 0.7)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(244, 67, 54, 1)'
        ],
        borderWidth: 1,
      };
    }),
  };

  const performanceTrendData = {
    labels: testDetails.map(test => test.testName || `Test ${test.testId}`),
    datasets: [
      {
        label: 'Highest Score (%)',
        data: testDetails.map(test => {
          const scores = test.records.map(record => record.marks_obtained);
          const highest = scores.length > 0 ? Math.max(...scores) : 0;
          return (highest / test.totalMarks * 100).toFixed(2);
        }),
        fill: false,
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        tension: 0.1
      },
      {
        label: 'Average Score (%)',
        data: testDetails.map(test => {
          const scores = test.records.map(record => record.marks_obtained);
          const average = scores.length > 0 
            ? (scores.reduce((sum, score) => sum + score, 0) / scores.length)
            : 0;
          return (average / test.totalMarks * 100).toFixed(2);
        }),
        fill: false,
        backgroundColor: '#3f51b5',
        borderColor: '#3f51b5',
        tension: 0.1
      },
      {
        label: 'Lowest Score (%)',
        data: testDetails.map(test => {
          const scores = test.records.map(record => record.marks_obtained);
          const lowest = scores.length > 0 ? Math.min(...scores) : 0;
          return (lowest / test.totalMarks * 100).toFixed(2);
        }),
        fill: false,
        backgroundColor: '#f44336',
        borderColor: '#f44336',
        tension: 0.1
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tests'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'black', mb: 4 }}>
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Class Performance Analysis
        </Typography>

        <Card sx={{ mb: 3, p: 3, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
            <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Select Batch:
          </Typography>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="batch-select-label">Batch</InputLabel>
            <Select
              labelId="batch-select-label"
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              label="Batch"
            >
              <MenuItem value="">
                <em>--Select a Batch--</em>
              </MenuItem>
              {batches.map(batch => (
                <MenuItem key={batch.batch_id} value={batch.batch_id}>
                  {batch.batch_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>

        {selectedBatch && (
          <>
            <Card sx={{ mb: 3, p: 3, boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Batch Overview
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, borderLeft: '4px solid #4caf50', backgroundColor: '#f0f0f0', borderRadius: '0 4px 4px 0', height: '100%' }}>
                    <Typography variant="subtitle2" color="textSecondary">Total Students</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{batchOverview.totalStudents}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, borderLeft: '4px solid #3f51b5', backgroundColor: '#f0f0f0', borderRadius: '0 4px 4px 0', height: '100%' }}>
                    <Typography variant="subtitle2" color="textSecondary">Total Tests</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>{batchOverview.totalTests}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, borderLeft: '4px solid #ff9800', backgroundColor: '#f0f0f0', borderRadius: '0 4px 4px 0', height: '100%' }}>
                    <Typography variant="subtitle2" color="textSecondary">Average Score</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>{batchOverview.averageScore}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ mb: 3, p: 3, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                Test Results
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow className="bg-gray-200 dark:bg-gray-700 border-b-2 border-gray-300">
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">S No</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Test Name</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Subject</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Date</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Highest</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Lowest</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Average</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Students</TableCell>
                      <TableCell className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 border border-gray-300">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {testDetails.map((testDetail, index) => {
                      if (!testDetail.records.length) return null;
                      
                      const scores = testDetail.records.map(record => record.marks_obtained);
                      const highestScore = Math.max(...scores);
                      const lowestScore = Math.min(...scores);
                      const averageScore = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
                      
                      return (
                        <TableRow key={testDetail.testId} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{testDetail.testName}</TableCell>
                          <TableCell>{testDetail.subject}</TableCell>
                          <TableCell>{testDetail.date}</TableCell>
                          <TableCell>{highestScore}</TableCell>
                          <TableCell>{lowestScore}</TableCell>
                          <TableCell>{averageScore}</TableCell>
                          <TableCell>{testDetail.records.length}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenReportDialog(testDetail)}
                              aria-label="View student report"
                              title="View Student Report Card"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            <Card sx={{ mb: 3, p: 3, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'black' }}>
                Performance Visualization
              </Typography>
              <Divider sx={{ mb: 4 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold'}}>
                    Performance Trends
                  </Typography>
                  <Box sx={{ height: '400px', mb: 4 }}>
                    <Line data={performanceTrendData} options={chartOptions} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Average Test Scores
                  </Typography>
                  <Box sx={{ height: '400px', mb: 4 }}>
                    <Bar data={averageScoresData} options={chartOptions} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Performance Distribution for Latest Test
                  </Typography>
                  <Box sx={{ height: '400px', mb: 4 }}>
                    {testDetails.length > 0 && (
                      <Pie 
                        data={{
                          labels: ['Excellent (80-100%)', 'Good (60-79%)', 'Average (40-59%)', 'Below Average (0-39%)'],
                          datasets: [{
                            data: [
                              testDetails[0].records.filter(r => (r.marks_obtained / testDetails[0].totalMarks * 100) >= 80).length,
                              testDetails[0].records.filter(r => (r.marks_obtained / testDetails[0].totalMarks * 100) >= 60 && (r.marks_obtained / testDetails[0].totalMarks * 100) < 80).length,
                              testDetails[0].records.filter(r => (r.marks_obtained / testDetails[0].totalMarks * 100) >= 40 && (r.marks_obtained / testDetails[0].totalMarks * 100) < 60).length,
                              testDetails[0].records.filter(r => (r.marks_obtained / testDetails[0].totalMarks * 100) < 40).length
                            ],
                            backgroundColor: [
                              'rgba(76, 175, 80, 0.7)',
                              'rgba(33, 150, 243, 0.7)',
                              'rgba(255, 152, 0, 0.7)',
                              'rgba(244, 67, 54, 0.7)'
                            ],
                            borderColor: [
                              '#4caf50',
                              '#2196f3',
                              '#ff9800',
                              '#f44336'
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                  return `${label}: ${value} students (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </>
        )}
        
        {/* Student Report Card Dialog */}
        <Dialog 
          open={openReportDialog} 
          onClose={handleCloseReportDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Student Report: {selectedTestDetails?.testName} - {selectedTestDetails?.subject}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseReportDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ my: 2 }}>
              <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#1a237e' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>S No</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name of Student</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank in Class</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentDetails.map((student, index) => (
                      <TableRow key={student.user_id} sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{student.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${student.marks_obtained}/${selectedTestDetails?.totalMarks || 100}`} 
                            sx={{ 
                              backgroundColor: getPerformanceColor(student.marks_obtained, selectedTestDetails?.totalMarks || 100),
                              color: 'white',
                              fontWeight: 'bold'
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`#${student.rank}`} 
                            sx={{ 
                              backgroundColor: student.rank <= 3 ? '#4caf50' : '#1a237e',
                              color: 'white',
                              fontWeight: 'bold'
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReportDialog} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClassPerformance;