const mysql = require('mysql2');

// Database configuration
const config = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  database: 'job_portal'
};

// Create connection
const connection = mysql.createConnection(config);

// Connect to database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  
  console.log('Successfully connected to database');
  connection.end();
});