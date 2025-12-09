const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

// Create connection
const connection = mysql.createConnection(config);

// Read schema file
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Connect to database and execute schema
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  
  console.log('Connected to database');
  
  // Execute schema
  connection.query(schema, (err, results) => {
    if (err) {
      console.error('Error executing schema:', err);
      connection.end();
      process.exit(1);
    }
    
    console.log('Database initialized successfully');
    connection.end();
  });
});