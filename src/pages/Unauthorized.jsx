// Unauthorized.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Unauthorized</h2>
      <p>You do not have access to this page.</p>
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
};

export default Unauthorized;
