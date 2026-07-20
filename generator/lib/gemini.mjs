// Thin Gemini REST client with structured JSON output + retries.
// Uses fetch (Node 18+) so there is no SDK dependency to drift.

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {object} p
 * @param {string} p.apiKey
 * @param {string} p.model              e.g. "gemini-2.5-flash"
 * @param {string} p.prompt
 * @param {object} p.schema             responseSchema
 * @param {number} [p.maxOutputTokens]
 * @param {number} [p.temperature]
 * @returns {Promise<object>} parsed JSON object
 */
export async function generateJSON({
  apiKey,
  model,
  prompt,
  schema,
  maxOutputTokens = 60000,
  temperature = 0.7,
}) {
  const url = `${API_ROOT}/${model}:generateContent`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature,
      maxOutputTokens,
    },
  };

  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status >= 500) {
        throw new Error(`retryable HTTP ${res.status}: ${await res.text()}`);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const cand = data.candidates?.[0];
      const text = cand?.content?.parts?.map((p) => p.text).join('') ?? '';
      if (!text) {
        throw new Error(
          `Empty response (finishReason=${cand?.finishReason ?? 'unknown'})`,
        );
      }
      return JSON.parse(text);
    } catch (e) {
      lastErr = e;
      const retryable =
        /retryable|ECONNRESET|ETIMEDOUT|network|fetch failed|Unexpected token/i.test(
          String(e?.message),
        );
      if (attempt < 4 && retryable) {
        const wait = 1500 * attempt;
        console.warn(`  · attempt ${attempt} failed (${e.message}); retrying in ${wait}ms`);
        await sleep(wait);
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}
