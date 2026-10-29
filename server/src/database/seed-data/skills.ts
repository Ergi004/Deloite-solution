import { SkillCategory } from '../../types/enums';

export interface SeedSkill {
  name: string;
  category: SkillCategory;
  roleFamilies: string[];
  description: string;
}

const T = SkillCategory.TECHNICAL;
const TOOL = SkillCategory.TOOL;
const S = SkillCategory.SOFT;
const D = SkillCategory.DOMAIN;
const L = SkillCategory.LANGUAGE;

export const SKILLS: SeedSkill[] = [
  // Engineering - languages & core technical
  {
    name: 'JavaScript',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Core scripting language for web applications.',
  },
  {
    name: 'TypeScript',
    category: T,
    roleFamilies: ['Engineering'],
    description:
      'Typed superset of JavaScript used across the frontend and backend.',
  },
  {
    name: 'React',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Component-based library for building user interfaces.',
  },
  {
    name: 'HTML/CSS',
    category: T,
    roleFamilies: ['Engineering', 'Design'],
    description: 'Markup and styling fundamentals for the web.',
  },
  {
    name: 'Node.js',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'JavaScript runtime used for backend services.',
  },
  {
    name: 'Python',
    category: T,
    roleFamilies: ['Engineering', 'Data'],
    description:
      'General-purpose language used for scripting, data and ML work.',
  },
  {
    name: 'SQL',
    category: T,
    roleFamilies: ['Engineering', 'Data'],
    description: 'Query language for relational databases.',
  },
  {
    name: 'Java',
    category: T,
    roleFamilies: ['Engineering'],
    description:
      'Object-oriented language used for backend and Android development.',
  },
  {
    name: 'Kotlin',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Modern JVM language, the standard for native Android apps.',
  },
  {
    name: 'Dart/Flutter',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Cross-platform mobile UI toolkit and language.',
  },
  {
    name: 'GraphQL',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Query language for APIs, used as an alternative to REST.',
  },
  {
    name: 'REST APIs',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Designing and consuming HTTP-based web service interfaces.',
  },
  {
    name: 'Redux/State management',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Predictable client-side state management patterns.',
  },
  {
    name: 'Unit testing (Jest)',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Writing automated unit tests with the Jest framework.',
  },
  {
    name: 'System design basics',
    category: T,
    roleFamilies: ['Engineering'],
    description:
      'Reasoning about scalability, reliability and trade-offs in software systems.',
  },
  {
    name: 'Database design',
    category: T,
    roleFamilies: ['Engineering', 'Data'],
    description: 'Modeling relational schemas, normalization and indexing.',
  },
  {
    name: 'NoSQL basics',
    category: T,
    roleFamilies: ['Engineering', 'Data'],
    description: 'Document and key-value database fundamentals.',
  },
  {
    name: 'API design',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Designing clear, consistent, versioned service interfaces.',
  },
  {
    name: 'Shell scripting',
    category: TOOL,
    roleFamilies: ['Engineering'],
    description: 'Automating tasks with bash/shell scripts.',
  },

  // Engineering - tools / infra
  {
    name: 'Git',
    category: TOOL,
    roleFamilies: ['Engineering', 'Data', 'Design'],
    description:
      'Version control for tracking and collaborating on code changes.',
  },
  {
    name: 'Docker',
    category: TOOL,
    roleFamilies: ['Engineering'],
    description: 'Containerizing applications for consistent environments.',
  },
  {
    name: 'CI/CD',
    category: TOOL,
    roleFamilies: ['Engineering'],
    description: 'Automated build, test and deployment pipelines.',
  },
  {
    name: 'Linux',
    category: TOOL,
    roleFamilies: ['Engineering', 'Security'],
    description: 'Operating system fundamentals used on most servers.',
  },
  {
    name: 'AWS fundamentals',
    category: TOOL,
    roleFamilies: ['Engineering'],
    description: 'Core cloud services: compute, storage, networking on AWS.',
  },
  {
    name: 'Kubernetes basics',
    category: TOOL,
    roleFamilies: ['Engineering'],
    description: 'Orchestrating containerized workloads at scale.',
  },
  {
    name: 'Cloud cost awareness',
    category: D,
    roleFamilies: ['Engineering'],
    description: 'Understanding how infrastructure choices affect cost.',
  },
  {
    name: 'Testing/QA',
    category: T,
    roleFamilies: ['Engineering'],
    description:
      'Manual and exploratory testing practices for software quality.',
  },
  {
    name: 'Test automation',
    category: T,
    roleFamilies: ['Engineering'],
    description: 'Writing automated test suites and frameworks.',
  },

  // Data
  {
    name: 'Data analysis',
    category: T,
    roleFamilies: ['Data'],
    description:
      'Exploring and interpreting data to answer business questions.',
  },
  {
    name: 'Statistics',
    category: T,
    roleFamilies: ['Data'],
    description: 'Probability and statistical reasoning for data work.',
  },
  {
    name: 'Power BI/Tableau',
    category: TOOL,
    roleFamilies: ['Data', 'Product'],
    description: 'Building dashboards and visualizations for stakeholders.',
  },
  {
    name: 'ETL',
    category: T,
    roleFamilies: ['Data'],
    description: 'Extracting, transforming and loading data between systems.',
  },
  {
    name: 'Machine learning basics',
    category: T,
    roleFamilies: ['Data'],
    description: 'Fundamentals of supervised/unsupervised learning models.',
  },
  {
    name: 'Data visualization',
    category: T,
    roleFamilies: ['Data', 'Product'],
    description: 'Communicating data clearly through charts and visuals.',
  },
  {
    name: 'A/B testing',
    category: D,
    roleFamilies: ['Data', 'Product', 'Marketing'],
    description: 'Designing and interpreting controlled experiments.',
  },
  {
    name: 'Experiment design',
    category: D,
    roleFamilies: ['Data', 'Product'],
    description: 'Setting up rigorous tests to validate hypotheses.',
  },

  // Security
  {
    name: 'Cybersecurity fundamentals',
    category: T,
    roleFamilies: ['Security', 'Engineering'],
    description: 'Core principles of protecting systems and data.',
  },
  {
    name: 'Network basics',
    category: T,
    roleFamilies: ['Security', 'Engineering'],
    description: 'How networks, protocols and traffic flow work.',
  },
  {
    name: 'Risk management',
    category: D,
    roleFamilies: ['Security', 'Operations', 'Finance'],
    description: 'Identifying, assessing and mitigating operational risk.',
  },

  // Design
  {
    name: 'UX research',
    category: T,
    roleFamilies: ['Design', 'Product'],
    description: 'Gathering and synthesizing user insights to inform design.',
  },
  {
    name: 'UI design',
    category: T,
    roleFamilies: ['Design'],
    description: 'Crafting visual interfaces that are usable and consistent.',
  },
  {
    name: 'Figma',
    category: TOOL,
    roleFamilies: ['Design', 'Product'],
    description: 'Collaborative interface design and prototyping tool.',
  },
  {
    name: 'Accessibility',
    category: D,
    roleFamilies: ['Design', 'Engineering'],
    description: 'Designing and building for users with diverse abilities.',
  },
  {
    name: 'Mobile UI patterns',
    category: D,
    roleFamilies: ['Design', 'Engineering'],
    description: 'Conventions for usable mobile interfaces.',
  },

  // Product
  {
    name: 'Product discovery',
    category: D,
    roleFamilies: ['Product'],
    description:
      'Techniques for validating problems and solutions before building.',
  },
  {
    name: 'Agile/Scrum',
    category: D,
    roleFamilies: ['Product', 'Engineering', 'Operations'],
    description: 'Iterative delivery frameworks and ceremonies.',
  },
  {
    name: 'Prioritization',
    category: S,
    roleFamilies: ['Product', 'Operations'],
    description: 'Deciding what matters most with limited time and resources.',
  },

  // Marketing
  {
    name: 'SEO',
    category: D,
    roleFamilies: ['Marketing'],
    description: 'Optimizing content and sites to rank in search results.',
  },
  {
    name: 'Content writing',
    category: T,
    roleFamilies: ['Marketing'],
    description: 'Writing clear, engaging content for different audiences.',
  },
  {
    name: 'Copywriting',
    category: T,
    roleFamilies: ['Marketing'],
    description: 'Persuasive writing for ads, landing pages and campaigns.',
  },
  {
    name: 'Brand storytelling',
    category: D,
    roleFamilies: ['Marketing'],
    description: 'Shaping a consistent brand narrative across channels.',
  },
  {
    name: 'Google Ads',
    category: TOOL,
    roleFamilies: ['Marketing'],
    description: 'Running and optimizing paid search campaigns.',
  },
  {
    name: 'Social media marketing',
    category: D,
    roleFamilies: ['Marketing'],
    description: 'Planning and running organic social media presence.',
  },
  {
    name: 'Paid social advertising',
    category: TOOL,
    roleFamilies: ['Marketing'],
    description: 'Running paid campaigns on social platforms.',
  },
  {
    name: 'Email marketing',
    category: TOOL,
    roleFamilies: ['Marketing'],
    description: 'Planning and sending lifecycle and campaign emails.',
  },
  {
    name: 'Marketing automation',
    category: TOOL,
    roleFamilies: ['Marketing'],
    description: 'Using tools to automate lifecycle marketing workflows.',
  },
  {
    name: 'Analytics (GA4)',
    category: TOOL,
    roleFamilies: ['Marketing', 'Product'],
    description: 'Measuring web and campaign performance with GA4.',
  },
  {
    name: 'Influencer marketing',
    category: D,
    roleFamilies: ['Marketing'],
    description: 'Partnering with creators to reach audiences.',
  },

  // Finance
  {
    name: 'Financial modelling',
    category: T,
    roleFamilies: ['Finance'],
    description:
      'Building spreadsheet models to forecast and evaluate decisions.',
  },
  {
    name: 'Excel advanced',
    category: TOOL,
    roleFamilies: ['Finance', 'Operations'],
    description: 'Advanced formulas, pivot tables and data modeling in Excel.',
  },
  {
    name: 'Accounting principles',
    category: D,
    roleFamilies: ['Finance'],
    description: 'Core bookkeeping and accounting standards.',
  },
  {
    name: 'Budgeting',
    category: D,
    roleFamilies: ['Finance', 'Operations'],
    description: 'Planning and tracking spend against financial plans.',
  },
  {
    name: 'Bookkeeping',
    category: D,
    roleFamilies: ['Finance'],
    description: 'Recording day-to-day financial transactions accurately.',
  },
  {
    name: 'Tax fundamentals',
    category: D,
    roleFamilies: ['Finance'],
    description: 'Basics of corporate and payroll tax obligations.',
  },
  {
    name: 'Audit fundamentals',
    category: D,
    roleFamilies: ['Finance'],
    description: 'Principles of verifying financial records and controls.',
  },
  {
    name: 'Payroll basics',
    category: D,
    roleFamilies: ['Finance', 'HR'],
    description: 'Processing employee pay, deductions and compliance.',
  },

  // HR
  {
    name: 'Recruiting fundamentals',
    category: D,
    roleFamilies: ['HR'],
    description: 'Sourcing, screening and progressing candidates.',
  },
  {
    name: 'Interviewing',
    category: S,
    roleFamilies: ['HR'],
    description: 'Structured techniques for evaluating candidates fairly.',
  },
  {
    name: 'HR analytics',
    category: T,
    roleFamilies: ['HR'],
    description: 'Using people data to inform HR decisions.',
  },
  {
    name: 'Applicant tracking systems',
    category: TOOL,
    roleFamilies: ['HR'],
    description: 'Managing hiring pipelines in an ATS.',
  },
  {
    name: 'Employer branding',
    category: D,
    roleFamilies: ['HR', 'Marketing'],
    description: 'Positioning the company as an attractive place to work.',
  },
  {
    name: 'Onboarding design',
    category: D,
    roleFamilies: ['HR'],
    description: "Designing a new hire's first weeks for a strong start.",
  },

  // Sales / Customer Success
  {
    name: 'CRM tools',
    category: TOOL,
    roleFamilies: ['Sales', 'Customer Success'],
    description: 'Managing pipeline and customer data in a CRM.',
  },
  {
    name: 'Sales prospecting',
    category: D,
    roleFamilies: ['Sales'],
    description: 'Identifying and reaching out to potential customers.',
  },
  {
    name: 'Cold calling',
    category: S,
    roleFamilies: ['Sales'],
    description: 'Opening conversations with prospects by phone.',
  },
  {
    name: 'Objection handling',
    category: S,
    roleFamilies: ['Sales'],
    description: 'Responding constructively to customer concerns.',
  },
  {
    name: 'Pipeline management',
    category: D,
    roleFamilies: ['Sales'],
    description: 'Tracking and progressing deals through sales stages.',
  },
  {
    name: 'Customer onboarding',
    category: D,
    roleFamilies: ['Customer Success'],
    description: 'Guiding new customers to initial value.',
  },
  {
    name: 'Negotiation',
    category: S,
    roleFamilies: ['Sales', 'Customer Success', 'Operations'],
    description: 'Reaching mutually beneficial agreements.',
  },

  // Operations
  {
    name: 'Project coordination',
    category: D,
    roleFamilies: ['Operations', 'Product'],
    description: 'Tracking tasks, timelines and dependencies across a team.',
  },
  {
    name: 'Process improvement',
    category: D,
    roleFamilies: ['Operations'],
    description: 'Identifying and removing inefficiencies in workflows.',
  },
  {
    name: 'Vendor management',
    category: D,
    roleFamilies: ['Operations'],
    description: 'Managing supplier relationships and contracts.',
  },
  {
    name: 'Supply chain basics',
    category: D,
    roleFamilies: ['Operations'],
    description: 'Fundamentals of how goods and services flow to customers.',
  },

  // Cross-functional
  {
    name: 'Technical writing',
    category: T,
    roleFamilies: ['Engineering', 'Product'],
    description:
      'Writing clear documentation for technical and non-technical readers.',
  },
  {
    name: 'Public speaking',
    category: S,
    roleFamilies: ['Other'],
    description: 'Presenting ideas clearly and confidently to a group.',
  },
  {
    name: 'Facilitation',
    category: S,
    roleFamilies: ['Other'],
    description: 'Running productive meetings and workshops.',
  },

  // Languages
  {
    name: 'English (CEFR)',
    category: L,
    roleFamilies: ['Other'],
    description: 'English proficiency measured on the CEFR scale.',
  },
  {
    name: 'Albanian (CEFR)',
    category: L,
    roleFamilies: ['Other'],
    description: 'Albanian proficiency measured on the CEFR scale.',
  },

  // Soft skills
  {
    name: 'Communication',
    category: S,
    roleFamilies: ['Other'],
    description: 'Expressing ideas clearly and listening effectively.',
  },
  {
    name: 'Teamwork',
    category: S,
    roleFamilies: ['Other'],
    description: 'Collaborating well with others toward a shared goal.',
  },
  {
    name: 'Leadership',
    category: S,
    roleFamilies: ['Other'],
    description: 'Guiding and motivating others toward outcomes.',
  },
  {
    name: 'Problem solving',
    category: S,
    roleFamilies: ['Other'],
    description: 'Breaking down and resolving complex issues.',
  },
  {
    name: 'Time management',
    category: S,
    roleFamilies: ['Other'],
    description: 'Prioritizing and organizing work to meet deadlines.',
  },
  {
    name: 'Adaptability',
    category: S,
    roleFamilies: ['Other'],
    description: 'Adjusting well to change and ambiguity.',
  },
  {
    name: 'Creativity',
    category: S,
    roleFamilies: ['Other'],
    description: 'Generating novel and useful ideas.',
  },
  {
    name: 'Critical thinking',
    category: S,
    roleFamilies: ['Other'],
    description: 'Evaluating information and arguments rigorously.',
  },
  {
    name: 'Ownership',
    category: S,
    roleFamilies: ['Other'],
    description: 'Taking responsibility for outcomes without being asked.',
  },
  {
    name: 'Stakeholder management',
    category: S,
    roleFamilies: ['Other'],
    description:
      'Aligning and communicating with people who have a stake in the work.',
  },
  {
    name: 'Conflict resolution',
    category: S,
    roleFamilies: ['Other'],
    description: 'Resolving disagreements constructively.',
  },
  {
    name: 'Cross-functional collaboration',
    category: S,
    roleFamilies: ['Other'],
    description: 'Working effectively across teams and disciplines.',
  },
];
