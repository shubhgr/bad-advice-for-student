import { NextRequest, NextResponse } from "next/server";
import { callGroq, GROQ_MODELS } from "@/lib/groq";
import { getFallbackGoodAdvice as getGoalFallback } from "@/lib/student-goals";
import { UserResponses } from "@/lib/types";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
];

const REQUEST_TIMEOUT_MS = 15000;

interface GoodAdviceRequest {
  responses: UserResponses;
  badAdvice: string;
}

function getUsableName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 3 || /^[a-z]{1,5}$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function profileSummary(responses: UserResponses): string {
  const usableName = getUsableName(responses.name);

  return `Name: ${usableName ?? "(skip, no usable name)"}
Student Stage: ${responses.studentStage}
Student Goal: ${responses.studentGoal}
Bollywood Character: ${responses.bollywoodCharacter}
Student Superpower: ${responses.superpower}
Student Crime: ${responses.studentCrime}`;
}

function buildGoodAdvicePrompt(responses: UserResponses): string {
  return `You write genuine, warm, useful advice for a student quiz app. This is the REAL advice screen, shown after the user has already seen a joke bad advice screen. This must be sincere, supportive, and actually useful. No jokes, no sarcasm, no roasting, no absurd logic here.

USER DATA:
${profileSummary(responses)}

GOAL:
Write 2 to 4 sentences that recognise the student's actual problem, give one useful direction, and suggest a clear next step. The primary inputs are Student Stage (${responses.studentStage}) and Student Goal (${responses.studentGoal}). Personality answers are optional and usually better skipped.

HOW TO USE THE FIELDS:
Student Goal and Student Stage are the fields that matter most here.
Bollywood Character, Student Superpower, and Student Crime are optional. Given how short this text is, skip them unless one adds a genuine, on the nose connection.

Do NOT turn this into generic motivational filler. Do NOT give actual harmful advice. Do NOT pitch a specific university or platform by name.

TONE:
Warm, direct, encouraging, like a mentor or an older friend who believes in them. Confident but not preachy. No corporate LinkedIn voice.

STRICT RULES:
1. Start with their name if present and not a placeholder like "friend," "user," or random letters. If no valid name, skip straight into the advice with zero direct address.
2. 2 to 4 sentences. Structure: recognise the problem, give one useful direction, suggest a next step.
3. Do not use the dash or hyphen character anywhere in the output. Use commas or periods instead.
4. Must reference their Student Goal in plain language, not a vague paraphrase that could apply to anyone.
5. Do not include any joke, sarcasm, roast, or absurd logic, this is not the bad advice screen.
6. Do not literally say things like "here are some programs" or "check out these courses," that list appears separately below your text.
7. Output ONLY the advice text in the "advice" field. No quotes around it, no markdown, no preamble, no meta commentary.

BANNED PHRASING:
"Consider...", "You should...", "I recommend..."
"Take small steps", "unlock your potential", "level up", "actionable", "growth mindset", "the sky's the limit"
Any joke, pun, or absurd logic left over from a different tone
Forced references to quiz answers that do not genuinely fit
Any dash or hyphen character

GOOD EXAMPLES, study the pattern, do not copy:
"If internships are your biggest concern right now, don't try to learn everything. Pick one area, build a couple of projects that demonstrate it clearly and start applying before you feel completely ready."
"Choosing a university gets noisy when rankings become the whole conversation. Name what you actually want to study, then shortlist schools on fit, cost and outcomes instead of opening another 47 tabs."
"Riya, career confusion is normal at this stage, and you do not need a five year plan tonight. Explore a couple of fields with some structured learning and talk to people already in them before locking a title because it looked good on LinkedIn."

BAD EXAMPLES, what NOT to do:
"Well, crashing your wedding plans wouldn't be the best life hack." Leftover joke voice mixed into genuine advice.
"Unlock your potential and level up your career journey." Generic motivational filler, banned.

HEADLINE RULES:
Also write a short, genuine, encouraging headline for the top of the card, 2 to 5 words, related to their Student Goal. Should sound like a real section title, not a joke and not a question.
Examples: "Your University Shortlist", "Internships Ahead", "Your Career Path", "Build Your Profile", "Study Abroad Ahead", "Skills Start Here"

Output as JSON only, with exactly these keys:
{"headline":"your short genuine headline","advice":"the short genuine advice text"}`;
}

