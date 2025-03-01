import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Header, Segment, Button } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

const UserRoles = () => {
    const [roles, setRoles] = useState([]);
    const [userCounts, setUserCounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://apistudents.sainikschoolcadet.com/api/role/')
            .then(response => {
                setRoles(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the roles!', error);
            });

        axios.get('https://apistudents.sainikschoolcadet.com/api/users/roles/count')
            .then(response => {
                const counts = response.data.reduce((acc, item) => {
                    acc[item.role_id] = item.count;
                    return acc;
                }, {});
                setUserCounts(counts);
            })
            .catch(error => {
                console.error('There was an error fetching the user counts!', error);
            });
    }, []);


    const handleViewClick = (roleId) => {
        if (roleId === 2) {
            navigate('/Students');
        } else {
            navigate(`/user-list/${roleId}`);
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
            <div style={{ margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '20px' }}>User Roles</h2>
                <div style={{ 
                    overflowX: 'auto', 
                    borderRadius: '8px', 
                    backgroundColor: '#fff',
                    padding: '5px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}>
                    <table className="min-w-full table-auto bg-white border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-2 py-3 text-center" style={{ width: '40px' }}>S.No</th>
                                <th className="border border-gray-300 px-4 py-3 text-left" style={{ width: '150px' }}>Role</th>
                                <th className="border border-gray-300 px-4 py-3 text-center" style={{ width: '100px' }}>User Count</th>
                                <th className="border border-gray-300 px-4 py-3 text-center" style={{ width: '100px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role, index) => (
                                <tr key={role.role_id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-2 py-3 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-3">{role.role_name}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">{userCounts[role.role_id] || 0}</td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        <button
                                            className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                                            onClick={() => handleViewClick(role.role_id)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserRoles;
