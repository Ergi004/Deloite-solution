export const DEGREE_LEVELS = ['Bachelor', 'Master', 'Other'];
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'];
export const INTEREST_OPTIONS = [
  'Technology',
  'Data',
  'Design',
  'People',
  'Writing',
  'Numbers',
  'Strategy',
  'Customers',
  'Operations',
  'Research',
  'Leadership',
  'Creativity',
];
export const DAY_TO_DAY_OPTIONS = [
  'Building things',
  'Analysing data',
  'Designing',
  'Talking to people',
  'Organising',
  'Writing',
  'Solving puzzles',
  'Teaching',
];
export const ROLE_FAMILY_OPTIONS = [
  'Engineering',
  'Data',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Operations',
  'Customer Success',
  'Security',
  'Other',
];
export const TRACK_PREFERENCE_OPTIONS = [
  { value: 'INDIVIDUAL_CONTRIBUTOR', label: 'Individual contributor' },
  { value: 'PEOPLE_LEADERSHIP', label: 'People leadership' },
  { value: 'UNSURE', label: 'Not sure yet' },
];
export const TARGET_LEVEL_OPTIONS = ['Junior to Mid', 'Mid', 'Senior', 'Lead'];
export const EXPECTATION_OPTIONS = [
  'Mentorship',
  'Remote flexibility',
  'Salary growth',
  'International exposure',
  'Certifications paid',
  'Leadership training',
];

export const SITUATIONAL_QUESTIONS = [
  {
    key: 'conflictAnswer' as const,
    prompt: 'A teammate disagrees with your approach in front of the team. You:',
    options: [
      { value: 'A', label: 'Insist on your approach since you prepared it' },
      { value: 'B', label: 'Ask to hear their reasoning, then find common ground' },
      { value: 'C', label: 'Stay quiet to avoid conflict in the moment' },
      { value: 'D', label: 'Suggest discussing it privately after the meeting' },
    ],
  },
  {
    key: 'deadlineAnswer' as const,
    prompt: 'You realise a deadline is at risk two days before it is due. You:',
    options: [
      { value: 'A', label: 'Work extra hours quietly to try to finish in time' },
      { value: 'B', label: 'Flag it to your manager immediately with a revised plan' },
      { value: 'C', label: 'Wait to see if it resolves itself' },
      { value: 'D', label: 'Cut corners on quality to hit the date' },
    ],
  },
  {
    key: 'feedbackAnswer' as const,
    prompt: 'You receive critical feedback on work you were proud of. You:',
    options: [
      { value: 'A', label: 'Explain why your original approach was right' },
      { value: 'B', label: 'Thank them, ask clarifying questions, and adjust' },
      { value: 'C', label: 'Feel discouraged and avoid asking for feedback again' },
      { value: 'D', label: 'Agree in the moment but do not change anything' },
    ],
  },
];
