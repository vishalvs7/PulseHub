export type DocSection = {
  heading?: string;
  body: string[];
  bullets?: string[];
};

export type AcademyDoc = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  module: string;
  sections: DocSection[];
};

export type AcademyModule = {
  id: string;
  title: string;
  description: string;
  icon: string;
  docs: string[]; // doc slugs, ordered
};

export const academyModules: AcademyModule[] = [
  {
    id: 'algorithm-seo',
    title: 'Algorithm & Social SEO',
    description: 'How ranking works and how to make content discoverable.',
    icon: 'Zap',
    docs: ['the-3-second-hook', 'caption-seo', 'rising-audio', 'viewer-retention'],
  },
  {
    id: 'monetization',
    title: 'Monetization & Deals',
    description: 'Pricing, pitching, and closing brand collaborations.',
    icon: 'BadgeDollarSign',
    docs: ['pricing-sponsorships', 'usage-rights', 'pitching-brands', 'rejecting-lowballs'],
  },
  {
    id: 'workflow',
    title: 'Workflow Efficiency',
    description: 'Produce more with consistent, repeatable processes.',
    icon: 'Workflow',
    docs: ['batch-production', 'repurposing', 'content-sprint'],
  },
  {
    id: 'policy',
    title: 'Platform Policy & Compliance',
    description: 'Stay compliant with disclosure rules and API-approved language.',
    icon: 'Shield',
    docs: ['editorial-guidelines', 'pre-publish-checklist'],
  },
];

