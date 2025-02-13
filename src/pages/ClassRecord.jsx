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
} from "@mui/material";
import { Add, Edit, Visibility } from "@mui/icons-material";
import axios from "axios";

const ClassRecord = () => {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: "", topic: "", description: "", chapterName: "", homeworkAssigned: "" });
  const [viewOpen, setViewOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [editMode, setEditMode] = useState(false);
const [editId, setEditId] = useState(null);

  
  useEffect(() => {
    axios.get("https://apistudents.sainikschoolcadet.com/api/batches")
      .then(res => setBatches(res.data))
      .catch(err => console.error('Error fetching batches:', err));

    axios.get("https://apistudents.sainikschoolcadet.com/api/subjects")
      .then(res => setSubjects(res.data))
      .catch(err => console.error('Error fetching subjects:', err));
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
  const handleEdit = (entry) => {
    setForm({
      date: entry.date,
      topic: entry.topic_covered,
      description: entry.detailed_description,
      chapterName: entry.chapter_name,
      homeworkAssigned: entry.homework_assigned,
    });
    setEditId(entry.id);
    setEditMode(true);
    setOpen(true);
  };
  
  const handleAddEntry = () => {
    const teacherName = localStorage.getItem('name');
    const apiUrl = editMode 
      ? `https://apistudents.sainikschoolcadet.com/api/teacher-report/${editId}` 
      : "https://apistudents.sainikschoolcadet.com/api/teacher-report";
  
    const method = editMode ? axios.put : axios.post;
  
    method(apiUrl, {
      teacher_name: teacherName,
      batch_id: selectedBatch,
      subject_id: selectedSubject,
      date: form.date,
      chapter_name: form.chapterName,
      topic_covered: form.topic,
      detailed_description: form.description,
      homework_assigned: form.homeworkAssigned,
    }).then(() => {
      setOpen(false);
      setEditMode(false);
      setEditId(null);
      setForm({ date: "", topic: "", description: "", chapterName: "", homeworkAssigned: "" });
      axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-report/batch/${selectedBatch}/subject/${selectedSubject}`)
        .then(res => setEntries(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
        .catch(err => console.error('Error fetching classwork entries:', err));
    }).catch(err => console.error('Error saving classwork entry:', err));
  };
  
  return (
    <div style={{ padding: "20px" }}>
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
  style={{
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
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
        <DialogTitle>Add/Edit Classwork Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField type="date" fullWidth value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Chapter Name" fullWidth value={form.chapterName} onChange={(e) => setForm({ ...form, chapterName: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Topic Covered" fullWidth value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Detailed Description" fullWidth multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Homework Assigned" fullWidth multiline rows={2} value={form.homeworkAssigned} onChange={(e) => setForm({ ...form, homeworkAssigned: e.target.value })} />
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
      
      <Grid item xs={12}>
        <Typography><b>Date:</b> {viewEntry.date}</Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Typography><b>Chapter Name:</b> {viewEntry.chapter_name}</Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Typography><b>Topic Covered:</b> {viewEntry.topic_covered}</Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Typography><b>Homework Assigned:</b> {viewEntry.homework_assigned}</Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography><b>Detailed Description:</b> {viewEntry.detailed_description || "No description provided."}</Typography>
      </Grid>
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
              <TableCell><b>Classwork Covered</b></TableCell>
              <TableCell><b>Homework Assigned</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(entry => (
              <TableRow key={entry.id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.chapter_name}</TableCell>
                <TableCell>{entry.topic_covered}</TableCell>
                <TableCell>{entry.homework_assigned}</TableCell>
                <TableCell>
  <Button color="primary" size="small" startIcon={<Edit />} onClick={() => handleEdit(entry)}>
    Edit
  </Button>
  <Button color="secondary" size="small" startIcon={<Visibility />} onClick={() => handleView(entry)}>
    View
  </Button>
</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ClassRecord;
