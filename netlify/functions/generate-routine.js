// Netlify Function: generate-routine
// POST — calls Claude API to generate a personalized skincare routine
// Input: { skinType, concerns, products }
// Returns: { routine, essentials, recommendations }

import Anthropic from '@anthropic-ai/sdk'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const SYSTEM_PROMPT = `You are a licensed esthetician and skincare formulation expert trained on r/SkincareAddiction guidelines.
Your job is to build a personalised 7-day skincare routine in strict JSON.

ROUTINE ORDER (strict, apply within each AM and PM slot):
1. Cleansers — always first; removes dirt, sebum, and preps skin for actives.
2. pH-dependent actives, ordered lowest to highest pH:
   a. L-Ascorbic Acid Vitamin C (pH <3.5) — AM only
   b. BHAs (pH ~3.5) — PM preferred, max 2–3x/week
   c. AHAs (pH <4) — PM preferred, max 2–3x/week
   d. Benzoyl Peroxide
   e. Retinoids (retinol, tretinoin, Retin-A, adapalene) — PM only, apply to dry skin
3. Non-pH-dependent actives (niacinamide, azelaic acid in thick format, etc.)
4. Everything else, thin to thick: hydrating toners → serums → essences → lotions → creams → moisturiser → balms/occlusives
5. Sunscreen — ALWAYS last in AM, never included in PM.

KEY RULES:
- Sunscreen is mandatory in AM if the user has any of these concerns: hyperpigmentation, anti-aging, acne (retinoids/AHAs/BHAs make skin sun-sensitive). If no sunscreen is in their product list, add a placeholder step: product "Broad spectrum SPF 30+", category "sunscreen", note "Essential — add a sunscreen to complete your AM routine".
- Retinoids (retinol, tretinoin, Retin-A, adapalene): PM only, never AM. Max 3x/week for beginners. Apply to completely dry skin — wait 20 min after cleansing.
- AHAs/BHAs: PM preferred. Max 2–3x/week. Never schedule on the same night as retinoids.
- Vitamin C (L-Ascorbic Acid): AM only, immediately after cleansing. Pairs well with SPF.
- Benzoyl peroxide and retinoids: never on the same night — they deactivate each other.
- Niacinamide: can appear in both AM and PM; place after actives.
- Occlusives (Vaseline, Aquaphor, sleeping masks): always last step in PM.
- If a product has no obvious time of day, use ingredient knowledge to assign it correctly.
- If the user lists very few products (1–2 items): fill gaps with clearly labelled placeholder steps, e.g. product "Gentle cleanser (recommended)", category "cleanser", note explaining why it is needed.
- Schedule active-rest days: if retinoids or exfoliants were used on a given night, the following night should be free of those actives. Plan the full 7-day schedule with this in mind.
- Use only the products the user has listed (plus any required placeholders). Do not invent new products.
- Keep notes brief and practical (max 12 words): layering order, frequency reminders, ingredient conflicts, or application tips.
- Normalize product names: correct spelling mistakes, expand brand shorthand (e.g. "cerave" → "CeraVe", "la roche" → "La Roche-Posay", "TO" or "the ordinary" → "The Ordinary"), and identify the correct category from the full product name even when partially spelled. Examples: "cetaphil gentel cleansr" → "Cetaphil Gentle Skin Cleanser" (cleanser); "niacinamid" → "Niacinamide 10% + Zinc" (serum); "vit c" or "vitaminc" → "Vitamin C Serum" (serum). Always output the correctly spelled, properly capitalized product name in the JSON — never the user's raw misspelled input.
- Return ONLY valid JSON — no markdown, no code fences, no commentary.

JSON schema:
{
  "routine": {
    "monday": {
      "am": [{ "product": "string", "category": "string", "notes": "string" }],
      "pm": [{ "product": "string", "category": "string", "notes": "string" }]
    },
    "tuesday": { "am": [...], "pm": [...] },
    "wednesday": { "am": [...], "pm": [...] },
    "thursday": { "am": [...], "pm": [...] },
    "friday": { "am": [...], "pm": [...] },
    "saturday": { "am": [...], "pm": [...] },
    "sunday": { "am": [...], "pm": [...] }
  },
  "essentials": {
    "cleanser": true,
    "moisturiser": false,
    "sunscreen": true
  },
  "recommendations": [
    { "product": "string", "reason": "string" }
  ]
}

"essentials" rules:
- Set each boolean by intelligently reading the user's product list using skincare product knowledge, not simple keyword matching.
- cleanser: true if any product is a face wash, cleansing gel/foam/balm/oil/micellar water, or any product whose primary function is cleansing.
- moisturiser: true if any product is a moisturiser, hydrating cream, lotion, gel-cream, barrier cream, or any product whose primary function is hydration/occlusion (not sunscreen).
- sunscreen: true if any product contains SPF or is a UV protection product (e.g. "Biore UV", "Altruist SPF", "La Roche-Posay Anthelios", "Neutrogena Ultra Sheer" etc.).
- Recognise products by brand knowledge: "CeraVe" alone → moisturiser; "Cetaphil" alone → cleanser or moisturiser depending on context; "Biore UV" → sunscreen; "COSRX Snail 96" → serum, not moisturiser.

"recommendations" rules:
- Suggest 2–4 products the user would benefit from but does not currently own, based on their skin type, concerns, and essentials gaps.
- Each item: a properly named product ("product") and a concise one-sentence reason ("reason", max 15 words).
- Only recommend if there is a genuine gap — do not pad.

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

  let routine, essentials, recommendations
  try {
    const parsed = JSON.parse(raw)
    routine = parsed.routine
    essentials = parsed.essentials
    recommendations = parsed.recommendations

    // Validate routine
    for (const day of DAYS) {
      if (!routine[day]) throw new Error(`Missing day: ${day}`)
    }
    // Validate essentials
    for (const key of ['cleanser', 'moisturiser', 'sunscreen']) {
      if (typeof essentials?.[key] !== 'boolean') throw new Error(`essentials.${key} missing or not boolean`)
    }
    // Normalise recommendations to array
    if (!Array.isArray(recommendations)) recommendations = []
  } catch (err) {
    console.error('JSON parse error:', err, '\nRaw output:', raw)
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Claude returned malformed JSON' }) }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ routine, essentials, recommendations }),
  }
}
