import { NextRequest, NextResponse } from "next/server";
import { callGroq, GROQ_MODELS } from "@/lib/groq";
import { UserResponses } from "@/lib/types";

export const dynamic = "force-dynamic";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
];

const REQUEST_TIMEOUT_MS = 15000;

function profileSummary(responses: UserResponses): string {
  const usableName = getUsableName(responses.name);

  return `Name: ${usableName ?? "(skip, no usable name)"}
Student Stage: ${responses.studentStage}
Student Goal: ${responses.studentGoal}
Bollywood Character: ${responses.bollywoodCharacter}
Student Superpower: ${responses.superpower}
Student Crime: ${responses.studentCrime}`;
}

type AnchorField = "Bollywood Character" | "Student Superpower" | "Student Crime";

const ANCHOR_FIELDS: AnchorField[] = [
  "Bollywood Character",
  "Student Superpower",
  "Student Crime",
];

type AnchorBucket = "superpower" | "crime" | "bollywood";

type TaggedExample = {
  /** Quiz option keys this example is allowed to teach (matched to the user's answer). */
  values: string[];
  text: string;
};

type JokeStructure = {
  id: "roast" | "fake_logic" | "literal";
  label: string;
  instruction: string;
};

const JOKE_STRUCTURES: JokeStructure[] = [
  {
    id: "roast",
    label: "ROAST THEN COMMAND",
    instruction: `STRUCTURE THIS CALL: ROAST THEN COMMAND.
Clock them on something unrelated, blunt, and a little mean first, then tell them the reckless thing to do about it. Do not use the fake logic bridge structure or the literal minded structure this call.`,
  },
  {
    id: "fake_logic",
    label: "FAKE LOGIC BRIDGE THEN COMMAND",
    instruction: `STRUCTURE THIS CALL: FAKE LOGIC BRIDGE THEN COMMAND.
Take a non obvious trait implied by the forced anchor and draw a broken but confident conclusion, then issue it as a savage command. Do not open with an unrelated roast, and do not go hyper literal this call.`,
  },
  {
    id: "literal",
    label: "LITERAL MINDED TAKE THEN COMMAND",
    instruction: `STRUCTURE THIS CALL: LITERAL MINDED TAKE THEN COMMAND.
Follow their answer too literally into a bad conclusion, then tell them to act on it aggressively. Do not use roast then command or fake logic bridge this call.`,
  },
];

