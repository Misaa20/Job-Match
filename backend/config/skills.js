// Predefined skills list for matching
// These are common tech skills that will be used for keyword matching

const TECH_SKILLS = [
  // Programming Languages
  'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go',
  'rust', 'typescript', 'scala', 'perl', 'r', 'matlab', 'dart', 'lua', 'haskell',
  
  // Frontend
  'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
  'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'html5', 'css', 'css3',
  'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui',
  'jquery', 'redux', 'mobx', 'webpack', 'vite', 'parcel', 'babel',
  
  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'nestjs', 'fastify', 'koa',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'ruby on rails',
  'laravel', 'symfony', 'asp.net', '.net', 'dotnet',
  
  // Databases
  'mongodb', 'mongoose', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle',
  'sql server', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firebase',
  'firestore', 'supabase', 'prisma', 'sequelize', 'typeorm',
  
  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
  'netlify', 'digitalocean', 'docker', 'kubernetes', 'k8s', 'jenkins', 'ci/cd',
  'github actions', 'gitlab ci', 'terraform', 'ansible', 'nginx', 'apache',
  
  // Mobile
  'react native', 'flutter', 'ionic', 'xamarin', 'android', 'ios', 'swift ui',
  
  // Tools & Others
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
  'figma', 'sketch', 'photoshop', 'illustrator', 'xd',
  
  // Data & ML
  'machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
  'data science', 'data analysis', 'big data', 'hadoop', 'spark', 'tableau',
  'power bi',
  
  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'puppeteer', 'playwright',
  'junit', 'pytest', 'testing', 'unit testing', 'e2e testing', 'tdd',
  
  // Methodologies & Concepts
  'agile', 'scrum', 'kanban', 'rest', 'restful', 'graphql', 'api', 'microservices',
  'serverless', 'oop', 'functional programming', 'design patterns', 'solid',
  
  // Soft Skills (optional)
  'leadership', 'communication', 'teamwork', 'problem solving', 'project management'
];

// Normalize skill for comparison
const normalizeSkill = (skill) => {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#.]/g, '');
};

// Get all skills as a Set for O(1) lookup
const getSkillsSet = () => {
  return new Set(TECH_SKILLS.map(normalizeSkill));
};

module.exports = {
  TECH_SKILLS,
  normalizeSkill,
  getSkillsSet
};
