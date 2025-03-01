import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Course = () => {
  const [batches, setBatches] = useState([]);
  const [newBatchName, setNewBatchName] = useState('');
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editingBatch, setEditingBatch] = useState(null); 

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get('https://apistudents.sainikschoolcadet.com/api/batches/all');
        const enrichedBatches = await Promise.all(
          response.data.map(async (batch) => {
            const countResponse = await axios.get(
              `https://apistudents.sainikschoolcadet.com/api/studentBatches/batches/${batch.batch_id}/count`
            );
            return { ...batch, studentCount: countResponse.data.studentCount };
          })
        );
        setBatches(enrichedBatches);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    fetchBatches();
  }, []);

  const handleCreateBatch = async () => {
    try {
      const response = await axios.post('https://apistudents.sainikschoolcadet.com/api/batches/', {
        batch_name: newBatchName,
      });
      setBatches((prevBatches) => [...prevBatches, { ...response.data, studentCount: 0 }]);
      alert('Batch created successfully');
      setNewBatchName('');
      setShowNewBatchModal(false);
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleEditBatch = async () => {
    try {
      const response = await axios.put(
        `https://apistudents.sainikschoolcadet.com/api/batches/${editingBatch.batch_id}`,
        {
          batch_name: editingBatch.batch_name,
          is_active: editingBatch.is_active,
        }
      );
  
      const reloadBatches = await axios.get(
        'https://apistudents.sainikschoolcadet.com/api/batches/'
      );
      const enrichedBatches = await Promise.all(
        reloadBatches.data.map(async (batch) => {
          const countResponse = await axios.get(
            `https://apistudents.sainikschoolcadet.com/api/studentBatches/batches/${batch.batch_id}/count`
          );
          return { ...batch, studentCount: countResponse.data.studentCount };
        })
      );
      setBatches(enrichedBatches);
  
      alert('Batch updated successfully');
      setShowEditModal(false);
      setEditingBatch(null);
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const handleEditClick = (batch) => {
    setEditingBatch({ ...batch });
    setShowEditModal(true);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">List of Courses</h1>

        <button
          onClick={() => setShowNewBatchModal(true)}
          className="mb-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Create New Course
        </button>

        {/* Batch List */}
        <table className="w-full table-auto bg-white border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">S.No</th>
              <th className="border border-gray-300 px-4 py-2">Course Name</th>
              <th className="border border-gray-300 px-4 py-2">No. of Students</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch, index) => (
              <tr key={batch.batch_id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{batch.batch_name}</td>
                <td className="border border-gray-300 px-4 py-2">{batch.studentCount}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {batch.is_active ? 'Active' : 'Inactive'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEditClick(batch)}
                    className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create New Batch Modal */}
      {showNewBatchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Create New Course</h2>
            <input
              type="text"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              placeholder="Enter Course Name"
              className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              onClick={handleCreateBatch}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewBatchModal(false)}
              className="mt-4 w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditModal && editingBatch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Edit Course</h2>
            <input
              type="text"
              value={editingBatch.batch_name}
              onChange={(e) => setEditingBatch({ ...editingBatch, batch_name: e.target.value })}
              placeholder="Enter Course name"
              className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
            <select
              value={editingBatch.is_active ? 'Active' : 'Inactive'}
              onChange={(e) => setEditingBatch({ ...editingBatch, is_active: e.target.value === 'Active' })}
              className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              onClick={handleEditBatch}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
            >
              Save
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="mt-4 w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;
