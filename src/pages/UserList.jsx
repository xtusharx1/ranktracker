import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import bcrypt from 'bcryptjs'; // Ensure bcryptjs is installed

// Role mappings
const roles = {
    1: "Admin",
    2: "Student",
    3: "Teacher",
    4: "Counselor"
};

const UserList = () => {
    const { role_id } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [assignedSubjects, setAssignedSubjects] = useState({});
    const [selectedSubject, setSelectedSubject] = useState('');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role_id,
        status: 'active',
    });
    const [batches, setBatches] = useState([]);
    const [assignedBatches, setAssignedBatches] = useState({}); // Store assigned batches per teacher
    const [batchModalIsOpen, setBatchModalIsOpen] = useState(false);
const [selectedBatches, setSelectedBatches] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const filteredBatches = batches.filter(batch =>
    batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase())
);


    
useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`https://apistudents.sainikschoolcadet.com/api/users/role/${role_id}`);
            setUsers(response.data);

            if (role_id === '3') {
                // Fetch assigned subjects
                const assignedSubjectsResponse = await Promise.all(response.data.map(user =>
                    axios.get(`https://apistudents.sainikschoolcadet.com/api/subject-teachers/teacher/${user.user_id}`)
                        .then(res => res.data)
                        .catch(err => err.response?.status === 404 ? [] : Promise.reject(err))
                ));

                // Fetch assigned batches
                const assignedBatchesResponse = await Promise.all(response.data.map(user =>
                    axios.get(`https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${user.user_id}/batches`)
                        .then(res => res.data)
                        .catch(err => err.response?.status === 404 ? [] : Promise.reject(err))
                ));

                // Fetch all batches to map batch names
                const batchesResponse = await axios.get('https://apistudents.sainikschoolcadet.com/api/batches/');
                const batchesMap = batchesResponse.data.reduce((acc, batch) => {
                    acc[batch.batch_id] = batch.batch_name; // Store batch_name against batch_id
                    return acc;
                }, {});

                // Ensure data is an array
                const assignedSubjectsMap = {};
                const assignedBatchesMap = {};

                response.data.forEach((user, index) => {
                    assignedSubjectsMap[user.user_id] = Array.isArray(assignedSubjectsResponse[index])
                        ? assignedSubjectsResponse[index].map(subject => subject.subject_id)
                        : [];

                    assignedBatchesMap[user.user_id] = Array.isArray(assignedBatchesResponse[index])
                        ? assignedBatchesResponse[index].map(batch => ({
                            batch_id: batch.batch_id,
                            batch_name: batchesMap[batch.batch_id] || `Batch ID: ${batch.batch_id}`
                        }))
                        : [];
                });

                setAssignedSubjects(assignedSubjectsMap);
                setAssignedBatches(assignedBatchesMap);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            if (err.response?.status === 404) {
                setUsers([]);
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('https://apistudents.sainikschoolcadet.com/api/subjects/');
            setSubjects(response.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await axios.get('https://apistudents.sainikschoolcadet.com/api/batches/');
            if (Array.isArray(response.data)) {
                setBatches(response.data);
            } else {
                console.warn("Unexpected batch response format:", response.data);
                setBatches([]); // Default to an empty array
            }
        } catch (err) {
            console.error('Error fetching batches:', err);
            setBatches([]); // Handle errors gracefully
        }
    };

    fetchUsers();
    fetchSubjects();
    fetchBatches();
}, [role_id]);

    
    const openAssignModal = async (user) => {
        setSelectedUser(user);
    
        try {
            const response = await axios.get(
                `https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${user.user_id}/batches`
            );
            setSelectedBatches(response.data.map(batch => batch.batch_id));
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setSelectedBatches([]);
            } else {
                console.error("Error fetching assigned batches:", err);
            }
        }
    
        setBatchModalIsOpen(true);
    };
    const handleBatchAssignment = async () => {
        console.log("Button clicked!");
    
        if (!selectedUser || !Array.isArray(selectedBatches)) {
            alert("Please select at least one batch.");
            console.log("Invalid input: selectedUser or selectedBatches is missing.");
            return;
        }
    
        try {
            console.log("Fetching existing batches...");
            let existingBatchIds = [];
    
            try {
                const { data: existingBatches } = await axios.get(
                    `https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${selectedUser.user_id}/batches`
                );
                existingBatchIds = existingBatches.map(batch => batch.batch_id);
            } catch (error) {
                if (error.response?.status === 404) {
                    console.warn("No existing batches found, assuming empty list.");
                } else {
                    throw error; // Other errors should not be ignored
                }
            }
    
            const batchesToRemove = existingBatchIds.filter(id => !selectedBatches.includes(id));
            const batchesToAdd = selectedBatches.filter(id => !existingBatchIds.includes(id));
    
            console.log("Batches to remove:", batchesToRemove);
            console.log("Batches to add:", batchesToAdd);
    
            if (batchesToRemove.length > 0) {
                console.log("Sending DELETE request...");
                await axios.delete(
                    `https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${selectedUser.user_id}/batches`,
                    { data: { batch_ids: batchesToRemove } }
                );
            }
    
            if (batchesToAdd.length > 0) {
                console.log("Sending POST request...");
                await axios.post(
                    `https://apistudents.sainikschoolcadet.com/api/teacher-batches/teacher/${selectedUser.user_id}/batches`,
                    { batch_ids: batchesToAdd }
                );
            }
    
            alert("Batch assignments updated successfully!");
            setBatchModalIsOpen(false);
            window.location.reload();
        } catch (err) {
            console.error("Error updating batch assignments:", err);
            alert("Failed to update batches. Try again.");
        }
    };
    
    
    
    
    const openCreateModal = () => {
        setCreateModalIsOpen(true);
    };

    const closeCreateModal = () => {
        setCreateModalIsOpen(false);
        setNewUser({ name: '', email: '', password: '', role_id, status: 'active' });
        setSelectedSubject('');
    };

    const openEditModal = async (user) => {
        setSelectedUser(user);
        setNewUser({
            name: user.name,
            email: user.email,
            password: '', // Leave password empty for security reasons
            role_id: user.role_id,
            status: user.status,
        });

        if (role_id === '3') {
            try {
                const response = await axios.get(`https://apistudents.sainikschoolcadet.com/api/subject-teachers/teacher/${user.user_id}`);
                setSelectedSubject(response.data[0]?.subject_id || '');
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setSelectedSubject('');
                } else {
                    console.error('Error fetching assigned subject:', err);
                }
            }
        }

        setEditModalIsOpen(true);
    };

    const closeEditModal = () => {
        setEditModalIsOpen(false);
        setSelectedUser(null);
        setSelectedSubject('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://apistudents.sainikschoolcadet.com/api/users/register', newUser);
            const createdUser = response.data;
    
            console.log("Created User Response:", createdUser); // Debugging
            console.log("Subject ID:", selectedSubject); // Debugging
    
            const userId = createdUser.user?.id; // Fix: Use createdUser.user.id
            if (!userId) {
                console.error("User ID is missing in response!");
                return;
            }
    
            if (!selectedSubject) {
                console.error("No subject selected!");
                return;
            }
    
            if (Number(role_id) === 3) {
                await axios.post('https://apistudents.sainikschoolcadet.com/api/subject-teachers/assign', {
                    subject_id: selectedSubject,
                    user_id: userId, // Fix: Use userId instead of undefined createdUser.user_id
                });
                console.log("Subject assigned successfully!");
            }
    
            alert('User created successfully!');
            closeCreateModal();
            setLoading(true); // Refresh user list
        } catch (err) {
            console.error('Error creating user:', err.response?.data || err.message);
            alert(err.response?.data?.message || 'Failed to create user.');
        }
    };
    

    const handleEditUser = async (e) => {
        e.preventDefault();
    
        console.log("Selected User Data:", selectedUser);  // Debugging log
        console.log("Selected Subject from Dropdown:", selectedSubject);  // Debugging log
    
        try {
            // ✅ Update user's basic info
            const userUpdateResponse = await axios.put(
                `https://apistudents.sainikschoolcadet.com/api/users/user/${selectedUser.user_id}`,
                {
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password ? newUser.password : undefined,
                    status: newUser.status
                }
            );
    
            console.log('User updated:', userUpdateResponse.data);
    
            // ✅ Check if the user is a teacher (role_id == 3)
            if (Number(role_id) !== 3) {
                console.log("Skipping subject update as the user is not a teacher.");
                window.location.reload();
                closeEditModal();
                return;
            }
    
            console.log("User is a teacher. Proceeding with subject update.");
    
            // ✅ Check if selectedSubject is valid
            if (!selectedSubject) {
                console.warn("No subject selected. Skipping subject update.");
                window.location.reload();
                closeEditModal();
                return;
            }
    
            // ✅ Get the current assigned subject for the user
            const currentAssignedSubject = assignedSubjects[selectedUser.user_id]?.[0] || null;
    
            console.log("Current assigned subject:", currentAssignedSubject);
    
            if (!currentAssignedSubject) {
                // ✅ No subject is currently assigned → Assign the subject
                try {
                    console.log(`No subject assigned. Assigning new subject: ${selectedSubject}`);
                    const subjectAssignResponse = await axios.post(
                        'https://apistudents.sainikschoolcadet.com/api/subject-teachers/assign',
                        {
                            subject_id: selectedSubject,
                            user_id: selectedUser.user_id,
                        }
                    );
                    console.log('Subject assigned:', subjectAssignResponse.data);
                } catch (assignError) {
                    console.error('Error assigning Subject:', assignError.response?.data || assignError.message);
                }
            } else if (currentAssignedSubject !== selectedSubject) {
                // ✅ If the subject is different, update it
                try {
                    console.log(`Updating subject from ${currentAssignedSubject} to ${selectedSubject}`);
                    const subjectUpdateResponse = await axios.put(
                        `https://apistudents.sainikschoolcadet.com/api/subject-teachers/update/${currentAssignedSubject}/${selectedUser.user_id}`,
                        { new_subject_id: selectedSubject }
                    );
                    console.log('Subject updated:', subjectUpdateResponse.data);
                } catch (updateError) {
                    console.error('Error updating Subject:', updateError.response?.data || updateError.message);
    
                    // ✅ If update fails because the subject doesn't exist, assign it instead
                    if (updateError.response?.status === 404) {
                        try {
                            console.log(`No existing subject found. Assigning new subject: ${selectedSubject}`);
                            const subjectAssignResponse = await axios.post(
                                'https://apistudents.sainikschoolcadet.com/api/subject-teachers/assign',
                                {
                                    subject_id: selectedSubject,
                                    user_id: selectedUser.user_id,
                                }
                            );
                            console.log('Subject assigned:', subjectAssignResponse.data);
                        } catch (assignError) {
                            console.error('Error assigning Subject:', assignError.response?.data || assignError.message);
                        }
                    }
                }
            } else {
                console.log("Subject is already assigned correctly. No changes needed.");
            }
    
            window.location.reload();
            closeEditModal();
        } catch (error) {
            console.error('Error updating user:', error.response?.data || error.message);
        }
    };
    
    
    
    
    
    
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-gray-700">Loading...</div>
            </div>
        );
    }

    if (error && error.response?.status !== 404) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-red-500">Error: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <div className=" mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">{roles[role_id]}s</h1>
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                        onClick={openCreateModal}
                    >
                        Create New {roles[role_id]}
                    </button>
                </div>
                {users.length === 0 ? (
                    <div className="text-center text-gray-500">
                        <p>No {roles[role_id]}s found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto bg-white border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                                    {role_id === '3' && <th className="border border-gray-300 px-4 py-2 text-left">Assigned Subject</th>}
                                    {role_id === '3' && <th className="border border-gray-300 px-4 py-2 text-left">Assigned Courses</th>}
                                    {role_id === '3' && <th className="border border-gray-300 px-4 py-2 text-left">Assign Courses</th>}
                                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.user_id} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                        <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded-full ${
                                                    user.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                }`}
                                            >
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        {role_id === '3' && (
                        <>
                            {/* Display Assigned Subjects */}
                            <td className="border border-gray-300 px-4 py-2">
                                {assignedSubjects[user.user_id] !== null 
                                    ? assignedSubjects[user.user_id]?.map(subjectId => 
                                        subjects.find(subject => subject.subject_id === subjectId)?.subject_name
                                    ).join(', ') || 'N/A'
                                    : 'Not assigned to any subject'}
                            </td>

                            {/* Display Assigned Batches */}
                            <td className="border border-gray-300 px-4 py-2">
    {assignedBatches[user.user_id]?.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
            {assignedBatches[user.user_id].map(batch => (
                <li key={batch.batch_id} className="text-gray-800">{batch.batch_name}</li>
            ))}
        </ul>
    ) : (
        <p className="text-gray-500">Not assigned to any batch</p>
    )}
</td>


                        </>
                    )}

                                        {role_id === '3' && (
                                            <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                className="bg-violet-500 text-white py-1 px-4 rounded-lg hover:bg-violet-600 transition duration-200"
                                                onClick={() => openAssignModal(user)} // Pass user to open modal
                                            >
                                                Assign
                                            </button>
                                        </td>
                                        
                                        )}
                                        <td className="border border-gray-300 px-4 py-2">
                                            <button
                                                className="bg-yellow-500 text-white py-1 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
                                                onClick={() => openEditModal(user)}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Modal
    isOpen={batchModalIsOpen}
    onRequestClose={() => setBatchModalIsOpen(false)}
    contentLabel="Assign Batches"
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
>
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Assign Courses to "{selectedUser?.name}"
        </h2>

        {/* Search Input */}
        <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Select Courses</label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => (
                        <label 
                            key={batch.batch_id} 
                            className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                value={batch.batch_id}
                                checked={selectedBatches.includes(batch.batch_id)}
                                onChange={(e) => {
                                    const batchId = parseInt(e.target.value);
                                    setSelectedBatches((prev) =>
                                        prev.includes(batchId)
                                            ? prev.filter((id) => id !== batchId)
                                            : [...prev, batchId]
                                    );
                                }}
                                className="h-5 w-5 text-blue-500 focus:ring-blue-400 rounded"
                            />
                            <span className="text-gray-800">{batch.batch_name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-gray-500">No matching batches found.</p>
                )}
            </div>
        </div>

        <div className="flex justify-end mt-4">
            <button
                type="button"
                onClick={() => setBatchModalIsOpen(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200 mr-2"
            >
                Cancel
            </button>
            <button
                onClick={handleBatchAssignment}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
            >
                Assign Courses
            </button>
        </div>
    </div>
</Modal>



            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit User"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">Edit {roles[role_id]}</h2>
                    <form onSubmit={handleEditUser}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={newUser.name}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password (Leave empty if not changing)</label>
                            <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Status</label>
                            <select
                                name="status"
                                value={newUser.status}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        {role_id === '3' && (
                            <div className="mb-4">
                                <label className="block text-gray-700">Assign Subject</label>
                                <select
    name="subject"
    value={selectedSubject}
    onChange={(e) => setSelectedSubject(e.target.value)}
    required
    className="w-full border px-3 py-2 rounded-lg"
>
    <option value="">Select a subject</option>
    {subjects.map((subject) => (
        <option key={subject.subject_id} value={subject.subject_id}>
            {subject.subject_name}
        </option>
    ))}
</select>

                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="bg-gray-500 text-white py-1 px-4 rounded-lg hover:bg-gray-600 transition duration-200 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Create Modal */}
            <Modal
                isOpen={createModalIsOpen}
                onRequestClose={closeCreateModal}
                contentLabel="Create User"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">Create {roles[role_id]}</h2>
                    <form onSubmit={handleCreateUser}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={newUser.name}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Status</label>
                            <select
                                name="status"
                                value={newUser.status}
                                onChange={handleInputChange}
                                required
                                className="w-full border px-3 py-2 rounded-lg"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        {role_id === '3' && (
                            <div className="mb-4">
                                <label className="block text-gray-700">Assign Subject</label>
                                <select
                                    name="subject"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    required
                                    className="w-full border px-3 py-2 rounded-lg"
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.subject_id} value={subject.subject_id}>
                                            {subject.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="bg-gray-500 text-white py-1 px-4 rounded-lg hover:bg-gray-600 transition duration-200 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                            >
                                Create User
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default UserList;

