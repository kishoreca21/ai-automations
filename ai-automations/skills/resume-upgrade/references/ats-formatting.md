# ATS-Safe Formatting + One-Page Tactics

Build the `.docx` with the **docx skill** (docx-js for creation). This file covers *what layout to build* so an ATS can parse it and it fits one page. Read the docx skill for the API footguns (A4 default, tables need dual widths, no literal `\n`, bullets via a `numbering` config, `PositionalTab` for right-aligned text, etc.).

## Why these rules exist

Applicant Tracking Systems ingest the file and try to linearize it into fields (name, contact, work history, skills). Anything that breaks that linearization — multi-column tables, text in images, content in headers/footers — can be reordered or dropped. The goal is a document that reads correctly top-to-bottom as plain text.

## Non-negotiables

- **Single column only.** No multi-column tables holding resume content. Many parsers read across rows and interleave columns, scrambling the text. This is the single biggest fix versus a table-based template.
- **All critical info as real text, in the body.** Name, email, phone, LinkedIn, and every bullet must be selectable text in the document body — never inside an image, text box, header, or footer. Some parsers ignore headers/footers entirely, so contact info there can vanish.
- **Drop the logo/graphics for the ATS build.** A logo carries no parseable text and occasionally trips parsers. Omit it (or keep it purely decorative only if you're certain all info is in text). Note the choice in the change report.
- **Standard, recognized section headings.** Use plain headings the ATS knows: `Summary` (or `Professional Summary`), `Skills` (or `Core Skills`), `Experience` (or `Work Experience`), `Projects`, `Education`, `Certifications`, `Awards`. Avoid cute or non-standard headings.
- **Standard fonts.** Calibri, Arial, Georgia, Garamond, or Times. Nothing decorative.
- **Real bullet characters** via a `numbering` config with `LevelFormat.BULLET` — never a literal `•` typed in, never image bullets.
- **Consistent date format**, e.g. `Aug 2019 – Jul 2022`. Reverse-chronological order.
- **Save as `.docx`** — the most broadly parseable format across ATS platforms.
- **No em dashes (—) or en dashes (–), anywhere in the resume.** Hard style rule for this user. Use a comma, colon, semicolon, or " | " as a separator, and a plain hyphen `-` for date ranges (e.g. `Dec 2022 - Aug 2025`). Hyphenated compound words (end-to-end, first-principles, product-facing) are fine — the ban is only on the long em/en dashes. After building, grep the extracted text to confirm none slipped in.

## The skills section, done parse-safe

Instead of a 3-column grid (a table — avoid), use grouped, comma-separated lines. It's keyword-rich, reads cleanly, and linearizes perfectly. Example shape:

```
Product: Discovery & Roadmapping · PRDs & User Stories · Prioritization (RICE, MoSCoW) · MVP / 0→1 delivery
Data & Tools: SQL · Power BI · Tableau · Advanced Excel · Figma · JIRA
AI / Automation: RAG · Agentic AI (n8n) · Python
```

Category labels help a human skim; the tools themselves are what the ATS keys on. Use only skills the person genuinely has.

**Categorize accurately, and fit the categories to the target field.** Every skill must sit under a heading it genuinely belongs to. Tools (SQL, Excel, Figma, Python, n8n, REST APIs, BI tools) go under a Technical/Tools heading — never under "Product". Collaboration abilities (cross-functional delivery, stakeholder management) go under a delivery/collaboration heading — never under "Technology". And skills are **capabilities, not achievements**: "Cross-functional Delivery" is a skill; "Cross-functional delivery across 3 countries" is an achievement that belongs in an experience bullet, not the skills list. Miscategorized skills read as careless to a human and weaken the whole section.

## Right-aligning dates without a table

To put a company on the left and dates on the right of the same line, use `PositionalTab` (`alignment: PositionalTabAlignment.RIGHT`) inside the `TextRun` — per the docx skill. Do **not** build a two-column table to achieve this; that reintroduces the parsing problem.

## Layout / spacing defaults (single page)

- Margins: `0.5"–0.7"` all around (DXA: 720-1008; 1440 = 1").
- Body font: `10–10.5pt`. Name: `16–20pt`. Section headings: `11–12pt` bold, optionally a thin bottom border (a paragraph border, **not** a table).
- Line spacing: single, with small space-after on paragraphs (e.g. 2-4pt) so it breathes without wasting vertical space.
- Page size: A4 is fine for India-based / UK / EU roles; use US Letter (`width 12240, height 15840` DXA) for US roles. Both parse fine.

## One-page enforcement

After building, **render and count pages** (docx skill: `soffice --convert-to pdf` → `pdftoppm -jpeg -r 100` → read the images). If it spills onto a second page, tighten in this order — cheapest, least-destructive first:

1. Reduce space-after on paragraphs and section gaps.
2. Trim margins toward `0.5"`.
3. Drop body font to `10pt` (floor — don't go smaller; readability is part of the score).
4. Cut the **weakest** content: the least JD-relevant bullet, project, or older role detail. Prune, don't shrink into illegibility.
5. Tighten wording — turn two-line bullets into one strong line.

Re-render after changes and confirm it's exactly one page and still readable. A cramped, 9pt, edge-to-edge page fails both the human reader and category 5 of the rubric — one clean page beats one crammed page.

**On white space:** white space does **not** lower an ATS parse or match score — that's a persistent myth; parsers extract text and ignore the gaps between sections. It matters only to the human who reads the page. So aim for a **full, evenly-dense single page**: no large empty band at the bottom, no lopsided gaps. But don't over-tighten to erase every gap — that produces the unreadable brick warned about above. Balanced density is the goal, not zero white space.

## Quick pre-delivery checklist

- [ ] One column, no content in tables
- [ ] Name + contact are real text in the body (not header/footer/image)
- [ ] No logo/graphic carrying information
- [ ] Standard section headings
- [ ] Standard font, body 10-10.5pt, readable
- [ ] Real bullets, consistent dates, reverse-chronological
- [ ] Renders to exactly one page (verified from the rendered PDF, not assumed)
- [ ] Every line traces to the person's real experience
