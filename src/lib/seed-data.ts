import { getDb } from './db'
import { randomUUID } from 'crypto'

interface SeedEmail {
  from: string
  subject: string
  body: string
  receivedAt: string
  category: string
  urgency: string
  sentiment: string
  confidence: number
  summary: string
  status: string
  assignedTo?: string | null
  autoReplyDraft?: string | null
}

interface CountRow {
  count: number
}

interface SeededEmailRow {
  id: string
  category: string | null
  summary: string | null
  receivedAt: string
}

const SEED_EMAILS: SeedEmail[] = [
  {
    from: 'sarah.chen@acme.io',
    subject: 'Payment declined during checkout — tried 3 times',
    body: 'Hi, I\'ve been trying to complete my purchase for the last 30 minutes but my payment keeps getting declined. I\'ve tried three different credit cards. The error message just says "Payment failed" with no details. This is really frustrating — I need these items for a project deadline tomorrow. My order total is $450. Can someone help me ASAP?',
    receivedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: 'bug_report', urgency: 'critical', sentiment: 'angry', confidence: 0.97,
    summary: 'Payment processing failure during checkout — multiple cards declined with generic error',
    status: 'routed', assignedTo: 'Engineering',
  },
  {
    from: 'james.w@outlook.com',
    subject: 'I\'d like a refund for order #8834',
    body: 'Hello, I received my order #8834 yesterday but the color is completely different from what was shown on the website. The listing showed a navy blue jacket but what I received is more of a teal/green color. I\'d like a full refund please. I can ship the item back at your convenience.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'refund', urgency: 'medium', sentiment: 'neutral', confidence: 0.94,
    summary: 'Refund request for order #8834 — product color mismatch from listing',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi James,\n\nThank you for reaching out about order #8834. I\'m sorry to hear the color didn\'t match what you expected — that\'s definitely not the experience we want for our customers.\n\nI\'ve initiated a full refund for your order. You should see the credit back on your card within 3-5 business days. I\'m also sending you a prepaid return label so you can ship the jacket back at no cost.\n\nIf you\'d like to exchange it instead, just let us know and we\'ll be happy to help.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'maria.lopez@gmail.com',
    subject: 'WRONG ITEM SHIPPED!! This is the second time!!',
    body: 'THIS IS UNACCEPTABLE. I ordered the Premium Widget (SKU-4472) and you sent me the Basic Widget AGAIN. This is the SECOND time this has happened with the same product. I want a full refund AND I want to know what you\'re going to do about your warehouse because clearly nobody there can read a shipping label. I\'ve been a customer for 3 years and I\'m about to take my business elsewhere.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    category: 'complaint', urgency: 'high', sentiment: 'angry', confidence: 0.91,
    summary: 'Repeat wrong item shipped — SKU-4472 fulfillment error, second occurrence, customer threatening to leave',
    status: 'needs_review', assignedTo: 'Senior Support',
    autoReplyDraft: 'Hi Maria,\n\nI sincerely apologize for this repeated error — you\'re absolutely right that this is unacceptable, especially as a valued 3-year customer. I can see this is the second time SKU-4472 was incorrectly fulfilled.\n\nI\'ve escalated this to our warehouse operations team for immediate investigation. In the meantime, I\'ve processed a full refund for your order and I\'m arranging for the correct Premium Widget to be shipped to you today via express delivery at no charge.\n\nYou\'ll receive tracking information within the hour. Again, I\'m truly sorry for the inconvenience.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'dev.tom@startup.co',
    subject: 'Any plans to add Slack integration?',
    body: 'Hey team! Love your product — been using it for about 6 months now. Quick question: do you have any plans to add a Slack integration? It would be super helpful to get notifications in our team channel when certain events happen. Would also love webhook support if that\'s on the roadmap. Keep up the great work!',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    category: 'feature_request', urgency: 'low', sentiment: 'positive', confidence: 0.89,
    summary: 'Feature request for Slack integration and webhook support from satisfied 6-month user',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi Tom,\n\nThanks for the kind words and for being a loyal user! We appreciate the feedback.\n\nGreat news — Slack integration is actually on our Q2 roadmap! We\'re planning to support channel notifications for key events. Webhook support is also something we\'re actively evaluating.\n\nI\'ve added your request to our feature tracker so you\'ll be notified when these launch. In the meantime, feel free to share any specific use cases — it helps us prioritize.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'amy.k@company.org',
    subject: 'Cancel my subscription effective immediately',
    body: 'Please cancel my subscription effective immediately. I\'ve found an alternative that better fits our team\'s needs. My account email is amy.k@company.org. Please confirm the cancellation and let me know if there will be any charges for the remainder of the billing period.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    category: 'cancellation', urgency: 'medium', sentiment: 'negative', confidence: 0.96,
    summary: 'Subscription cancellation request — switching to competitor, wants immediate effect and billing clarity',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi Amy,\n\nI\'m sorry to hear you\'re leaving us. I\'ve initiated the cancellation of your subscription effective today. You won\'t be charged for the remainder of the billing period.\n\nYour account will remain accessible until the end of your current billing cycle so you can export any data you need. If you change your mind, you can reactivate anytime.\n\nWe\'d love to hear what the alternative offers that we\'re missing — your feedback helps us improve for other customers.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'ops@bigclient.com',
    subject: 'Mobile checkout broken — we process 200 orders/day through you',
    body: 'This is urgent. Our entire mobile checkout flow is broken as of this morning. We process approximately 200 orders per day through your platform and right now none of them are going through on mobile. Desktop seems fine. We\'re losing significant revenue every hour this is down. We need an immediate response and ETA on the fix. Our account ID is BC-4401.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: 'bug_report', urgency: 'critical', sentiment: 'negative', confidence: 0.98,
    summary: 'Critical: Mobile checkout completely broken for high-volume client (200 orders/day), revenue impact ongoing',
    status: 'routed', assignedTo: 'Engineering',
  },
  {
    from: 'curious@newuser.io',
    subject: 'How do I export my data as CSV?',
    body: 'Hi there! I just signed up last week and I\'m loving the dashboard so far. Quick question — is there a way to export my data as a CSV file? I need to pull monthly reports for my manager. I looked through the settings but couldn\'t find an export option. Thanks!',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: 'general_inquiry', urgency: 'low', sentiment: 'positive', confidence: 0.92,
    summary: 'New user asking about CSV data export functionality',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi there!\n\nWelcome aboard! Great question. You can export your data as CSV by going to Dashboard → Reports → clicking the download icon in the top right corner. From there, select "Export as CSV" and choose your date range.\n\nIf you need any help setting up automated monthly reports, just let us know!\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'frustrated@user.net',
    subject: 'Your checkout is BROKEN on my phone',
    body: 'I\'ve been trying to buy something for the last hour on my iPhone and the checkout page just spins forever. I\'ve tried Safari and Chrome. This is ridiculous. Fix your mobile site.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    category: 'bug_report', urgency: 'high', sentiment: 'angry', confidence: 0.95,
    summary: 'Mobile checkout infinite loading on iOS — both Safari and Chrome affected',
    status: 'routed', assignedTo: 'Engineering',
  },
  {
    from: 'patient@customer.com',
    subject: 'Refund request for duplicate charge',
    body: 'Hello, I noticed I was charged twice for my order #9021. The amounts are $79.99 each, posted on March 28. Could you please refund the duplicate charge? I\'ve attached screenshots of my bank statement showing both charges. Thank you.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    category: 'refund', urgency: 'high', sentiment: 'neutral', confidence: 0.93,
    summary: 'Duplicate charge refund request for order #9021 — $79.99 charged twice',
    status: 'needs_review', assignedTo: 'Manager',
    autoReplyDraft: 'Hi there,\n\nThank you for bringing the duplicate charge to our attention. I can see both charges of $79.99 on your account for order #9021.\n\nI\'ve submitted a refund for the duplicate charge. You should see the $79.99 credit back on your statement within 3-5 business days.\n\nI apologize for the inconvenience. If you don\'t see the refund within that timeframe, please don\'t hesitate to reach out.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'mobile.user@gmail.com',
    subject: 'Checkout crashes on Android phone',
    body: 'Hey, just wanted to report that the checkout page crashes on my Pixel 7 when I tap "Place Order". It happens every time. I\'m using Chrome 122. Same thing happened to my friend on their Samsung. Thought you should know.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    category: 'bug_report', urgency: 'high', sentiment: 'neutral', confidence: 0.96,
    summary: 'Checkout crash on Android devices — Pixel 7 and Samsung, Chrome browser',
    status: 'routed', assignedTo: 'Engineering',
  },
  {
    from: 'loyal@customer.org',
    subject: 'Love your product but checkout was glitchy today',
    body: 'Hi! Long-time customer here. Just wanted to flag that the mobile checkout was acting weird today — the page took forever to load and I had to try twice before my order went through. Not a huge deal since it eventually worked, but thought you\'d want to know. Keep up the otherwise great work!',
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    category: 'bug_report', urgency: 'medium', sentiment: 'positive', confidence: 0.88,
    summary: 'Intermittent mobile checkout slowness reported by loyal customer — eventually successful',
    status: 'needs_review', assignedTo: null,
    autoReplyDraft: 'Hi there,\n\nThank you so much for taking the time to report this — and for your continued support! We really appreciate loyal customers like you.\n\nWe\'re aware of some mobile checkout performance issues today and our engineering team is actively investigating. Your report helps us pinpoint the scope of the problem.\n\nWe expect to have this resolved shortly. Thank you for your patience!\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'bulk.buyer@enterprise.co',
    subject: 'Need to cancel and get refund for annual plan',
    body: 'We need to cancel our annual enterprise plan and request a prorated refund. Our company is going through restructuring and we\'re consolidating all SaaS tools. Account: ENT-2240. We have 8 months remaining on the annual commitment. Please process this as soon as possible.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'cancellation', urgency: 'high', sentiment: 'neutral', confidence: 0.91,
    summary: 'Enterprise annual plan cancellation with prorated refund request — 8 months remaining, company restructuring',
    status: 'needs_review', assignedTo: 'Manager',
    autoReplyDraft: 'Hi there,\n\nI understand — company restructuring is never easy. I\'ve noted your cancellation request for account ENT-2240.\n\nSince this involves an annual enterprise plan with a prorated refund, I\'ve escalated this to our accounts team for review. Someone will reach out within 24 hours to discuss the details and process your refund.\n\nIn the meantime, your service will continue uninterrupted.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'happy@user.com',
    subject: 'Would love dark mode!',
    body: 'Hey! Quick suggestion — would you consider adding a dark mode option? I use your dashboard late at night and the white background is pretty harsh on the eyes. Would be awesome to have a toggle in settings. Thanks!',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: 'feature_request', urgency: 'low', sentiment: 'positive', confidence: 0.94,
    summary: 'Feature request for dark mode toggle in dashboard settings',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi there!\n\nGreat suggestion! Dark mode is one of our most requested features and it\'s definitely on our radar. I\'ve added your vote to the feature request.\n\nWe\'ll make sure to notify you when it launches. Thanks for the feedback!\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'confused@newbie.io',
    subject: 'How does billing work?',
    body: 'Hi, I\'m considering upgrading to the Pro plan but I\'m a bit confused about the billing. If I upgrade mid-cycle, do I get charged the full amount or is it prorated? Also, can I switch back to the free plan anytime? Thanks for clarifying.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    category: 'general_inquiry', urgency: 'low', sentiment: 'neutral', confidence: 0.90,
    summary: 'Pre-purchase billing inquiry about Pro plan — prorated charges and downgrade flexibility',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi there!\n\nGreat questions! Here\'s how our billing works:\n\n1. **Mid-cycle upgrade**: You\'ll only be charged the prorated amount for the remaining days in your current billing cycle.\n2. **Downgrading**: You can switch back to the free plan at any time. Your Pro features will remain active until the end of your billing period.\n\nNo long-term commitments required! If you have any other questions about the Pro plan, feel free to ask.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'angry.merchant@shop.com',
    subject: 'RE: RE: RE: Still waiting for my refund!!!',
    body: 'This is my FOURTH email about this. I was promised a refund 2 weeks ago and NOTHING has happened. Order #7761. $234.50. I want my money back TODAY or I\'m filing a chargeback and leaving a review on every site I can find. This is the worst customer service I\'ve ever experienced.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    category: 'complaint', urgency: 'critical', sentiment: 'angry', confidence: 0.99,
    summary: 'Escalated complaint — 4th email about unfulfilled refund promise ($234.50), threatening chargeback and negative reviews',
    status: 'routed', assignedTo: 'Senior Support',
  },
  {
    from: 'tech.lead@startup.io',
    subject: 'API rate limiting question',
    body: 'Hi, we\'re integrating your API into our platform and need clarification on rate limits. The docs say 100 requests/minute but we need about 500/minute during peak hours. Is there an enterprise tier with higher limits? Also, do you support webhooks for real-time events?',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    category: 'general_inquiry', urgency: 'medium', sentiment: 'neutral', confidence: 0.87,
    summary: 'API rate limit inquiry — needs 500 req/min (5x standard), asking about enterprise tier and webhooks',
    status: 'needs_review', assignedTo: null,
    autoReplyDraft: 'Hi there,\n\nThanks for your interest in our API! For higher rate limits, we do offer enterprise plans with custom limits tailored to your usage patterns.\n\nI\'d recommend scheduling a quick call with our solutions team to discuss your specific needs. They can set up a custom plan that supports your 500 req/min requirement.\n\nRegarding webhooks — yes, we support real-time event webhooks on our Pro and Enterprise plans.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'password.reset@helpme.com',
    subject: 'Can\'t reset my password on Safari',
    body: 'I\'ve been trying to reset my password using the "Forgot Password" link but nothing happens when I click the submit button on Safari. I tried on Chrome and it worked fine. Just wanted to let you know about the Safari issue. My account email is help@helpme.com.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    category: 'bug_report', urgency: 'medium', sentiment: 'neutral', confidence: 0.92,
    summary: 'Password reset form broken on Safari — submit button non-functional, works on Chrome',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi there,\n\nThank you for reporting this Safari-specific issue! We\'ve confirmed the bug and our engineering team is working on a fix.\n\nIn the meantime, please use Chrome or Firefox to reset your password. We apologize for the inconvenience and expect to have the Safari fix deployed within the next day or two.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'safari.user@mac.com',
    subject: 'Password reset page broken in Safari 17',
    body: 'The forgot password page doesn\'t work in Safari 17 on macOS Sonoma. The reset button is unresponsive. I had to switch to Firefox to reset my password. This seems like a WebKit compatibility issue.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    category: 'bug_report', urgency: 'medium', sentiment: 'neutral', confidence: 0.91,
    summary: 'Password reset broken in Safari 17/macOS Sonoma — WebKit compatibility issue, unresponsive button',
    status: 'auto_replied', assignedTo: null,
    autoReplyDraft: 'Hi there,\n\nThanks for the detailed report! We\'re aware of this Safari 17 compatibility issue and it\'s in our bug fix queue. You\'re right that it appears to be a WebKit-specific problem.\n\nWe appreciate you taking the time to report it — your details about the specific Safari and macOS version are very helpful for our debugging.\n\nBest regards,\nThe Support Team',
  },
  {
    from: 'wrong.item@buyer.net',
    subject: 'Received wrong product - SKU 4472',
    body: 'Hello, I ordered the Premium Widget (SKU-4472) but received the Standard Widget instead. This is my first order with you so I\'m hoping this is just a one-time mistake. Order number is #10234. Can I get the correct item shipped?',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    category: 'complaint', urgency: 'medium', sentiment: 'neutral', confidence: 0.88,
    summary: 'Wrong item shipped — ordered Premium Widget (SKU-4472), received Standard Widget, first-time buyer',
    status: 'needs_review', assignedTo: null,
    autoReplyDraft: 'Hi there,\n\nI\'m sorry about the mix-up with your order! I can see that SKU-4472 (Premium Widget) should have been shipped instead of the Standard Widget.\n\nI\'ve arranged for the correct Premium Widget to be shipped to you right away. You\'ll receive tracking information shortly. Please keep the Standard Widget as a courtesy — no need to return it.\n\nWe want to make sure your first experience with us is a positive one!\n\nBest regards,\nThe Support Team',
  },
]

