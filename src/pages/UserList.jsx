import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';

const UserList = () => {
    const { role_id } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role_id });

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

    const fetchUserDetails = async (user_id) => {
        try {
            const response = await axios.get(`https://apistudents.sainikschoolcadet.com/api/users/user/${user_id}`);
            setSelectedUser(response.data.user);
            setViewModalIsOpen(true);
        } catch (err) {
            setError(err);
        }
    };

    const closeViewModal = () => {
        setViewModalIsOpen(false);
        setSelectedUser(null);
    };

    const openCreateModal = () => {
        setCreateModalIsOpen(true);
    };

    const closeCreateModal = () => {
        setCreateModalIsOpen(false);
        setNewUser({ name: '', email: '', password: '', role_id });
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
                    <h1 className="text-3xl font-bold text-gray-800"> </h1>
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                        onClick={openCreateModal}
                    >
                        Create User
                    </button>
                </div>
                {users.length === 0 ? (
                    <div className="text-center text-gray-500">
                        <p>No users found for this role.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto bg-white border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">User Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
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
                                            <button
                                                className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                                                onClick={() => fetchUserDetails(user.user_id)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* View Modal */}
            <Modal
                isOpen={viewModalIsOpen}
                onRequestClose={closeViewModal}
                contentLabel="User Details"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                {selectedUser && (
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">User Details</h2>
                        <p><strong>Name:</strong> {selectedUser.name}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        {/* Add more user details here */}
                        <button
                            className="mt-4 bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition duration-200"
                            onClick={closeViewModal}
                        >
                            Close
                        </button>
                    </div>
                )}
            </Modal>
            {/* Create Modal */}
            <Modal
                isOpen={createModalIsOpen}
                onRequestClose={closeCreateModal}
                contentLabel="Create User"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">Create User</h2>
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
                        <button
                            type="submit"
                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="ml-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default UserList;
