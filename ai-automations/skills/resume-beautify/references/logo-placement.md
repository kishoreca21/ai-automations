# Logo Placement — Top-Right, Aligned to the Section Rule End

An optional institute or company logo (MDI, IIM, ISB, employer, etc.) sits top-right as a small
decorative mark. Its right edge lines up with the right end of every section-heading rule (`PROFILE`,
`CORE SKILLS`, …), so the resume reads as one intentional column of alignment down the right side.

## How it's anchored

The logo is a **floating** image with an **explicit horizontal offset** measured in EMU (English Metric
Units, Word's internal unit). Not `align: RIGHT` — that puts the image flush with the page edge and
Word ignores `margins` there.

```
1 dxa = 635 EMU
1 pixel (at 96 DPI) = 9525 EMU
1 inch = 914400 EMU = 1440 dxa

logoLeftOffsetEmu = (pageWidth - pageMargin) * 635 - logoWidth * 9525
```

The builder computes this at render time from the current density preset's page width, page margin,
and the logo's `width` from the JSON. When you switch density presets, the alignment stays correct
without any manual EMU tweaking.

## What the user configures

In the input JSON:

```json
"logo": {
  "path": "/absolute/path/to/logo.png",
  "width": 65,
  "height": 65,
  "topOffsetEmu": 60000
}
```

- **`path`** — absolute filesystem path to a PNG (transparent background is best) or JPG. If the file
  doesn't exist at render time, the build fails.
- **`width`, `height`** — pixels at 96 DPI. 60-80 px is the sweet spot; smaller than 50 disappears,
  bigger than 90 crowds the name.
- **`topOffsetEmu`** — vertical offset from the top of the page in EMU. `60000` ≈ 0.06" from the top
  (the default we settled on). Smaller number = higher on the page. `30000` puts it right at the top
  edge; `120000` drops it about level with the contact line.

## Word vs. LibreOffice drift

The PDF this skill's workflow generates is rendered by LibreOffice (`soffice --convert-to pdf`). Word's
renderer positions floating anchors a hair differently — typically 1-2mm of drift. If the user opens
the `.docx` in Word and the logo looks slightly off compared to the preview PDF, that's expected. Nudge
`topOffsetEmu` up or down by ~20000 at a time, and `width` if the horizontal alignment looks off — the
horizontal position is a function of width, so a wider logo starts further left.

Important: when the user **exports a PDF from Word themselves** for a job application, that PDF will
match Word's rendering, not the preview PDF. Advise the user to do a final visual check after their own
export.

## When to skip the logo entirely

Omit the `logo` block for:
- **Maximum ATS safety** — for older or unusual ATS (legacy Taleo, some govt/bank portals) where any
  image is a small risk. Modern ATS (Workday, Greenhouse, Lever, iCIMS, SmartRecruiters, Naukri,
  iimjobs, hirist) handle floating decorative images fine.
- **Non-MDI/IIM contexts** where the logo would add no signal — general lateral applications where the
  reader has never heard of the school, or where the user is applying under an alias.
- **International applications outside India** where the logo may look parochial.

The pure-text version passes every parseability test with no exceptions and looks clean on its own.

## When the user wants it moved

Common asks and the fix:

- **"Move it left"** — the alignment is tied to the page margin, so it moves with the layout. If the
  user wants the logo further left of the section rules (unusual), reduce `width` — the right edge
  stays anchored to the rule end, so a narrower logo starts further right (not left). To get it inside
  the rule end, add a manual right margin via `layout` or shrink `width`.
- **"Move it up"** — decrease `topOffsetEmu`.
- **"Move it down"** — increase `topOffsetEmu`.
- **"Make it smaller"** — decrease `width` and `height` proportionally (keep aspect ratio).
- **"It's stuck to the page edge in Word"** — the JSON is probably missing `logo` entirely, or was
  edited by hand with `align: RIGHT`. Re-render with the JSON schema.
