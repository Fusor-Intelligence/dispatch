import Anthropic from '@anthropic-ai/sdk'
import type { ClassificationResult, Severity } from './types'

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
export const CLASSIFICATION_FAILURE_SUMMARY = 'Classification failed - requires manual review'

const CLASSIFICATION_SYSTEM_PROMPT = `You are an AI customer support classifier. Analyze the email and return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

Required JSON schema:
{
  "category": "refund" | "cancellation" | "bug_report" | "feature_request" | "general_inquiry" | "complaint",
  "urgency": "low" | "medium" | "high" | "critical",
  "sentiment": "positive" | "neutral" | "negative" | "angry",
  "confidence": 0.0-1.0,
  "summary": "one sentence summary"
}

Rules:
- category: classify the primary intent of the email
- choose "complaint" for fulfillment/shipping mistakes, repeated service failures, or customer frustration about something going wrong, even if they also ask for a refund
- choose "refund" only when the primary intent is getting money back for an otherwise understood issue
- choose "feature_request" only when they are asking for a new capability; questions about current limits, billing, exports, or how something works are "general_inquiry"
- urgency: critical = service down/data loss, high = revenue impact/multiple users, medium = single user issue, low = question/suggestion
- sentiment: angry = all caps/threats/profanity, negative = frustration/disappointment, neutral = factual, positive = praise/thanks
- confidence: how certain you are about the classification (0.0-1.0); use the full range and avoid reusing the same score unless the evidence is equally strong
- summary: one concise sentence describing the core issue`

const REPLY_SYSTEM_PROMPT = `You are a helpful customer support agent. Write a professional, empathetic reply to the customer email. Keep it concise (2-3 short paragraphs max). Address their specific issue. Be warm but professional. Do not make promises you can't keep. Sign off as "The Support Team".

Rules:
- Personalize the greeting with the sender's name only if it is clearly available in the email address or signature
- Never use placeholders like [Customer Name], [Client Name], or similar
- Do not invent refunds, credits, timelines, roadmap commitments, or policy exceptions that were not stated
- If the exact resolution is unknown, acknowledge the issue and explain the next reasonable step without overpromising

Return ONLY the reply text, no JSON wrapping.`

const CLUSTER_SYSTEM_PROMPT = `You are analyzing customer support email summaries to identify recurring issues. Group related emails into clusters.

Return ONLY valid JSON array with no markdown formatting:
[
  {
    "title": "short descriptive title of the issue pattern",
    "emailIds": ["id1", "id2"],
    "severity": "critical" | "high" | "medium" | "low",
    "suggestedAction": "recommended action to resolve"
  }
]

Rules:
- Only create a cluster if 2+ emails share the same root cause
- severity: critical = service outage affecting many users, high = significant bug/revenue impact, medium = recurring annoyance, low = minor pattern
- Group fulfillment mistakes like wrong item shipped / wrong product / SKU mismatches together even if one email also asks for a refund
- Be specific in titles (not "various issues" but "checkout payment failing on mobile Safari")`

export function parseJsonPayload<T>(raw: string): T {
  let cleaned = raw.trim()
  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(cleaned)
}

