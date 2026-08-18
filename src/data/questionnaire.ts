export interface BollywoodCharacter {
  id: string;
  name: string;
  personalityTrait: string;
  image: string;
}

export const BOLLYWOOD_CHARACTERS: BollywoodCharacter[] = [
  {
    id: "rancho",
    name: "Rancho",
    personalityTrait: "Wise, Kind, Curious",
    image: "/images/characters/rancho.png?v=2",
  },
  {
    id: "aakash",
    name: "Aakash",
    personalityTrait: "Ambitious, competitive",
    image: "/images/characters/aakash.png?v=2",
  },
  {
    id: "bunny",
    name: "Bunny",
    personalityTrait: "Bold, Adventurous",
    image: "/images/characters/bunny.png?v=2",
  },
  {
    id: "geet",
    name: "Geet",
    personalityTrait: "Witty & Unapologetically Herself",
    image: "/images/characters/geet.png?v=2",
  },
  {
    id: "queen",
    name: "Rani",
    personalityTrait: "Innocent, Overthinker, Occasional Crier",
    image: "/images/characters/queen.png?v=2",
  },
  {
    id: "raju",
    name: "Raju",
    personalityTrait: "Funny, chaotic & always scheming",
    image: "/images/characters/raju.png?v=2",
  },
];

export type ChoiceOption = {
  value: string;
  title: string;
  subtitle?: string;
};

export const STUDENT_STAGE_OPTIONS: ChoiceOption[] = [
  {
    value: "First year, still figuring things out",
    title: "First year",
  },
  {
    value: "Mid-college and questioning everything",
    title: "Mid-college",
  },
  {
    value: "Final year. Placement panic has begun.",
    title: "Final year",
  },
  {
    value: "Just graduated. Now what?",
    title: "Just graduated",
  },
  {
    value: "Taking a gap year / figuring things out",
    title: "Gap year",
  },
  {
    value: "Already working, still figuring it out",
    title: "Already working",
  },
];

export const SUPERPOWER_OPTIONS: ChoiceOption[] = [
  {
    value: "Know what's coming in every exam",
    title: "Know every exam",
  },
  {
    value: "Get any internship instantly",
    title: "Instant internship",
  },
  {
    value: "Know exactly what career to choose",
    title: "Know my career",
  },
  {
    value: "Finish any assignment in 5 minutes",
    title: "5-minute assignments",
  },
  {
    value: "Get motivation whenever you need it",
    title: "Motivation on demand",
  },
  {
    value: "Understand anything on the first try",
    title: "Understand first try",
  },
];

export const STUDENT_CRIME_OPTIONS: ChoiceOption[] = [
  {
    value: "Study one night before the exam",
    title: "Study one night before",
  },
  {
    value: "Open YouTube for studying and disappear for 3 hours",
    title: "YouTube for 3 hours",
  },
  {
    value: "Buy a course and never open it",
    title: "Buy a course, never open",
  },
  {
    value: "Make beautiful notes instead of studying",
    title: "Pretty notes, no studying",
  },
  {
    value: "Attend class only when attendance gets scary",
    title: "Class only for attendance",
  },
  {
    value: 'Put "Future CEO" on LinkedIn in first year',
    title: "Future CEO on LinkedIn",
  },
];

export const STUDENT_GOAL_OPTIONS: ChoiceOption[] = [
  {
    value: "Which college/university should I choose?",
    title: "College / university",
  },
  {
    value: "How do I get a good internship?",
    title: "Get a good internship",
  },
  {
    value: "What career should I actually choose?",
    title: "Choose a career",
  },
  {
    value: "How do I build a better profile?",
    title: "Build a better profile",
  },
  {
    value: "Should I study abroad?",
    title: "Study abroad",
  },
  {
    value: "What skills should I learn?",
    title: "Skills to learn",
  },
];

export const AREA_TO_EXPLORE_OPTIONS = [
  "Business & Finance",
  "Marketing, HR & Ops",
  "CS, Tech & STEM",
  "Data & AI",
  "Healthcare & Medicine",
  "Education & Arts",
];

export const AREA_TO_AOS_MAP: Record<string, string[]> = {
  "Business & Finance": [
    "Business",
    "Business & Management",
    "Finance & Accounting",
  ],
  "Marketing, HR & Ops": [
    "Marketing & Communications",
    "Operations & Supply Chain",
    "Human Resources",
    "Product Management",
    "Project Management",
    "Human Resources & Recruiting",
  ],
  "CS, Tech & STEM": ["STEM", "Technology & IT", "Computer Science"],
  "Data & AI": ["AI & Machine Learning", "Data & Analytics", "Data Science"],
  "Healthcare & Medicine": ["Healthcare & Medicine", "Healthcare"],
  "Education & Arts": [
    "Social Sciences & Humanities",
    "Arts & Design",
    "Design & Creative",
    "Law & Policy",
    "Education & Training",
    "Social Sciences",
    "Education & Career Development",
    "Education",
  ],
};

export const STUDENT_GOAL_TO_PROGRAM_AREA: Record<string, string> = {
  "Which college/university should I choose?": "Business & Finance",
  "How do I get a good internship?": "CS, Tech & STEM",
  "What career should I actually choose?": "Data & AI",
  "How do I build a better profile?": "CS, Tech & STEM",
  "Should I study abroad?": "Business & Finance",
  "What skills should I learn?": "Data & AI",
};

export function getProgramAreaForGoal(studentGoal: string): string {
  return STUDENT_GOAL_TO_PROGRAM_AREA[studentGoal] ?? "Data & AI";
}
