---
name: job-hunt-run
description: "One-command LinkedIn job-hunt pipeline: discover new roles, dedupe against Kishore's tracker, scrape JDs, tailor resumes, deliver."
---

# Job Hunt Run

## Trigger

Kishore says "run job hunt" or invokes /job-hunt inside the "Linkedin and Job work" project.

## Prerequisites (verify first, halt if missing)

- Kishore's Chrome is open and logged into LinkedIn. The pipeline uses the mcp__claude-in-chrome__* tools which drive his local Chrome via the desktop app. If unreachable, tell him and stop.
- His 4 base resumes are accessible: `Kishore_Kunal_CV_Product_Manager.docx`, `Kishore_Kunal_CV_Business_Analyst.docx`, `Kishore_Kunal_CV_Technology_Consultant.docx`, `Kishore_Kunal_CV_General_Manager.docx`. Ask him to attach any that aren't already in the project or the session's uploads.
- His current tracker.xlsx is attached (or he explicitly wants a fresh run with no prior state).

## Steps

1. **Read project state.** Use Projects `project_read claude/agent-workflow.md` for the operating manual (keyword set, tier priority, resume-base map, skip rules). If the doc doesn't exist, halt and tell him the workflow doc is missing.

2. **Load tracker.** If tracker.xlsx is attached, read it. Extract:
   - `HARD_SKIP` = Job IDs where Status ∈ {Applied, Interviewing, Rejected, Offer, Withdrawn} — never re-surface these.
   - `ALREADY_TAILORED` = Job IDs where Status = Ready to apply AND JD Collected = Yes — don't redo their resumes.
   - `EXISTING` = all Job IDs in the tracker (used as dedupe set on discovery).

3. **Discovery.** Via Claude in Chrome, run the 6 standing keyword searches at f_E=3 (Associate) in Gurgaon, Haryana, India:
   `product manager`, `associate product manager`, `business analyst`, `technology consultant`, `management trainee`, `healthcare`.
   For each search, navigate, scroll to load all cards, extract Job IDs from `data-occludable-job-id` / `data-job-id` attributes. Collect and dedupe.

4. **Filter and prioritize.** Subtract `EXISTING` from discovered IDs to get `NEW`. Also handle the backlog: any Job IDs already in tracker with Status = Backlog get promoted to the work queue. Sort combined work queue by tier (PM=1, BA=2, TC=3, GM=4, HC=5), then by rank within source query. Cap this run at 25 items (or a lower cap Kishore names).

5. **JD scrape.** For each ID in the work queue:
   - Navigate to `https://www.linkedin.com/jobs/view/<id>/`
   - Wait 3s, scroll down 5-6 ticks, wait 2s (LinkedIn lazy-loads the About-the-job section only after scroll)
   - `get_page_text` — extract title, company, location, work type, description body
   - Save to `/home/claude/jobhunt/jds/<id>.txt` in the standard header + body format
   - If a page doesn't render the JD (some "Responses managed off LinkedIn" postings hide it), mark that ID as `JD unavailable — apply direct` in the tracker and move on. Do not retry more than once.

6. **Resume tailoring.** For each scraped JD, invoke the `resume-upgrade` skill with:
   - The JD text as target job description
   - The base resume matching the job's tier (see agent-workflow.md resume-base map)
   Save each tailored resume as `/home/claude/jobhunt/resumes/<Company>_<Title>_<id>.docx` (sanitize filename).

7. **Rebuild deliverables.**
   - Regenerate `tracker.xlsx` with all rows (old + new). New rows get JD Collected = Yes, Status = Ready to apply. Preserve any existing Status values.
   - Build `JDs_SessionN.docx` with the JDs scraped this run (N = increment from prior sessions).

8. **Deliver.**
   - SendUserFile the updated tracker.xlsx, the new JDs docx, and every tailored resume produced this run.
   - `project_write` the updated tracker.xlsx and JDs docx into the project so subsequent sessions can find them.

## Verification

- Confirm every SendUserFile call succeeded.
- Print a plain-English summary at the end:
  - N new jobs discovered
  - M JDs successfully scraped (K failed, listed by ID)
  - J resumes tailored
  - Current tracker row count
  - How many rows are Ready to apply and how many remain Backlog
- If Chrome is unreachable at step 3, stop immediately and tell Kishore to open Chrome and log into LinkedIn, then re-invoke /job-hunt.

## Notes

- Kishore already has Simplify installed in Chrome and uses it for the actual apply step. This skill delivers tailored resumes; Simplify (or a manual click) handles application submission.
- LinkedIn's virtual list unloads content when scrolled out of view — always use scroll + get_page_text, never rely on card content in search list DOM.
- Job URLs must be clean `/jobs/view/<id>/` form — query strings can trigger tool content filters.
- Be honest about scale: if the work queue is >25, tell him the cap kicked in and the rest stays Backlog for the next /job-hunt call.