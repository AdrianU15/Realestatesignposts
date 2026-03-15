// Assuming other necessary imports are present.

function initDB() {
    // Database initialization logic...
}

try {
    initDB();
} catch (error) {
    console.error("Database connection failed: ", error);
    // Optionally, you may want to handle the error more gracefully, such as by exiting or providing a fallback.
}

// ...rest of the server.js code remains unchanged.