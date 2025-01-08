// src/components/WebSocketComponent.js

import React, { useEffect } from 'react';

const WebSocketComponent = () => {
  useEffect(() => {
    // Use different WebSocket URLs for development and production
    const socket = new WebSocket(
      process.env.NODE_ENV === 'production'
        ? 'ws://http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3002' // Production: Use server IP or domain
        : 'ws://localhost:3002'               // Development: Use local Node.js server
    );

    // Handle successful connection
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      socket.send('Hello from React client');
    });

    // Handle incoming messages
    socket.addEventListener('message', (event) => {
      console.log('Message from server:', event.data);
    });

    // Handle errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    // Clean up WebSocket connection on unmount
    return () => socket.close();
  }, []);

  return null; // No UI, just logic
};


export default WebSocketComponent;