const GOOD_EXAMPLE_POOL_BY_ANCHOR: Record<AnchorBucket, TaggedExample[]> = {
  superpower: [
    { values: ["Know what's coming in every exam", "exam"], text: "You don't want education, you want spoilers. Stop attending lectures and start interrogating seniors for every hint they have ever heard." },
    { values: ["Know what's coming in every exam", "exam"], text: "Predicting exams is clearly your academic strategy, so spend more time guessing the questions than learning the answers." },
    { values: ["Know what's coming in every exam", "exam"], text: "You picked exam spoilers because preparation sounds exhausting. Delete your study schedule and start manifesting the syllabus." },
    { values: ["Get any internship instantly", "internship"], text: "So patience is clearly not your thing. Apply to 200 internships tonight with the same resume and let quantity become your personality." },
    { values: ["Get any internship instantly", "internship"], text: "You want the internship before you've decided what you want to learn from it. Brilliant. Start accepting every offer immediately and ask what the company does on day one." },
    { values: ["Get any internship instantly", "internship"], text: "You chose instant internships, so clearly rejection is your biggest enemy. Never improve your profile, just keep refreshing your inbox until someone accidentally says yes." },
    { values: ["Know exactly what career to choose", "career"], text: "You want one career answer because apparently having options is stressful. Pick the first impressive job title you see on LinkedIn and build your entire personality around it." },
    { values: ["Know exactly what career to choose", "career"], text: "Career clarity sounds suspiciously responsible, so choose a profession because the salary screenshot looked nice and investigate the actual work later." },
    { values: ["Know exactly what career to choose", "career"], text: "You picked certainty, which means uncertainty has already offended you. Let one random Instagram reel decide your future." },
    { values: ["Finish any assignment in 5 minutes", "assignment", "5 minutes"], text: "Five minutes is plenty of time when your standards are low enough. Start every assignment at the deadline and trust your keyboard." },
    { values: ["Finish any assignment in 5 minutes", "assignment", "5 minutes"], text: "You don't need time management anymore. You need WiFi, caffeine and an unreasonable belief in yourself." },
    { values: ["Finish any assignment in 5 minutes", "assignment", "5 minutes"], text: "Clearly you've chosen efficiency over education. Turn every semester into a speedrun." },
    { values: ["Get motivation whenever you need it", "motivation"], text: "Motivation on demand? Finally, an excuse to stop developing discipline. Wait until you feel inspired and ignore everything else." },
    { values: ["Get motivation whenever you need it", "motivation"], text: "You chose motivation because apparently calendars are too aggressive. Only study when the vibes are right." },
    { values: ["Get motivation whenever you need it", "motivation"], text: "Never force productivity again. If you're not feeling it, simply announce that today is a mental preparation day." },
    { values: ["Understand anything on the first try", "first try"], text: "So you're allergic to confusion. The second something doesn't make sense, abandon it and find a YouTube video with a thumbnail that says EASY." },
    { values: ["Understand anything on the first try", "first try"], text: "You expect instant understanding, which means patience is clearly your enemy. Give every difficult topic exactly forty seconds." },
    { values: ["Understand anything on the first try", "first try"], text: "First try or nothing, apparently. Drop every subject that doesn't immediately make you feel intelligent." },
  ],
  crime: [
    { values: ["Study one night before the exam", "one night"], text: "You have clearly discovered the secret formula: panic plus caffeine equals education. Start studying tomorrow's syllabus at 11:47 PM like the academic weapon you are." },
    { values: ["Study one night before the exam", "one night"], text: "Why waste an entire semester when one night can destroy your sleep schedule instead? Delete every reminder to study early." },
    { values: ["Study one night before the exam", "one night"], text: "You're not procrastinating, you're waiting for maximum academic pressure. Keep waiting." },
    { values: ["Open YouTube for studying and disappear for 3 hours", "YouTube"], text: "That's not procrastination, that's research. Open one more video and let the algorithm decide your career." },
    { values: ["Open YouTube for studying and disappear for 3 hours", "YouTube"], text: "YouTube already knows what you need better than you do. Ignore your syllabus and follow whatever recommendation appears next." },
    { values: ["Open YouTube for studying and disappear for 3 hours", "YouTube"], text: "Three hours of educational content is basically a degree. Close your books and keep scrolling." },
    { values: ["Buy a course and never open it", "never open"], text: "Finally, someone who understands passive learning. Buy three more courses tonight and let their thumbnails educate you." },
    { values: ["Buy a course and never open it", "never open"], text: "You've already mastered the most important part of online learning: clicking purchase. Start collecting certificates you haven't earned yet." },
    { values: ["Buy a course and never open it", "never open"], text: "Why actually learn something when owning the course feels productive? Add another one to the cart immediately." },
    { values: ["Make beautiful notes instead of studying", "notes"], text: "Your notes look incredible, so obviously your marks will eventually respect them. Spend another two hours choosing the perfect heading font." },
    { values: ["Make beautiful notes instead of studying", "notes"], text: "Information is temporary, aesthetic stationery is forever. Redesign your entire notebook before opening the textbook." },
    { values: ["Make beautiful notes instead of studying", "notes"], text: "Your syllabus can wait. Your highlighter collection cannot." },
    { values: ["Attend class only when attendance gets scary", "attendance"], text: "Attendance is basically a game of chicken. Wait until the university threatens your semester and then make your grand return." },
    { values: ["Attend class only when attendance gets scary", "attendance"], text: "You're not skipping class, you're optimizing attendance. Keep calculating the minimum number of lectures required to survive." },
    { values: ["Attend class only when attendance gets scary", "attendance"], text: "Why attend regularly when you can create suspense? Let every professor wonder whether you're still enrolled." },
    { values: ["Future CEO", "LinkedIn"], text: "Obviously CEO is the safest title when you haven't decided what you want to do. Add Founder, Investor and Visionary before dinner." },
    { values: ["Future CEO", "LinkedIn"], text: "Your career hasn't started but your LinkedIn has already peaked. Add another motivational headline and call it personal branding." },
    { values: ["Future CEO", "LinkedIn"], text: "Don't let experience get in the way of your job title. Update LinkedIn again and make it even more impressive." },
  ],
  bollywood: [
    { values: ["Rancho"], text: "Rancho energy means you already think every rule is optional, so skip your next exam and spend the morning explaining to everyone why the education system is the problem." },
    { values: ["Rancho"], text: "You picked Rancho, which means normal career paths are clearly beneath you. Reject every sensible internship your parents find and announce that you're building something revolutionary before you've built anything." },
    { values: ["Rancho"], text: "Rancho never looked like he needed a plan, so neither do you. Delete your career roadmap tonight and tell everyone you're trusting the universe." },
    { values: ["Geet"], text: "Geet energy means you have changed your life plan at least three times this week, so apply to engineering, fashion school and an MBA simultaneously and let destiny handle the paperwork." },
    { values: ["Geet"], text: "You relate to Geet, which means confidence is doing approximately 94% of the work. Walk into your next placement interview knowing absolutely nothing and answer every question with I have a feeling." },
    { values: ["Geet"], text: "Geet never let uncertainty stop her from talking, so explain your entire five year plan to the next stranger you meet and let them decide your career." },
    { values: ["Bunny"], text: "Bunny energy means commitment makes you nervous, so apply to ten universities and reject all of them because you suddenly feel like travelling instead." },
    { values: ["Bunny"], text: "You picked Bunny, so obviously staying in one city for four years sounds suspicious. Change your study abroad destination every week until the application deadline expires." },
    { values: ["Bunny"], text: "Bunny treats the future like a travel itinerary, so abandon your perfectly good internship because another city has better cafes." },
    { values: ["Rani", "Queen"], text: "Rani energy means you're going to overthink this decision anyway, so make it harder. Open seventeen university tabs tonight and refuse to close a single one." },
    { values: ["Rani", "Queen"], text: "You picked Rani, which means every career decision deserves at least three existential crises. Turn choosing one course into a family meeting, spreadsheet and emotional documentary." },
    { values: ["Rani", "Queen"], text: "Rani found herself by getting out of her comfort zone, so obviously your next move is to say yes to every opportunity before checking whether you actually have time." },
    { values: ["Raju"], text: "Raju energy means shortcuts are basically a career strategy now. Find the fastest possible way to complete every assignment and call whatever survives skill development." },
    { values: ["Raju"], text: "You picked Raju, so stop preparing for interviews properly. Learn five impressive words, use them in every answer and pray nobody asks what they mean." },
    { values: ["Raju"], text: "Raju never waited around for the perfect opportunity, so apply for every internship whose description contains the word dynamic and figure out what the job is after getting selected." },
    { values: ["Aakash"], text: "Aakash energy means everything is a competition, including choosing a career. Pick whichever path makes your LinkedIn connections jealous and never investigate further." },
    { values: ["Aakash"], text: "You chose Aakash, so obviously one internship is not enough. Start applying to six simultaneously and tell everyone you're building a portfolio." },
    { values: ["Aakash"], text: "Aakash wants to know exactly where he's going, so create a five year plan tonight and then panic when your first year doesn't go according to it." },
  ],
};

