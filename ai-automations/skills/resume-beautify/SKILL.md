---
name: resume-beautify
description: >-
  Rebuild a resume into a single-column, ATS-safe, one-page .docx with a clean, senior-looking layout:
  name centered, contact line, optional institute or company logo anchored top-right and aligned to the
  section-rule end, PROFILE and other section headings with thin bottom rules, employer on the left with
  dates right-aligned on the same line, categorized skills, real bullets, hyphen date ranges. Use this
  skill whenever the user wants their resume made "cleaner", "more professional", "Aman-style",
  "single-column", "ATS-friendly", "prettier", or "one-pager"; when they ask to add a logo (MDI, IIM,
  ISB, employer) to their resume; when their dates need to move from a left column to inline
  right-aligned; when their resume is spilling to two pages; or whenever they upload a resume and ask
  for a layout redo without a specific JD (if they DO have a target JD, use resume-upgrade instead).
  Trigger for casual phrasings like "make my CV look like X's" or "reformat my resume".
---

# Resume Beautify (single-column ATS-safe layout, one page)

Take a person's existing resume and rebuild it into a **one-page, ATS-safe, single-column `.docx`** with a
polished, senior-looking layout — no JD required. Content is preserved; only structure and formatting
change. If a target job description is on the table, prefer the `resume-upgrade` skill instead — it does
JD-tailored rewriting *and* uses this same layout underneath.

## The invariant: content preserved, structure fixed

Do **not** invent, delete, or paraphrase real bullets, employers, dates, metrics, tools, or credentials.
Rewriting for a JD is the resume-upgrade skill's job. This skill's edits are structural:
- reorganise skill grids into categorised inline lines
- merge redundant recognition/award items into a single denser bullet
- move dates from any left-column strip into inline right-aligned tab stops
- add a **PROFILE** heading around the summary
- add an optional institute or company logo, top-right, aligned to the section-rule end

If a bullet is genuinely two bullets glued together and one half is duplicative, merging is fine — but the
underlying facts must all come from the source resume.

## Inputs

- **Resume file** (usually `.docx` or `.pdf`).
- Optionally a **logo image** the user wants top-right (a PNG with transparency is best; JPG works too).
- Optionally a **density preference** — user may say "keep it airy" or "pack it tight". Otherwise infer.

## Workflow

### 1. Extract the source resume

