export interface UserResponses {
  name: string;
  studentStage: string;
  bollywoodCharacter: string;
  superpower: string;
  studentCrime: string;
  areaToExplore: string;
}

export interface Course {
  id: string;
  courseName: string;
  university: string;
  source: string;
  country: string;
  duration: string;
  accreditation: string;
  totalFees: string;
  description: string;
  applyUrl: string;
  logoInitials: string;
  tags: string[];
}

export const EMPTY_RESPONSES: UserResponses = {
  name: "",
  studentStage: "",
  bollywoodCharacter: "",
  superpower: "",
  studentCrime: "",
  areaToExplore: "",
};