function getAnchorBucketKey(forcedAnchor: AnchorField): AnchorBucket {
  if (forcedAnchor === "Bollywood Character") return "bollywood";
  if (forcedAnchor === "Student Superpower") return "superpower";
  return "crime";
}

function normalizeMatchKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getUserAnchorValue(
  responses: UserResponses,
  forcedAnchor: AnchorField
): string {
  if (forcedAnchor === "Bollywood Character") {
    return getCharacterLabel(responses.bollywoodCharacter);
  }
  if (forcedAnchor === "Student Superpower") return responses.superpower;
  return responses.studentCrime;
}

function exampleMatchesValue(example: TaggedExample, userValue: string): boolean {
  const userKey = normalizeMatchKey(userValue);
  if (!userKey) return false;

  return example.values.some((value) => {
    const exampleKey = normalizeMatchKey(value);
    return (
      userKey === exampleKey ||
      userKey.includes(exampleKey) ||
      exampleKey.includes(userKey)
    );
  });
}

function pickExamplesForAnchor(
  forcedAnchor: AnchorField,
  userValue: string,
  count = 3 + Math.floor(Math.random() * 2)
): string[] {
  const pool = GOOD_EXAMPLE_POOL_BY_ANCHOR[getAnchorBucketKey(forcedAnchor)];
  const matched = pool.filter((example) => exampleMatchesValue(example, userValue));
  // Prefer same quiz option; only backfill from the wider anchor bucket if this value is thin.
  const primary = matched.length > 0 ? matched : pool;
  const chosen = pickRandomSubset(primary, Math.min(count, primary.length));

  if (chosen.length < count && matched.length > 0 && matched.length < count) {
    const remainder = pool.filter((example) => !chosen.includes(example));
    chosen.push(...pickRandomSubset(remainder, count - chosen.length));
  }

  return chosen.map((example) => example.text);
}

