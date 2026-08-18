# Bad Advice for Student

A GradRight B2U parody quiz: students answer six ridiculous questions, get deliberately terrible AI advice, then flip to useful guidance and GradRight's higher-ed tools.

Built with Next.js and Groq.

## What it does

1. **Quiz** — name, student stage, Bollywood character, student superpower, student crime, student goal  
2. **Bad advice** — brutal, absurd joke advice from Groq (one forced fun anchor per call: character, superpower, or crime)  
3. **Good advice** — sincere next-step guidance based on student stage + goal, plus a GradRight plug-in  
4. **Ecosystem + CTA** — universities, financing, learning, Graddie, ConnectED, then app download

The joke screen is entertainment-only (see the in-app disclaimer). GradRight does not give counterproductive advice to real customers.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript  
- **Tailwind CSS 4**  
- **Groq** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) for advice generation  
- Program recommendations from `src/data/online_programs.csv`

## Setup

```bash
npm install
```

Create `.env.local` in the project root:

```bash
GROQ_API_KEY=your_groq_api_key
```

Without a key, the app still runs but uses local fallback joke / good-advice text.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/components/` | Quiz UI, bad/good advice screens, ecosystem, loading states |
| `src/app/api/advice/` | Bad advice generation (Groq + variety / anchor logic) |
| `src/app/api/good-advice/` | Real advice generation |
| `src/app/api/recommendations/` | Programs matched from student goal |
| `src/data/questionnaire.ts` | Questions and options |
| `src/data/online_programs.csv` | Program catalog |
| `src/lib/groq.ts` | Groq client |

## Notes

- Advice API routes are dynamic (`force-dynamic`) so per-request randomness is not cached.  
- Bad advice pins one fun quiz field (Bollywood / student superpower / student crime) per generation. Student stage and student goal stay background context.  
- Default download UTMs: `utm_medium=Bad_Advice_B2U`, `utm_campaign=Bad_Advice_2026_B2U`. Campus activations can override with `utm_source=QR_[COLLEGE]`.
