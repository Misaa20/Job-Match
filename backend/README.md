# Job Portal Backend

Express.js REST API for the Job Portal with Resume Matching.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

3. Start MongoDB locally or use MongoDB Atlas

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (candidate/recruiter)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/skills` - Update candidate skills

### Jobs
- `GET /api/jobs` - Get all jobs with search, filters, pagination
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter owner)
- `DELETE /api/jobs/:id` - Delete job (recruiter owner)
- `GET /api/jobs/recruiter/my-jobs` - Get recruiter's jobs
- `POST /api/jobs/:id/save` - Save/unsave job (candidate)
- `GET /api/jobs/saved/list` - Get saved jobs (candidate)

### Applications
- `POST /api/applications/:jobId` - Apply for a job (candidate)
- `GET /api/applications/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get applications for a job (recruiter)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status (recruiter)
- `PUT /api/applications/:id/withdraw` - Withdraw application (candidate)

### Resume
- `POST /api/resume/upload` - Upload PDF resume (candidate)
- `GET /api/resume/skills/extract` - Re-extract skills from resume
- `DELETE /api/resume` - Delete resume
- `GET /api/resume/download/:userId` - Download candidate resume (recruiter)

### Matching
- `GET /api/matching/jobs` - Get jobs matched to candidate skills
- `GET /api/matching/job/:jobId` - Get match score for specific job
- `GET /api/matching/candidates/:jobId` - Get matched candidates (recruiter)
- `GET /api/matching/recommendations` - Get job recommendations (candidate)
