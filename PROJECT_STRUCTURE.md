# Project Structure

```
JOB/
├── README.md
├── SOLUTION_SUMMARY.md
├── PROJECT_STRUCTURE.md
├── frontend/
│   ├── index.html
│   └── app.js
└── backend/
    ├── package.json
    ├── package-lock.json
    ├── .env
    ├── server.js
    ├── config/
    │   └── database.js
    ├── middleware/
    │   └── auth.js
    ├── routes/
    │   ├── auth.js
    │   └── jobs.js
    ├── utils/
    │   ├── auth.js
    │   └── notifications.js
    ├── database/
    │   └── schema.sql
    └── scripts/
        └── init-db.js
```

## File Descriptions

### Root Directory
- `README.md`: Main documentation for the project
- `SOLUTION_SUMMARY.md`: Detailed summary of the implementation
- `PROJECT_STRUCTURE.md`: This file showing the project organization

### Frontend Directory
- `index.html`: Main HTML file with all UI components
- `app.js`: Client-side JavaScript handling all frontend logic

### Backend Directory
- `package.json`: Node.js project configuration and dependencies
- `.env`: Environment variables for configuration
- `server.js`: Main server file with Express app and Socket.IO setup

### Backend Config
- `config/database.js`: Database connection configuration

### Backend Middleware
- `middleware/auth.js`: Authentication and authorization middleware

### Backend Routes
- `routes/auth.js`: Authentication-related API endpoints
- `routes/jobs.js`: Job and application-related API endpoints

### Backend Utilities
- `utils/auth.js`: Authentication helper functions (JWT, password hashing)
- `utils/notifications.js`: WebSocket notification helpers

### Backend Database
- `database/schema.sql`: SQL schema for creating database tables

### Backend Scripts
- `scripts/init-db.js`: Script to initialize the database schema