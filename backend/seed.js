const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');

const MONGODB_URI = process.env.MONGODB_URI;

// Sample Recruiters
const recruiters = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    password: 'password123',
    role: 'recruiter',
    company: 'TechCorp Solutions',
    companyWebsite: 'https://techcorp.com'
  },
  {
    name: 'Michael Chen',
    email: 'michael@innovate.io',
    password: 'password123',
    role: 'recruiter',
    company: 'Innovate.io',
    companyWebsite: 'https://innovate.io'
  },
  {
    name: 'Priya Sharma',
    email: 'priya@startupindia.com',
    password: 'password123',
    role: 'recruiter',
    company: 'StartupIndia Tech',
    companyWebsite: 'https://startupindia.com'
  },
  {
    name: 'David Williams',
    email: 'david@globalsoft.com',
    password: 'password123',
    role: 'recruiter',
    company: 'GlobalSoft Inc',
    companyWebsite: 'https://globalsoft.com'
  }
];

// Sample Jobs
const getJobs = (recruiterIds) => [
  {
    title: 'Senior React Developer',
    description: `We are looking for an experienced React Developer to join our frontend team. You will be responsible for building and maintaining high-quality web applications using React.js and related technologies.

Key Responsibilities:
• Develop new user-facing features using React.js
• Build reusable components and front-end libraries
• Optimize components for maximum performance
• Collaborate with backend developers and designers
• Write clean, maintainable, and well-documented code`,
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    salary: { min: 120000, max: 160000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'senior',
    skills: ['react', 'javascript', 'typescript', 'redux', 'html', 'css', 'git'],
    requirements: [
      '5+ years of experience with React.js',
      'Strong proficiency in JavaScript and TypeScript',
      'Experience with state management (Redux, MobX)',
      'Familiarity with RESTful APIs and GraphQL',
      'Bachelor\'s degree in Computer Science or related field'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work hours',
      '401(k) matching',
      'Professional development budget'
    ],
    recruiter: recruiterIds[0],
    status: 'open'
  },
  {
    title: 'Full Stack JavaScript Developer',
    description: `Join our dynamic team as a Full Stack Developer working with modern JavaScript technologies. You'll work on exciting projects using Node.js, React, and MongoDB.

What you'll do:
• Design and implement full-stack web applications
• Work with both frontend and backend technologies
• Participate in code reviews and technical discussions
• Mentor junior developers
• Contribute to architectural decisions`,
    company: 'Innovate.io',
    location: 'New York, NY',
    locationType: 'remote',
    salary: { min: 100000, max: 140000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['javascript', 'nodejs', 'react', 'mongodb', 'express', 'html', 'css', 'git'],
    requirements: [
      '3+ years of full-stack development experience',
      'Proficiency in Node.js and React',
      'Experience with MongoDB or similar NoSQL databases',
      'Understanding of CI/CD pipelines',
      'Excellent problem-solving skills'
    ],
    benefits: [
      '100% remote work',
      'Unlimited PTO',
      'Home office stipend',
      'Health insurance',
      'Annual learning budget'
    ],
    recruiter: recruiterIds[1],
    status: 'open'
  },
  {
    title: 'Python Backend Engineer',
    description: `We're seeking a talented Python Backend Engineer to help build scalable microservices and APIs. You'll work with cutting-edge technologies and contribute to our growing platform.

Responsibilities:
• Design and develop RESTful APIs using Python/Django
• Build and maintain microservices architecture
• Optimize application performance and scalability
• Write unit tests and integration tests
• Collaborate with cross-functional teams`,
    company: 'StartupIndia Tech',
    location: 'Bangalore, India',
    locationType: 'onsite',
    salary: { min: 1500000, max: 2500000, currency: 'INR' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['python', 'django', 'flask', 'postgresql', 'redis', 'docker', 'aws', 'git'],
    requirements: [
      '3+ years of Python development experience',
      'Strong knowledge of Django or Flask',
      'Experience with PostgreSQL and Redis',
      'Familiarity with Docker and AWS',
      'Good understanding of software design patterns'
    ],
    benefits: [
      'Competitive salary',
      'Stock options',
      'Health insurance for family',
      'Free meals',
      'Gym membership'
    ],
    recruiter: recruiterIds[2],
    status: 'open'
  },
  {
    title: 'DevOps Engineer',
    description: `Looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You'll be responsible for CI/CD pipelines, monitoring, and ensuring high availability of our services.

Key Responsibilities:
• Manage and optimize AWS/GCP infrastructure
• Implement and maintain CI/CD pipelines
• Set up monitoring and alerting systems
• Automate deployment processes
• Ensure security best practices`,
    company: 'GlobalSoft Inc',
    location: 'London, UK',
    locationType: 'hybrid',
    salary: { min: 70000, max: 95000, currency: 'GBP' },
    jobType: 'full-time',
    experienceLevel: 'senior',
    skills: ['aws', 'docker', 'kubernetes', 'jenkins', 'terraform', 'python', 'linux', 'git'],
    requirements: [
      '5+ years of DevOps experience',
      'Strong knowledge of AWS or GCP',
      'Experience with Docker and Kubernetes',
      'Proficiency in Infrastructure as Code (Terraform)',
      'Experience with CI/CD tools (Jenkins, GitLab CI)'
    ],
    benefits: [
      'Competitive salary',
      'Private healthcare',
      'Pension scheme',
      'Flexible working',
      '25 days holiday'
    ],
    recruiter: recruiterIds[3],
    status: 'open'
  },
  {
    title: 'Junior Frontend Developer',
    description: `Great opportunity for a Junior Frontend Developer to kickstart their career! You'll learn from experienced developers while working on real projects.

What we offer:
• Mentorship from senior developers
• Hands-on experience with modern technologies
• Supportive learning environment
• Career growth opportunities`,
    company: 'TechCorp Solutions',
    location: 'Austin, TX',
    locationType: 'onsite',
    salary: { min: 60000, max: 80000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'entry',
    skills: ['html', 'css', 'javascript', 'react', 'git'],
    requirements: [
      '0-2 years of experience',
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with React is a plus',
      'Eagerness to learn and grow',
      'Good communication skills'
    ],
    benefits: [
      'Competitive starting salary',
      'Health insurance',
      'Mentorship program',
      'Training and certifications',
      'Fun team environment'
    ],
    recruiter: recruiterIds[0],
    status: 'open'
  },
  {
    title: 'Machine Learning Engineer',
    description: `Join our AI team to build cutting-edge machine learning models. You'll work on challenging problems in NLP, computer vision, and recommendation systems.

Responsibilities:
• Develop and deploy ML models at scale
• Work with large datasets and build data pipelines
• Collaborate with product teams to integrate AI features
• Stay current with latest ML research
• Optimize model performance and efficiency`,
    company: 'Innovate.io',
    location: 'Seattle, WA',
    locationType: 'hybrid',
    salary: { min: 150000, max: 200000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'senior',
    skills: ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'pandas', 'numpy', 'aws'],
    requirements: [
      'MS/PhD in Computer Science or related field',
      '4+ years of ML engineering experience',
      'Strong Python programming skills',
      'Experience with TensorFlow or PyTorch',
      'Published research is a plus'
    ],
    benefits: [
      'Top-tier compensation',
      'Equity package',
      'Research publication support',
      'Conference attendance budget',
      'Flexible work arrangement'
    ],
    recruiter: recruiterIds[1],
    status: 'open'
  },
  {
    title: 'React Native Mobile Developer',
    description: `Build beautiful cross-platform mobile apps using React Native. You'll work on our flagship mobile application used by millions of users.

What you'll do:
• Develop and maintain React Native mobile apps
• Implement pixel-perfect UI designs
• Integrate with backend APIs
• Optimize app performance
• Publish apps to App Store and Play Store`,
    company: 'StartupIndia Tech',
    location: 'Mumbai, India',
    locationType: 'hybrid',
    salary: { min: 1200000, max: 2000000, currency: 'INR' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['react native', 'javascript', 'typescript', 'react', 'ios', 'android', 'git'],
    requirements: [
      '2+ years of React Native experience',
      'Published apps on App Store/Play Store',
      'Strong JavaScript/TypeScript skills',
      'Understanding of mobile app lifecycle',
      'Experience with native modules is a plus'
    ],
    benefits: [
      'Competitive salary',
      'Remote work options',
      'Latest MacBook Pro',
      'Health insurance',
      'Learning budget'
    ],
    recruiter: recruiterIds[2],
    status: 'open'
  },
  {
    title: 'Data Engineer',
    description: `We're looking for a Data Engineer to build robust data pipelines and infrastructure. You'll work with big data technologies to enable data-driven decision making.

Responsibilities:
• Design and build scalable data pipelines
• Manage data warehouse and data lake solutions
• Optimize ETL processes for performance
• Ensure data quality and integrity
• Collaborate with data scientists and analysts`,
    company: 'GlobalSoft Inc',
    location: 'Berlin, Germany',
    locationType: 'remote',
    salary: { min: 65000, max: 90000, currency: 'EUR' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['python', 'sql', 'spark', 'hadoop', 'aws', 'postgresql', 'kafka', 'airflow'],
    requirements: [
      '3+ years of data engineering experience',
      'Strong SQL and Python skills',
      'Experience with Apache Spark',
      'Knowledge of data warehouse concepts',
      'Experience with cloud platforms (AWS/GCP)'
    ],
    benefits: [
      'Competitive EU salary',
      'Full remote work',
      'Work from anywhere policy',
      'Equipment budget',
      '30 days vacation'
    ],
    recruiter: recruiterIds[3],
    status: 'open'
  },
  {
    title: 'UI/UX Designer (with Frontend Skills)',
    description: `Looking for a creative UI/UX Designer who can also code! You'll design beautiful interfaces and bring them to life with HTML/CSS.

What you'll do:
• Create user-centered designs
• Build interactive prototypes
• Implement designs using HTML/CSS
• Conduct user research
• Collaborate with developers`,
    company: 'TechCorp Solutions',
    location: 'Los Angeles, CA',
    locationType: 'hybrid',
    salary: { min: 90000, max: 130000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['figma', 'html', 'css', 'javascript', 'react', 'tailwind'],
    requirements: [
      '3+ years of UI/UX design experience',
      'Strong portfolio showcasing web/mobile designs',
      'Proficiency in Figma or Sketch',
      'Basic frontend development skills',
      'Understanding of design systems'
    ],
    benefits: [
      'Creative freedom',
      'Design tool subscriptions',
      'Health benefits',
      'Flexible schedule',
      'Design conference budget'
    ],
    recruiter: recruiterIds[0],
    status: 'open'
  },
  {
    title: 'Backend Engineer - Node.js',
    description: `Join our backend team to build scalable APIs and services using Node.js. You'll work on high-traffic systems serving millions of requests.

Key Responsibilities:
• Design and develop RESTful APIs
• Build microservices using Node.js
• Optimize database queries and performance
• Implement caching strategies
• Write comprehensive tests`,
    company: 'Innovate.io',
    location: 'Remote',
    locationType: 'remote',
    salary: { min: 110000, max: 150000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'senior',
    skills: ['nodejs', 'express', 'typescript', 'mongodb', 'postgresql', 'redis', 'docker', 'aws'],
    requirements: [
      '5+ years of backend development experience',
      'Expert-level Node.js knowledge',
      'Experience with both SQL and NoSQL databases',
      'Understanding of microservices architecture',
      'Experience with message queues (RabbitMQ, Kafka)'
    ],
    benefits: [
      'Fully remote position',
      'Competitive salary',
      'Stock options',
      'Unlimited PTO',
      'Home office budget'
    ],
    recruiter: recruiterIds[1],
    status: 'open'
  },
  {
    title: 'QA Automation Engineer',
    description: `We need a QA Automation Engineer to ensure the quality of our products. You'll build and maintain automated test suites and improve our testing processes.

Responsibilities:
• Develop automated test scripts
• Set up CI/CD test automation
• Perform manual testing when needed
• Report and track bugs
• Improve testing processes`,
    company: 'StartupIndia Tech',
    location: 'Hyderabad, India',
    locationType: 'onsite',
    salary: { min: 1000000, max: 1800000, currency: 'INR' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['selenium', 'cypress', 'javascript', 'python', 'jest', 'testing', 'git'],
    requirements: [
      '3+ years of QA automation experience',
      'Experience with Selenium or Cypress',
      'Programming skills in Python or JavaScript',
      'Knowledge of testing methodologies',
      'Experience with CI/CD pipelines'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Performance bonuses',
      'Career growth',
      'Training programs'
    ],
    recruiter: recruiterIds[2],
    status: 'open'
  },
  {
    title: 'Cloud Architect',
    description: `Senior Cloud Architect position to design and implement enterprise cloud solutions. You'll lead cloud migration projects and establish best practices.

What you'll do:
• Design cloud architecture for enterprise clients
• Lead cloud migration projects
• Establish cloud governance and security
• Optimize cloud costs
• Mentor team members`,
    company: 'GlobalSoft Inc',
    location: 'Singapore',
    locationType: 'hybrid',
    salary: { min: 120000, max: 180000, currency: 'SGD' },
    jobType: 'full-time',
    experienceLevel: 'lead',
    skills: ['aws', 'azure', 'gcp', 'terraform', 'kubernetes', 'docker', 'python', 'linux'],
    requirements: [
      '8+ years of IT experience',
      '5+ years of cloud architecture experience',
      'AWS/Azure/GCP certifications',
      'Experience with multi-cloud environments',
      'Strong leadership skills'
    ],
    benefits: [
      'Executive compensation',
      'Leadership role',
      'Certification sponsorship',
      'Travel opportunities',
      'Comprehensive benefits'
    ],
    recruiter: recruiterIds[3],
    status: 'open'
  },
  {
    title: 'Frontend Intern',
    description: `3-month internship program for aspiring frontend developers. Learn from industry experts and gain real-world experience.

What you'll learn:
• Modern frontend technologies
• Professional development practices
• Team collaboration
• Code review process
• Agile methodology`,
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    locationType: 'onsite',
    salary: { min: 25, max: 35, currency: 'USD' },
    jobType: 'internship',
    experienceLevel: 'entry',
    skills: ['html', 'css', 'javascript', 'git'],
    requirements: [
      'Currently pursuing CS degree',
      'Basic knowledge of HTML/CSS/JavaScript',
      'Passion for frontend development',
      'Available for 3 months',
      'Strong willingness to learn'
    ],
    benefits: [
      'Paid internship',
      'Mentorship',
      'Potential full-time offer',
      'Free lunch',
      'Networking opportunities'
    ],
    recruiter: recruiterIds[0],
    status: 'open'
  },
  {
    title: 'Blockchain Developer',
    description: `Join our Web3 team to build decentralized applications. You'll work with Ethereum, smart contracts, and cutting-edge blockchain technology.

Responsibilities:
• Develop smart contracts using Solidity
• Build dApps with Web3.js
• Audit smart contract security
• Integrate blockchain with web applications
• Stay updated with Web3 trends`,
    company: 'Innovate.io',
    location: 'Miami, FL',
    locationType: 'remote',
    salary: { min: 130000, max: 180000, currency: 'USD' },
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: ['javascript', 'typescript', 'react', 'nodejs', 'python', 'git'],
    requirements: [
      '2+ years of blockchain development',
      'Experience with Solidity and smart contracts',
      'Knowledge of Ethereum and other chains',
      'Frontend skills (React)',
      'Understanding of DeFi concepts'
    ],
    benefits: [
      'Crypto-friendly salary options',
      'Remote work',
      'Token allocation',
      'Conference sponsorship',
      'Flexible hours'
    ],
    recruiter: recruiterIds[1],
    status: 'open'
  },
  {
    title: 'Technical Project Manager',
    description: `Lead technical projects and coordinate between engineering teams. You'll ensure successful delivery of complex software projects.

Key Responsibilities:
• Manage project timelines and deliverables
• Coordinate between teams
• Remove blockers for developers
• Report progress to stakeholders
• Implement agile practices`,
    company: 'GlobalSoft Inc',
    location: 'Toronto, Canada',
    locationType: 'hybrid',
    salary: { min: 100000, max: 140000, currency: 'CAD' },
    jobType: 'full-time',
    experienceLevel: 'senior',
    skills: ['agile', 'scrum', 'jira', 'project management', 'leadership'],
    requirements: [
      '5+ years of project management experience',
      'Technical background (software development)',
      'PMP or Scrum Master certification',
      'Experience with Jira and Confluence',
      'Excellent communication skills'
    ],
    benefits: [
      'Competitive salary',
      'Leadership position',
      'Work-life balance',
      'Health benefits',
      'Professional development'
    ],
    recruiter: recruiterIds[3],
    status: 'open'
  }
];

// Sample Candidates
const candidates = [
  {
    name: 'Alex Thompson',
    email: 'alex@example.com',
    password: 'password123',
    role: 'candidate',
    skills: ['javascript', 'react', 'nodejs', 'mongodb', 'html', 'css', 'git'],
    experience: 3,
    location: 'New York, NY',
    bio: 'Full-stack developer passionate about building great user experiences.'
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    password: 'password123',
    role: 'candidate',
    skills: ['python', 'django', 'postgresql', 'docker', 'aws', 'machine learning'],
    experience: 5,
    location: 'San Francisco, CA',
    bio: 'Backend engineer with experience in AI/ML and cloud technologies.'
  },
  {
    name: 'Rahul Patel',
    email: 'rahul@example.com',
    password: 'password123',
    role: 'candidate',
    skills: ['react', 'react native', 'javascript', 'typescript', 'redux', 'git'],
    experience: 2,
    location: 'Bangalore, India',
    bio: 'Mobile developer specializing in React Native applications.'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});

    // Create recruiters
    console.log('Creating recruiters...');
    const createdRecruiters = [];
    for (const recruiter of recruiters) {
      const hashedPassword = await bcrypt.hash(recruiter.password, 10);
      const user = await User.create({
        ...recruiter,
        password: hashedPassword
      });
      createdRecruiters.push(user);
      console.log(`  Created recruiter: ${recruiter.name} (${recruiter.email})`);
    }

    // Create jobs
    console.log('Creating jobs...');
    const recruiterIds = createdRecruiters.map(r => r._id);
    const jobs = getJobs(recruiterIds);
    for (const job of jobs) {
      await Job.create(job);
      console.log(`  Created job: ${job.title} at ${job.company}`);
    }

    // Create candidates
    console.log('Creating sample candidates...');
    for (const candidate of candidates) {
      const hashedPassword = await bcrypt.hash(candidate.password, 10);
      await User.create({
        ...candidate,
        password: hashedPassword
      });
      console.log(`  Created candidate: ${candidate.name} (${candidate.email})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdRecruiters.length} recruiters created`);
    console.log(`   - ${jobs.length} jobs created`);
    console.log(`   - ${candidates.length} sample candidates created`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('   Recruiters (password: password123):');
    recruiters.forEach(r => console.log(`     - ${r.email}`));
    console.log('   Candidates (password: password123):');
    candidates.forEach(c => console.log(`     - ${c.email}`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
