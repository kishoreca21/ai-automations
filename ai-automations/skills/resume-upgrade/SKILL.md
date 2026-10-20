---
name: resume-upgrade
description: >-
  Tailor and upgrade a person's resume to a specific target job description,
  producing a one-page, ATS-safe .docx plus a transparent 0-100 ATS-alignment
  score and a short change report. Use this skill whenever someone wants to
  adapt, tailor, optimize, or "upgrade" their resume or CV for a particular
  job, role, or company - especially when they upload a resume file and paste
  or reference a job description, or use phrasing like "resume upgrade for this
  role", "tailor my CV to this posting", "make my resume ATS-friendly for
  X", "rework my resume for this Product Manager role", or "score my resume
  against this job". Also use when they ask how well their resume matches a
  posting, or how to raise their ATS score for a specific application. Prefer
  this skill over ad-hoc editing any time a resume is being aimed at a specific
  job.
---

# Resume Upgrade (ATS-targeted, one page)

Take a person's existing resume and a target job description (JD), and produce three things:

1. A rewritten, **one-page, ATS-safe `.docx`** tailored to that job.
2. A transparent **0-100 ATS-alignment score** with a per-category breakdown.
3. A short **change report**: what changed, why, and any honest gaps.

## The one rule that makes this worth doing: truthful enhancement

"Enhance" means sharpening, surfacing, quantifying, re-ordering, and re-keywording the person's **real** experience. It never means inventing employers, titles, dates, metrics, tools, degrees, or skills. **Confident, assertive framing of skills the person genuinely has is encouraged** — lead with them, claim them plainly, don't hedge. The line is fabrication, not confidence: exaggerating *emphasis* on something true is fine; asserting something untrue is not.

Why this matters, practically and not just ethically: a resume that games the ATS but claims things the person can't back up collapses in the interview and reference check — which is a worse outcome than a slightly lower score, because it burns the opportunity and their credibility. And a keyword-stuffed resume that reads as hollow fails the *human* recruiter who reads it in the ~20 seconds right after the ATS pass. So the target is a resume that parses cleanly, genuinely matches the must-haves, and reads sharp to a person.

If the JD asks for something the person genuinely doesn't have, **flag it in the report** — don't manufacture it. Where honest, suggest a real way to close the gap (an adjacent experience of theirs to emphasize, or an actual course/cert to pursue).

## Inputs and trigger

- **Resume file** (usually `.docx`). If the person keeps several role-tailored versions (common — e.g. one each for BA / PM / Consulting / GM), pick the one closest to the target role and **say which you picked and why.** You can borrow strong, true bullets from their other versions if they fit the target better.
- **A job description** — pasted text, a URL, or a described role. If it's missing, ask for it before proceeding; the whole skill is relative to a specific JD.
- **Company name**, if present in the JD — triggers the research pass in step 2.
- **Newly-acquired skills or experience**, if the person mentions any (e.g. "I've since learned A/B testing and Tableau"). Treat these as real additions to their profile and fold them in during the rewrite (step 5). If they don't volunteer any but the JD lists must-haves their resume doesn't show, **ask** whether they've since gained them (step 4) instead of silently flagging a gap. Only ever add what's genuinely true.

## Workflow

Do these in order. Steps 1-4 are analysis; 5-7 produce the deliverable.

### 1. Read the job description closely

Extract, and hold onto, the specifics:
- Target **role/title** and **seniority**.
- **Must-have** hard skills, tools, certifications, and domain knowledge.
- **Nice-to-haves.**
- Core **responsibilities** and what the role is really optimizing for.
- The posting's own **vocabulary** — the exact terms it uses (e.g. "PRD" vs "spec", "stakeholder management", "A/B testing", a named framework).

Separate must-haves from nice-to-haves explicitly — must-haves carry the most scoring weight and get first priority for keyword placement.

### 2. Research the company (only when it's named)

Do a short, time-boxed web search (a few queries, not a deep dive): what the company does, its product/domain, and what this role tends to prioritize there. Use it to tune emphasis and vocabulary — e.g. an e-commerce PM role weights funnel/experimentation/marketplace language; a healthcare role weights compliance and clinical-workflow language. This is the useful, honest version of "the resume that worked there": align to what the company actually values, don't copy anyone. If nothing useful turns up, proceed without it — don't stall.

### 3. Load the person's resume

Read it with the **docx skill** (`pandoc -t markdown file.docx` for extraction). Inventory their real material: employers, titles, dates, metrics, tools, projects, achievements, education, certifications. **This inventory is the source of truth** — every line in the output must trace back to something here (or to a true fact the person confirms in chat).

### 4. Gap analysis

