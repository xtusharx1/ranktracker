import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  TableContainer,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Container,
} from "@mui/material";
import { Add, Visibility } from "@mui/icons-material";
import axios from "axios";

const ClassRecord = () => {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: "", chapterName: "", homeworkAssigned: "", isTeacherAbsent: false });
  const [viewOpen, setViewOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  useEffect(() => {
    const userId = localStorage.getItem("user_id"); // Get logged-in user ID
  
    // Fetch batches (common for both admin & teachers)
    axios
      .get("https://apistudents.sainikschoolcadet.com/api/batches")
      .then((res) => setBatches(res.data))
      .catch((err) => console.error("Error fetching batches:", err));
  
    if (role === "admin") {
      // Admin fetches all subjects
      axios
        .get("https://apistudents.sainikschoolcadet.com/api/subjects")
        .then((res) => setSubjects(res.data))
        .catch((err) => console.error("Error fetching subjects:", err));
    } else if (role === "teacher") {
      // Teachers fetch only their assigned subject
      axios
        .get(`https://apistudents.sainikschoolcadet.com/api/subject-teachers/teacher/${userId}`)
        .then((res) => {
          if (res.data.length > 0) {
            setSelectedSubject(res.data[0].subject_id); // Auto-set subject
          }
        })
        .catch((err) => console.error("Error fetching teacher's subject:", err));
    }
  }, []);
  

  useEffect(() => {
    if (selectedBatch && selectedSubject) {
      axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-report/batch/${selectedBatch}/subject/${selectedSubject}`)
        .then(res => setEntries(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
        .catch(err => console.error('Error fetching classwork entries:', err));
    }
  }, [selectedBatch, selectedSubject]);

  const handleView = (entry) => {
    setViewEntry(entry);
    setViewOpen(true);
  };

  const handleAddEntry = () => {
    const teacherName = localStorage.getItem('name');
    const apiUrl = "https://apistudents.sainikschoolcadet.com/api/teacher-report";
    const method = axios.post;

    method(apiUrl, {
      teacher_name: teacherName,
      batch_id: selectedBatch,
      subject_id: selectedSubject,
      date: form.date,
      chapter_name: form.chapterName,
      detailed_description: form.description,
      homework_assigned: form.homeworkAssigned,
      is_teacher_absent: form.isTeacherAbsent,
    }).then(() => {
      setOpen(false);
      setForm({ date: new Date().toISOString().split('T')[0], description: "", chapterName: "", homeworkAssigned: "", isTeacherAbsent: false });
      axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-report/batch/${selectedBatch}/subject/${selectedSubject}`)
        .then(res => setEntries(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
        .catch(err => console.error('Error fetching classwork entries:', err));
    }).catch(err => console.error('Error saving classwork entry:', err));
  };

  return (
    <Container sx={{ paddingLeft: 3, paddingRight: 3 }}>
      <div style={{ padding: "20px" }}></div>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        📝 Daily Classwork Entry
      </Typography>

      <Card elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6}>
              <select
                id="class"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                }}
              >
                <option value="">Select Class</option>
                {batches.map((batch) => (
                  <option key={batch.batch_id} value={batch.batch_id}>
                    {batch.batch_name}
                  </option>
                ))}
              </select>
            </Grid>
            <Grid item xs={12} sm={6}>
            <select
    id="subject"
    value={selectedSubject}
    onChange={(e) => setSelectedSubject(e.target.value)}
    disabled={role !== "admin"} // Lock dropdown if the user is not an admin
    style={{
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      backgroundColor: role !== "admin" ? "#f0f0f0" : "#fff", // Grey out when disabled
      cursor: role !== "admin" ? "not-allowed" : "pointer", // Show not-allowed cursor when locked
    }}
  >
    <option value="">Select Subject</option>
    {subjects.map((subject) => (
      <option key={subject.subject_id} value={subject.subject_id}>
        {subject.subject_name}
      </option>
    ))}
  </select>

            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                Add New Class Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Classwork Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isTeacherAbsent}
                    onChange={(e) => setForm({ ...form, isTeacherAbsent: e.target.checked })}
                  />
                }
                label="Teacher Absent"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type="date"
                fullWidth
                value={form.date}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Chapter Name"
                fullWidth
                value={form.chapterName}
                onChange={(e) => setForm({ ...form, chapterName: e.target.value })}
                disabled={form.isTeacherAbsent}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Detailed Description"
                fullWidth
                multiline
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={form.isTeacherAbsent}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Homework Assigned"
                fullWidth
                multiline
                rows={2}
                value={form.homeworkAssigned}
                onChange={(e) => setForm({ ...form, homeworkAssigned: e.target.value })}
                disabled={form.isTeacherAbsent}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEntry}>
            {"Done"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)}>
        <DialogContent dividers>
          {viewEntry && (
            <Grid container spacing={2} sx={{ padding: 2 }}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" color="primary">Classwork Details</Typography>
              </Grid>
              {viewEntry.is_teacher_absent ? (
                <Grid item xs={12}>
                  <Typography><b>Teacher is Absent</b></Typography>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Typography><b>Date:</b> {viewEntry.date}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><b>Chapter Name:</b> {viewEntry.chapter_name}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><b>Classwork: </b> {viewEntry.detailed_description || "No description provided."}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><b>Homework: </b> {viewEntry.homework_assigned}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><b>Submission Time:</b> {new Date(viewEntry.createdAt).toLocaleTimeString()}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h5" fontWeight="bold" gutterBottom style={{ marginTop: "30px" }}>
        📋 Submission Reports
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Chapter Name</b></TableCell>
              <TableCell><b>Classwork</b></TableCell>
              <TableCell><b>Homework</b></TableCell>
              <TableCell><b>Teacher's Attendance</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(entry => (
              <TableRow key={entry.id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.chapter_name}</TableCell>
                <TableCell>{entry.detailed_description}</TableCell>
                <TableCell>{entry.homework_assigned}</TableCell>
                <TableCell>
                  <Typography color={entry.is_teacher_absent ? "red" : "green"}>
                    {entry.is_teacher_absent ? "Absent" : "Present"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button color="secondary" size="small" startIcon={<Visibility />} onClick={() => handleView(entry)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ClassRecord;
