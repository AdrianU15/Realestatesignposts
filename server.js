// Import necessary modules
const express = require('express');
const app = express();

// Database initialization function
const initDB = require('./db').initDB;

// Wrap initDB call in a try-catch block
try {
    initDB();
} catch (error) {
    console.error('Database initialization failed:', error);
    // Continue server initialization even if the database connection fails
}

// Other server configurations and routes go here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});