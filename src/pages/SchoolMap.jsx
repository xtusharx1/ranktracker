import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Table, TableHead, TableBody, TableCell, TableRow, Button, MenuItem, 
  Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Chip, Box, CircularProgress, Typography, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

// Custom School Icon
const schoolIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991231.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Status Chip Colors
const statusColors = {
  Pending: "warning",
  Active: "primary",
  Completed: "success",
};

const SchoolMap = () => {
  const [visits, setVisits] = useState([]);
  const [schools, setSchools] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [editVisit, setEditVisit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, schoolsRes, personnelRes] = await Promise.all([
        fetch("hhttps://apistudents.sainikschoolcadet.com/api/visits").then(res => res.json()),
        fetch("hhttps://apistudents.sainikschoolcadet.com/api/schools").then(res => res.json()),
        fetch("hhttps://apistudents.sainikschoolcadet.com/api/marketing-personnel/").then(res => res.json()),
      ]);
      
      setVisits(visitsRes.data || []);
      setSchools(schoolsRes.data || []);
      setPersonnel(personnelRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
// State for form
const [open, setOpen] = useState(false);
const [newVisit, setNewVisit] = useState({
  school_id: "",
  personnel_id: "",
  visit_date: "",
  status: "Pending",
});

// Handle form input change
const handleInputChange = (e) => {
  setNewVisit({ ...newVisit, [e.target.name]: e.target.value });
};

// Handle visit assignment
const handleAssignVisit = async () => {
  try {
    await fetch("hhttps://apistudents.sainikschoolcadet.com/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVisit),
    });

    fetchData(); // Refresh visits
    setNewVisit({ school_id: "", personnel_id: "", visit_date: "", status: "Pending" });
    setOpen(false);
  } catch (error) {
    console.error("Error creating visit:", error);
  }
};

  const handleEditChange = (e) => {
    setEditVisit({ ...editVisit, [e.target.name]: e.target.value });
  };

  const handleEditVisit = async () => {
    try {
      await fetch(`hhttps://apistudents.sainikschoolcadet.com/api/visits/${editVisit.visit_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editVisit),
      });

      fetchData();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating visit:", error);
    }
  };

  const filteredSchools = schools.filter((school) => {
    if (filter === "All") return true;
    const visit = visits.find((v) => v.school_id === school.school_id);
    if (!visit) return filter === "Unassigned";
    return visit.status === filter;
  });

  return (
    <div>
      <Typography variant="h4" sx={{ textAlign: "center", marginY: 2 }}>
          
      </Typography>

      {/* Loading State */}
      {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
      <center>
      <FormControl
  sx={{
    width: "200px", // Slightly increased for better readability
    backgroundColor: "#fff",
    borderRadius: "8px", // Smoother rounded corners
    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.15)", // Softer shadow for depth
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.2)",
    },
    "& .MuiInputLabel-root": {
      backgroundColor: "#fff",
      paddingX: "6px",
      transform: "translate(14px, -6px) scale(0.85)", // Better alignment
      fontSize: "13px",
      fontWeight: "500",
      color: "#007BFF",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "& fieldset": {
        borderColor: "#007BFF",
      },
      "&:hover fieldset": {
        borderColor: "#0056b3",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00A4CC",
        boxShadow: "0px 0px 6px rgba(0, 123, 255, 0.4)",
      },
    },
    "& .MuiSelect-select": {
      padding: "8px 14px", // Balanced padding
      fontSize: "14px",
      fontWeight: "500",
    },
  }}
>
  <InputLabel>Filter By</InputLabel> {/* More descriptive label */}
  <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
    <MenuItem value="All">🌍 All</MenuItem>
    <MenuItem value="Unassigned">🚨 Unassigned</MenuItem>
    <MenuItem value="Pending">⏳ Pending</MenuItem>
    <MenuItem value="Active">🏁 Active</MenuItem>
    <MenuItem value="Completed">✅ Completed</MenuItem>
  </Select>
</FormControl>


</center>
<br></br>

      {/* Map Container */}
      <Box sx={{ height: "60vh", width: "100%", marginBottom: 4 }}>
        <MapContainer center={[28.45, 77.05]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredSchools.map((school, index) => (
            <Marker key={index} position={[parseFloat(school.lat), parseFloat(school.lng)]} icon={schoolIcon}>
              <Popup>
                <strong>{school.school_name}</strong> <br />📍 {school.lat}, {school.lng}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
{/* Assign Visit Button */}
<Button
  variant="contained"
  onClick={() => setOpen(true)}
  sx={{
    width: "250px", // Decreased width
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "30px",
    background: "linear-gradient(135deg, #007BFF 30%, #00D4FF 100%)",
    color: "white",
    boxShadow: "0px 4px 10px rgba(0, 123, 255, 0.4)",
    transition: "all 0.3s ease",
    display: "block",
    margin: "20px auto", // Centered position
    "&:hover": {
      background: "linear-gradient(135deg, #0056b3 30%, #00A4CC 100%)",
      boxShadow: "0px 6px 12px rgba(0, 123, 255, 0.6)",
      transform: "translateY(-2px)",
    },
  }}
>
  🚀 Assign a Visit
</Button>


{/* Visit Assignment Form */}
<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Assign a Visit</DialogTitle>
  <DialogContent>
    {/* School Selection */}
    <FormControl fullWidth sx={{ marginY: 1 }}>
      <InputLabel>School</InputLabel>
      <Select name="school_id" value={newVisit.school_id} onChange={handleInputChange}>
        {schools.map((school) => (
          <MenuItem key={school.school_id} value={school.school_id}>
            {school.school_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Marketing Personnel Selection */}
    <FormControl fullWidth sx={{ marginY: 1 }}>
      <InputLabel>Marketing Personnel</InputLabel>
      <Select name="personnel_id" value={newVisit.personnel_id} onChange={handleInputChange}>
        {personnel.map((p) => (
          <MenuItem key={p.personnel_id} value={p.personnel_id}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Visit Date Input */}
    <TextField
      label="Visit Date"
      type="date"
      name="visit_date"
      value={newVisit.visit_date}
      onChange={handleInputChange}
      fullWidth
      sx={{ marginY: 1 }}
      InputLabelProps={{ shrink: true }}
    />

    {/* Status Selection */}
    <FormControl fullWidth sx={{ marginY: 1 }}>
      <InputLabel>Status</InputLabel>
      <Select name="status" value={newVisit.status} onChange={handleInputChange}>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Completed">Completed</MenuItem>
      </Select>
    </FormControl>
  </DialogContent>

  {/* Form Actions */}
  <DialogActions>
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="contained" color="primary" onClick={handleAssignVisit}>
      Assign
    </Button>
  </DialogActions>
</Dialog>

      {/* School Visits Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S. No.</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Marketing Personnel</TableCell>
              <TableCell>Visit Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits
              .sort((a, b) => {
                // Custom order for statuses
                const statusOrder = { Pending: 1, Active: 2, Completed: 3 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                  return statusOrder[a.status] - statusOrder[b.status];
                }
                // Sort by date (latest first)
                return new Date(b.visit_date) - new Date(a.visit_date);
              })
              .map((visit, index) => {
                const school = schools.find((s) => s.school_id === visit.school_id);
                const person = personnel.find((p) => p.personnel_id === visit.personnel_id);
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{school ? school.school_name : "Unknown"}</TableCell>
                    <TableCell>{person ? person.name : "Unknown"}</TableCell>
                    <TableCell>{visit.visit_date}</TableCell>
                    <TableCell>
                      <Chip label={visit.status} color={statusColors[visit.status]} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => { setEditVisit(visit); setEditDialogOpen(true); }}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Box>

      {/* Edit Visit Dialog */}
      {editVisit && (
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Visit</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ marginY: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={editVisit.status} onChange={handleEditChange}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleEditVisit}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default SchoolMap;