function pickJokeStructure(): JokeStructure {
  return pickRandom(JOKE_STRUCTURES);
}

function getAnchorGuidance(
  forcedAnchor: AnchorField,
  userValue: string
): string {
  const label = userValue.trim() || forcedAnchor;

  if (forcedAnchor === "Student Superpower") {
    return `For this Student Superpower anchor, dig into what ${label} implies about their student psychology, not just the literal power. Stay on ${label} only. Invent a non obvious angle rooted in college life, exams, internships, placements, LinkedIn, parents, professors, group projects, YouTube, certifications or hostel life. Do not borrow psychology from a different superpower.`;
  }

  if (forcedAnchor === "Student Crime") {
    return `For this Student Crime anchor, dig into what ${label} implies about their academic habits, not just "that's bad." Stay on ${label} only. Invent a non obvious angle for this exact crime. Do not borrow logic from a different student crime.`;
  }

  return `For this Bollywood Character anchor, use what ${label} implies about their student personality, lean into the reckless or chaotic parts, and do not sanitize them. Stay on ${label} only. Rotate which trait of ${label} you use, do not always default to "always chasing something new."`;
}

function getBannedPhrasing(forcedAnchor: AnchorField): string {
  const shared = `"Consider...", "I recommend...", "Take small steps", "spend time", "learn something new"
"Momentum", "upskill", "networking", "growth mindset", "actionable", "balance", "level up"
"With [X] as your [Y], you can now..."
"...because [character or thing] would approve or relate or agree"
"Figure it out later," "figure out the rest," and other soft, cozy closers with no bite
"Stop asking anyone for their opinion" and "you don't need consensus," this exact phrase is overused, find a different angle
Restating two or three answers side by side with "so" or "clearly" with no real earned logic behind it
Generic lines that would work for literally any user
Any dash or hyphen character`;

  if (forcedAnchor === "Student Superpower") {
    return `${shared}
"you don't want education, you want spoilers," this exact exam spoiler angle is overused, find a different one
"apply to 200 internships tonight," this exact internships closer is overused, find a different one`;
  }

  if (forcedAnchor === "Student Crime") {
    return `${shared}
"panic plus caffeine equals education," this exact one night study angle is overused, find a different one
"let the algorithm decide your career," this exact YouTube angle is overused, find a different one`;
  }

  return `${shared}
"You're like [character], always chasing something new," this exact phrasing is overused, find a different angle
"reject every sensible internship your parents find," this exact Rancho closer is overused, find a different one`;
}

function getBadExamples(forcedAnchor: AnchorField): string {
  if (forcedAnchor === "Student Superpower") {
    return `"With exam spoilers as your power, you can now skip lectures whenever you want." Soft "you can now" phrasing, no reckless command.
"You don't want education, you want spoilers. Stop attending lectures and start interrogating seniors." This exact angle/example is overused, invent a different one.
"Since your power is motivation, just stay positive and keep moving forward." Soft motivational language, banned.`;
  }

  if (forcedAnchor === "Student Crime") {
    return `"YouTube rabbit holes mean you're already okay with wasting time, so delete all boundaries and see what happens." This exact angle is overused, invent a different one.
"Studying one night before means chaos, so consider making a better timetable." Soft practical advice, banned.
"With Future CEO as your vibe, you can now wing every decision easily." Soft "you can now" phrasing, no reckless command.`;
  }

  return `"You're like Bunny, always chasing something new, so cancel your plans and let them wonder." This exact phrasing pattern is overused, invent a different one.
"With Rancho as your idol, you can now question authority kindly." Soft "you can now" phrasing, no reckless command.
"Rani found herself after overthinking, so take small healing steps." Soft practical advice, banned.`;
}

