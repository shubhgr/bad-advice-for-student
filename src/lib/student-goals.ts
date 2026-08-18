import { UserResponses } from "@/lib/types";

export type StudentGoalId =
  | "university"
  | "internship"
  | "career"
  | "profile"
  | "study-abroad"
  | "skills";

export type ProductPlug = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

export function getStudentGoalId(goal: string): StudentGoalId {
  const value = goal.toLowerCase();

  if (value.includes("study abroad")) return "study-abroad";
  if (value.includes("internship")) return "internship";
  if (value.includes("career")) return "career";
  if (value.includes("profile")) return "profile";
  if (value.includes("skill")) return "skills";
  return "university";
}

export function showsProgramCard(goal: string): boolean {
  const id = getStudentGoalId(goal);
  return id === "internship" || id === "profile" || id === "skills";
}

export function getProductPlug(goal: string): ProductPlug {
  switch (getStudentGoalId(goal)) {
    case "university":
      return {
        eyebrow: "Okay, here's something useful.",
        title: "Not sure which universities actually fit you?",
        body: "Let GradRight help you build a personalised university shortlist instead of opening 47 tabs and trusting your cousin's friend's roommate.",
        cta: "BUILD MY SHORTLIST",
      };
    case "internship":
      return {
        eyebrow: "Okay, here's something useful.",
        title: "Need skills that actually strengthen your profile?",
        body: "Explore online programs and certifications across areas you're interested in.",
        cta: "EXPLORE PROGRAMS",
      };
    case "career":
      return {
        eyebrow: "Okay, here's something useful.",
        title: "Still figuring out what everyone else seems to have figured out?",
        body: "You're not the only one. Connect with other students navigating higher education, careers and everything in between.",
        cta: "MEET YOUR PEOPLE",
      };
    case "profile":
      return {
        eyebrow: "Okay, here's something useful.",
        title: "Your profile needs more than another PDF certificate.",
        body: "Find structured online programs and certifications that match what you actually want to build.",
        cta: "FIND MY PROGRAM",
      };
    case "study-abroad":
      return {
        eyebrow: "Okay, here's something useful.",
        title: "Thinking about studying abroad?",
        body: "You don't need 19 spreadsheets and 6 WhatsApp groups. GradRight brings the major pieces of your higher-ed journey together.",
        cta: "PLAN MY JOURNEY",
      };
    case "skills":
      return {
        eyebrow: "Okay, here's something useful.",
        title: "Not sure what you should learn next?",
        body: "Explore programs and certifications across leading learning platforms and find options that match your interests.",
        cta: "EXPLORE ONLINE LEARNING",
      };
  }
}

export function getFallbackGoodAdvice(responses: UserResponses): {
  aspirationalHeading: string;
  advice: string;
} {
  const name = responses.name.trim();
  const prefix = name.length >= 3 ? `${name}, ` : "";
  const id = getStudentGoalId(responses.studentGoal);
  const stage = responses.studentStage || "where you are now";

  const bodies: Record<StudentGoalId, string> = {
    university: `${prefix}choosing a college gets messy fast when rankings become the whole conversation. Start by naming what you actually want to study, then compare a shortlist on fit, cost and outcomes instead of opening another 47 tabs.`,
    internship: `${prefix}if internships are the loudest stress right now, don't try to learn everything at once. Pick one skill you can show clearly, put it into a couple of projects, and start applying before you feel completely ready.`,
    career: `${prefix}you don't need a perfect five year plan tonight. Explore a few fields with some structured learning, talk to people already in them, and avoid locking a career because a reel made it look glamorous.`,
    profile: `${prefix}a stronger profile comes from work people can actually see. Build a couple of relevant projects, add skills that match the roles you want, and treat certificates as proof of that work, not the whole story.`,
    "study-abroad": `${prefix}study abroad is less about collecting university logos and more about course fit, cost, scholarships and a realistic application plan. Get those pieces in one place before the WhatsApp groups start multiplying.`,
    skills: `${prefix}from ${stage.toLowerCase()}, the useful next step is choosing one field, spotting the skill gap, and learning it in a structured way you can apply through a project. Curiosity without a project stays a tab you never reopen.`,
  };

  const headings: Record<StudentGoalId, string> = {
    university: "Your University Shortlist",
    internship: "Internships Ahead",
    career: "Your Career Path",
    profile: "Build Your Profile",
    "study-abroad": "Study Abroad Ahead",
    skills: "Skills Start Here",
  };

  return {
    aspirationalHeading: headings[id],
    advice: bodies[id],
  };
}
