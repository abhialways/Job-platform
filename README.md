# Job Portal Application

This is a full-stack job portal application with real-time notifications, built with modern web technologies.

## Features

- User authentication with JWT
- Job posting for employers
- Job application for job seekers
- Application rejection system
- Interview scheduling
- Real-time notifications using WebSocket

## Tech Stack

### Frontend
- HTML5
- Vanilla JavaScript
- Alpine.js for DOM manipulation
- Tailwind CSS with Preline UI components
- Pristine.js for form validation
- Socket.IO client for real-time notifications

### Backend
- Node.js with Express.js
- MySQL for data storage
- Socket.IO for real-time communication
- JWT for authentication

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a MySQL database named `job_portal`
   - Update the `.env` file with your database credentials
   - Run the database initialization script:
     ```
     npm run init-db
     ```

4. Start the server:
   ```
   npm start
   ```
   or for development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

The frontend is a static website that can be served by any web server. For development:

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Serve the files using any static server, for example:
   ```
   npx serve
   ```
   or
   ```
   python -m http.server 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Post a new job (Employer only)
- `POST /api/jobs/:id/apply` - Apply for a job (Job Seeker only)

### Applications
- `POST /api/applications/:id/reject` - Reject an application (Employer only)
- `POST /api/applications/:id/schedule-interview` - Schedule an interview (Employer only)

## Database Schema

The application uses MySQL with the following tables:
- `users` - Stores user information
- `jobs` - Stores job postings
- `applications` - Stores job applications
- `rejections` - Stores application rejections
- `interviews` - Stores interview schedules

## Real-time Notifications

The application uses Socket.IO for real-time notifications:
- New job postings are broadcast to all job seekers
- New applications are sent to the job owner
- Application rejections are sent to the applicant
- Interview schedules are sent to the selected applicant

## License

This project is for educational purposes only.