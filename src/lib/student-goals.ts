import { UserResponses } from "@/lib/types";

export function getFallbackGoodAdvice(responses: UserResponses): {
  aspirationalHeading: string;
  advice: string;
} {
  const name = responses.name.trim();
  const prefix = name.length >= 3 ? `${name}, ` : "";
  const area = responses.areaToExplore || "your chosen field";
  const stage = responses.studentStage || "where you are now";
  const isEarly =
    stage.toLowerCase().includes("first year") ||
    stage.toLowerCase().includes("mid-college");

  const shortArea = area.split(/\s+/).slice(0, 3).join(" ");

  const body = isEarly
    ? `${prefix}as a student, now is the best possible time to build real skills in ${area}, before the pressure of a full time job kicks in.`
    : `${prefix}exploring ${area} from ${stage.toLowerCase()} is a genuinely good instinct, and focused practical learning is exactly what will open the next door.`;

  return {
    aspirationalHeading: `${shortArea} Ahead`,
    advice: body,
  };
}
