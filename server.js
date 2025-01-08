// server.js
const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('WebSocket server is running');
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// When a new WebSocket connection is established
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // When a message is received from the client
  ws.on('message', (message) => {
    console.log('Received: %s', message);
    
    // Send a response back to the client
    ws.send('Hello from server');
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the HTTP server on port 3003
server.listen(3003, () => {
  console.log('WebSocket server listening on ws://localhost:3003');
});
