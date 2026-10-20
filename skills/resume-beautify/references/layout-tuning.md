# Layout Tuning — the Auto-Fit Ladder

The `.docx` output must fit on **exactly one page**. If the first render spills to two pages, walk this
ladder from cheapest fix to most destructive; stop the moment it fits.

## The four density presets

Set with `"density": "..."` in the input JSON. Each preset scales all spacing together.

| Preset  | Margin (dxa) | Body pt | Name pt | Heading before/after | Role before | After bullet | Feel                                 |
| :------ | :----------- | :------ | :------ | :------------------- | :---------- | :----------- | :----------------------------------- |
| loose   | 720 (0.50")  | 11.0    | 18.0    | 60 / 20              | 50          | 14           | 3-4 role, airy, senior-exec vibe     |
| normal  | 540 (0.38")  | 10.5    | 17.0    | 30 / 10              | 24          | 8            | most 5-8 year resumes with 3 roles   |
| tight   | 420 (0.29")  | 10.0    | 16.0    | 18 / 6               | 14          | 4            | 5-10 year resume with many projects  |
| compact | 340 (0.24")  | 10.0    | 15.0    | 14 / 4               | 12          | 2            | very content-heavy, last-mile fit    |

Never drop below 10pt body text. If `compact` still spills, the content is genuinely too much — cut,
don't shrink further.

## The tuning ladder (in order)

Rebuild after each step; stop when it fits.

**Step 1 — Density preset.** Start at `normal`. If it spills, try `tight`. If it still spills, try
`compact`.

**Step 2 — Skills format.** Switch `"skillsFormat"` from `"grouped"` to `"inline"`. Saves roughly two
vertical lines when the skill list is long.

**Step 3 — Merge awards / recognitions.** If the source lists three or more short recognitions ("Star
of the Quarter", "9 manager recognitions", "recognised by VP"), merge them into one denser bullet
joined with semicolons.

**Step 4 — Shorten certification titles.** Drop version numbers (`v4.1`), publishers/author parentheses
(`(Charles Du)`, `(Udemy)`) unless they're the credential's actual name. `BCS Foundation Certificate in
Business Analysis v4.1` → `BCS Foundation Certificate in Business Analysis`.

**Step 5 — Merge to just 2 balanced skill categories (or inline).** If you started with 3 categories
and one is short, merge the smallest into the closest larger one. Never leave a 2-3 item orphan
category with obvious right-side whitespace — that reads as sloppy. If 2 balanced categories still
overflow the skills band, switch to `"skillsFormat": "inline"`.

**Step 6 — Trim the weakest project / POR / award.** If the resume has 4+ projects and the fourth is
weakest for the target field, drop it. Same test for positions of responsibility and one-line awards
that don't move the needle for a senior reader.

**Step 7 — Custom layout overrides.** Only if you need a hair more. `"layout"` in the input JSON
overrides individual density-preset values. Common nudge: `{ "margin": 300, "headingBefore": 10 }` on
top of `compact`.

## What NOT to do

- **Don't drop body font below 10pt.** The whole thing becomes an unreadable brick and the rubric
  penalises it.
- **Don't remove real work bullets to fit.** Cut projects, POR, awards, or reword — never delete a
  work-experience bullet from a role.
- **Don't split the resume across two pages "cleanly".** One page or nothing. Every second-page item is
  invisible to a busy reviewer.
- **Don't switch to a 2-column layout to save space.** That's the exact pathology this skill exists to
  fix.

## Debug: how to see what's overflowing

```bash
soffice --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 110 output.pdf page
ls page-*.jpg
```

Then look at `page-2.jpg`. Whatever is on page 2 is your overflow. That tells you which step above to
target: 5 skill lines overflowing → step 5 (consolidate); a whole Awards block overflowing → step 3
(merge); just Education alone overflowing → step 1 (next density preset up).
