// Netlify Function: generate-routine
// POST — calls Claude API to generate a personalized skincare routine
// Input: { skinType, concerns, products }
// Returns: { routine } — structured JSON routine with AM/PM steps per day

import Anthropic from '@anthropic-ai/sdk'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const SYSTEM_PROMPT = `You are a licensed esthetician and skincare formulation expert.
Your job is to build a personalised 7-day skincare routine in strict JSON.

Rules:
- Use only the products the user has listed. Do not invent new products.
- If a product should only be used on certain days (e.g. AHA/BHA exfoliants 2–3x/week, retinol 3x/week), reflect that by omitting it on other days.
- Order steps correctly: cleanse → tone → treatment/serum → eye cream → moisturiser → SPF (AM) or face oil/sleeping mask (PM).
- Keep notes brief and practical (max 12 words): timing, layering order, frequency reminders, or any ingredient conflicts.
- If no products are provided, return sensible placeholder step names (e.g. "Gentle cleanser") with category filled in.
- Return ONLY valid JSON — no markdown, no code fences, no commentary.

JSON schema (repeat for all 7 days):
{
  "routine": {
    "monday": {
      "am": [{ "product": "string", "category": "string", "notes": "string" }],
      "pm": [{ "product": "string", "category": "string", "notes": "string" }]
    },
    "tuesday": { ... },
    "wednesday": { ... },
    "thursday": { ... },
    "friday": { ... },
    "saturday": { ... },
    "sunday": { ... }
  }
}

Valid category values: cleanser, toner, exfoliant, serum, treatment, eye-cream, moisturiser, sunscreen, oil, mask, other.`

function buildUserPrompt({ skinType, concerns, products }) {
  const concernList = concerns && concerns.length
    ? concerns.join(', ')
    : 'none specified'

  const productList = products && products.trim()
    ? products.trim()
    : 'none provided'

  return `Skin type: ${skinType}
Concerns: ${concernList}
Current products (one per line):
${productList}

Build a 7-day AM and PM routine using these products.`
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { skinType, concerns, products } = body

  if (!skinType) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'skinType is required' }) }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let raw
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt({ skinType, concerns, products }) }],
    })
    raw = message.content[0].text
  } catch (err) {
    console.error('Claude API error:', err)
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Failed to reach Claude API' }) }
  }

  let routine
  try {
    routine = JSON.parse(raw).routine
    // Validate all 7 days present
    for (const day of DAYS) {
      if (!routine[day]) throw new Error(`Missing day: ${day}`)
    }
  } catch (err) {
    console.error('JSON parse error:', err, '\nRaw output:', raw)
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Claude returned malformed JSON' }) }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ routine }),
  }
}