export const academyDocs: AcademyDoc[] = [
  {
    slug: 'the-3-second-hook',
    title: 'The 3-Second Hook',
    description: 'Win the first seconds so viewers stay and the algorithm promotes you.',
    readTime: '4 min read',
    module: 'algorithm-seo',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Every social platform optimizes for retention. A feed post that keeps a viewer watching for three seconds outperforms one that loses them immediately — even if the latter has more likes or shares.',
          'This document explains how to construct an opening that stops the scroll, and how to test whether your hooks are actually working.',
        ],
      },
      {
        heading: 'Why the first 3 seconds matter',
        body: [
          'Platforms use signals like average watch time, rewatch rate, and save rate to decide which content to surface. If your audience leaves within the first seconds, the platform interprets that as low quality and reduces distribution.',
          'A strong hook also carries a compounding effect: higher retention leads to more reach, which leads to more followers, which makes the next post more likely to perform.',
        ],
        bullets: [
          'Average watch time is the dominant ranking signal for short-form video.',
          'The first second decides whether a viewer stays for the second and third.',
          'Hooks that raise curiosity outperform hooks that only describe the content.',
        ],
      },
      {
        heading: 'Hook formulas that work',
        body: [
          'Copy-and-paste patterns are not required, but these four structures consistently delay the scroll decision:',
        ],
        bullets: [
          'The open loop — state a result and withhold the "how": "I went viral 4 times in 30 days. Here is the one thing nobody talks about."',
          'The contrarian claim — challenge a widely held belief: "Stop posting at 6 PM. Your best time is probably wrong."',
          'The specific promise — lead with a precise, believable number: "This caption got 210,000 views. I am rewriting it in front of you."',
          'The immediate visual — motion, a changed frame, or an on-screen caption in the first second, even before you speak.',
        ],
      },
      {
        heading: 'How to verify your hooks',
        body: [
          'Pull the retention graph for your last ten posts. Note the average watch percentage at the 3-second mark. If most viewers drop before 3 seconds, the hook is the problem, not the topic.',
          'A/B test by publishing the same video with two different opening lines to two platforms, or re-uploading the same script with a new first line after 2–3 weeks.',
        ],
      },
    ],
  },
  {
    slug: 'caption-seo',
    title: 'Caption & Keyword SEO',
    description: 'Optimize captions, alt text, and hashtags for search and discovery.',
    readTime: '4 min read',
    module: 'algorithm-seo',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Search is now a first-class discovery surface on every major platform. Instagram keyword search, TikTok search, and LinkedIn search all index your captions and profile text.',
          'This document defines how to structure captions so they rank for the searches your audience actually performs.',
        ],
      },
      {
        heading: 'How platform search works',
        body: [
          'Search engines match the text you publish against the queries people type. If a user searches "best budget microphone" and your caption mentions it, your post becomes eligible for that query.',
          'Posting a keyword-rich caption costs nothing and keeps working for months, unlike a story that expires in 24 hours.',
        ],
        bullets: [
          'First sentence is weighted most heavily by most platforms.',
          'Hashtags contribute to discovery but no longer dominate it.',
          'Alt text and audio captions are indexed as well.',
        ],
      },
      {
        heading: 'Caption structure',
        body: [
          'Lead with the primary keyword naturally in the first line. Follow with supporting detail and a question or call to action. Add 3–5 relevant hashtags only.',
          'Write the caption for a human first and a search engine second. Keyword stuffing reads badly and triggers spam detection.',
        ],
      },
      {
        heading: 'Hashtag strategy',
        body: [
          'Use a mix of broad, niche, and exact-match tags. Broad tags like #travel have volume but brutal competition; niche tags like #soloindiatravel convert better.',
          'The safe-zone hashtag detector in the Pre-Publish Checklist is a good baseline: 3–5 tags, all relevant, none banned or unrelated.',
        ],
      },
    ],
  },
  {
    slug: 'rising-audio',
    title: 'Surfing Rising Audio',
    description: 'Use trending and emerging sounds before they peak.',
    readTime: '3 min read',
    module: 'algorithm-seo',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Sound is a distribution lever, not a decoration. Platforms surface posts using audio that is accelerating in usage, which means posting early in an audio trend can borrow the wave.',
          'This document explains how to identify rising audio and how to ride it without spamming your feed.',
        ],
      },
      {
        heading: 'The audio curve',
        body: [
          'Every trending sound has a lifecycle: emerging, peaking, and saturated. Posting during the emerging phase gives you a head start; posting during saturation means you compete with thousands of near-identical videos.',
          'The same applies to topical trends on X and LinkedIn — timely takes perform, recycled takes do not.',
        ],
      },
      {
        heading: 'How to find rising audio',
        body: [
          'Open the sounds search and sort by trending. Compare a sound usage count to the number of high-view videos using it. If usage is high but top videos are small, the sound is still rising.',
          'Check sounds used by accounts that grew quickly in the last two weeks — early adopters often indicate a wave is forming.',
        ],
      },
      {
        heading: 'Guidelines',
        body: [
          'Only use audio relevant to your content. The algorithm values matching sound to topic, and mismatched audio confuses the recommendation engine.',
          'If a sound peaks and saturates, skip it. Your effort is better spent on the next rising one.',
        ],
      },
    ],
  },
  {
    slug: 'viewer-retention',
    title: 'Viewer Retention',
    description: 'Structure videos to keep viewers watching until the end.',
    readTime: '4 min read',
    module: 'algorithm-seo',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Retention is the sum of every second a viewer spends on your content. Improving retention by a few percentage points reliably increases distribution more than any posting-time trick.',
          'This document breaks a video into its parts and explains how to keep each part tight.',
        ],
      },
      {
        heading: 'The retention graph',
        body: [
          'In your analytics, the retention graph shows watch percentage over time. A healthy short-form video holds 70%+ of viewers at 3 seconds and finishes above 20%.',
          'A flat line near the top means the audience is engaged; a steep drop anywhere signals a weak section to re-cut.',
        ],
      },
      {
        heading: 'Section by section',
        body: [
          'Front-load the payoff promise, deliver value early, and leave one small thing unresolved until the final seconds to pull viewers across the finish line.',
        ],
        bullets: [
          'Intro: state the promise in under 2 seconds; never show logos, intros, or "before we start" filler.',
          'Middle: keep edits every 1–2 seconds, cut pauses, and change the frame when energy dips.',
          'End: end on a loop or a resolved answer — never a "thanks for watching" tail.',
        ],
      },
    ],
  },
  {
    slug: 'pricing-sponsorships',
    title: 'Pricing Sponsorships',
    description: 'Set a defensible rate using the cost-per-engaged-view method.',
    readTime: '5 min read',
    module: 'monetization',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Most creators price by follower count. That is the metric brands care least about. Pricing by engagement is defensible, easier to justify, and usually raises your rate.',
          'This document defines the cost-per-engaged-view method used by the PulseHub Rate Calculator.',
        ],
      },
      {
        heading: 'The benchmark model',
        body: [
          'The calculator estimates your engaged audience as followers × engagement rate, then multiplies by a niche cost-per-engaged-view benchmark. For example, 100,000 engaged viewers at ₹4–8 per engaged viewer suggests a baseline ₹4–8 lakh range for a full campaign.',
          'Your actual rate depends on audience quality, region, usage rights, and exclusivity — treat the calculator output as a floor, not a ceiling.',
        ],
      },
      {
        heading: 'Building your rate card',
        body: [
          'Create a one-page rate card with three tiers: story/post, long-form video, and dedicated campaign with usage rights. Revisit it every quarter as your engagement metrics change.',
          'Never publish a static price for "everything." Scope-specific pricing signals professionalism and protects you from scope creep.',
        ],
      },
      {
        heading: 'Negotiation rules',
        body: [
          'Quote the number first and stay silent. The first number anchors the conversation, and most brands counter with a number still above your floor.',
          'If a brand requests changes that add production cost — reshoots, extra formats, usage rights — add to the rate instead of absorbing it.',
        ],
      },
    ],
  },
  {
    slug: 'usage-rights',
    title: 'Usage Rights & Licensing',
    description: 'What it means when a brand wants to use your content.',
    readTime: '3 min read',
    module: 'monetization',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Usage rights determine where, how long, and for how much a brand can use your content. They are the difference between a creator who sells posts and one who sells media.',
          'This document explains the common licensing terms and what to charge for each.',
        ],
      },
      {
        heading: 'The tiers',
        body: [
          'Social-only usage — the brand may repost your content on their social channels. This is the default included in most deals.',
          'Ad usage — the brand may run your content in paid advertising. Ads reach an order of magnitude more people than organic posts.',
          'Ownership — the brand owns the content outright and can use it anywhere, including TV and print, forever.',
        ],
        bullets: [
          'Each tier up multiplies the value of the post.',
          'If a brand asks for ad usage without additional payment, request a 2–3× uplift.',
          'Get usage terms in writing — verbal agreements do not survive a campaign.',
        ],
      },
      {
        heading: 'Territory and duration',
        body: [
          'Limit ad usage to a region (e.g. India only) and a duration (e.g. 90 days). If the brand wants to extend, that is another invoice.',
          'Put the limits in the contract. The API-driven deals module in PulseHub stores usage terms alongside the deal so both parties agree before posting.',
        ],
      },
    ],
  },
  {
    slug: 'pitching-brands',
    title: 'Pitching Brands',
    description: 'Write outreach that earns a reply instead of a delete.',
    readTime: '4 min read',
    module: 'monetization',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Outreach is a numbers game, but the numbers improve dramatically when the pitch is specific. A generic DM gets archived; a tailored pitch gets a reply.',
          'This document covers the structure of a pitch that positions you as a solution, not a request.',
        ],
      },
      {
        heading: 'Before you pitch',
        body: [
          'Do not pitch the brand; pitch the campaign. Reference a recent post of theirs and name the specific gap your content fills.',
          'Gather three metrics before writing: your average views, your engagement rate, and a relevant example post that performed well.',
        ],
      },
      {
        heading: 'The pitch structure',
        body: [
          'Keep it under 150 words. One sentence on who you are, one on the specific idea, one on what you would deliver, and one line with your starting rate.',
          'Close with a low-friction question like "Can I send a 30-second sample concept?" A question with a clear yes invites a reply.',
        ],
        bullets: [
          'Mention one specific brand post to prove you did the homework.',
          'Attach a relevant example of your work — do not link your whole profile.',
          'Follow up once after 5–7 days; then stop.',
        ],
      },
    ],
  },
  {
    slug: 'rejecting-lowballs',
    title: 'Rejecting Lowball Offers',
    description: 'Decline bad deals without burning the relationship.',
    readTime: '3 min read',
    module: 'monetization',
    sections: [
      {
        heading: 'Overview',
        body: [
          'You will receive offers below your rate. Declining well is a skill: it preserves the relationship, and a surprising number of brands come back with a better number.',
          'This document explains how to counter or decline without hostility.',
        ],
      },
      {
        heading: 'Decide between counter and decline',
        body: [
          'Counter when the gap is less than 40% of your rate — anchor to your metrics and offer a smaller scope at the offered price. Decline when the gap is large or the request signals a low-value relationship.',
          'A "no" now is better than an underpaid "yes" that trains the brand to undervalue you.',
        ],
      },
      {
        heading: 'Scripts that keep doors open',
        body: [
          "For a counter: \"I can't do the full scope at that price, but I can do X for Y — or we can keep the scope and adjust the number. Which works?\"",
          "For a decline: \"I appreciate the offer, but I can't make this work at that level. If the budget moves, I would love to revisit.\" Then stop negotiating.",
        ],
        bullets: [
          'Never accept immediately after a counter — even if the final number is fine.',
          'Keep the reply short. Long justifications weaken your position.',
          'If they ask "what is your best number," restate your rate card, not a discount.',
        ],
      },
    ],
  },
  {
    slug: 'batch-production',
    title: 'Batch Production',
    description: 'Shoot and edit in batches to publish consistently without burnout.',
    readTime: '3 min read',
    module: 'workflow',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Consistency beats intensity. A creator who publishes four mediocre posts a week usually outgrows one who publishes one great post whenever inspiration strikes.',
          'Batching is the system that makes consistency sustainable. This document describes the batch workflow and where a scheduling tool like PulseHub fits in.',
        ],
      },
      {
        heading: 'The batch cycle',
        body: [
          'Reserve one day every two weeks for capture: shoot 4–8 ideas in one session. Use the same setup, outfits, and location changes to create visual variety.',
          'Spend the next two days editing everything. Then schedule across the month so publishing becomes a review task, not a creation task.',
        ],
      },
      {
        heading: 'What to batch',
        body: [
          'Batch the input-first: write ten captions in one sitting, shoot in a second, edit in a third. Each step has a different mental mode, so separating them is more efficient than doing all three for one post at a time.',
          'Keep a "snippet jar" — a running list of ideas so that when a batch day arrives, you never face a blank page.',
        ],
      },
    ],
  },
  {
    slug: 'repurposing',
    title: 'Repurposing Content',
    description: 'Turn one piece of content into many without spam.',
    readTime: '3 min read',
    module: 'workflow',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Your best content deserves more than one platform. Repurposing is reformatting an idea for each platform's native format — not cross-posting the same file everywhere.",
          'The cross-posting engine in PulseHub handles distribution; this document covers the creative reformatting that makes it worth distributing at all.',
        ],
      },
      {
        heading: 'The repurposing tree',
        body: [
          'Start with one long-form video as the trunk. From it, cut highlights for shorts, pull a quote for a LinkedIn text post, and extract a poll for X.',
          'Each format gets a native caption — a vertical clip does not need the same opening as a text post.',
        ],
      },
      {
        heading: 'Avoid repurposing spam',
        body: [
          'Do not post the same exact video to every platform in the same week. Native audiences will see it, and cross-posting identical files is a known quality penalty.',
          'Reformat, re-edit, and re-voice. The idea is the same; the content should not be.',
        ],
      },
    ],
  },
  {
    slug: 'content-sprint',
    title: 'The 90-Minute Content Sprint',
    description: 'A timed system for generating a month of ideas fast.',
    readTime: '3 min read',
    module: 'workflow',
    sections: [
      {
        heading: 'Overview',
        body: [
          'The content sprint is a timed, single-session system for producing a month of topic ideas. It removes the "what do I post" decision from every single day.',
          'This document defines the sprint format and the rules that make it work.',
        ],
      },
      {
        heading: 'The format',
        body: [
          'Set a timer for 90 minutes. Split it: 30 minutes of writing raw topic ideas with zero filtering, 30 minutes of expanding the best 10 into angles with hooks, and 30 minutes of turning each angle into a first-line caption.',
          'The goal is 20–30 ideas. Most will be unusable; that is the point. Volume surfaces the 3–5 strong ones.',
        ],
      },
      {
        heading: 'The rules',
        body: [
          "No editing during the idea phase. No judging an idea mid-flow. Use every sprint's overflow as the seed list for the next sprint.",
          'Store the output somewhere you schedule from — a sheet, a doc, or the PulseHub composer — so ideas become posts instead of notes.',
        ],
      },
    ],
  },
  {
    slug: 'editorial-guidelines',
    title: 'Editorial Guidelines',
    description: 'Compliance-safe language for sponsored content.',
    readTime: '2 min read',
    module: 'policy',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Sponsored content is regulated. Disclosure rules require you to label paid partnerships, and platform policies restrict health and financial claims. This document lists the language that is safe and the language that triggers review or rejection.',
        ],
      },
      {
        heading: 'Approved framing',
        body: [
          'Describe what a product does with specific, verifiable statements: "This keyboard reduced my typing noise," not "This keyboard will fix your productivity."',
          "Use explicit disclosure language: #ad, #sponsored, or the platform's paid-partnership tag, placed at the start of the caption where it cannot be missed.",
        ],
        bullets: [
          'Personal experience statements are the safest form of endorsement.',
          'Clear disclosure protects you from regulatory action and brand disputes.',
          'When in doubt, add disclosure rather than remove it.',
        ],
      },
      {
        heading: 'Banned terms',
        body: [
          'Avoid claims of cure, guaranteed results, or income promises: "guaranteed growth," "cures X," "instant results," "make money fast," "100% effective."',
          "Avoid superlatives you cannot substantiate: \"best,\" \"number one,\" \"world's fastest.\" A claim you cannot prove with a citation is a risk.",
        ],
      },
      {
        heading: 'PulseHub enforcement',
        body: [
          'The Pre-Publish Checklist scans your caption for banned terms and missing disclosure before you publish. It is a guardrail, not a lawyer — for regulated categories, consult a professional.',
        ],
      },
    ],
  },
  {
    slug: 'pre-publish-checklist',
    title: 'Pre-Publish Checklist',
    description: 'The 3 checks you must pass before posting anything.',
    readTime: '2 min read',
    module: 'policy',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Most posting mistakes are cheap to catch and expensive to fix after distribution starts. The checklist runs three checks against your caption before it can be scheduled or published.',
        ],
      },
      {
        heading: 'Check 1 — Safe zones',
        body: [
          "Your content must stay within the platform's approved topic zones for your niche. Content that drifts into restricted claims or formats risks demotion or removal.",
        ],
      },
      {
        heading: 'Check 2 — Keywords & hashtags',
        body: [
          'At least one relevant keyword and a small set of relevant hashtags must be present. This ensures the post is discoverable through search and that your hashtags are topical rather than spammy.',
        ],
      },
      {
        heading: 'Check 3 — Call to action',
        body: [
          'Every post should tell the viewer what to do next — follow, save, comment, or share. A post without a CTA is a broadcast; a post with one is a conversation starter.',
          'The checklist requires a detected CTA keyword before publishing is enabled.',
        ],
      },
      {
        heading: 'Where it lives',
        body: [
          'The checklist is embedded in the composer on the brand posting page. It blocks "Post Now" and "Schedule" until all three checks pass, and it gives instant feedback on which check failed and why.',
        ],
      },
    ],
  },
];

export function getDoc(slug: string): AcademyDoc | undefined {
  return academyDocs.find((d) => d.slug === slug);
}

export function getDocIndex(slug: string): number {
  return academyDocs.findIndex((d) => d.slug === slug);
}

export function getDocsForModule(moduleId: string): AcademyDoc[] {
  const mod = academyModules.find((m) => m.id === moduleId);
  if (!mod) return [];
  return mod.docs
    .map((slug) => getDoc(slug))
    .filter((d): d is AcademyDoc => Boolean(d));
}
