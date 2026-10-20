---
name: iimjobs-hunt-run
description: "One-command iimjobs.com pipeline: discover jobs from Kishore's personalized feed + 6 category pages, dedupe against tracker, scrape JDs, ATS-score each against the best-matching base resume, deliver a ranked recommendations sheet."
---

# IIMJobs Hunt Run

## Trigger

Kishore says "run iimjobs hunt" or invokes /iimjobs-hunt inside the "Linkedin and Job work" project. Sibling to [[job-hunt-run]] but for iimjobs.com — and unlike that skill this one does NOT tailor resumes; it only recommends the best-matching base resume with an ATS score.

## Prerequisites (verify first, halt if missing)

- Kishore's Chrome is open and logged into iimjobs.com. The pipeline uses the mcp__claude-in-chrome__* tools which drive his local Chrome via the desktop app. If unreachable, tell him and stop.
- All 6 base resumes are attached to the session or present in the project: `Kishore_Kunal_CV_Product_Manager.docx`, `Kishore_Kunal_CV_Project_Manager.docx`, `Kishore_Kunal_CV_Business_Analyst.docx`, `Kishore_Kunal_CV_Technology_Consultant.docx`, `Kishore_Kunal_CV_General_Manager.docx`, `Kishore_Kunal_CV_Healthcare_Manager.docx`. Ask him to attach any that are missing.
- His current `iimjobs_tracker.xlsx` is attached (or he explicitly wants a fresh run with no prior state).

## Steps

1. **Load tracker.** If iimjobs_tracker.xlsx is attached, read it. Extract:
   - `HARD_SKIP` = Job IDs where Status ∈ {Applied, Interviewing, Rejected, Offer, Withdrawn} — never re-surface these.
   - `EXISTING` = all Job IDs in the tracker (dedupe set for discovery).
   - `BACKLOG` = Job IDs with Status = Backlog (promote into this run's work queue).

2. **Discovery — 7 pages.** Via Claude in Chrome, navigate each URL below in turn, wait 3s, and extract every anchor href matching `/j/<slug>-<7-digit-id>?ref=...`. The last numeric segment of the slug is the Job ID. Keep the FULL relative path (slug required — iimjobs doesn't resolve bare IDs).
   - `https://www.iimjobs.com/jobfeed` (personalized, ~40 jobs — primary source)
   - `https://www.iimjobs.com/k/it-product-management-jobs`
   - `https://www.iimjobs.com/k/it-project-management-jobs`
   - `https://www.iimjobs.com/k/it-business-analyst-jobs`
   - `https://www.iimjobs.com/k/it-consulting-jobs`
   - `https://www.iimjobs.com/k/consulting-healthcare-jobs`
   - `https://www.iimjobs.com/k/consulting-general-mgmt-jobs`
   Dedupe by Job ID across all 7 lists. For each ID record which category first surfaced it (used as a tier hint later).

3. **Filter and prioritize.** Subtract `HARD_SKIP` from discovered IDs. Add `BACKLOG` back into the work queue. Sort by: (a) jobfeed rank first if present, then (b) category order above. Cap this run at 25 items (or a lower cap Kishore names).

4. **JD scrape.** For each URL in the work queue:
   - Navigate to the full `/j/<slug>-<id>` URL from discovery
   - Wait 2s — pages render synchronously, NO scroll needed (unlike LinkedIn)
   - `get_page_text` — extract Title, Company, Experience (yrs), Salary (LPA), Location, Categories (#tags), Recruiter, JD body
   - Verify the "Job Code: <id>" line matches the URL's ID
   - Save to `/home/claude/iimjobs/jds/<id>.txt` in header + body format
   - If the page doesn't render (rare on iimjobs), mark that ID `JD unavailable` in the sheet and move on. One retry max.

5. **Pick the best-matching resume (top-match only).** For each JD, apply this heuristic against title + categories, in order — first hit wins:
   - Contains "product manager", "product owner", "APM", or #IT Product Management / #IT Product Strategy → **PM**
   - Contains "project manager", "PMO", "program manager", or #IT Project Management → **PjM**
   - Contains "business analyst", "data analyst", or #IT Business Analyst → **BA**
   - Contains "consultant", "consulting", "advisory", or #Strategy Consulting / #IT Consulting → **TC**
   - Contains "healthcare", "health tech", "clinical", "medical", "hospital", "pharma", "life sciences", or #Consulting Healthcare → **HC** (only if none of the above already matched — functional tier wins over industry)
   - Everything else (general manager, operations, strategy generalist) → **GM**

6. **ATS score (one call per job).** Invoke the `resume-upgrade` skill in score-only mode with the JD text and the ONE matched base resume from step 5. Capture the 0-100 ATS score plus its short change-report (keywords matched/missed). Do NOT generate a tailored resume file.

7. **Build the recommendations sheet.** Regenerate `iimjobs_recommendations.xlsx` with all rows (prior + new). Columns:
   - Job ID | Title | Company | Location | Experience | Salary (LPA) | Categories | Recommended Resume | ATS Score | Recommend (Y if ≥70 else N) | Apply URL | Status | Notes
   Sort by ATS Score descending. Preserve any existing Status values from the loaded tracker (`Applied`, `Interviewing`, etc.). New rows get Status = blank and Notes = the 2-3 top matched/missed keywords from the ATS report.

8. **Deliver.**
   - SendUserFile the updated `iimjobs_recommendations.xlsx`.
   - `project_write` the same file into the project so subsequent runs can find it as the tracker.

## Verification

- Confirm the SendUserFile call succeeded.
- Print a plain-English summary at the end:
  - N new jobs discovered across the 7 pages (X unique after dedupe)
  - M JDs successfully scraped (K failed, listed by ID)
  - Distribution across the 6 resume tiers (e.g., PM: 12, BA: 5, TC: 4, PjM: 2, GM: 1, HC: 1)
  - How many scored ≥70 (Recommend = Y)
  - Top 5 jobs by ATS score with title + company + score
  - Current sheet row count; how many remain Backlog for next run
- If Chrome is unreachable at step 2, stop immediately and tell Kishore to open Chrome and log into iimjobs.com, then re-invoke /iimjobs-hunt.

## Notes

- iimjobs JD pages render synchronously — one navigate + 2s wait + get_page_text is enough. No LinkedIn-style scrolling.
- The URL slug matters — iimjobs will NOT resolve a bare `/j/-<id>` path. Always save and reuse the full slugged URL captured during discovery.
- "Job Code" on the JD page equals the last numeric segment of the URL slug — use it as a sanity check that navigation landed on the intended job.
- The jobfeed is ML-personalized to Kishore's profile, so it's the highest-signal source; the 6 category pages exist to catch fresh listings the feed hasn't ranked yet.
- Deliberate: this skill does NOT produce tailored resume .docx files. If Kishore wants a tailored resume for a specific high-scoring role, he invokes the `resume-upgrade` skill separately with that JD + the recommended base resume.
- Base-resume filenames use "Healthcare_Manager" (not "Healthcare_Management") and "Project_Manager" (not "Project_Management") to match the PM/BA/TC/GM naming convention already in [[cv-suite]]. If Kishore attaches them under different names, ask before proceeding.
- Simplify handles the actual apply step in-browser; this skill only recommends.