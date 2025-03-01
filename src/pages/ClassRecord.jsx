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
    const Id = localStorage.getItem("user_id");
    
    if (role === "admin") {
      axios.get('https://apistudents.sainikschoolcadet.com/api/subjects/')
        .then(res => setSubjects(res.data))
        .catch(err => console.error('Error fetching subjects:', err));
    } else if (role === "teacher") {
      axios.get(`https://apistudents.sainikschoolcadet.com/api/subject-teachers/teacher/${Id}`)
        .then(res => {
          if (res.data.length > 0) {
            setSelectedSubject(res.data[0].subject_id);
            return axios.get('https://apistudents.sainikschoolcadet.com/api/subjects/')
              .then(subjectsRes => {
                setSubjects(subjectsRes.data.filter(subject => 
                  subject.subject_id === res.data[0].subject_id
                ));
              });
          }
        })
        .catch(err => console.error("Error fetching teacher's subject:", err));
    }
  }, [role]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
  
    if (role === "admin") {
      axios.get("https://apistudents.sainikschoolcadet.com/api/batches")
        .then((res) => setBatches(res.data))
        .catch((err) => console.error("Error fetching batches:", err));
    } else if (role === "teacher") {
      axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${userId}/batches`)
        .then((res) => {
          const assignedBatchIds = res.data.map((batch) => batch.batch_id);
          
          axios.get("https://apistudents.sainikschoolcadet.com/api/batches")
            .then((batchRes) => {
              const filteredBatches = batchRes.data.filter((batch) =>
                assignedBatchIds.includes(batch.batch_id)
              );
              setBatches(filteredBatches);
            })
            .catch((err) => console.error("Error fetching batch details:", err));
        })
        .catch((err) => console.error("Error fetching teacher's assigned batches:", err));
    }
  }, [role]);

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
    <Container maxWidth={false} sx={{ padding: 0 }}>
      <div style={{ padding: "20px" }}></div>
      <Typography variant="h4" fontWeight="bold">
        Daily Classwork Entry
      </Typography>
      <br></br>

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
              {role === "teacher" ? (
                <input
                  type="text"
                  value={subjects[0]?.subject_name || "Loading..."}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f0f0f0",
                    cursor: "not-allowed"
                  }}
                />
              ) : (
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
              )}
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
                label="Classwork"
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
                label="Homework"
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
        Submission Reports
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
      <div className="overflow-x-auto">
  <table className="min-w-full table-auto bg-white border-collapse border border-gray-300 mb-8">
    <thead>
      <tr className="bg-gray-200 text-black">
        <th className="border border-gray-300 px-2 py-2 text-left" style={{ width: '50px' }}>S.No</th>
        <th className="border border-gray-300 px-4 py-2 text-left"style={{ width: '200px' }}>Date</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Chapter Name</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Classwork</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Homework</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Teacher's Attendance</th>
        <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {entries.map((entry, index) => (
        <tr key={entry.id} className="hover:bg-gray-100">
          <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
          <td className="border border-gray-300 px-4 py-2">
            {`${new Date(entry.date).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric'
            })}, ${new Date(entry.date).toLocaleDateString('en-GB', { 
              weekday: 'long'
            })}`}
          </td>
         
          <td className="border border-gray-300 px-4 py-2">{entry.chapter_name}</td>
          <td className="border border-gray-300 px-4 py-2">{entry.detailed_description}</td>
          <td className="border border-gray-300 px-4 py-2">{entry.homework_assigned}</td>
          <td className="border border-gray-300 px-4 py-2">
            <span className={entry.is_teacher_absent ? "text-red-600" : "text-green-600"}>
              {entry.is_teacher_absent ? "Absent" : "Present"}
            </span>
          </td>
          <td className="border border-gray-300 px-4 py-2">
            <button
              className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 transition duration-200"
              onClick={() => handleView(entry)}
            >
              View
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </TableContainer>
    </Container>
  );
};

export default ClassRecord;
