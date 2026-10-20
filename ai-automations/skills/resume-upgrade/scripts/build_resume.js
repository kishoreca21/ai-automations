#!/usr/bin/env node
/*
  build_resume.js -- renders a tailored, ATS-safe, single-column, one-page resume (.docx).

  USAGE:  node build_resume.js <input.json> <output.docx>

  This freezes the finalized layout so every run is identical. The SKILL.md workflow
  produces the tailored *content*; this script only renders it with the correct
  ATS-safe styling. Do not hand-write docx code each run -- fill the JSON and call this.

  HARD RULES baked in: single column, no tables, all text real (no images), standard
  headings and fonts, real bullets, dates right-aligned with a tab stop (not a table).
  Do NOT put em dashes or en dashes in any string; the script prints a warning if it
  finds one so you can fix it (use commas, colons, " | ", or a plain hyphen for dates).

  INPUT SCHEMA (every value is plain text):
  {
    "name": "Kishore Kunal",
    "contact": "email  |  +91 ...  |  linkedin.com/in/...",
    "summary": "one paragraph ...",
    "skills": [
      { "label": "Product", "items": "A \u00b7 B \u00b7 C" },
      { "label": "Technical & Tools", "items": "SQL \u00b7 Excel \u00b7 ..." }
    ],
    "sections": [
      { "heading": "Experience", "blocks": [
        { "role": "FNZ, Gurugram  |  Analyst Tester", "date": "Dec 2022 - Aug 2025",
          "bullets": ["...", "..."] }
      ]},
      { "heading": "Product Projects", "blocks": [
        { "lead": "redBus 'Open Ticket' (...): ", "rest": "..." }
      ]},
      { "heading": "Awards & Certifications", "blocks": [ { "bullet": "... \u00b7 ..." } ]},
      { "heading": "Education", "blocks": [ { "role": "PGDBM, MDI, Gurgaon", "date": "2025 - 2027" } ]}
    ],
    "layout": {   // optional -- sensible defaults; nudge only to force one page
      "margin": 670, "bodyHalfPt": 21, "nameHalfPt": 34,
      "headingBefore": 46, "headingAfter": 16, "roleBefore": 40,
      "afterBullet": 10, "afterSkill": 10, "pageWidth": 11906, "pageHeight": 16838
    }
  }

  A block in a section is ONE of:
    { "role": "...", "date": "...", "bullets": ["..."] }  -> bold role left, date right, optional bullets
    { "lead": "...", "rest": "..." }                       -> a bullet with a bold lead then regular text
    { "bullet": "..." }                                     -> a plain bullet
*/

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, LevelFormat, TabStopType
} = require('docx');
const fs = require('fs');

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node build_resume.js <input.json> <output.docx>");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));

// --- safety net: warn on em/en dashes anywhere in the content ---
const offenders = [];
(function scan(o, p) {
  if (typeof o === 'string') { if (/[\u2013\u2014]/.test(o)) offenders.push(p + ' -> ' + o); }
  else if (Array.isArray(o)) o.forEach((v, i) => scan(v, p + '[' + i + ']'));
  else if (o && typeof o === 'object') Object.keys(o).forEach(k => scan(o[k], p ? p + '.' + k : k));
})(data, '');
if (offenders.length) {
  console.warn("WARNING: em/en dash found in content (replace with comma/colon/'|'/hyphen):");
  offenders.forEach(s => console.warn("  " + s));
}

const L = Object.assign({
  margin: 670, bodyHalfPt: 21, nameHalfPt: 34,
  headingBefore: 46, headingAfter: 16, roleBefore: 40,
  afterBullet: 10, afterSkill: 10, pageWidth: 11906, pageHeight: 16838,
}, data.layout || {});
const FONT = "Calibri";
const BODY = L.bodyHalfPt;
const CONTENT_W = L.pageWidth - L.margin * 2;

function heading(text) {
  return new Paragraph({
    spacing: { before: L.headingBefore, after: L.headingAfter },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888", space: 2 } },
    children: [new TextRun({ text: String(text).toUpperCase(), bold: true, size: BODY, color: "1a1a1a", characterSpacing: 8 })],
  });
}
function roleLine(left, right) {
  const kids = [new TextRun({ text: left, bold: true, size: BODY })];
  if (right) kids.push(new TextRun({ text: "\t" + right, size: BODY - 1, color: "444444" }));
  return new Paragraph({
    spacing: { before: L.roleBefore, after: 8 },
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
    children: kids,
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bul", level: 0 }, spacing: { after: L.afterBullet },
    children: [new TextRun({ text, size: BODY })],
  });
}
function inlineItem(lead, rest) {
  return new Paragraph({
    numbering: { reference: "bul", level: 0 }, spacing: { after: L.afterBullet },
    children: [new TextRun({ text: lead, bold: true, size: BODY }), new TextRun({ text: rest, size: BODY })],
  });
}
function skillLine(label, items) {
  return new Paragraph({
    spacing: { after: L.afterSkill },
    children: [new TextRun({ text: label + ": ", bold: true, size: BODY }), new TextRun({ text: items, size: BODY })],
  });
}

const children = [];
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 16 },
  children: [new TextRun({ text: data.name, bold: true, size: L.nameHalfPt, color: "111111" })] }));
if (data.contact) children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 34 },
  children: [new TextRun({ text: data.contact, size: BODY - 1, color: "444444" })] }));
if (data.summary) children.push(new Paragraph({ spacing: { after: 28 },
  children: [new TextRun({ text: data.summary, size: BODY })] }));

if (data.skills && data.skills.length) {
  children.push(heading("Core Skills"));
  data.skills.forEach(s => children.push(skillLine(s.label, s.items)));
}

(data.sections || []).forEach(sec => {
  children.push(heading(sec.heading));
  (sec.blocks || []).forEach(b => {
    if (b.role !== undefined) {
      children.push(roleLine(b.role, b.date));
      (b.bullets || []).forEach(t => children.push(bullet(t)));
    } else if (b.lead !== undefined) {
      children.push(inlineItem(b.lead, b.rest || ""));
    } else if (b.bullet !== undefined) {
      children.push(bullet(b.bullet));
    }
  });
});

const doc = new Document({
  creator: data.name || "Resume",
  styles: { default: { document: { run: { font: FONT, size: BODY, color: "222222" } } } },
  numbering: { config: [{ reference: "bul", levels: [{
    level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
    style: { run: { size: BODY }, paragraph: { indent: { left: 260, hanging: 180 } } },
  }] }] },
  sections: [{
    properties: { page: { size: { width: L.pageWidth, height: L.pageHeight },
      margin: { top: L.margin, bottom: L.margin, left: L.margin, right: L.margin } } },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("wrote " + outPath);
});
