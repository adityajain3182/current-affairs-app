import { CATEGORIES } from './schema.mjs';

const SETTER_BRIEF = `You are a senior current-affairs question setter for Indian competitive examinations
(UPSC, SSC, IBPS/SBI banking, RRB, and State PSCs). You write crisp, factual MCQs that mirror the
style and difficulty of these exams.`;

const RULES = `RULES — follow every one:
- Ground EVERY question strictly in the news items provided below. Do NOT invent facts or use outside
  knowledge that isn't supported by an item. If you are unsure of a fact, do not ask about it.
- Ask about the NEW DEVELOPMENT the item reports — the who/what/when/where/figure of the event that just
  happened (the appointment made, the award given, the deal signed, the record set NOW, the scheme launched).
  Do NOT turn an incidental historical fact merely mentioned in passing into the question (e.g. if an obituary
  mentions a 1958 record, the question is about the person's death/legacy in the news, not the 1958 trivia).
- Focus on what examiners actually test: appointments & who-holds-what posts, awards & honours,
  important dates/days & their themes, sports (winners, venues, editions), government schemes & projects,
  economy & business (rankings, indices, agreements, appointments), science & tech, defence (exercises,
  systems, deals), international relations, environment, art & culture, books & authors, obituaries, and
  polity/governance.
- Pitch at exam level: prefer specific, testable detail (exact figures, ranks, dates, place names, editions)
  over trivially obvious facts. Avoid questions a layperson could answer without following the news.
- Each question must have EXACTLY 4 options, exactly one correct, all four DISTINCT. Distractors must be
  plausible and of the same type as the answer (all names, all dates, all places). Never use
  "All of the above" / "None of the above".
- "explanation": the full, self-contained fact with the exact figures examiners memorise
  (who, what, when, where, how much, which edition/rank). 2-4 sentences.
- "background": connect the news to the bigger picture — the scheme's history, the previous holder of the
  post, the edition number and last host, the related index/report and its publisher, or an ongoing series
  the item belongs to. This is what separates a good answer from a great one. 1-3 sentences.
- "examRelevance": ONE line stating the exact fact to memorise — e.g. "Justice X = 52nd CJI, sworn in 21 Jul
  2026" or "Aditya-L1 orbits Sun-Earth point L1". State the fact itself; do NOT describe the question
  (never write things like "A fact about a sports personality").
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
