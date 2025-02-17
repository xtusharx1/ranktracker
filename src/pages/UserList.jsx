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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`https://apistudents.sainikschoolcadet.com/api/users/role/${role_id}`);
                setUsers(response.data);

                if (role_id === '3') {
                    const assignedSubjectsResponse = await Promise.all(response.data.map(user => 
                        axios.get(`https://apistudents.sainikschoolcadet.com/api/subject-teachers/teacher/${user.user_id}`)
                        .then(res => res.data)
                        .catch(err => {
                            if (err.response && err.response.status === 404) {
                                return null;
                            }
                            throw err;
                        })
                    ));

                    const assignedSubjectsMap = {};
                    assignedSubjectsResponse.forEach((res, index) => {
                        assignedSubjectsMap[response.data[index].user_id] = res ? res.map(subject => subject.subject_id) : null;
                    });

                    setAssignedSubjects(assignedSubjectsMap);
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setUsers([]); // No users exist for the role
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

        fetchUsers();
        fetchSubjects();
    }, [role_id]);

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

            if (role_id === '3' && selectedSubject) {
                await axios.post('https://apistudents.sainikschoolcadet.com/api/subject-teachers/assign', {
                    subject_id: selectedSubject,
                    user_id: createdUser.user_id,
                });
            }

            alert('User created successfully!');
            closeCreateModal();
            setLoading(true); // Refresh user list
        } catch (err) {
            console.error('Error creating user:', err);
            alert(err.response?.data?.message || 'Failed to create user.');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
    
        console.log("Selected User Data:", selectedUser);  // Debugging log
        console.log("Selected Subject from Dropdown:", selectedSubject);  // Debugging log
    
        try {
            // Update user's basic info
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
    
            // Check if selectedSubject is valid
            if (!selectedSubject) {
                console.error("Error: selectedSubject is undefined or null!");
                return;
            }
    
            // Get the current assigned subject for the user from assignedSubjects
            const currentAssignedSubject = assignedSubjects[selectedUser.user_id]
                ? assignedSubjects[selectedUser.user_id][0] // Assume one subject per user
                : null;
    
            console.log("Current assigned subject:", currentAssignedSubject); // Debugging log
    
            // If the current subject is different from the selected subject, update the subject
            if (currentAssignedSubject && currentAssignedSubject !== selectedSubject) {
                try {
                    console.log(`Updating subject from ${currentAssignedSubject} to ${selectedSubject}`);
    
                    const subjectUpdateResponse = await axios.put(
                        `https://apistudents.sainikschoolcadet.com/api/subject-teachers/update/${currentAssignedSubject}/${selectedUser.user_id}`,
                        { new_subject_id: selectedSubject }
                    );
                    console.log('Subject updated:', subjectUpdateResponse.data);
                } catch (error) {
                    console.error('Error updating Subject:', error.response?.data || error.message);
                }
            }
            window.location.reload();
            closeEditModal(); // Close modal on success
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
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
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
                                    <th className="border border-gray-300 px-4 py-2 text-left">User Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                                    {role_id === '3' && <th className="border border-gray-300 px-4 py-2 text-left">Assigned Subject</th>}
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
                                            <td className="border border-gray-300 px-4 py-2">
                                                {assignedSubjects[user.user_id] !== null 
                                                    ? assignedSubjects[user.user_id]?.map(subjectId => subjects.find(subject => subject.subject_id === subjectId)?.subject_name).join(', ') || 'N/A'
                                                    : 'Not assigned to any subject'}
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

