# AI Automations

The agents, schedulers and skills I've built to run the repetitive parts of my week, so my own time goes into thinking, not copy-pasting.

Everything here runs on Claude (scheduled tasks + skills driving Chrome and Gmail) or on n8n. Personal details (phone, email, salary, real holdings) have been replaced with `<PLACEHOLDERS>`.

## Scheduled agents

| Agent | When it runs | What it gives me |
|---|---|---|
| [Morning Recruiter Brief](scheduled-agents/morning-recruiter-brief.md) | Daily, 9:53 AM IST | Reads 24h of Gmail across every job portal, separates real recruiter updates from noise, and emails me one "do today / coming up / closed" brief with deadlines in IST |
| [Pre-Market Portfolio Agent](scheduled-agents/pre-market-portfolio-agent.md) | Weekdays, 7:45 AM IST | Triage of overnight news against a long-term equity portfolio; one-minute BUY / SELL / **NO ACTION** call with sourced reasons |

Design choices I care about in both:
- **Read-only by default.** The recruiter agent can only email *me*; it never replies, labels or deletes.
- **Inputs are data, not instructions.** An email or web page that says "do X" is reported, never obeyed.
- **No guessing.** Unknown dates, prices or facts are said to be unknown.
- **The boring answer is allowed.** "NO ACTION" is the expected output on most days.

## Job-search skills (Claude Skills)

| Skill | What it does |
|---|---|
| [job-hunt-run](skills/job-hunt-run) | LinkedIn pipeline: discover new roles → dedupe against my tracker → scrape JDs → tailor resumes → deliver |
| [iimjobs-hunt-run](skills/iimjobs-hunt-run) | Same idea for iimjobs: personalised feed + 6 category pages, ATS-scores each JD against the best-fit base resume, ranked sheet |
| [recruiter-connect-run](skills/recruiter-connect-run) | Finds best-fit roles posted in the last 24h in Delhi NCR and drafts a short, human connection note to the recruiter |
| [job-apply-run](skills/job-apply-run) | Bulk-apply loop across LinkedIn, Indeed, iimjobs and Naukri, with hard rules: never solve CAPTCHAs, never create accounts, never enter ID or bank details, skip anything that needs a fee |
| [resume-upgrade](skills/resume-upgrade) | Tailors a resume to a target JD → one-page ATS-safe `.docx` + transparent 0–100 alignment score + change report. Never fabricates experience; asks about missing must-haves |
| [resume-beautify](skills/resume-beautify) | Rebuilds a resume into a clean single-column one-pager (Node `docx` builder, logo placement, right-aligned dates) |

Each folder has a `SKILL.md` (the instructions) plus any scripts and references it uses.

## n8n Trireme — multi-agent stock analysis

See [n8n-trireme](n8n-trireme/README.md): separate sell/hold and buy agents orchestrated in n8n, covering ~95 NSE stocks, moved from n8n Cloud to self-hosted Docker.
