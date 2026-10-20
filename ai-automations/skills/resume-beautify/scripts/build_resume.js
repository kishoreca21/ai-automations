#!/usr/bin/env node
/*
  build_resume.js — renders a single-column, ATS-safe, one-page resume (.docx).

  USAGE:  node build_resume.js <input.json> <output.docx>

  This is the frozen renderer for the resume-beautify skill. The SKILL.md workflow
  produces the structured JSON; this script only renders it with the correct
  ATS-safe styling. Do not hand-write docx code each run — fill the JSON and call this.

  HARD RULES baked in:
    - single column, no tables holding resume content
    - all text real (no critical info inside the logo image)
    - standard headings, Calibri, real bullets
    - dates right-aligned with a PositionalTab (not a 2-column table)
    - em/en dashes rejected; use commas, colons, " | ", or plain hyphens for date ranges

  INPUT SCHEMA (every value is plain text unless noted):
  {
    "name": "Kishore Kunal",
    "contact": "email  |  +91 ...  |  linkedin.com/in/...  |  City",
    "summary": "one paragraph — will sit under a PROFILE heading",

    "logo": {                         // optional; omit for max ATS safety
      "path": "/abs/path/to/logo.png",
      "width": 65,                    // pixels; 60-80 is a good range
      "height": 65,
      "topOffsetEmu": 60000           // EMU from page top; 60000 ≈ 0.06"
    },

    "skillsFormat": "grouped",        // "grouped" (default) | "inline"
    "skills": [
      { "label": "Analytics & Data", "items": "SQL · Power BI · Tableau · Excel" },
      { "label": "Business Analysis", "items": "PRDs · User Stories (INVEST) · BPMN" }
    ],
    // If "skillsFormat": "inline", skills[] is ignored and skillsInline is used:
    "skillsInline": "SQL · Power BI · Tableau · PRDs · User Stories · BPMN · Python",

    "sections": [
      { "heading": "Work Experience", "blocks": [
        { "role": "FNZ, Gurugram  |  Analyst Tester", "date": "Dec 2022 - Aug 2025",
          "bullets": ["...", "..."] }
      ]},
      { "heading": "Projects", "blocks": [
        { "lead": "redBus 'Open Ticket' (2026): ", "rest": "Designed a UPI-based ..." }
      ]},
      { "heading": "Awards & Certifications", "blocks": [ { "bullet": "... ; ..." } ]},
      { "heading": "Education", "blocks": [
        { "role": "PGDBM, MDI, Gurgaon", "date": "2025 - 2027" }
      ]}
    ],

    "density": "normal",              // "loose" | "normal" | "tight" | "compact"
    "layout": {                       // optional overrides on top of the density preset
      "margin": 340, "bodyHalfPt": 20, "nameHalfPt": 30,
      "headingBefore": 14, "headingAfter": 4, "roleBefore": 12,
      "afterBullet": 2, "afterSkill": 2,
      "pageWidth": 11906, "pageHeight": 16838  // A4
    }
  }

  A block in a section is ONE of:
    { "role": "...", "date": "...", "bullets": ["..."] }  -> bold role left, date right, optional bullets
    { "lead": "...", "rest": "..." }                       -> a bullet with a bold lead then regular text
    { "bullet": "..." }                                     -> a plain bullet
*/

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, LevelFormat, TabStopType,
  ImageRun, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom,
  HorizontalPositionAlign, VerticalPositionAlign, TextWrappingType,
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

// --- density presets: pick one point on the tuning ladder ---
const DENSITY_PRESETS = {
  loose:   { margin: 720, bodyHalfPt: 22, nameHalfPt: 36, headingBefore: 60, headingAfter: 20, roleBefore: 50, afterBullet: 14, afterSkill: 14 },
  normal:  { margin: 540, bodyHalfPt: 21, nameHalfPt: 34, headingBefore: 30, headingAfter: 10, roleBefore: 24, afterBullet: 8,  afterSkill: 8  },
  tight:   { margin: 420, bodyHalfPt: 20, nameHalfPt: 32, headingBefore: 18, headingAfter: 6,  roleBefore: 14, afterBullet: 4,  afterSkill: 4  },
  compact: { margin: 340, bodyHalfPt: 20, nameHalfPt: 30, headingBefore: 14, headingAfter: 4,  roleBefore: 12, afterBullet: 2,  afterSkill: 2  },
};
const preset = DENSITY_PRESETS[data.density] || DENSITY_PRESETS.normal;
const L = Object.assign(
  { pageWidth: 11906, pageHeight: 16838 }, // A4 default; override for US Letter
  preset,
  data.layout || {}
);
const FONT = "Calibri";
const BODY = L.bodyHalfPt;
const CONTENT_W = L.pageWidth - L.margin * 2;

