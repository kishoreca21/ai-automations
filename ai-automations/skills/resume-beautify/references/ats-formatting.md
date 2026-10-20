# ATS-Safe Formatting Rules Baked Into the Builder

An Applicant Tracking System reads the `.docx` and tries to linearise it into fields — name, contact,
work history, skills, education. Anything that breaks that linearisation (multi-column tables, text in
images, content in headers/footers, unicode oddities) can get reordered or dropped. The rules below are
the parseability floor. The bundled builder enforces most of them for you; when you're deciding whether
a formatting change is safe, check it here first.

## Non-negotiables

- **Single column only.** No multi-column tables holding resume content. The biggest fix vs. a
  table-based template.
- **All critical info as real text, in the body.** Name, email, phone, LinkedIn, every bullet — real
  selectable text in the document body. Never inside an image, text box, header, or footer. Some ATS
  strip headers/footers entirely.
- **Logo is decorative only.** Fine to include a small institute/company logo top-right, but zero
  parseable info lives in it. See `logo-placement.md`.
- **Standard section headings.** `Profile`, `Core Skills`, `Work Experience`, `Projects`, `Positions of
  Responsibility`, `Awards & Certifications`, `Education`. Avoid cute or non-standard headings.
- **Standard font.** Calibri, Arial, Georgia, Garamond, or Times. The builder uses Calibri.
- **Real bullet characters** via a `numbering` config with `LevelFormat.BULLET` — never a literal `•`
  typed in, never image bullets.
- **Consistent date format.** `Aug 2019 - Jul 2022` with a plain hyphen. Reverse-chronological order.
- **No em dashes (—) or en dashes (–), anywhere.** Hard style rule; the builder rejects them with a
  warning. Use a comma, colon, semicolon, or ` | ` as a separator, and a plain hyphen `-` for date
  ranges.
- **Save as `.docx`.** Most broadly parseable format across ATS platforms.

## The skills section, done parse-safe

Two acceptable formats, both linearise cleanly:

- **Grouped** (default) — **exactly 2 balanced categories**, each with a bold label and a `·`-separated
  list. Every wrapped line must fill at least ~90% of the page width. Never leave an orphan half-line
  (a 2-3 item category with obvious right-side whitespace) — always merge into a bigger category.
  Wrapped continuation flows to the left margin (no hanging indent) so every wrap uses full width.
- **Inline compact** — one long `Core Skills: A · B · C · D · …` line. For very content-heavy resumes
  where even 2 wrapped categories is too much vertically.

Never use a 3-column grid of bulleted skills — that's a table, and tables scramble parsing.

## Right-aligning dates without a table

Employer on the left, dates on the right of the same line uses a `PositionalTab` (`alignment:
PositionalTabAlignment.RIGHT`) inside the `TextRun`. Do **not** build a two-column table for this;
that's exactly the layout that pushes the date strip out of parse order.

## Categorisation discipline

Every skill sits under a heading it genuinely belongs to. Tools (SQL, Excel, Figma, Python, n8n, REST
APIs, BI tools) go under Technical/Tools or Analytics — never under Product. Collaboration abilities
(cross-functional delivery, stakeholder management) go under a delivery/collaboration heading. Skills
are **capabilities**, not achievements: `Cross-functional Delivery` is a skill; `Cross-functional
delivery across 3 countries` is an achievement that belongs in an experience bullet, not the skills
list.

## Layout defaults

- Margins: `0.5"–0.7"` in the loose/normal presets; `compact` goes to `~0.24"` (still legible).
- Body font: `10–10.5pt`. Never below `10pt`.
- Name: `16–20pt` bold, centred.
- Section headings: `10-11pt` bold uppercase with a thin bottom border (paragraph border, **not** a
  table).
- Line spacing: single, with small space-after so it breathes without wasting vertical space.
- Page size: A4 default; use US Letter (`width 12240, height 15840` dxa) for US roles.

## Pre-delivery checklist

- [ ] One column, no content in tables
- [ ] Name + contact are real text in the body (not header/footer/image)
- [ ] Logo (if any) carries no information
- [ ] Standard section headings only
- [ ] Body font 10-10.5pt
- [ ] Real bullets, consistent dates, reverse-chronological
- [ ] Renders to exactly one page (verified from the rendered PDF, not assumed)
- [ ] Every line traces back to the source resume
