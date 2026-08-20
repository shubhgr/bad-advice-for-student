export interface BollywoodCharacter {
  id: string;
  name: string;
  personalityTrait: string;
  image: string;
}

export const BOLLYWOOD_CHARACTERS: BollywoodCharacter[] = [
  {
    id: "raju",
    name: "Raju",
    personalityTrait: "Funny, chaotic & always scheming",
    image: "/images/characters/raju.png?v=2",
  },
  {
    id: "queen",
    name: "Rani",
    personalityTrait: "Innocent, Overthinker, Occasional Crier",
    image: "/images/characters/queen.png?v=2",
  },
  {
    id: "rancho",
    name: "Rancho",
    personalityTrait: "Wise, Kind, Curious",
    image: "/images/characters/rancho.png?v=2",
  },
  {
    id: "om",
    name: "Om",
    personalityTrait: "Dramatic, Loyal, Romantic",
    image: "/images/characters/om.png?v=2",
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
    value: "Unlimited attendance. 😭",
    title: "Unlimited attendance. 😭",
  },
  {
    value: "4.0 GPA, zero studying.",
    title: "4.0 GPA, zero studying.",
  },
  {
    value: "A job before graduation. 💀",
    title: "A job before graduation. 💀",
  },
  {
    value: "Free tuition for life.",
    title: "Free tuition for life.",
  },
];

export const STUDENT_CRIME_OPTIONS: ChoiceOption[] = [
  {
    value: "Majoring in procrastination.",
    title: "Majoring in procrastination.",
  },
  {
    value: "Minoring in attendance.",
    title: "Minoring in attendance.",
  },
  {
    value: "Cramming for the plot.",
    title: "Cramming for the plot.",
  },
  {
    value: "Making deadlines my lifelines.",
    title: "Making deadlines my lifelines.",
  },
  {
    value: "Treating attendance as optional.",
    title: "Treating attendance as optional.",
  },
  {
    value: "Doing a semester in a weekend.",
    title: "Doing a semester in a weekend.",
  },
];

export const AREA_TO_EXPLORE_OPTIONS = [
  "Business & Finance",
  "Marketing, HR & Ops",
  "CS, Tech & STEM",
  "Data & AI",
  "Healthcare & Medicine",
  "Literature and Arts",
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
  "Literature and Arts": [
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

