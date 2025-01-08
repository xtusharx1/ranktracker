// src/components/WebSocketComponent.js

import React, { useEffect } from 'react';

const WebSocketComponent = () => {
  useEffect(() => {
    // Use localhost URL for local testing
    const socket = new WebSocket('ws://localhost:3002'); // WebSocket URL for local development

    // When the WebSocket connection is successfully established
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      
      // Send a message to the server when the connection is established
      socket.send('Hello from React client');
    });

    // Listen for messages sent from the WebSocket server
    socket.addEventListener('message', (event) => {
      console.log('Message from server:', event.data);
    });

    // Handle WebSocket connection errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    // Clean up the WebSocket connection when the component is unmounted
    return () => {
      socket.close(); // Close the WebSocket connection when component is removed
    };
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return null; // No UI component, just the WebSocket logic
};

export default WebSocketComponent;