type SeedMode = 'demo' | 'unclassified'

interface SeedOptions {
  reset?: boolean
  mode?: SeedMode
}

function resetDatabase() {
  const db = getDb()
  db.exec(`
    DELETE FROM clusters;
    DELETE FROM emails;
    DELETE FROM settings;
  `)
}

export function seedDatabase(options: SeedOptions = {}) {
  const db = getDb()
  const mode = options.mode || 'demo'

  if (options.reset) {
    resetDatabase()
  }

  const existing = (db.prepare('SELECT COUNT(*) as count FROM emails').get() as CountRow).count

  if (existing > 0) return { seeded: 0, message: 'Database already has data' }

  const insert = db.prepare(`
    INSERT INTO emails (id, gmailId, threadId, "from", subject, body, receivedAt, category, urgency, sentiment, confidence, summary, status, assignedTo, autoReplyDraft, clusterId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `)

  const insertAll = db.transaction(() => {
    for (const email of SEED_EMAILS) {
      const id = randomUUID()
      const isDemoMode = mode === 'demo'

      insert.run(
        id, `gmail_${id.slice(0, 8)}`, `thread_${id.slice(0, 8)}`,
        email.from, email.subject, email.body, email.receivedAt,
        isDemoMode ? email.category : null,
        isDemoMode ? email.urgency : null,
        isDemoMode ? email.sentiment : null,
        isDemoMode ? email.confidence : 0,
        isDemoMode ? email.summary : null,
        isDemoMode ? email.status : 'new',
        isDemoMode ? email.assignedTo || null : null,
        isDemoMode ? email.autoReplyDraft || null : null
      )
    }
  })

  insertAll()

  if (mode === 'unclassified') {
    return { seeded: SEED_EMAILS.length, clusters: 0, mode }
  }

  // Also seed clusters based on the known patterns
  const emails = db.prepare('SELECT id, category, summary, receivedAt FROM emails').all() as SeededEmailRow[]
  let clusterCount = 0

  // Checkout bug cluster
  const checkoutBugs = emails.filter((e) =>
    e.category === 'bug_report' && (e.summary?.toLowerCase().includes('checkout') || e.summary?.toLowerCase().includes('mobile'))
  )
  if (checkoutBugs.length >= 2) {
    const clusterId = randomUUID()
    const dates = checkoutBugs.map((e) => e.receivedAt).sort()
    db.prepare(`INSERT INTO clusters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      clusterId, 'Checkout payment failing on mobile', 'bug_report',
      checkoutBugs.length, dates[0], dates[dates.length - 1],
      'critical', 1, 'Escalate to engineering immediately',
      JSON.stringify(checkoutBugs.map((e) => e.id))
    )
    for (const e of checkoutBugs) {
      db.prepare('UPDATE emails SET clusterId = ? WHERE id = ?').run(clusterId, e.id)
    }
    clusterCount++
  }

  // Wrong item cluster
  const wrongItems = emails.filter((e) =>
    e.summary?.toLowerCase().includes('wrong item') || e.summary?.toLowerCase().includes('sku-4472')
  )
  if (wrongItems.length >= 2) {
    const clusterId = randomUUID()
    const dates = wrongItems.map((e) => e.receivedAt).sort()
    db.prepare(`INSERT INTO clusters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      clusterId, 'Wrong item shipped — fulfillment error', 'complaint',
      wrongItems.length, dates[0], dates[dates.length - 1],
      'high', 0, 'Flag to operations, check warehouse SKU-4472',
      JSON.stringify(wrongItems.map((e) => e.id))
    )
    for (const e of wrongItems) {
      db.prepare('UPDATE emails SET clusterId = ? WHERE id = ?').run(clusterId, e.id)
    }
    clusterCount++
  }

  // Safari password reset cluster
  const safariIssues = emails.filter((e) =>
    e.summary?.toLowerCase().includes('safari') || e.summary?.toLowerCase().includes('password reset')
  )
  if (safariIssues.length >= 2) {
    const clusterId = randomUUID()
    const dates = safariIssues.map((e) => e.receivedAt).sort()
    db.prepare(`INSERT INTO clusters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      clusterId, 'Password reset not working on Safari', 'bug_report',
      safariIssues.length, dates[0], dates[dates.length - 1],
      'medium', 0, 'Add to bug backlog, Safari WebKit issue',
      JSON.stringify(safariIssues.map((e) => e.id))
    )
    for (const e of safariIssues) {
      db.prepare('UPDATE emails SET clusterId = ? WHERE id = ?').run(clusterId, e.id)
    }
    clusterCount++
  }

  return { seeded: SEED_EMAILS.length, clusters: clusterCount, mode }
}