// --- helpers ---
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
// Grouped skill line — no indent; wrapped continuation flows to the left margin
// so the second/third wrap uses the full page width.
function skillLine(label, items) {
  return new Paragraph({
    spacing: { after: L.afterSkill },
    children: [
      new TextRun({ text: label + ": ", bold: true, size: BODY }),
      new TextRun({ text: items, size: BODY }),
    ],
  });
}
// Inline "Core Skills:" — one long line, saves ~2 vertical lines vs grouped.
function skillsInlineLine(items) {
  return new Paragraph({
    spacing: { after: L.afterSkill },
    children: [
      new TextRun({ text: "Core Skills: ", bold: true, size: BODY }),
      new TextRun({ text: items, size: BODY }),
    ],
  });
}

// --- header (name + optional floating logo) ---
const children = [];
const nameKids = [new TextRun({ text: data.name, bold: true, size: L.nameHalfPt, color: "111111" })];

if (data.logo && data.logo.path) {
  const logoW = data.logo.width || 65;
  const logoH = data.logo.height || 65;
  // Explicit horizontal offset (EMU) so the logo's RIGHT edge lands exactly at
  // the content-right margin — same x-coordinate where every section-heading
  // rule ends. This is reliable across Word and LibreOffice, unlike `align`.
  //   1 dxa = 635 EMU;  1 px @ 96 DPI = 9525 EMU.
  const logoLeftEmu = (L.pageWidth - L.margin) * 635 - logoW * 9525;
  nameKids.push(new ImageRun({
    type: "png",
    data: fs.readFileSync(data.logo.path),
    transformation: { width: logoW, height: logoH },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: logoLeftEmu },
      verticalPosition:   { relative: VerticalPositionRelativeFrom.PAGE,   offset: (data.logo.topOffsetEmu !== undefined ? data.logo.topOffsetEmu : 100000) },
      wrap: { type: TextWrappingType.NONE },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      behindDocument: false,
      allowOverlap: true,
    },
  }));
}
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 16 }, children: nameKids }));

// --- contact line ---
if (data.contact) {
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 14 },
    children: [new TextRun({ text: data.contact, size: BODY - 1, color: "444444" })],
  }));
}

// --- PROFILE section (heading + summary) ---
if (data.summary) {
  children.push(heading("Profile"));
  children.push(new Paragraph({
    spacing: { after: 4 },
    children: [new TextRun({ text: data.summary, size: BODY })],
  }));
}

// --- CORE SKILLS ---
if (data.skillsFormat === "inline" && data.skillsInline) {
  children.push(heading("Core Skills"));
  children.push(skillsInlineLine(data.skillsInline));
} else if (data.skills && data.skills.length) {
  children.push(heading("Core Skills"));
  data.skills.forEach(s => children.push(skillLine(s.label, s.items)));
}

// --- remaining sections ---
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

// --- assemble the document ---
const doc = new Document({
  creator: data.name || "Resume",
  styles: { default: { document: { run: { font: FONT, size: BODY, color: "222222" } } } },
  numbering: { config: [{ reference: "bul", levels: [{
    level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
    style: { run: { size: BODY }, paragraph: { indent: { left: 260, hanging: 180 } } },
  }] }] },
  sections: [{
    properties: { page: {
      size: { width: L.pageWidth, height: L.pageHeight },
      margin: { top: L.margin, bottom: L.margin, left: L.margin, right: L.margin },
    } },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("wrote " + outPath + "  (density: " + (data.density || 'normal') + ")");
});
