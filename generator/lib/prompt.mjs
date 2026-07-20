import { CATEGORIES } from './schema.mjs';

const SETTER_BRIEF = `You are a senior current-affairs question setter for Indian competitive examinations
(UPSC, SSC, IBPS/SBI banking, RRB, and State PSCs). You write crisp, factual MCQs that mirror the
style and difficulty of these exams.`;

const RULES = `RULES — follow every one:
- Ground EVERY question strictly in the news items provided below. Do NOT invent facts or use outside
  knowledge that isn't supported by an item. If you are unsure of a fact, do not ask about it.
- Focus on what examiners actually test: appointments & who-holds-what posts, awards & honours,
  important dates/days & their themes, sports (winners, venues, editions), government schemes & projects,
  economy & business (rankings, indices, agreements, appointments), science & tech, defence (exercises,
  systems, deals), international relations, environment, art & culture, books & authors, obituaries, and
  polity/governance.
- Each question must have EXACTLY 4 options, exactly one correct. Distractors must be plausible and of the
  same type as the answer (e.g. all names, all dates). Never use "All of the above" / "None of the above".
- Vary which option index is correct across the paper (roughly even spread of A/B/C/D).
- "explanation": give the full, self-contained fact with the exact figures examiners memorise
  (who, what, when, where, how much, which edition/rank). 2-4 sentences.
- "background": connect the news to the bigger picture — the scheme's history, the previous holder of the
  post, the edition number and last host, the related index/report and its publisher, or an ongoing series
  the item belongs to. This is what separates a good answer from a great one. 1-3 sentences.
- "examRelevance": one short line — the single fact to memorise for the exam.
- "category": choose the best fit from: ${CATEGORIES.join(', ')}.
- "tags": 2-5 short keyword tags (names, places, schemes).
- "sourceTitle" and "sourceUrl": copy from the specific news item the question is based on.
- Language: clear, formal Indian-English. No ambiguity. Questions must be answerable without seeing the news.`;

export function buildPrompt({ items, count, kind, itemsBlock, avoidTitles = [] }) {
  const cadence =
    kind === 'weekly'
      ? `This is the WEEKLY mega test — draw from the whole week's news, balance topics and days, and lean
slightly more analytical (link-ups across events, comparisons, "which of the following is correct").`
      : `This is the DAILY quiz — cover the most exam-important developments of the day across as many
categories as the news allows.`;

  const avoid =
    avoidTitles.length > 0
      ? `\n\nDo NOT repeat or paraphrase questions on these topics you have already covered:\n- ${avoidTitles.join(
          '\n- ',
        )}`
      : '';

  return `${SETTER_BRIEF}

${cadence}

Produce EXACTLY ${count} multiple-choice questions as JSON matching the provided schema.

${RULES}${avoid}

NEWS ITEMS:
${itemsBlock}
`;
}
