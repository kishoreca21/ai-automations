# ATS-Alignment Scoring Rubric (0-100)

This rubric is a **transparent heuristic** for how well a resume matches a specific job description *and* how cleanly an ATS can parse it. It is not a simulation of any one vendor's tool (Workday, Greenhouse, Lever, Taleo, Jobscan all score differently). Score with judgment against these six categories, and always show the person the breakdown so the number is explainable.

Total = 100, across six categories.

---

## 1. Keyword & skills alignment — 30 pts

The heart of ATS matching: does the resume contain the JD's important terms, in context?

- Identify the JD's **must-have** skills/tools/domain terms and its **nice-to-haves**.
- Score mainly on **must-have coverage** — a resume missing 3 of 8 must-haves can't score full marks here no matter how polished.
- Terms must appear **in real context** (summary, skills, or a bullet that reflects genuine experience), not in a stuffed keyword strip. Contextual, spread-out coverage scores higher than a dumped list.
- Reward using the JD's **exact phrasing** where the person's real experience matches it (e.g. JD says "product requirements documents"; the person writes PRDs → use the JD's phrasing).

Rough bands: 27-30 = nearly all must-haves present and contextual; 21-26 = most present, a couple missing or only in a list; 14-20 = several must-haves absent; <14 = major mismatch.

## 2. Role & summary alignment — 10 pts

Does the top of the resume aim at *this* role?

- The **summary/headline** names or clearly targets the role and leads with the 2-3 attributes this JD cares most about.
- The target **job title (or a close variant)** appears where truthful.
- Seniority framing matches (don't pitch a lead as a junior or vice versa).

## 3. Impact & quantification — 20 pts

Strong resumes show outcomes, not duties.

- Bullets **lead with strong action verbs** and land a **quantified result** (number, %, ₹, time, scale).
- Duty-listing ("responsible for managing…") is penalized; converted impact is rewarded.
- Numbers must be the person's **real** ones. (Fabricated precision is an integrity failure, not a scoring win — if you suspect a number was invented to score here, that's a reason to flag, not to reward.)

Rough bands: 18-20 = most bullets quantified and outcome-led; 12-17 = mixed; <12 = mostly duties, few numbers.

## 4. ATS parseability & formatting — 20 pts

Can the machine actually read it? (See `ats-formatting.md` for the rules being checked.)

- **Single-column** layout; no multi-column tables holding content.
- All **critical info as real text** — name, contact, and every bullet — never inside an image, text box, header, or footer.
- **Standard section headings** an ATS recognizes.
- **Standard fonts**, consistent **date formats**, real bullet characters.
- Saved as `.docx`.

Any one serious parse-blocker (content locked in a table, contact info only in the header, key text as an image) should cap this category low (≤10) even if everything else is clean — because in a real ATS it can drop that content entirely.

## 5. Relevance & prioritization — 10 pts

- Most JD-relevant experience, projects, and bullets sit **highest**.
- Irrelevant or dated content is **trimmed**.
- Fits **one page** without feeling cramped or padded.

## 6. Clarity, consistency & correctness — 10 pts

- No spelling/grammar errors; consistent tense and punctuation.
- Consistent formatting (dates, capitalization, bullet style).
- Contact line complete and correct: name, email, phone, LinkedIn as readable text.
- Tight, professional language — no filler.

---

## How to report the score

Show the total and a one-line reason per category (see the output template in `SKILL.md`). Then give the **top 3 levers** — the specific changes that would move the most points, in priority order. Be honest about the ceiling: if a must-have is genuinely missing, the keyword category is capped, and the right move is to tell the person, not to inflate the number.

**Calibration reminder:** most first-pass tailored resumes land in the 78-90 range. A score of 95+ should be rare and mean the resume is genuinely, contextually matched to the JD's must-haves with clean parseable formatting and quantified impact throughout — not that keywords were crammed to hit a number.