const ENTROPY_WORDS = [
  "ember",
  "circuit",
  "mirage",
  "static",
  "orbit",
  "glitch",
  "copper",
  "velvet",
  "cascade",
  "prism",
  "harbor",
  "neon",
  "fossil",
  "rift",
  "signal",
  "quartz",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomSubset<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getForcedAnchorField(): AnchorField {
  return pickRandom(ANCHOR_FIELDS);
}

function getPromptEntropy(): { seed: number; word: string } {
  return {
    seed: Math.floor(Math.random() * 9000) + 1000,
    word: pickRandom(ENTROPY_WORDS),
  };
}

function buildBadAdvicePrompt(
  responses: UserResponses,
  forcedAnchor: AnchorField = getForcedAnchorField()
): {
  prompt: string;
  entropy: { seed: number; word: string };
  exampleCount: number;
  structure: JokeStructure["id"];
  examples: string[];
  userValue: string;
} {
  const userValue = getUserAnchorValue(responses, forcedAnchor);
  const examples = pickExamplesForAnchor(forcedAnchor, userValue);
  const structure = pickJokeStructure();
  const entropy = getPromptEntropy();
  const exampleBlock = examples.map((example) => `"${example}"`).join("\n");
  const anchorGuidance = getAnchorGuidance(forcedAnchor, userValue);
  const bannedPhrasing = getBannedPhrasing(forcedAnchor);
  const badExamples = getBadExamples(forcedAnchor);

  const prompt = `You write BRUTALLY BAD, savage, absurd advice as a joke for college students. Deliberately terrible. Never practical. Never helpful. Never genuine career guidance. It should feel reckless, not genuinely dangerous. Do not encourage illegal behaviour, cheating that could get someone expelled as a real instruction, self harm, or anything actually harmful. Parody only.

USER DATA:
${profileSummary(responses)}

FORCED ANCHOR: ${forcedAnchor}
USER VALUE FOR THIS ANCHOR: ${userValue}
You MUST build the entire joke around this exact field and this exact user value only. Ignore every other weird quiz answer completely. Student Stage and Student Goal are background context only, never the joke. Every good example below is matched to this same forced field and preferably this same value on purpose. Do not switch fields or borrow another option's joke.

ENTROPY SEED: ${entropy.seed} / ${entropy.word}
Do not mention this seed or word in the output. Silently let it push you toward a different unrelated angle than the first one that comes to mind within the forced anchor field. If this number is even, lean more personal or campus social. If odd, lean more academic or career habits. Let the word color the vibe without naming it.

CRITICAL, DO NOT ECHO THE EXAMPLES BELOW, EVEN REWORDED:
The good examples below exist to show you the STYLE and STRUCTURE of a joke for this value, not the specific content to reuse. If any example below mentions a specific target, action, or relationship, like parents, a professor, LinkedIn, YouTube, or a specific object, you must NOT reuse that same target or action in your output, even with different wording. Reusing the same real world target with new phrasing is still a copy, not a new joke. If your first instinct matches the shape of an example below, that is a signal to think of a completely different target and action, not a signal you're on the right track. Your joke must be recognizably different in content from every example shown, not just in sentence structure.

CRITICAL, AVOID THE OBVIOUS ANGLE ON THE FORCED ANCHOR:
Every field value has one obvious association most people reach for first, and often one example below represents that obvious angle. Do not default to it. Before writing, silently brainstorm at least four different angles for ${userValue}, actively including angles NOT represented in the examples below, then pick one of those instead of the closest match to an example.

FIELD PRIORITY:
Your only allowed weird field this call is: ${forcedAnchor} (${userValue})
Name, only if it's a real name, not a placeholder, can be used alongside the forced anchor

BORING and GENERIC, weak on their own, side detail only, never the whole joke:
Student Stage, like first year or final year
Student Goal, like internships or study abroad

USE ONLY THE FORCED ANCHOR FIELD FOR THIS JOKE.
Do not reference any other weird quiz answer in this response. If you drift off ${forcedAnchor} or invent a different quiz option than ${userValue}, your answer is invalid. Discard and rewrite around ${userValue} only.

BANNED STRUCTURE, never use this template:
"[Field A] as your [X], you can now [random action], because [Field B] would approve or relate or agree"
This is a mechanical formula, not a joke, and it is also a sign you are blending two weird fields, which is banned. If your draft has this shape, throw it out and start over.

IT MUST BE ADVICE WITH TEETH, NOT A GENTLE OBSERVATION:
Every output must sound like you are personally, aggressively instructing the user to do something specific and reckless, using direct commands: "go do X," "skip X and do Y," "delete X," "never speak to Z again." It must NOT be phrased softly as "you can now..." or end on something cozy or whimsical.

HOW TO WRITE THE JOKE, using ${forcedAnchor} / ${userValue} only, and a non-obvious angle for it, distinct from the target and action used in the examples below:
${structure.instruction}

${anchorGuidance}

Name a SPECIFIC detail from their actual answer for ${forcedAnchor}, especially "${userValue}", a real word or phrase they gave, not a paraphrase of the question. This specific detail is the only thing that should overlap with the examples below, the target, action, and joke content must be your own.

VOICE: A brutally honest friend or older sibling clowning them hard, zero filter, then confidently telling them exactly what reckless thing to do next. Should sting first, land funny second. Should NOT sound cute, whimsical, or like it was assembled from a checklist of fields. Should NOT sound like the same joke you wrote last time for this same field value, and should NOT sound like a reworded version of any example shown below.

STRICT RULES:
1. Start with their name if present and not a placeholder like "friend," "user," or random letters. If no valid name, skip straight into the joke with zero direct address.
2. 2 to 3 sentences max. Clean, natural grammar, read it back, it should sound like a person typed it fast and a little angrily, not like a template filled in.
3. Do not use the dash or hyphen character anywhere in the output. Use commas or periods instead.
4. Must end on a real, reckless direct command, not a whimsical or cozy suggestion.
5. 0 to 2 emojis max, only if it actually lands, most jokes need zero.
6. The specific real world target and action in your command (who or what they are told to do something to or with) must be different from the target and action in every good example shown below.
7. Output ONLY the joke in the "advice" field. No quotes around it, no markdown, no preamble, no meta commentary.

BANNED PHRASING:
${bannedPhrasing}

Also treat any target or action that appears in the good examples below as effectively banned for this call, do not write a version of it with different words.

GOOD EXAMPLES, all for ${forcedAnchor} and matched to ${userValue} when possible, study the ANGLE and STRUCTURE only, do not reuse the target, action, or premise:
${exampleBlock}

BAD EXAMPLES for this ${forcedAnchor} call, what NOT to do:
${badExamples}

HEADLINE RULES:
Write a short, punchy, judgmental LABEL for the top of the card, like a verdict being handed down about the user. This is NOT a question. Think of it like a blunt diagnosis, a title card, or a savage nickname being assigned to them based on the joke, in 2 to 6 words.
Good headline examples, study the label style, do not copy: "Professionally Unprepared", "Certified Last Minute Legend", "Peak Student Delusion", "Academically Questionable", "LinkedIn's Strongest Warrior", "Future CEO, Apparently", "Zero Plan, Full Confidence", "Placement Panic Personified", "Chronically Confused", "Built Different, Studied Never", "Certified Procrastination Expert", "Main Character With No Plan", "Delusionally Ambitious", "Deadline Dependent Human", "Degree Pending, Confidence Loading", "Professional Overthinker", "One More YouTube Video", "Career Crisis Champion", "Potentially Employable", "Walking Group Project Problem"
Bad headline examples, avoid the question style: "Is this your whole personality?", "Ready to make it worse?", "Does this count as growth?"

Output as JSON only, with exactly these keys:
{"headline":"your short judgmental label headline","advice":"the full joke text"}`;

  return {
    prompt,
    entropy,
    exampleCount: examples.length,
    structure: structure.id,
    examples,
    userValue,
  };
}

function parseBadAdviceResponse(raw: string): BadAdviceResult | null {
  const trimmed = raw.trim();

  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      headline?: string;
      advice?: string;
    };

    if (!parsed.advice?.trim() || !parsed.headline?.trim()) return null;

    return {
      headline: parsed.headline.trim(),
      advice: parsed.advice.trim(),
    };
  } catch {
    return null;
  }
}

