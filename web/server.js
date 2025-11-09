/**
 * Node.js server for serving the web interface
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from web directory
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Web interface running at http://localhost:${PORT}`);
    console.log('Make sure the Python backend is running on port 5000');
});
