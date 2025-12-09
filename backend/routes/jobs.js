const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorizeEmployer, authorizeJobSeeker } = require('../middleware/auth');
const { emitToUser, broadcastToAllJobSeekers } = require('../utils/notifications');

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const [jobs] = await db.execute(`
      SELECT j.*, u.name as employer_name 
      FROM jobs j 
      JOIN users u ON j.employer_id = u.id
      ORDER BY j.created_at DESC
    `);
    
    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a new job (Employer only)
router.post('/', authenticate, authorizeEmployer, async (req, res) => {
  try {
    const { title, description, requirements, location } = req.body;
    const employerId = req.user.id;
    
    // Validate input
    if (!title || !description || !requirements || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Insert new job
    const [result] = await db.execute(
      'INSERT INTO jobs (title, description, requirements, location, employer_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, requirements, location, employerId]
    );
    
    const newJob = {
      id: result.insertId,
      title,
      description,
      requirements,
      location,
      employerId
    };
    
    // Notify all job seekers about the new job
    const [jobSeekers] = await db.execute('SELECT id FROM users WHERE user_type = "job_seeker"');
    const notificationMessage = `New Job Alert: ${title} at Your Company!`;
    
    jobSeekers.forEach(seeker => {
      emitToUser(seeker.id, 'new_job', {
        message: notificationMessage,
        jobId: newJob.id
      });
    });
    
    res.status(201).json({
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for a job (Job Seeker only)
router.post('/:id/apply', authenticate, authorizeJobSeeker, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Check if job exists
    const [jobs] = await db.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const job = jobs[0];
    
    // Check if already applied
    const [applications] = await db.execute(
      'SELECT id FROM applications WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );
    
    if (applications.length > 0) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    // Insert application
    const [result] = await db.execute(
      'INSERT INTO applications (job_id, user_id) VALUES (?, ?)',
      [jobId, userId]
    );
    
    const newApplication = {
      id: result.insertId,
      jobId,
      userId
    };
    
    // Notify employer about the application
    const [user] = await db.execute('SELECT name FROM users WHERE id = ?', [userId]);
    const userName = user[0].name;
    
    const notificationMessage = `${userName} has applied for your job: ${job.title}`;
    
    emitToUser(job.employer_id, 'new_application', {
      message: notificationMessage,
      jobId: jobId,
      applicantId: userId
    });
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject an application (Employer only)
router.post('/:id/reject', authenticate, authorizeEmployer, async (req, res) => {
  try {
    const applicationId = req.params.id;
    
    // Check if application exists and belongs to this employer
    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, u.id as applicant_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ? AND j.employer_id = ?
    `, [applicationId, req.user.id]);
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = applications[0];
    
    // Update application status to rejected
    await db.execute(
      'UPDATE applications SET status = "rejected" WHERE id = ?',
      [applicationId]
    );
    
    // Store rejection in rejections table
    await db.execute(
      'INSERT INTO rejections (application_id, reason) VALUES (?, ?)',
      [applicationId, req.body.reason || 'No reason provided']
    );
    
    // Notify applicant about rejection
    const notificationMessage = `Sorry, your application for ${application.job_title} was rejected.`;
    
    emitToUser(application.applicant_id, 'application_rejected', {
      message: notificationMessage,
      jobId: application.job_id
    });
    
    res.json({
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule an interview (Employer only)
router.post('/:id/schedule-interview', authenticate, authorizeEmployer, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { interviewDate } = req.body;
    
    // Validate input
    if (!interviewDate) {
      return res.status(400).json({ message: 'Interview date is required' });
    }
    
    // Check if application exists and belongs to this employer
    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, u.id as applicant_id
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ? AND j.employer_id = ?
    `, [applicationId, req.user.id]);
    
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = applications[0];
    
    // Update application status to interview_scheduled
    await db.execute(
      'UPDATE applications SET status = "interview_scheduled" WHERE id = ?',
      [applicationId]
    );
    
    // Store interview schedule
    await db.execute(
      'INSERT INTO interviews (application_id, interview_date) VALUES (?, ?)',
      [applicationId, interviewDate]
    );
    
    // Notify applicant about interview schedule
    const notificationMessage = `Your interview for ${application.job_title} is scheduled on ${interviewDate}.`;
    
    emitToUser(application.applicant_id, 'interview_scheduled', {
      message: notificationMessage,
      jobId: application.job_id,
      interviewDate
    });
    
    res.json({
      message: 'Interview scheduled successfully'
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;