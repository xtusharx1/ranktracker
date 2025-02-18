import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUserRole, setUserDetails }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('https://apistudents.sainikschoolcadet.com/api/users/login', { email, password });
      const { id, role_id, name, email: userEmail } = response.data.user;
  
      // Map role_id to role name
      let role = '';
      switch(role_id) {
        case 1:
          role = 'admin';
          break;
        case 3:
          role = 'teacher';
          break;
        case 4:
          role = 'counselor';
          break;
        default:
          throw new Error('Invalid role');
      }
  
      // Save user role and details in localStorage
      localStorage.setItem('user_id', id);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('email', userEmail);
  
      setUserRole(role); // Set the role in context
      setUserDetails({ id, name, email: userEmail }); // Set the user details in context
  
      console.log('Login successful!', { id, name, role });
  
      navigate('/'); // Redirect to the home page or dashboard
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
    }
  };
  

  return (
    <div className="login-container flex justify-center items-center min-h-screen bg-gray-100">
      <div className="login-form bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">Login</h2>
        
        {error && <div className="error-message text-red-600 text-center mb-4">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 font-medium mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
