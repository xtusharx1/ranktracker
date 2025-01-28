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

        fetchUsers();
    }, [role_id]);

    

    const openCreateModal = () => {
        setCreateModalIsOpen(true);
    };

    const closeCreateModal = () => {
        setCreateModalIsOpen(false);
        setNewUser({ name: '', email: '', password: '', role_id, status: 'active' });
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setNewUser({
            name: user.name,
            email: user.email,
            password: '', // Leave password empty for security reasons
            role_id: user.role_id,
            status: user.status,
        });
        setEditModalIsOpen(true);
    };

    const closeEditModal = () => {
        setEditModalIsOpen(false);
        setSelectedUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://apistudents.sainikschoolcadet.com/api/users/register', newUser);
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
        try {
            // Check if a new password is provided
            if (newUser.password) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
                newUser.password = hashedPassword;
            }

            await axios.put(`https://apistudents.sainikschoolcadet.com/api/users/user/${selectedUser.user_id}`, newUser);

            alert('User updated successfully!');
            closeEditModal();
            window.location.reload(); // Reload the page to refresh user list
        } catch (err) {
            console.error('Error updating user:', err);
            alert(err.response?.data?.message || 'Failed to update user.');
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

            {/* Edit Modal */}
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