Read it with the docx skill (`pandoc -t markdown file.docx`) or with `pdftotext -layout file.pdf` for
PDFs. Get every bullet, employer, date, project, credential, and position of responsibility onto the
table. **This inventory is the source of truth** — every line in the output must trace back to something
in it. If the source uses a left-column date strip, the `pdftotext -layout` output will show the dates
orphaned at the top (that's exactly the parse pathology this skill fixes).

### 2. Structure the content into the input JSON

Fill the JSON schema documented in `scripts/build_resume.js` (the header comment). The shape is:

- `name`, `contact`, `summary` — real text, one line each for contact.
- `logo` (optional) — `{ path, width, height, topOffsetEmu }`. See `references/logo-placement.md`.
- `skills` — array of `{ label, items }`. Group by category (see step 3).
- `sections` — array of `{ heading, blocks[] }`, where a block is one of:
  - `{ role, date, bullets[] }` — bold role on the left, date right-aligned, bullets underneath.
  - `{ lead, rest }` — bulleted item with a bold lead phrase followed by regular text (great for projects).
  - `{ bullet }` — plain bulleted line (great for awards, POR, certifications).
- `layout` (optional) — density and page overrides. See `references/layout-tuning.md`.

### 3. Compress the skills section without losing keywords

The single biggest whitespace/parseability win. Two acceptable formats:

- **Grouped (default, recommended)** — **exactly 2 balanced categories**, each with a bold label and a
  `·`-separated list. Every wrapped line must fill at least ~90% of the page width. **Never leave an
  orphan half-line** (a 2-3 item category with obvious right-side whitespace) — that reads as sloppy to
  a human reviewer and defeats the point. If the source resume implies 3+ conceptual categories,
  merge the smallest into the closest-fitting larger one until you have 2 balanced categories.
  Example labels: `Analytics & Business Analysis` / `Delivery, Tools & AI`;
  `Operations, Delivery & Leadership` / `Strategy, Finance & Analytics`.
- **Inline (compact)** — for very content-heavy resumes where even 2 wrapped categories is too much:
  one long `Core Skills:` line. Loses the visual grouping but saves ~2 vertical lines. Set
  `"skillsFormat": "inline"` in the JSON.

Skill lines have **no hanging indent** — wrapped continuation flows to the left margin so every wrap
uses the full page width.

Move every skill to the category it genuinely belongs to. Tools (SQL, Power BI, Figma, Python) go under
Analytics or Delivery, never under Product. Frameworks (MoSCoW, RICE, SIPOC) go under Business Analysis.
Don't put an achievement (e.g. "Cross-functional delivery across 3 countries") in the skills list.

### 4. Consolidate awards / recognitions when three or more collapse cleanly

If the source lists three or more short recognitions of the same shape ("recognised by …", "'Star of the
Quarter'", "9 manager recognitions"), merge them into one denser bullet joined with semicolons — same
facts, one line instead of three. Never merge two things with different subjects.

### 5. Render with the bundled builder

```bash
node scripts/build_resume.js input.json output.docx
```

The builder bakes in the frozen layout: single column, Calibri body 10pt, name centred at the top,
optional floating logo (positioned with an explicit EMU offset so Word and LibreOffice render it in the
same place), **PROFILE** heading with a thin bottom rule, section headings in uppercase with rules,
employer bold on the left with the date right-aligned via a `PositionalTab`, real bullets from a
`numbering` config, and a hyphen (never en/em dash) for date ranges. It prints a warning if em/en dashes
slipped into the content anywhere.

### 6. Auto-fit to one page

Render the `.docx` to PDF, rasterize, and count pages:

```bash
soffice --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 110 output.pdf page
ls page-*.jpg
```

If more than one page comes back, rebuild with the next-tighter density preset and re-render. The
presets, in order, are `loose` → `normal` (default) → `tight` → `compact`. If `compact` still overflows,
the content is genuinely too much for one page — go back to step 3 and cut the weakest section (usually
by merging awards further, shortening certification titles to short forms, or combining two skill
lines). Do **not** drop below 10pt body text. See `references/layout-tuning.md` for the tuning ladder.

### 7. Verify visually and deliver

Look at the rendered page(s). Confirm:
- Everything on **one** page
- Logo (if present) right-edge lands at the same x as the section rules
- No text spilling into the left/right margins
- Employer left, date right, bullets underneath, no orphaned lines
- Every fact traces back to the source resume

Save to the outputs directory and present the `.docx`. Also mention: (a) the `.docx` is what to upload to
ATS portals like Workday/Greenhouse/Naukri/iimjobs; (b) for email/PDF submissions, export from Word
themselves rather than sending this preview PDF — Word's rendering of floating anchors can drift by 1-2
mm from LibreOffice's.

## What this skill deliberately does NOT do

- **JD tailoring, keyword matching, ATS scoring.** Use `resume-upgrade` for that; it targets a specific
  role. This skill is layout-only.
- **Content invention.** No new metrics, tools, or achievements. If the source doesn't say it, it doesn't
  go in.
- **Multi-column layouts.** The 15-cell skill grids and left-column date strips are exactly what breaks
  ATS parsing; the whole point of this skill is to replace them.
- **Header/footer content.** Contact info goes in the body. Some ATS strip headers and footers entirely.

## When to invoke resume-upgrade instead

If the user has a specific job posting in hand and wants their resume aimed at it, invoke `resume-upgrade`
— it uses this same builder underneath but layers a full JD-aware content rewrite on top, plus a
0-100 ATS-alignment score and a change report.

## Reference files

- `references/ats-formatting.md` — the ATS-safe rules the builder bakes in. Read before making
  layout changes.
- `references/layout-tuning.md` — density presets and the auto-fit tuning ladder. Read when a rebuild
  spills to two pages.
- `references/logo-placement.md` — how the top-right logo is anchored (explicit EMU offset), what to
  tweak when it drifts in Word vs LibreOffice, and when to skip the logo entirely.
- `examples/sample_input.json` — a fully-populated input showing every field, with the logo block and
  both grouped and inline skill formats.

## A note on ATS vs. human eye

A logo, a Profile section rule, and generous typography make the resume noticeably more pleasant for a
human reviewer without moving the ATS parse score at all — the parser reads the text and skips the image
and the rules. Where the two goals *do* compete is dense skill grids and left-column date strips: those
look "designed" to humans but they break parsers. This skill picks the cleaner parseable choice every
time, and recovers the visual polish through the rules, the Profile heading, and the logo.