Map the JD's must-haves against what the resume actually shows, and bucket each:
- **Present & strong** → make sure it's surfaced high and framed in the JD's language.
- **Present but buried or understated** → real experience they have but didn't foreground. Pull it forward; re-word using the JD's terms (only where the underlying experience genuinely matches the term).
- **Genuinely missing** → don't invent it. First **ask the person** whether they've since acquired it — a skill, tool, or certification they now genuinely have (e.g. the JD wants A/B testing or Tableau and they've since learned it). If yes, treat it as a real addition and fold it in. If no, report it honestly as a gap in the change report.

### 5. Rewrite for the target

- Rewrite the **summary** to position them for this specific role (title alignment, top 2-3 must-haves, real headline achievement).
- Rebuild the **skills** section around the JD's must-haves and tools that the person actually has — grouped and keyword-rich (see `references/ats-formatting.md` for the parse-safe way to lay this out).
- **Fold in any newly-acquired skills** the person confirmed (from the input, or from your step-4 questions) — into the skills section, and into a bullet or the summary where they genuinely apply. Add only what's true.
- Rewrite **experience bullets** to lead with a strong action verb and land a **quantified, real outcome** (number, %, ₹, time saved, scale). Reuse the person's true numbers; never inflate them. Convert duty-listing ("responsible for…") into impact.
- **Weave** must-have keywords naturally into summary, skills, and experience — in context. Never a stuffed keyword dump; that wins the parser and loses the human.
- **Re-order** sections, bullets, and which projects appear so the most JD-relevant content sits highest.
- **Trim** anything that doesn't earn its place on a one-page, role-targeted resume.

### 6. Format: one page, ATS-safe

Follow `references/ats-formatting.md` in full, and build the `.docx` using the **docx skill**. The non-negotiables: single column, standard section headings, all critical info as real text (never inside an image or header/footer), standard fonts, consistent dates, real bullet characters, `.docx` output. **Use no em dashes or en dashes anywhere in the resume** — a hard style rule for this user; use commas, colons, semicolons, or " | " as separators, and a plain hyphen for date ranges (e.g. "Dec 2022 - Aug 2025"). The formatting reference has the detail.

**Render with the bundled builder.** The finalized layout is frozen into `scripts/build_resume.js`. Assemble the tailored content as JSON (the schema is documented in the script's header) and run `node scripts/build_resume.js input.json output.docx` to render it, rather than hand-writing docx code each run. The script bakes in the single-column ATS-safe layout and the tuned one-page spacing, right-aligns dates with a tab stop, and prints a warning if any em/en dash slipped into the content. If the output runs to two pages, nudge the optional `layout` values (smaller `margin`/spacing) or trim the weakest content, then re-run.

Then **verify**: render the file to PDF and rasterize it (the docx skill shows how: `soffice --convert-to pdf` → `pdftoppm`), look at it, and confirm it is **exactly one page** and reads cleanly. If it overflows, tighten per the one-page tactics in the formatting reference and re-render until it fits. Looking at the rendered page also catches layout bugs that XML review misses.

### 7. Score it

Apply `references/scoring-rubric.md`. Report the **total /100**, the **per-category breakdown** (one line of reasoning each), and the **top 3 levers** that would raise the score further. Frame the score honestly as a heuristic for match quality and parseability — not a promise of an interview. **Be blunt.** Give direct, honest feedback and don't soften the score or the gaps to spare feelings — a cushioned score is a useless score, and the person has explicitly asked for candor.

## Output

Save the `.docx` to the outputs directory and present it to the person. Alongside it, give the change report in this shape:

```
## Tailored for: <role> at <company>  —  ATS score: <NN>/100

**Score breakdown**
- Keyword & skills alignment: <n>/30 — <reason>
- Role & summary alignment: <n>/10 — <reason>
- Impact & quantification: <n>/20 — <reason>
- ATS parseability & formatting: <n>/20 — <reason>
- Relevance & prioritization: <n>/10 — <reason>
- Clarity & correctness: <n>/10 — <reason>

**What I changed and why**
- <the few highest-impact edits, briefly>

**Honest gaps** (JD wants these; your resume doesn't show them — I did NOT fabricate them)
- <gap> → <true way to address it, or "worth acquiring">

**Top 3 levers to go higher**
- <specific, actionable>

**Formatting note**
- Rebuilt in a single-column ATS-safe layout (dropped the logo/table grid so parsers read every line). Say the word if you want the branded version for human-facing sends.
```

Keep the prose tight — the person wants the resume and a clear score, not an essay.

## Reference files

- `references/scoring-rubric.md` — the transparent 0-100 rubric. Read it before scoring.
- `references/ats-formatting.md` — ATS-safe formatting rules, one-page density tactics, and docx build notes. Read it before building the `.docx`.

## A note on chasing "100"

Don't push for a literal 100 by cramming every JD term in — past a point that *lowers* real quality, because it wrecks human readability and can read as gaming. A genuine **90+** — clean parse, real must-have coverage, sharp writing — beats a hollow 100 every time. If the honest ceiling for this person against this JD is, say, 86, report 86 and show them the real levers, rather than inflating either the resume or the number.
