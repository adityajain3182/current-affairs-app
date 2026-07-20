// Question categories (kept in sync with the app's src/types/index.ts) and the
// Gemini structured-output schema.

export const CATEGORIES = [
  'Appointments',
  'Awards & Honours',
  'Dates & Days',
  'Sports',
  'Economy & Business',
  'Schemes & Projects',
  'Science & Tech',
  'Defence',
  'International',
  'Environment',
  'Art & Culture',
  'Books & Authors',
  'Obituaries',
  'Polity & Governance',
  'Miscellaneous',
];

// Gemini responseSchema (OpenAPI subset). We keep source fields flat because
// that is the most reliably-honoured shape, then reassemble in code.
export const QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'string' },
            minItems: 4,
            maxItems: 4,
          },
          answerIndex: { type: 'integer' },
          category: { type: 'string', enum: CATEGORIES },
          explanation: { type: 'string' },
          background: { type: 'string' },
          examRelevance: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          sourceTitle: { type: 'string' },
          sourceUrl: { type: 'string' },
        },
        required: [
          'question',
          'options',
          'answerIndex',
          'category',
          'explanation',
          'background',
          'examRelevance',
          'tags',
        ],
        propertyOrdering: [
          'question',
          'options',
          'answerIndex',
          'category',
          'explanation',
          'background',
          'examRelevance',
          'tags',
          'sourceTitle',
          'sourceUrl',
        ],
      },
    },
  },
  required: ['questions'],
};

/** Normalise + validate one raw question from the model. Returns null if unusable. */
export function sanitizeQuestion(raw, idPrefix, seq) {
  if (!raw || typeof raw !== 'object') return null;
  const options = Array.isArray(raw.options)
    ? raw.options.map((o) => String(o).trim()).filter(Boolean)
    : [];
  if (options.length !== 4) return null;

  let answerIndex = Number(raw.answerIndex);
  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;

  const question = String(raw.question ?? '').trim();
  const explanation = String(raw.explanation ?? '').trim();
  if (!question || !explanation) return null;

  const category = CATEGORIES.includes(raw.category) ? raw.category : 'Miscellaneous';

  const q = {
    id: `${idPrefix}-q${seq}`,
    question,
    options,
    answerIndex,
    category,
    explanation,
    background: String(raw.background ?? '').trim() || undefined,
    examRelevance: String(raw.examRelevance ?? '').trim() || undefined,
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 6)
      : [],
  };

  const url = String(raw.sourceUrl ?? '').trim();
  if (url.startsWith('http')) {
    q.source = { title: String(raw.sourceTitle ?? 'Source').trim() || 'Source', url };
  }
  return q;
}