interface GoodAdviceResult {
  aspirationalHeading: string;
  advice: string;
}

function parseGoodAdviceResponse(raw: string): GoodAdviceResult | null {
  const trimmed = raw.trim();

  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      headline?: string;
      aspirationalHeading?: string;
      advice?: string;
    };

    const headline =
      parsed.headline?.trim() || parsed.aspirationalHeading?.trim();

    if (!parsed.advice?.trim() || !headline) return null;

    return {
      aspirationalHeading: headline,
      advice: parsed.advice.trim(),
    };
  } catch {
    return null;
  }
}

function soundsInvalidGoodAdvice(text: string): boolean {
  if (/[-\u2013\u2014]/.test(text)) {
    return true;
  }

  const sentenceCount = text.split(/[.!?]+/).filter((part) => part.trim()).length;
  if (sentenceCount > 4) {
    return true;
  }

  const lower = text.toLowerCase();

  const invalidSignals = [
    "unlock your potential",
    "level up",
    "growth mindset",
    "the sky's the limit",
    "take small steps",
    "life hack",
    "you can now",
    "would approve",
    "ahem",
    "coursera",
    "udemy",
    "crash your wedding",
    "wouldn't be the best",
    "check out these courses",
    "here are some programs",
    "consider...",
    "you should...",
    "i recommend",
  ];

  return invalidSignals.some((phrase) => lower.includes(phrase));
}

function getFallbackGoodAdvice(responses: UserResponses): GoodAdviceResult {
  return getGoalFallback(responses);
}

async function callGemini(
  model: string,
  prompt: string,
  apiKey: string
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 180,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API error (${model}):`, errorBody);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`Gemini API timeout (${model})`);
    } else {
      console.error(`Gemini API request failed (${model}):`, error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGoodAdviceWithGemini(
  prompt: string,
  apiKey: string
): Promise<GoodAdviceResult | null> {
  for (const model of GEMINI_MODELS) {
    const result = await callGemini(model, prompt, apiKey);
    if (!result) continue;

    const parsed = parseGoodAdviceResponse(result);
    if (parsed && !soundsInvalidGoodAdvice(parsed.advice)) return parsed;
  }
  return null;
}

async function generateGoodAdvice(
  prompt: string,
  apiKey: string
): Promise<GoodAdviceResult | null> {
  for (const model of GROQ_MODELS) {
    const result = await callGroq(model, prompt, apiKey, {
      temperature: 0.8,
      maxTokens: 180,
    });
    if (!result) continue;

    const parsed = parseGoodAdviceResponse(result);
    if (parsed && !soundsInvalidGoodAdvice(parsed.advice)) return parsed;

    if (result) {
      console.warn(`Groq (${model}) returned invalid good advice, trying next`);
    }
  }
  return null;
}

function validateResponses(responses: UserResponses): boolean {
  return Boolean(
    responses.name.trim() &&
      responses.studentStage &&
      responses.bollywoodCharacter.trim() &&
      responses.superpower &&
      responses.studentCrime &&
      responses.studentGoal
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: GoodAdviceRequest = await request.json();
    const { responses, badAdvice } = body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!validateResponses(responses)) {
      return NextResponse.json(
        { error: "Please complete all questions" },
        { status: 400 }
      );
    }

    if (!badAdvice?.trim()) {
      return NextResponse.json(
        { error: "Bad advice is required" },
        { status: 400 }
      );
    }

    let advice: string;
    let aspirationalHeading: string;
    let source = "fallback";

    if (apiKey) {
      const generated = await generateGoodAdvice(
        buildGoodAdvicePrompt(responses),
        apiKey
      );

      if (generated) {
        advice = generated.advice;
        aspirationalHeading = generated.aspirationalHeading;
        source = "groq";
      } else {
        const fallback = getFallbackGoodAdvice(responses);
        advice = fallback.advice;
        aspirationalHeading = fallback.aspirationalHeading;
      }
    } else {
      const fallback = getFallbackGoodAdvice(responses);
      advice = fallback.advice;
      aspirationalHeading = fallback.aspirationalHeading;
    }

    return NextResponse.json({ advice, aspirationalHeading, source });
  } catch (error) {
    console.error("Good advice generation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
