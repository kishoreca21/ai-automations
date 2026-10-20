# Trireme AI — a three-agent equity research desk (n8n)

Built with my Group 2 teammates for the GenAI for Business course at MDI Gurgaon, then kept running as a personal build.

**The problem.** Stock screeners can't read context (a real joint venture vs. a PR release), and humans fall for a good story while ignoring the balance sheet. Trireme reads the market like a person and checks the numbers like a calculator.

## The committee

| Agent | Role | Looks at |
|---|---|---|
| **1 · Catalyst Hunter** | Qualitative specialist | Daily financial news; filters noise and clickbait; proposes one high-conviction stock with a verifiable catalyst |
| **2 · Quant Skeptic** | Risk manager | Ignores the news. 5-year fundamentals, a simplified DCF upside check, debt and ROE red flags |
| **3 · Fiduciary Synthesizer** | Portfolio manager | Resolves the two views into BUY / HOLD / SELL / **ESCALATE** |

## Guardrails

- **Math overrides hype.** If the Quant Skeptic rejects the fundamentals, the Synthesizer must veto the Catalyst Hunter.
- **Position-size caps** (e.g. max 10% of the portfolio), even on a "strong buy".
- **Escalate when unsure.** A big gap between the bullish and bearish agents defaults to ESCALATE, not a guess.
- **Strict JSON schemas** between agents so outputs never break the pipeline.
- **Human in the loop for execution.** The agent prepares the trade; a person places it.

## How it runs

```
RSS feeds (Economic Times, Moneycontrol, Yahoo, Business Standard)
  → merge + 24h cutoff + dedupe (n8n code nodes)
  → Agent 1 → Agent 2 → Agent 3 (LLM nodes, JSON in / JSON out)
  → Google Doc trade sheet + HTML email report
```

- Course version: n8n Cloud with Groq's low-latency LLMs.
- Personal version: moved to **self-hosted n8n on Docker** when the cloud subscription lapsed, extended with DeepSeek, Tavily search and Yahoo Finance data across ~95 NSE stocks.

## In this folder

- [Trireme_Group-2-Presentation.pdf](Trireme_Group-2-Presentation.pdf) — the class presentation
- [Trireme_Design-Document.pdf](Trireme_Design-Document.pdf) — need, architecture, agents, guardrails, automation vs. human-in-the-loop
- [Trireme_Code-Nodes-and-Prompts.pdf](Trireme_Code-Nodes-and-Prompts.pdf) — the n8n code nodes and every agent prompt
- [screenshots/](screenshots) — sample daily outputs (IOC, Hindalco, Grasim, May 2026)

> Workflow export (`trireme-workflow.json`) to be added. Built for learning; not investment advice.