export function isClassificationFailure(result: ClassificationResult): boolean {
  return result.confidence === 0 && result.summary === CLASSIFICATION_FAILURE_SUMMARY
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function getGreetingName(from: string): string | null {
  const namedMatch = from.match(/^(.*?)(?:\s*<[^>]+>)?$/)
  const rawName = namedMatch?.[1]?.trim().replace(/^"+|"+$/g, '')
  if (rawName && !rawName.includes('@')) {
    return toTitleCase(rawName)
  }

  const emailMatch = from.match(/([A-Z0-9._%+-]+)@/i)
  const localPart = emailMatch?.[1]
  if (!localPart) return null

  const genericTokens = new Set([
    'admin',
    'angry',
    'billing',
    'bulk',
    'buyer',
    'client',
    'curious',
    'customer',
    'demo',
    'dev',
    'frustrated',
    'help',
    'merchant',
    'noreply',
    'ops',
    'password',
    'reset',
    'safari',
    'sales',
    'shop',
    'support',
    'team',
    'user',
    'wrong',
  ])
  const parts = localPart
    .split(/[._-]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

  const looksLikeHumanName = parts.length > 0
    && parts.length <= 2
    && parts.every((part) => /^[a-z]+$/i.test(part) && part.length > 1 && !genericTokens.has(part))

  if (!looksLikeHumanName) return null

  const cleaned = parts.join(' ')

  return cleaned ? toTitleCase(cleaned) : null
}

function sanitizeReply(reply: string, from: string): string {
  const greetingName = getGreetingName(from)
  const greeting = greetingName ? `Hi ${greetingName},` : 'Hi there,'

  return reply
    .trim()
    .replace(/^Subject:.*\n+/i, '')
    .replace(/^\s*(Dear|Hi)\s+\[[^\]]+\],/i, greeting)
    .replace(/^\s*(Dear|Hi)\s+[^,\n]*@[^,\n]*,/i, greeting)
    .replace(/\[(Customer'?s Name|Client Name|Customer Name)\]/gi, greetingName || 'there')
    .trim()
}

async function callMiniMax(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`MiniMax API error: ${response.status} ${response.statusText} - ${details}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part: { text?: string }) => part?.text)
      .filter(Boolean)
      .join('\n')
    if (text) return text
  }

  if (typeof data?.reply === 'string') {
    return data.reply
  }

  throw new Error(`MiniMax response missing message content: ${JSON.stringify(data).slice(0, 500)}`)
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  const block = message.content[0]
  if (block.type === 'text') return block.text
  throw new Error('Unexpected response type from Claude')
}

async function callAI(systemPrompt: string, userPrompt: string, requireJson: boolean = false): Promise<string> {
  // Try MiniMax first (primary)
  try {
    const result = await callMiniMax(systemPrompt, userPrompt)
    if (requireJson) {
      parseJsonPayload(result) // validate it parses
    }
    return result
  } catch (firstError) {
    // Retry MiniMax once with stricter prompt if JSON parse failed
    if (requireJson) {
      try {
        const strictPrompt = systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code fences.'
        const result = await callMiniMax(strictPrompt, userPrompt)
        parseJsonPayload(result)
        return result
      } catch {
        // Fall through to Claude
      }
    }

    // Fallback to Claude
    try {
      console.warn('MiniMax failed, falling back to Claude:', firstError)
      return await callClaude(systemPrompt, userPrompt)
    } catch (claudeError) {
      console.error('Both MiniMax and Claude failed:', claudeError)
      throw new Error('All AI providers failed')
    }
  }
}

export async function classifyEmail(from: string, subject: string, body: string): Promise<ClassificationResult> {
  const userPrompt = `From: ${from}\nSubject: ${subject}\n\n${body.slice(0, 2000)}`

  try {
    const result = await callAI(CLASSIFICATION_SYSTEM_PROMPT, userPrompt, true)
    return parseJsonPayload<ClassificationResult>(result)
  } catch {
    // If all AI fails, return a needs_review classification
    return {
      category: 'general_inquiry',
      urgency: 'medium',
      sentiment: 'neutral',
      confidence: 0,
      summary: CLASSIFICATION_FAILURE_SUMMARY,
    }
  }
}

export async function generateReply(from: string, subject: string, body: string, category: string): Promise<string> {
  const userPrompt = `Category: ${category}\nFrom: ${from}\nSubject: ${subject}\n\n${body.slice(0, 2000)}`
  const reply = await callAI(REPLY_SYSTEM_PROMPT, userPrompt, false)
  return sanitizeReply(reply, from)
}

export async function clusterIssues(summaries: { id: string; summary: string; category: string }[]): Promise<Array<{ title: string; emailIds: string[]; severity: Severity; suggestedAction: string }>> {
  const userPrompt = summaries
    .map((s) => `[${s.id}] (${s.category}) ${s.summary}`)
    .join('\n')

  const result = await callAI(CLUSTER_SYSTEM_PROMPT, userPrompt, true)
  return parseJsonPayload(result)
}
