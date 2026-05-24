import { mutation } from "./_generated/server";

/**
 * 50 hand-curated public templates across the modalities PromptForge supports.
 * These are seeded once and surface in /library as the "starter pack" so a
 * new user lands on something useful instead of an empty gallery.
 *
 * Run via Convex dashboard: `npx convex run seed-library:seedLibrary`
 *
 * Each entry is intentionally a *plain English* description, not a finished
 * prompt — the library demonstrates what users can paste into PromptForge
 * to get model-specific outputs. The "title" is searchable and the
 * "content" is what we run through the engine.
 */

interface LibraryEntry {
  title: string;
  description: string;
  content: string;
  tags: string[];
  targetModel: string;
}

const LIBRARY: LibraryEntry[] = [
  // --- Writing ---
  {
    title: "Cold sales email opener",
    description: "Hook a busy executive in two sentences without sounding salesy.",
    content:
      "write a cold email opening to a CTO at a 200-person fintech company who I want to introduce my devops platform to. they don't know me. tone should be specific, no fluff, mention one thing about their tech stack.",
    tags: ["sales", "email", "b2b"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Explain like I'm five",
    description: "Convert any technical concept into a child-friendly analogy.",
    content:
      "explain how database transactions and ACID properties work to a 5 year old using a story about toys",
    tags: ["explain", "education", "writing"],
    targetModel: "gpt-4o",
  },
  {
    title: "Hacker News title rewriter",
    description: "Turn a boring blog title into one that gets clicks on HN.",
    content:
      "rewrite this blog title to perform on Hacker News without being clickbait: 'How we reduced our cloud spend'",
    tags: ["copy", "hn", "marketing"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Apology email after an outage",
    description: "Honest, technical, no-spin postmortem email to customers.",
    content:
      "write an apology email to enterprise customers after our SaaS was down for 3 hours due to a database failover bug. be technically specific, no marketing speak, end with what we're changing.",
    tags: ["email", "ops", "b2b"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Newsletter intro paragraph",
    description: "Open a tech newsletter with a cold open that earns the read.",
    content:
      "write a newsletter intro for an AI tooling newsletter. lead with a contrarian observation about the current state of agent frameworks. 3 sentences max.",
    tags: ["newsletter", "writing", "ai"],
    targetModel: "gpt-4o",
  },

  // --- Code ---
  {
    title: "Code review request",
    description: "Get a thorough, opinionated code review with concrete fixes.",
    content:
      "review this typescript function for bugs, performance issues, and edge cases. point out specific line numbers. assume i'm a senior dev — be direct.",
    tags: ["code", "review", "typescript"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Refactor to idiomatic",
    description: "Take working but ugly code and clean it without changing behavior.",
    content:
      "refactor this python script to be idiomatic. preserve behavior exactly. add type hints. flag any potential bugs you find while refactoring.",
    tags: ["code", "refactor", "python"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "SQL query explainer",
    description: "Decompose a complex SQL query into plain English steps.",
    content:
      "explain this complex SQL query step by step. identify any performance issues. suggest indexes if relevant.",
    tags: ["code", "sql", "explain"],
    targetModel: "gpt-4o",
  },
  {
    title: "Test case generator",
    description: "Generate a thorough test suite covering edge cases.",
    content:
      "generate a complete jest test suite for this function. include happy path, edge cases, error handling, and at least one property-based test using fast-check.",
    tags: ["code", "testing", "jest"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Migrate code between frameworks",
    description: "Port a React component to a different framework idiomatically.",
    content:
      "convert this React component to Vue 3 composition API. preserve all behavior including state management and effects. flag anything that needs human review.",
    tags: ["code", "migration", "frontend"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Regex from description",
    description: "Plain English to a tested regex with examples.",
    content:
      "give me a regex that matches a US phone number in any common format. show 5 examples that should match and 3 that should not. explain each part of the regex.",
    tags: ["code", "regex"],
    targetModel: "gpt-4o",
  },
  {
    title: "Bug repro reduction",
    description: "Minimize a bug repro to the smallest possible failing case.",
    content:
      "reduce this bug repro to the absolute minimum that still fails. remove every line, dependency, and config option that isn't strictly needed. confirm the bug still reproduces at each step.",
    tags: ["code", "debugging"],
    targetModel: "claude-opus-4.1",
  },

  // --- Images ---
  {
    title: "Cinematic horror still",
    description: "Atmospheric horror frame, low key lighting.",
    content:
      "wide shot of an abandoned hospital corridor at night, single flickering fluorescent light, a child's red ball motionless in the foreground, atmospheric horror, 35mm film grain",
    tags: ["image", "cinematic", "horror"],
    targetModel: "midjourney-v7",
  },
  {
    title: "Product hero shot",
    description: "Clean studio-style product photo for a landing page.",
    content:
      "minimalist product photo of a matte black ceramic coffee mug on a smooth concrete surface, soft window light from the left, shallow depth of field, no logo, hero composition for a landing page",
    tags: ["image", "product", "studio"],
    targetModel: "midjourney-v7",
  },
  {
    title: "Concept art — sci-fi city",
    description: "Painterly concept art with a clear focal point.",
    content:
      "concept art of a brutalist megacity at sunset, towering concrete spires, monorail tracks weaving between them, two tiny figures crossing a sky bridge for scale, painterly, syd mead inspired",
    tags: ["image", "concept-art", "sci-fi"],
    targetModel: "midjourney-v7",
  },
  {
    title: "Editorial illustration",
    description: "Magazine-style illustration with strong metaphor.",
    content:
      "editorial illustration about burnout in tech: a developer at a desk where the keyboard keys are turning into autumn leaves and floating away. limited palette, NYT op-ed style, flat shapes",
    tags: ["image", "editorial", "illustration"],
    targetModel: "midjourney-v7",
  },
  {
    title: "App icon sketch",
    description: "Clean SaaS app icon with a single strong metaphor.",
    content:
      "app icon for a prompt engineering tool. single glyph: an anvil with a glowing rune. flat design, two-tone gradient, rounded square, no text",
    tags: ["image", "icon", "saas"],
    targetModel: "dalle-3",
  },
  {
    title: "Architectural visualization",
    description: "Photorealistic exterior render with mood.",
    content:
      "photorealistic architectural rendering of a small modern beach house at golden hour. cantilevered terrace, walls of glass, weathered cedar cladding. mood is quiet, isolated, expensive. ground level perspective",
    tags: ["image", "archviz", "photoreal"],
    targetModel: "midjourney-v7",
  },
  {
    title: "Character portrait",
    description: "Detailed character with personality and lighting story.",
    content:
      "portrait of a tired 70 year old jazz pianist in a smoky club, late 1960s, sweat on his forehead, fingers blurred mid-chord, single warm key light from the left, deep shadows. shot on portra 400",
    tags: ["image", "portrait", "cinematic"],
    targetModel: "midjourney-v7",
  },
  {
    title: "Icon set theme",
    description: "Cohesive flat icon set sharing one visual style.",
    content:
      "set of 6 flat-design icons for a finance app: wallet, chart, transfer, alert, receipt, settings. limited palette of dark navy and lime accent. unified stroke weight. iso 24x24",
    tags: ["image", "icons", "design-system"],
    targetModel: "dalle-3",
  },

  // --- Video ---
  {
    title: "8s product reveal",
    description: "Cinematic product hero video with clear shot list.",
    content:
      "8 second cinematic reveal of a sleek wireless earbud spinning on a polished black stone surface. start tight on the texture, pull out as it lifts and rotates. cold key light from above, warm rim light. luxurious mood",
    tags: ["video", "product", "cinematic"],
    targetModel: "sora-2",
  },
  {
    title: "Slow-mo nature beat",
    description: "Single beautiful nature shot with motion.",
    content:
      "slow motion shot of a hummingbird approaching a red flower at dawn. extreme close up, soft golden light, dewdrops catching light, dreamy out of focus background",
    tags: ["video", "nature", "slow-motion"],
    targetModel: "runway-gen-3",
  },
  {
    title: "Brand mood film opener",
    description: "Atmospheric brand video opening 3-shot sequence.",
    content:
      "3 shot opening for a luxury watch brand mood film. shot 1: extreme close on hands assembling a movement under loupes. shot 2: wide of a quiet workshop, morning light through tall windows. shot 3: medium of an old craftsman lifting his glasses. unhurried, reverent tone",
    tags: ["video", "brand", "mood"],
    targetModel: "sora-2",
  },
  {
    title: "Action chase beat",
    description: "Single dynamic action shot with camera language.",
    content:
      "low angle tracking shot following a parkour runner sprinting along the edge of a rooftop at sunset. handheld energy, sun flares, distant city, motion blur on hands",
    tags: ["video", "action"],
    targetModel: "runway-gen-3",
  },
  {
    title: "Veo 3 dialogue scene",
    description: "Synced audio + video dialogue scene for Veo's strength.",
    content:
      "two friends sitting on a fire escape at dusk in brooklyn. one says 'i think i'm going to do it.' the other replies 'tomorrow?' first one nods. ambient city sounds, distant siren. tender, quiet mood",
    tags: ["video", "dialogue", "veo"],
    targetModel: "veo-3",
  },

  // --- Music / Audio ---
  {
    title: "Lo-fi study track",
    description: "Two-minute lo-fi instrumental for a focus playlist.",
    content:
      "lo-fi hip hop instrumental for late night studying. dusty piano loop, vinyl crackle, soft kick and snare, tape saturation. melancholy but warm. about 75 bpm",
    tags: ["music", "lo-fi", "instrumental"],
    targetModel: "suno-v4",
  },
  {
    title: "Indie folk ballad",
    description: "Heartfelt indie folk song with verse-chorus structure.",
    content:
      "indie folk ballad about leaving the city and not regretting it. fingerpicked acoustic guitar, soft female vocal, swell of strings on the chorus. wistful, autumnal. include verses, chorus, and a bridge",
    tags: ["music", "folk", "ballad"],
    targetModel: "suno-v4",
  },
  {
    title: "80s synthwave anthem",
    description: "Driving retro synthwave with hooks.",
    content:
      "80s synthwave anthem about driving through neon streets at 2am. analog synths, gated reverb snare, soaring saw lead on the chorus. confident, nostalgic. 110 bpm",
    tags: ["music", "synthwave", "instrumental"],
    targetModel: "suno-v4",
  },
  {
    title: "Audiobook narration",
    description: "Calm, measured ElevenLabs narration with pacing direction.",
    content:
      "narrate this passage in a warm, measured audiobook voice. pause briefly at em dashes. sigh softly between paragraphs. tone is reflective, like recalling a memory",
    tags: ["audio", "narration"],
    targetModel: "elevenlabs",
  },
  {
    title: "Game trailer music",
    description: "Epic trailer music with rising intensity.",
    content:
      "epic orchestral game trailer track. starts with a single melancholic cello theme, builds with timpani and choir at 0:30, full orchestra and percussion drop at 0:50, resolve to a single piano note at the end",
    tags: ["music", "trailer", "orchestral"],
    targetModel: "suno-v4",
  },

  // --- Productivity ---
  {
    title: "Meeting summary distiller",
    description: "Extract decisions, owners, and follow-ups from messy notes.",
    content:
      "extract from these meeting notes: (1) decisions made, with the decider, (2) action items with owner and due date, (3) open questions with the person who needs to answer. format as a markdown table",
    tags: ["productivity", "meetings"],
    targetModel: "gpt-4o",
  },
  {
    title: "Daily standup writer",
    description: "Three-bullet standup update from raw morning thoughts.",
    content:
      "convert these raw morning thoughts into a 3 bullet standup format: yesterday, today, blockers. keep each bullet under 15 words. flag anything that needs help",
    tags: ["productivity", "standup"],
    targetModel: "gpt-4o-mini",
  },
  {
    title: "Email triage assistant",
    description: "Triage an inbox into reply now / later / archive.",
    content:
      "i'll paste the subjects and senders of my unread emails. triage each into REPLY NOW, REPLY LATER, ARCHIVE, or DELETE with a one-line reason. don't reply on my behalf",
    tags: ["productivity", "email"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Weekly review prompt",
    description: "Personal weekly review framework adapted from GTD.",
    content:
      "ask me 8 questions for a weekly review. cover: what shipped, what stalled, what i learned, who i should follow up with, energy level, focus quality, one thing to celebrate, one thing to change next week. one question at a time, wait for my answer",
    tags: ["productivity", "review"],
    targetModel: "claude-sonnet-4.5",
  },

  // --- Research ---
  {
    title: "Steel-man any argument",
    description: "Get the strongest version of an opposing view.",
    content:
      "steel-man the argument that AI agents will not replace SWEs in the next 5 years. give the 3 strongest reasons, with concrete examples, from the perspective of someone who has built agents in production",
    tags: ["research", "thinking"],
    targetModel: "claude-opus-4.1",
  },
  {
    title: "Pre-mortem on a project",
    description: "Imagine the project failed; identify why before starting.",
    content:
      "we're about to launch a freemium AI tool. pre-mortem this. assume it failed in 6 months. give the top 5 reasons it failed, ranked by likelihood. for each, give one early warning sign and one mitigation",
    tags: ["research", "strategy"],
    targetModel: "claude-opus-4.1",
  },
  {
    title: "Compare two technologies",
    description: "Apples-to-apples technical comparison with tradeoffs.",
    content:
      "compare PostgreSQL and ClickHouse for a 5TB analytics workload with 100 QPS read load and nightly batch writes. cover query latency, ingestion throughput, ops burden, cost. honest tradeoffs, no salesy framing",
    tags: ["research", "comparison"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "First principles breakdown",
    description: "Tear a complex topic down to first principles.",
    content:
      "explain why deep learning works at all from first principles. start from the universal approximation theorem and build up. assume i'm a math undergrad",
    tags: ["research", "explain"],
    targetModel: "claude-opus-4.1",
  },

  // --- Conversations & coaching ---
  {
    title: "Difficult conversation rehearsal",
    description: "Roleplay a hard conversation before having it.",
    content:
      "roleplay as my skip level. i'm asking for a promotion. push back realistically based on common objections (scope, business impact, growth area). make me earn it. stay in character",
    tags: ["coaching", "roleplay"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Negotiation coach",
    description: "Tactical advice for a specific negotiation moment.",
    content:
      "i'm in an offer negotiation for a senior engineer role. they've offered $X base, i counter $Y. they came back with $Y minus 5k and added more equity. coach me on the next move. be specific and tactical, not generic",
    tags: ["coaching", "negotiation"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Therapy-style reframe",
    description: "Cognitive reframing of a stuck thought (not a substitute for real therapy).",
    content:
      "i'm spiraling about [thing]. help me reframe by: (1) naming the cognitive distortion if there is one, (2) offering 3 alternative narratives that are more accurate, (3) asking me one question to test which one fits. gentle but honest",
    tags: ["coaching", "wellness"],
    targetModel: "claude-sonnet-4.5",
  },

  // --- Creative writing ---
  {
    title: "Short fiction opener",
    description: "Open a short story with hook + voice.",
    content:
      "write the opening 200 words of a short story about a dog walker who realizes one of the dogs has been talking to her for weeks. literary tone, not cute. specific physical detail",
    tags: ["writing", "fiction"],
    targetModel: "claude-opus-4.1",
  },
  {
    title: "Worldbuilding seed",
    description: "Three-paragraph worldbuilding bible for a setting.",
    content:
      "give me a 3-paragraph worldbuilding seed for a heist story set on a generation ship. cover: who's in power, what's scarce, what's sacred. nothing else. specific names",
    tags: ["writing", "worldbuilding"],
    targetModel: "claude-opus-4.1",
  },
  {
    title: "Poem in a specific form",
    description: "Get a real poem with formal constraints, not free verse.",
    content:
      "write a villanelle about deleting a file you'll never recover. 19 lines. follow the form strictly (refrains in the right places). modern voice, not archaic",
    tags: ["writing", "poetry"],
    targetModel: "claude-opus-4.1",
  },
  {
    title: "Dialogue-only scene",
    description: "Just dialogue — let the words do the work.",
    content:
      "write a scene that is pure dialogue, no tags, no actions. two old friends meeting after one of them was in prison. don't say what for. 30 lines. realistic voice",
    tags: ["writing", "dialogue"],
    targetModel: "claude-opus-4.1",
  },

  // --- Frontier / specialized ---
  {
    title: "Legal-style contract clause review",
    description: "Plain-English flagging of risky clauses (not legal advice).",
    content:
      "i'll paste a clause from a SaaS contract. flag what's unusual, who it favors, and what to negotiate. plain english, no legalese. assume i'm a founder, not a lawyer. always end with: 'this is not legal advice'",
    tags: ["legal", "contracts"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Investor pitch tightener",
    description: "Take a draft pitch and tighten it like a16z partner notes.",
    content:
      "rewrite this draft pitch deck slide. cut hedging, replace vague claims with numbers, lead with the insight. tone like an a16z partner editing it. no jargon, no buzzwords",
    tags: ["pitch", "investor"],
    targetModel: "claude-opus-4.1",
  },
  {
    title: "Resume bullet rewriter",
    description: "Convert a job description into impact bullets.",
    content:
      "rewrite this resume bullet using the format: [verb] [thing] resulting in [measurable impact]. cut adjectives. show, don't tell. include a number even if i have to estimate",
    tags: ["resume", "career"],
    targetModel: "gpt-4o",
  },
  {
    title: "Onboarding doc writer",
    description: "Generate a new-hire engineering onboarding doc structure.",
    content:
      "draft a new hire engineering onboarding doc for a 50 person infra startup. cover: week 1 reading, who to meet, first ticket, where to find docs, how to deploy. concrete, opinionated, no fluff",
    tags: ["docs", "onboarding"],
    targetModel: "claude-sonnet-4.5",
  },
  {
    title: "Bug report formalizer",
    description: "Turn a Slack-style bug report into a real ticket.",
    content:
      "convert this slack bug report into a structured ticket: title, environment, steps to reproduce, expected vs actual, impact, severity. preserve all facts. don't invent details",
    tags: ["bugs", "docs"],
    targetModel: "gpt-4o",
  },
];

/**
 * Idempotent seed mutation. Skips entries whose title already exists in the
 * templates table (so re-running doesn't create duplicates). Templates are
 * inserted as public, owned by the first admin user found, votes/usage 0.
 */
export const seedLibrary = mutation({
  args: {},
  handler: async (ctx) => {
    // Pick any user as author. In production, replace this with a dedicated
    // "system" user. For now, the first user in the table works.
    const author = await ctx.db.query("users").first();
    if (!author) {
      throw new Error(
        "Seed library requires at least one user. Sign up first, then re-run."
      );
    }

    let inserted = 0;
    let skipped = 0;
    for (const entry of LIBRARY) {
      const existing = await ctx.db
        .query("templates")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
        .filter((q) => q.eq(q.field("title"), entry.title))
        .first();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("templates", {
        authorId: author._id,
        workspaceId: undefined,
        title: entry.title,
        description: entry.description,
        content: entry.content,
        tags: entry.tags,
        targetModel: entry.targetModel,
        isPublic: true,
        votes: 0,
        usageCount: 0,
        createdAt: Date.now(),
      });
      inserted++;
    }

    return { inserted, skipped, total: LIBRARY.length };
  },
});
