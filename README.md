# 🚀 JobMatch - AI-Powered Job Portal

<div align="center">

![JobMatch Banner](https://img.shields.io/badge/JobMatch-AI%20Powered-6366f1?style=for-the-badge&logo=react&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A modern job portal with intelligent resume parsing and skill-based job matching**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API Documentation](#-api-documentation)

</div>

---

## ✨ Features

### 👤 For Candidates
- **📄 Resume Upload & Parsing** - Upload PDF resumes with automatic skill extraction
- **🎯 Smart Job Matching** - AI-powered matching based on your skills
- **💼 Easy Applications** - One-click job applications with cover letters
- **💾 Save Jobs** - Bookmark interesting opportunities for later
- **📊 Match Scores** - See how well you match each job posting

### 👔 For Recruiters
- **📝 Job Posting** - Create detailed job listings with requirements
- **👥 Applicant Management** - View, filter, and manage applications
- **📥 Resume Downloads** - Access candidate resumes directly
- **🏷️ Status Tracking** - Track applications through hiring stages
- **📈 Analytics** - View applicant counts and match scores

### 🌐 General Features
- **🔐 Secure Authentication** - JWT-based auth with role-based access
- **🌍 Multi-Currency Support** - USD, EUR, GBP, INR with proper formatting
- **📱 Responsive Design** - Beautiful UI on all devices
- **🔍 Advanced Search** - Filter by skills, location, job type, and more

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Job Listings
Modern card-based job listings with match scores and quick actions.

### Job Details
Detailed job view with skill matching and one-click apply.

### Recruiter Dashboard
Manage job postings and view applicant analytics.

</details>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | API Calls |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Multer | File Uploads |
| pdf-parse | Resume Parsing |
| bcryptjs | Password Hashing |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Misaa20/Job-Match.git
cd Job-Match
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Environment Setup

Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
PORT=5000
```

### 5. Run the Application

**Development Mode (run both commands in separate terminals):**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves frontend too)
cd ../backend
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
Job-Match/
├── backend/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── skills.js          # Skills list for matching
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # File upload handling
│   ├── models/
│   │   ├── Application.js     # Application schema
│   │   ├── Job.js             # Job schema
│   │   └── User.js            # User schema
│   ├── routes/
│   │   ├── applications.js    # Application endpoints
│   │   ├── auth.js            # Auth endpoints
│   │   ├── jobs.js            # Job endpoints
│   │   ├── matching.js        # Skill matching
│   │   └── resume.js          # Resume upload/download
│   ├── utils/
│   │   └── skillExtractor.js  # PDF parsing & skill extraction
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context (Auth)
│   │   ├── pages/
│   │   │   ├── candidate/     # Candidate pages
│   │   │   └── recruiter/     # Recruiter pages
│   │   ├── utils/
│   │   │   ├── api.js         # Axios instance
│   │   │   └── formatSalary.js # Currency formatting
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔌 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filters) |
| GET | `/api/jobs/:id` | Get job by ID |
| POST | `/api/jobs` | Create job (recruiter) |
| PUT | `/api/jobs/:id` | Update job (recruiter) |
| DELETE | `/api/jobs/:id` | Delete job (recruiter) |
| POST | `/api/jobs/:id/save` | Save/unsave job (candidate) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/:jobId` | Apply for job |
| GET | `/api/applications/my-applications` | Get my applications |
| GET | `/api/applications/job/:jobId` | Get job applicants (recruiter) |
| PUT | `/api/applications/:id/status` | Update application status |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload resume PDF |
| GET | `/api/resume/download/:userId` | Download resume (recruiter) |

### Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matching/jobs` | Get matched jobs for candidate |
| GET | `/api/matching/job/:id` | Get match score for specific job |

---

## 🎯 Skill Matching Algorithm

The platform uses keyword-based skill extraction:

1. **PDF Parsing** - Extracts text from uploaded resumes using `pdf-parse`
2. **Skill Detection** - Matches against 100+ predefined tech skills
3. **Score Calculation** - `(matched skills / required skills) × 100`

### Supported Skills Categories
- Programming Languages (JavaScript, Python, Java, etc.)
- Frontend (React, Vue, Angular, etc.)
- Backend (Node.js, Django, Spring, etc.)
- Databases (MongoDB, PostgreSQL, MySQL, etc.)
- Cloud & DevOps (AWS, Docker, Kubernetes, etc.)
- And many more...

---

## 💰 Currency Formatting

The platform supports proper currency formatting:

| Currency | Full Format | Compact Format |
|----------|-------------|----------------|
| USD | $150,000 | $150K |
| EUR | €150.000 | €150K |
| GBP | £150,000 | £150K |
| INR | ₹15,00,000 | ₹15L |

INR uses the Indian numbering system (Lakhs & Crores).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Era Trivedi**

- GitHub: [@Misaa20](https://github.com/Misaa20)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ using React & Node.js

</div>