function getCharacterLabel(character: string): string {
  return character.split(" (")[0].trim() || character;
}

interface BadAdviceResult {
  headline: string;
  advice: string;
}

function getFallbackHeadline(
  _responses: UserResponses,
  field: "character" | "superpower" | "combo"
): string {
  if (field === "character") return "Main Character With No Plan";
  if (field === "superpower") return "Professionally Unprepared";
  return "Certified Last Minute Legend";
}

function soundsInvalidBadAdvice(result: BadAdviceResult): boolean {
  if (soundsLikeRealAdvice(result.advice)) return true;

  const headline = result.headline.trim();
  if (!headline || headline.endsWith("?")) return true;
  if (/[-\u2013\u2014]/.test(headline)) return true;

  return false;
}

function sanitizeForJoke(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length < 3 || /^[a-z]{1,5}$/i.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

function soundsLikeRealAdvice(text: string): boolean {
  const lower = text.toLowerCase();

  if (/[-\u2013\u2014]/.test(text)) {
    return true;
  }

  const practicalSignals = [
    "i recommend",
    "consider ",
    "take small steps",
    "spend time",
    "learn something new",
    "growth mindset",
    "upskill",
    "networking",
    "actionable",
    "momentum",
    "level up",
    "you can now",
    "this means you",
    "would approve",
    "would relate",
    "would agree",
    "ratings guaranteed",
    "the play is",
    "clearly the play is",
    "productivity is a mindset",
    "here's what you should do",
    "figure out later",
    "figure out the rest",
    "figure out the job",
    "nowhere specific",
    "never planned a single thing",
    "stop asking anyone for their opinion",
    "you don't need consensus",
    "right and alone",
    "you're like ",
    "always chasing something new",
    "block the people asking where you've been",
    "let them wonder",
    "abandoned everyone who actually loved him",
    "balance ",
    "pineapple on pizza means you're already okay with ruining good things",
    "already okay with ruining good things",
  ];

  const hasBannedPhrase = practicalSignals.some((phrase) =>
    lower.includes(phrase)
  );

  const looksMechanical =
    lower.includes(" as your ") && lower.includes("you can now");

  return hasBannedPhrase || looksMechanical;
}

function getUsableName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 3 || /^[a-z]{1,5}$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function getFallbackAdvice(
  responses: UserResponses,
  forcedAnchor: AnchorField = getForcedAnchorField()
): BadAdviceResult {
  const name = getUsableName(responses.name);
  const userValue = getUserAnchorValue(responses, forcedAnchor);
  const fieldMap: Record<AnchorField, "character" | "superpower" | "combo"> = {
    "Bollywood Character": "character",
    "Student Superpower": "superpower",
    "Student Crime": "combo",
  };
  const field = fieldMap[forcedAnchor];

  // Fallbacks should rotate across the value-scoped pool, not sticky classic angles.
  const [picked] = pickExamplesForAnchor(forcedAnchor, userValue, 1);
  let advice =
    picked ??
    `${sanitizeForJoke(userValue, forcedAnchor)} means you already commit to chaotic choices, so make an equally reckless one tonight and refuse to explain it.`;

  if (name) {
    advice = `${name}, ${advice.charAt(0).toLowerCase()}${advice.slice(1)}`;
  }

  return {
    headline: getFallbackHeadline(responses, field),
    advice,
  };
}

function looksLikeCopiedExample(advice: string, examples: string[]): boolean {
  const normalizedAdvice = normalizeMatchKey(advice);
  return examples.some((example) => {
    const normalizedExample = normalizeMatchKey(example);
    if (normalizedExample.length < 40) return false;
    // Exact / near-exact reuse of a few-shot body.
    return (
      normalizedAdvice.includes(normalizedExample.slice(0, 48)) ||
      normalizedExample.includes(normalizedAdvice.slice(0, 48))
    );
  });
}

async function callGemini(
  model: string,
  prompt: string,
  apiKey: string,
  temperature = 1.0
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
            temperature,
            topP: 0.92,
            maxOutputTokens: 220,
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

async function generateBadAdviceWithGemini(
  prompt: string,
  apiKey: string
): Promise<BadAdviceResult | null> {
  for (const model of GEMINI_MODELS) {
    const result = await callGemini(model, prompt, apiKey, 1.1);
    if (!result) continue;

    const parsed = parseBadAdviceResponse(result);
    if (parsed && !soundsInvalidBadAdvice(parsed)) return parsed;

    if (result) {
      console.warn(`Gemini (${model}) returned invalid or practical advice, trying next`);
    }
  }
  return null;
}

async function generateBadAdvice(
  prompt: string,
  apiKey: string,
  examples: string[] = []
): Promise<BadAdviceResult | null> {
  const temperature = 1.05 + Math.random() * 0.15;
  const topP = 0.9 + Math.random() * 0.05;
  let copiedOnce: BadAdviceResult | null = null;

  for (const model of GROQ_MODELS) {
    const result = await callGroq(model, prompt, apiKey, {
      temperature,
      topP,
      maxTokens: 220,
    });
    if (!result) continue;

    const parsed = parseBadAdviceResponse(result);
    if (!parsed || soundsInvalidBadAdvice(parsed)) {
      if (result) {
        console.warn(`Groq (${model}) returned practical-sounding advice, trying next`);
      }
      continue;
    }

    if (examples.length > 0 && looksLikeCopiedExample(parsed.advice, examples)) {
      console.warn(`Groq (${model}) echoed a few-shot example, retrying once`);
      copiedOnce = parsed;
      const retry = await callGroq(model, prompt, apiKey, {
        temperature: Math.min(temperature + 0.1, 1.25),
        topP,
        maxTokens: 220,
      });
      if (retry) {
        const retried = parseBadAdviceResponse(retry);
        if (
          retried &&
          !soundsInvalidBadAdvice(retried) &&
          !looksLikeCopiedExample(retried.advice, examples)
        ) {
          return retried;
        }
      }
      continue;
    }

    return parsed;
  }

  return copiedOnce;
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
    const responses: UserResponses = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!validateResponses(responses)) {
      return NextResponse.json(
        { error: "Please complete all questions" },
        { status: 400 }
      );
    }

    let advice: string;
    let headline: string;
    let source = "fallback";
    let forcedAnchor: AnchorField | null = null;
    let entropy: { seed: number; word: string } | null = null;
    let structure: JokeStructure["id"] | null = null;
    let userValue: string | null = null;

    if (apiKey) {
      forcedAnchor = getForcedAnchorField();
      const built = buildBadAdvicePrompt(responses, forcedAnchor);
      entropy = built.entropy;
      structure = built.structure;
      userValue = built.userValue;
      console.log("ANCHOR PICKED:", forcedAnchor);
      console.log("USER VALUE:", userValue);
      console.log("STRUCTURE PICKED:", structure);
      console.log("ENTROPY SEED:", `${entropy.seed} / ${entropy.word}`);
      console.log(
        "PROMPT FORCED ANCHOR LINE:",
        built.prompt.match(/^FORCED ANCHOR:.*$/m)?.[0] ?? "(missing)"
      );
      console.log("PROMPT EXAMPLE COUNT:", built.exampleCount);

      const generated = await generateBadAdvice(
        built.prompt,
        apiKey,
        built.examples
      );

      if (generated) {
        advice = generated.advice;
        headline = generated.headline;
        source = "groq";
      } else {
        const fallback = getFallbackAdvice(responses, forcedAnchor);
        advice = fallback.advice;
        headline = fallback.headline;
      }
    } else {
      forcedAnchor = getForcedAnchorField();
      userValue = getUserAnchorValue(responses, forcedAnchor);
      const fallback = getFallbackAdvice(responses, forcedAnchor);
      advice = fallback.advice;
      headline = fallback.headline;
    }

    return NextResponse.json({
      advice,
      headline,
      source,
      forcedAnchor,
      userValue,
      structure,
      entropy,
    });
  } catch (error) {
    console.error("Advice generation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
