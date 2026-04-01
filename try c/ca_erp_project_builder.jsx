import { useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Syne:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07091A;--bg2:#0C1030;
  --gold:#C9A84C;--gold2:#E8CC7D;--gold3:#A07830;
  --text:#E8EEF8;--muted:#6B7A9F;
  --border:rgba(201,168,76,0.18);--faint:rgba(255,255,255,0.03);
  --green:#1B7A5A;--teal:#0B6B7B;--red:#8B2520;
  --blue:#1565C0;--violet:#4B2B8A;--amber:#B85A08;
}
body{font-family:'Syne',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden}
.mesh{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:0.055;animation:oF linear infinite}
@keyframes oF{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-55px) scale(1.08)}}
.hdr{position:sticky;top:0;z-index:200;background:rgba(7,9,26,0.94);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:0 28px;height:58px;display:flex;align-items:center;gap:0}
.logo{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--gold);margin-right:24px;white-space:nowrap}
.logo em{color:var(--text);font-style:normal}
.tabs{display:flex;gap:2px;overflow-x:auto;flex:1;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{padding:7px 11px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.18s;color:var(--muted);border:1px solid transparent;background:none;letter-spacing:0.2px}
.tab:hover{color:var(--text);background:rgba(255,255,255,0.04)}
.tab.on{color:var(--gold);background:rgba(201,168,76,0.1);border-color:var(--border)}
.hbadge{margin-left:auto;padding:4px 11px;border-radius:20px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#07091A;font-size:10px;font-weight:800;letter-spacing:1.5px;white-space:nowrap;text-transform:uppercase}
.main{position:relative;z-index:1;max-width:1300px;margin:0 auto;padding:36px 28px 64px}
.hero{text-align:center;padding:48px 0 36px;animation:fU 0.7s ease both}
.pill{display:inline-flex;align-items:center;gap:6px;background:rgba(201,168,76,0.08);border:1px solid var(--border);padding:5px 15px;border-radius:20px;margin-bottom:18px;font-size:10.5px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(30px,4.5vw,52px);font-weight:900;line-height:1.1;margin-bottom:14px;background:linear-gradient(135deg,#fff 0%,var(--gold2) 50%,var(--gold) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:14.5px;color:var(--muted);max-width:580px;margin:0 auto 24px;line-height:1.7}
.hstats{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.hs{padding:7px 15px;border-radius:28px;background:var(--faint);border:1px solid var(--border);font-size:12px;font-weight:600}
.hs span{color:var(--gold)}
.sechd{display:flex;align-items:flex-start;gap:14px;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid var(--border)}
.si{width:42px;height:42px;border-radius:11px;flex-shrink:0;background:linear-gradient(135deg,var(--gold3),var(--gold));display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(201,168,76,0.22)}
.st{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:var(--text)}
.ss{font-size:12px;color:var(--muted);margin-top:3px;line-height:1.5}
.doc-panel{display:grid;grid-template-columns:210px 1fr;gap:18px}
@media(max-width:768px){.doc-panel{grid-template-columns:1fr}.main{padding:22px 14px 48px}}
.dsidebar{display:flex;flex-direction:column;gap:5px}
.dbtn{padding:9px 13px;border-radius:8px;font-size:11.5px;font-weight:600;cursor:pointer;transition:all 0.18s;color:var(--muted);border:1px solid transparent;background:rgba(255,255,255,0.02);text-align:left;letter-spacing:0.2px;display:flex;align-items:center;gap:8px}
.dbtn:hover{color:var(--text);background:rgba(255,255,255,0.05)}
.dbtn.on{color:var(--gold);background:rgba(201,168,76,0.08);border-color:var(--border)}
.dbtn .dchip{margin-left:auto;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;background:rgba(201,168,76,0.15);color:var(--gold)}
.dcontent{background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:14px;overflow:hidden;min-height:580px}
.dtop{background:rgba(201,168,76,0.06);padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px}
.dfn{font-family:'Fira Code',monospace;font-size:12.5px;color:var(--gold2)}
.dds{font-size:11.5px;color:var(--muted);margin-top:2px}
.cbtn{margin-left:auto;padding:6px 13px;border-radius:6px;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.25);color:var(--gold);font-size:11px;font-weight:700;cursor:pointer;transition:all 0.18s;white-space:nowrap}
.cbtn:hover{background:rgba(201,168,76,0.25)}
.cbtn.ok{background:rgba(27,122,90,0.2);border-color:var(--green);color:#3EC89A}
.dbody{padding:22px;overflow-y:auto;max-height:70vh}
.md h1{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--gold2);margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(201,168,76,0.15)}
.md h2{font-size:14px;font-weight:700;color:var(--text);margin:20px 0 8px;display:flex;align-items:center;gap:7px}
.md h2::before{content:'';display:inline-block;width:3px;height:14px;background:var(--gold);border-radius:2px}
.md h3{font-size:13px;font-weight:700;color:var(--gold2);margin:14px 0 6px}
.md p{font-size:12.5px;color:#BCC8E0;margin-bottom:8px;line-height:1.75}
.md ul{padding-left:16px;margin-bottom:8px}
.md li{font-size:12.5px;color:#A8B8D0;margin-bottom:4px;line-height:1.55}
.md code{font-family:'Fira Code',monospace;font-size:11px;background:rgba(201,168,76,0.08);color:var(--gold2);padding:2px 6px;border-radius:3px;border:1px solid rgba(201,168,76,0.15)}
.md pre{font-family:'Fira Code',monospace;font-size:11px;background:rgba(0,0,0,0.45);color:#A8C8E8;padding:16px;border-radius:9px;overflow-x:auto;margin:10px 0;border:1px solid rgba(255,255,255,0.06);line-height:1.7;white-space:pre}
.md table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
.md th{background:rgba(201,168,76,0.1);color:var(--gold);padding:8px 11px;text-align:left;font-size:10.5px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;border-bottom:1px solid var(--border)}
.md td{padding:7px 11px;border-bottom:1px solid rgba(255,255,255,0.04);color:#A8B8D0;vertical-align:top}
.md tr:hover td{background:rgba(255,255,255,0.02)}
.wf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:13px}
.wfc{background:var(--faint);border:1px solid var(--border);border-radius:13px;padding:18px;transition:all 0.22s;position:relative;overflow:hidden;animation:fU 0.5s ease both}
.wfc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--cc,var(--gold))}
.wfc:hover{transform:translateY(-3px);border-color:rgba(201,168,76,0.3);background:rgba(255,255,255,0.05)}
.wfn{font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--cc,var(--gold));margin-bottom:7px}
.wft{font-size:14px;font-weight:700;color:var(--text);margin-bottom:5px}
.wfd{font-size:12px;color:var(--muted);line-height:1.55}
.wtool{margin-top:9px;font-family:'Fira Code',monospace;font-size:10.5px;background:rgba(0,0,0,0.3);color:var(--gold2);padding:4px 9px;border-radius:5px;border:1px solid rgba(201,168,76,0.12);display:inline-block}
.prompt-box{background:rgba(0,0,0,0.4);border:1px solid rgba(201,168,76,0.2);border-radius:13px;overflow:hidden;margin-bottom:18px}
.ptop{background:rgba(201,168,76,0.07);padding:11px 17px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(201,168,76,0.1)}
.plbl{font-size:10.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold)}
.pbody{padding:18px;font-family:'Fira Code',monospace;font-size:11.5px;color:#A8C8E8;line-height:1.75;white-space:pre-wrap}
.ibox{padding:13px 17px;border-radius:11px;margin-bottom:15px;font-size:12.5px;line-height:1.65}
.igold{background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.2);color:#C8D8E8}
.igreen{background:rgba(27,122,90,0.08);border:1px solid rgba(27,122,90,0.25);color:#A8D8C0}
.ired{background:rgba(139,37,32,0.1);border:1px solid rgba(139,37,32,0.3);color:#E8A8A0}
.tbl-wrap{overflow:auto;border-radius:11px;border:1px solid var(--border);margin-bottom:20px}
.dtbl{width:100%;border-collapse:collapse;font-size:12px}
.dtbl th{background:rgba(201,168,76,0.1);color:var(--gold);padding:9px 13px;text-align:left;font-size:10.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border)}
.dtbl td{padding:9px 13px;border-bottom:1px solid rgba(255,255,255,0.04);color:#A8B8D0;vertical-align:top}
.dtbl tr:hover td{background:rgba(255,255,255,0.02)}
.must{color:#3EC89A;font-weight:700;font-size:10.5px}
.rec{color:var(--gold);font-weight:700;font-size:10.5px}
.tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:11px}
.toolc{background:var(--faint);border:1px solid var(--border);border-radius:11px;padding:15px;transition:all 0.2s;animation:fU 0.5s ease both}
.toolc:hover{background:rgba(255,255,255,0.05);transform:translateY(-2px)}
@keyframes fU{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
`;

// ── ALL 10 DOCUMENTS ──────────────────────────────────────────────────────────
const DOCS = {
"PRD.md": {
icon:"📋", desc:"Product Requirements Document — Problem, users, flows, revenue",
content:`# PRD.md — Product Requirements Document
# CA ERP Suite — Income Tax · GST · TDS · Balance Sheet Platform
# Inspired by Winman Software | Built for Indian Chartered Accountants

---

## Project Name
**CA ERP Suite v1.0** — Full-Stack Income Tax + GST + TDS + Balance Sheet Software for CAs

---

## Problem Statement

Indian Chartered Accountants currently manage 500–2000 assessee files using:
- **Winman CA-ERP** (desktop only — no cloud, no mobile, no team access)
- **Winman TDS** (separate desktop software — no integration with CA-ERP)
- **Winman GST** (third separate desktop tool — no real-time sync)
- **Tally Prime** (accounting — no direct ITR/TDS/GST filing)

**Core pain points:**
1. Three separate desktop applications — data entry done 3× for the same client
2. Zero remote access — CA cannot work from home or on-site at client's office
3. No multi-user — article clerks wait for seniors to finish before they can work
4. No client portal — clients call/WhatsApp to ask "is my return filed?"
5. No AI assistance — CAs manually verify every clause in Form 3CD (44 clauses!)
6. No WhatsApp integration — documents collected manually by phone/email
7. No practice analytics — CA has no dashboard showing WIP, pending returns, billing

---

## Target Users

| User Type | Primary Need | Volume |
|-----------|-------------|--------|
| Chartered Accountant (CA Owner) | ITR computation, GST filing, TDS, 3CD audit | Primary |
| CA Staff / Article Clerk | Data entry, client document collection, basic filing | Daily users |
| Client (Individual / Company) | View filed returns, download ITR-V, upload docs | 500–2000 per CA firm |
| CA Firm Admin | Billing, deadlines, staff performance, WIP | Monthly |

---

## Core Features (Winman-Equivalent + AI Upgrades)

### A. Income Tax Module (Winman CA-ERP equivalent)
- Single-window IT computation for all assessee types (Individual, HUF, Firm, Company, AOP, BOI, Trust)
- All income heads: Salary, HP, PGBP, Capital Gains, Other Sources
- Old vs New Regime tax comparator (Section 115BAC — IT Act 2025)
- Tax slabs: New Regime FY 2026-27 (₹4L nil → 30% above ₹24L)
- Form 16 PDF import → AI auto-extract → auto-fill computation
- AIS / TIS / 26AS auto-fetch and reconciliation with books
- ITR-1 through ITR-7 JSON generation per income tax e-filing schema
- e-Return upload to IT portal via ERI API
- ITR-V auto-download, e-verify via Aadhaar OTP / Net Banking
- Bulk e-return processing status download (MIS report — all clients)
- Intimation import (143(1) emails parsed and mapped to client)
- Error locator before filing (schema validation + IT dept business rules)
- Advance Tax calculator (4 instalments with amounts and due dates)
- Old vs New regime comparison with automatic recommendation
- Import from previous year files; import from ITR/3CD JSON

### B. Balance Sheet & Trial Balance Module
- Import Trial Balance from Tally Prime via ODBC / XML export in single click
- Import from Excel (custom mapping of COA to standard heads)
- Balance Sheet generation as per Schedule III (Companies Act 2013)
- P&L Account (Manufacturing / Trading / P&L format)
- Cash Flow Statement (Direct + Indirect method — AS-3 / Ind AS-7)
- Notes to Accounts auto-population
- Export values directly to ITR (Schedule BP, Schedule AL, etc.)
- Comparative Balance Sheet (current year vs previous year)
- Customisable Balance Sheet format (per CA firm preference)
- Depreciation Schedule (SLM / WDV — Schedule II Companies Act)
- Digital signature on Balance Sheet (DSC integration)
- PDF export with CA firm letterhead + seal

### C. Tax Audit Module — Form 3CD (Winman CA-ERP equivalent)
- Structured Form 3CA / 3CB / 3CD data entry
- All 44 clauses of Form 3CD with AI-suggested answers
- AI reads trial balance + computation → auto-suggests clause answers
- Clause-by-clause validation with mandatory field check
- Auto-import TDS data from TDS module into 3CD (clause 34)
- Threshold checks: 40AB (cash payments), loans, related parties
- Digital signature on 3CD via DSC / Aadhaar eSign
- Fully automated e-filing: 'Add CA' to 3CD approval to upload
- 3CD JSON generation as per IT department schema
- Flag clauses requiring 'Yes' — AI explains why and suggests disclosure

### D. TDS Software Module (Winman TDS equivalent)
- All TDS return forms: 24Q (salary), 26Q (non-salary), 27Q (NRI payments), 27EQ (TCS)
- IT Act 2025: TDS consolidated under Section 392 (salary), Section 393 (others)
- Section-wise deduction rates (192B, 194C, 194J, 194H, 194-I, 194A, 195, etc.)
- TAN validation: [A-Z]{4}[0-9]{5}[A-Z]{1}
- PAN validation: [A-Z]{5}[0-9]{4}[A-Z]{1}
- Section 206AB / 206CCA compliance check (higher TDS for non-filers)
- Interest calculation: 1%/1.5% p.m. for late deduction/late payment
- TRACES integration: Consolidated FVU download, Form 16 mass download
- Form 16 (salary) and Form 16A (non-salary) bulk generation
- Challan 281 e-payment tracking and OLTAS verification
- Revised return facility with easy correction workflow
- Import salary data from CA-ERP computation module
- Export TDS report for Form 3CD clause 34

### E. GST Module (Winman GST equivalent)
- GSTR-1, GSTR-3B, GSTR-9, GSTR-9C, GSTR-4, CMP-08
- Import from Tally / Excel; auto-bifurcate B2B / B2CS / EXP / CDNR
- GSTR-2A / GSTR-2B auto-reconciliation (ITC — Sections 16–18 CGST)
- Blocked ITC auto-flag: Section 17(5) items (food, personal, construction)
- GSP facility for direct GSTN API filing (post GSP licence)
- E-Invoicing IRN generation via IRP (mandatory > ₹5 crore turnover)
- E-Way Bill generate / extend / cancel via NIC API
- Annual GSTR-9 with exception report; GSTR-9C with auditor certification
- LUT filing (Form RFD-11) for exporters
- Composition scheme returns (CMP-08)
- IFF (Invoice Furnishing Facility) for QRMP filers

### F. Practice Management (CA Office OS)
- Client master: PAN, GSTIN, TAN, Aadhaar (hashed), type, contact
- Multi-user: CA_OWNER, CA_STAFF, ARTICLE_CLERK, CLIENT roles
- Compliance deadline calendar: all filing due dates per client
- Task assignment to staff; WIP tracker; TAT reports
- Billing module: invoice generation, payment tracking, WIP to bill
- WhatsApp bot: auto-collect documents, send reminders, status updates
- Client portal: secure login, document upload, return download
- MIS Summary Report: all clients with ITR/3CD filed / not-filed status
- Bulk e-return processing status download (Winman-inspired)
- Compliance score per client (% of filings on time)

---

## User Flows

### IT Computation + Filing Flow (Winman CA-ERP Replicated)
Client created → Import Form 16 PDF (AI parser) → Import 26AS/AIS (ERI API) →
Auto-fill computation → Import Trial Balance from Tally → Balance Sheet generated →
3CD clauses AI-suggested → DSC sign 3CD → Error check → Generate ITR JSON →
Upload to IT portal (ERI API) → ITR-V auto-downloaded → e-Verify (Aadhaar OTP) →
ACK stored in DB → WhatsApp ITR-V to client → Status in client portal

### TDS Return Filing Flow
Add deductees → Map challan payments → Section-wise entries →
Form 16/16A generated → TRACES FVU download → Error locator →
Submit via NSDL portal → ACK stored → Intimation emails imported

### GST Filing Flow
Import Tally TB → Auto-bifurcate B2B/B2CS → GSTR-2B reconciliation →
ITC blocked items flagged → Validate → File via GSP → ACK stored → Notify CA

---

## Revenue Model

| Plan | Price | Target |
|------|-------|--------|
| Solo CA | ₹999/month | 1 CA, 100 assessees |
| Small Firm | ₹2,499/month | 3 users, 300 assessees |
| Medium Firm | ₹5,999/month | 10 users, 1000 assessees |
| Large Firm | ₹14,999/month | 25 users, unlimited assessees |
| Enterprise | Custom | CA networks, ICAI chapters |

Pay-per-filing: ₹29 per ITR, ₹19 per TDS return, ₹39 per GSTR-9

---

## Success Metrics (12 months)
- 1,000 CA firms onboarded
- 5,00,000 ITR filings processed (replacing Winman desktop)
- 50,000 TDS returns filed
- 2,00,000 GSTR filings
- ₹3 Cr ARR by month 12`
},

"Features.md": {
icon:"⚡", desc:"Complete feature checklist with P0/P1/P2 priority and Winman mapping",
content:`# Features.md — Complete Feature List
# CA ERP Suite — Winman Equivalent + AI-Powered Cloud

## Priority: P0 = Launch blocker | P1 = Sprint 2 | P2 = Roadmap

## Auth & Multi-Tenancy (P0)
- [ ] CA firm registration with ICAI registration number validation
- [ ] Multi-role: CA_OWNER, CA_STAFF, ARTICLE_CLERK, CLIENT, ADMIN
- [ ] JWT RS256 + Refresh token rotation (15 min access, 7-day sliding refresh)
- [ ] TOTP MFA (mandatory for CA_OWNER, optional for staff)
- [ ] Firm-level subscription with seat management
- [ ] Assessee-level access control (staff sees only assigned clients)
- [ ] Aadhaar OTP for e-verification actions (not stored — OTP only)
- [ ] DSC (Digital Signature Certificate) vault — Class 3 certs per CA

## Income Tax Module — P0 (Core Product)
- [ ] Assessee master: PAN, AY, assessee type (Individual/HUF/Firm/Company/AOP/BOI/Trust)
- [ ] Single-window computation table — all income heads on one screen
- [ ] New Regime slabs (IT Act 2025): 0/5/10/15/20/25/30% for defined slabs
- [ ] Old Regime with all deductions (80C/80D/80CCD/24(b)/HRA/LTA etc.)
- [ ] Regime comparator — show tax under both, recommend optimal
- [ ] Form 16 PDF parser (Google Vision + NER model — AI auto-extract)
- [ ] AIS / TIS fetch via ERI API → reconcile with computation
- [ ] 26AS import → TDS credit auto-applied to computation
- [ ] ITR-1: Salaried with HP + Other Sources (simple income)
- [ ] ITR-2: Capital gains, multiple HP, foreign income, RNOR
- [ ] ITR-3: Business income, partner in firm, F&O
- [ ] ITR-4: Presumptive income (44AD/44ADA/44AE equivalent)
- [ ] ITR-5: Firms, LLPs, AOPs, BOIs
- [ ] ITR-6: Companies not claiming Sec 11 exemption
- [ ] ITR-7: Trusts, political parties, Sec 10(23C) institutions
- [ ] ITR JSON generation as per IT dept e-filing schema
- [ ] e-Return upload via ERI API — auto-login to IT portal
- [ ] ITR-V auto-download, extract from ZIP, save to S3
- [ ] e-Verify: Aadhaar OTP / Net Banking / DMAT / Bank Account
- [ ] Bulk e-return processing status (Winman MIS — all assessees in one click)
- [ ] 143(1) intimation email import and parse → show to CA
- [ ] Error locator utility (schema + business rule validation before upload)
- [ ] Advance Tax calculator — 4 instalments with due dates (15 Jun/Sep/Dec/Mar)
- [ ] Capital Gains: STCG (Sec 111A — 20% / 15%) + LTCG (Sec 112/112A — 12.5%)
- [ ] Indexation calculator using CII (Cost Inflation Index)
- [ ] TDS on property (26QB) computation — 1% if sale value ≥ ₹50L
- [ ] House Property: Self-occupied loss ₹2L cap; Let-out with municipal tax, repairs 30%
- [ ] Import from previous year ITR JSON (easy data carry-forward)
- [ ] Bulk import of previous year assessee files (migrate from Winman)

## Balance Sheet Module — P0
- [ ] Import Trial Balance from Tally Prime (ODBC / XML — single click)
- [ ] Import TB from Excel (custom column mapping to COA heads)
- [ ] COA hierarchy: Assets / Liabilities / Equity / Income / Expenses
- [ ] Debit/credit columns ALWAYS separate — never signed single amount
- [ ] Schedule III Balance Sheet (Companies Act 2013)
- [ ] P&L Account: Manufacturing A/c + Trading A/c + P&L format
- [ ] Cash Flow Statement: Direct + Indirect method (AS-3 / Ind AS-7)
- [ ] Notes to Accounts: Fixed assets, loans, related parties, contingencies
- [ ] Export values to ITR Schedule BP / Schedule AL / Schedule SH
- [ ] Comparative Balance Sheet (2 years side-by-side)
- [ ] Depreciation Schedule: SLM and WDV (Schedule II Companies Act 2013)
- [ ] PDF with CA firm letterhead + MCA watermark
- [ ] DSC signature on Balance Sheet (Class 3 DSC)
- [ ] Auto-fill Signatory/Auditor details in Balance Sheet footer

## Form 3CD Tax Audit Module — P0
- [ ] Form 3CA (for companies) + 3CB (for others) + 3CD
- [ ] All 44 clauses of Form 3CD structured data entry
- [ ] AI-suggested answers: Claude API reads TB + computation → suggests per clause
- [ ] Clause 34: TDS data auto-imported from TDS module
- [ ] Clause 17(l): Cash payment > ₹10,000 auto-detected from vouchers
- [ ] Clause 26: Deductions under Chapter VI-A auto-pulled from computation
- [ ] Mandatory field validation (red flag for missing critical clause data)
- [ ] "Yes/No" clauses with AI-generated explanation when Yes
- [ ] 3CD JSON generation per IT dept e-filing schema
- [ ] Fully automated: Add CA → DSC sign → submit → ACK
- [ ] Audit trail: every clause change logged with who/when/what

## TDS Module — P0
- [ ] Deductor master: TAN (format [A-Z]{4}[0-9]{5}[A-Z]{1}) + company details
- [ ] All deductee details: PAN (format [A-Z]{5}[0-9]{4}[A-Z]{1}) mandatory
- [ ] Section codes: 192B (salary), 194C (contractor), 194J (professional), 194H (commission), 194-I (rent), 194A (interest), 195 (non-resident), 194Q (purchase), etc.
- [ ] IT Act 2025 mapping: Sec 392 (salary TDS), Sec 393 (others TDS), Sec 394 (TCS)
- [ ] TDS rates per section with threshold amounts
- [ ] 206AB/206CCA check: Higher rate (2×) for non-filers of ITR
- [ ] Interest: Late deduction 1% p.m. from deduction date; Late deposit 1.5% p.m.
- [ ] Form 24Q (quarterly salary TDS) + 26Q (non-salary) + 27Q (NRI) + 27EQ (TCS)
- [ ] FVU file generation as per NSDL format
- [ ] TRACES integration: Consolidated FVU download, challan input file, TBR download
- [ ] Form 16 bulk generation (salary) + Form 16A (non-salary)
- [ ] Revised return facility: easy correction of previous quarters
- [ ] Challan 281 OLTAS verification — online challan e-verification
- [ ] Import salary data from IT computation module (no re-entry)
- [ ] TDS report for Form 3CD clause 34 (auto-generated)
- [ ] DSC / TAN registration on IT website from within software

## GST Module — P1
- [ ] GSTIN format validation: [0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}
- [ ] GSTR-1: B2B / B2CS / CDNR / EXP / HSN sections
- [ ] GSTR-3B: ITC computation with Section 17(5) blocked credits auto-flagged
- [ ] GSTR-2A/2B auto-download via GSP + reconciliation with purchase register
- [ ] GSTR-9 annual return with exception report
- [ ] GSTR-9C: CA certification (reconciliation statement)
- [ ] GSTR-4: Composition dealer annual return
- [ ] CMP-08 (quarterly composition statement)
- [ ] IFF (Invoice Furnishing Facility) for QRMP filers
- [ ] Import data from Tally / Excel — auto-bifurcate B2B/B2CS
- [ ] E-Invoicing IRN generation (IRP API — mandatory > ₹5 cr turnover)
- [ ] E-Way Bill generate/extend/cancel (NIC API)
- [ ] GSP facility for direct GSTN filing (requires GSP licence)
- [ ] LUT filing (Form RFD-11) for zero-rated export supplies

## Practice Management — P1
- [ ] Client master with full PAN/GSTIN/TAN/Aadhaar(hashed) database
- [ ] Compliance calendar: all filing due dates per GSTIN/PAN
- [ ] Task assignment: staff → deadline → priority → status
- [ ] WIP tracker with billing integration
- [ ] WhatsApp Business API bot for document collection + reminders
- [ ] Client portal: upload docs, view filed returns, download ITR-V
- [ ] Billing: invoice per service, payment tracking, outstanding reports
- [ ] MIS summary: ITR/TDS/GST filed/not-filed report (Winman-inspired)
- [ ] Staff productivity: returns filed per day, pending, TAT

## AI Features — P1
- [ ] Form 16 PDF parser: Google Vision + custom NER → extract all fields
- [ ] 3CD AI assistant: Claude API → suggest clause answers from TB + computation
- [ ] Old vs New Regime AI recommendation (with plain language explanation)
- [ ] GST notice analyser: Claude reads DRC-01/ASMT-10 → drafts reply
- [ ] ITC optimiser: Flags unclaimed ITC, Section 17(5) violations
- [ ] Capital gains auto-compute from broker statements (Zerodha/Groww/AngelOne)
- [ ] Crypto/VDA tax: Schedule VDA (30% + 1% TDS Sec 393 equivalent)
- [ ] AI tax advice chatbot: RAG on IT Act 2025 + GST Act + ICAI standards`
},

"UIUX.md": {
icon:"🎨", desc:"Design system, GBC Associates inspired UI, animations, component patterns",
content:`# UIUX.md — UI/UX Design System
# CA ERP Suite — Winman Single-Window UX + Modern Cloud Aesthetic

## Design Philosophy
Primary inspiration: Winman CA-ERP's legendary single-window UX — no navigation between windows.
Visual inspiration: GBC & Associates (gbcandassociates.in) — Navy authority + Gold premium accent.
Direction: "Bloomberg Terminal for Indian CAs" — dense data, zero clutter, instant access.

---

## Color Palette (from gbcandassociates.in + CA brand conventions)

\`\`\`css
:root {
  /* Primary */
  --navy:     #0B1746;  /* Main background, headers */
  --navy-2:   #102060;  /* Card backgrounds */
  --navy-3:   #1E2A70;  /* Hover states */

  /* Gold Accent (authority + premium) */
  --gold:     #C9A84C;  /* CTA buttons, active states, highlights */
  --gold-2:   #E8CC7D;  /* Section headings, icons */
  --gold-3:   #A07830;  /* Borders, muted gold */

  /* Module Colours */
  --itr:      #1565C0;  /* Income Tax module — Trust blue */
  --bs:       #0D7B7B;  /* Balance Sheet — Teal accounting */
  --tds:      #D4700A;  /* TDS module — Amber warning */
  --gst:      #1B7A5A;  /* GST module — Emerald compliance */
  --audit:    #4B2B8A;  /* Tax Audit / 3CD — Violet accuracy */
  --practice: #8B2520;  /* Practice Mgmt — Crimson CA office */

  /* Neutrals */
  --text:     #E8EEF8;
  --muted:    #6B7A9F;
  --border:   rgba(201,168,76,0.15);
  --surface:  rgba(255,255,255,0.03);
}
\`\`\`

## Typography

\`\`\`css
/* Display — Section headings, module names, CA firm name */
font-family: 'Playfair Display', serif;
/* Weights: 400 (body text), 700 (headings), 900 (hero) */

/* Body — UI labels, buttons, descriptions, form fields */
font-family: 'Syne', sans-serif;
/* Weights: 400, 500, 600, 700, 800 */

/* Technical — PAN, TAN, GSTIN, amounts, code, tax numbers */
font-family: 'Fira Code', monospace;
/* Weights: 400, 500, 600 */
/* Use for: all financial figures, form numbers, amounts */
\`\`\`

## Winman-Inspired Single-Window Computation UI

The defining feature of Winman is that **all computation happens on one table** — data entry = computation = output. No navigation between screens. Replicate this in React:

\`\`\`jsx
// SingleWindowComputation component pattern
<div className="computation-window">
  <div className="assessee-bar">
    {/* Assessee name, PAN, AY, ITR form selector — always visible */}
    <span className="pan">{assessee.pan}</span>
    <AYSelector value={ay} onChange={setAy} />
    <ITRFormBadge form={itrForm} />
    <TaxDisplay old={taxOld} newR={taxNew} recommended={recommended} />
  </div>
  
  <div className="income-table">
    {/* Single expandable table — all heads in one view */}
    {INCOME_HEADS.map(head => (
      <IncomeRow
        key={head.id}
        label={head.label}        
        section={head.section}     {/* IT Act 2025 section reference */}
        value={values[head.id]}
        onEdit={v => updateComputation(head.id, v)}
        taxImpact={taxImpact(head)}  {/* Live tax recomputation */}
      />
    ))}
    <TotalRow label="Gross Total Income" value={gti} />
    <DeductionSection deductions={deductions} />
    <TaxLiabilityRow tax={tax} cess={cess} surcharge={surcharge} />
    <TDSCreditRow tds={tdsCredits} />
    <NetTaxRow payable={netPayable} />
  </div>
</div>
\`\`\`

## Animation Specification

\`\`\`css
/* Page / tab load — staggered card reveal */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeUp 0.5s ease both; }
.card:nth-child(2) { animation-delay: 0.07s; }

/* Live tax recomputation — smooth number transition */
.tax-amount {
  transition: color 0.3s, transform 0.15s;
  font-family: 'Fira Code', monospace;
}
.tax-amount.recalculating { color: var(--gold); transform: scale(1.03); }

/* Accordion — for 44 Form 3CD clauses */
.clause-body {
  max-height: 0; overflow: hidden;
  transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1);
}
.clause-body.open { max-height: 1200px; }

/* AI suggestion appear */
@keyframes aiSuggest {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.ai-suggestion { animation: aiSuggest 0.3s ease; border-left: 3px solid var(--gold); }

/* Error locator pulse */
@keyframes errorPulse {
  0%, 100% { border-color: rgba(139,37,32,0.4); }
  50%       { border-color: rgba(232,112,112,0.9); }
}
.field-error { animation: errorPulse 1.5s ease infinite; }

/* Progress bar on filing */
.filing-progress { 
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  background: linear-gradient(90deg, var(--gold3), var(--gold));
}

/* Floating orbs background */
@keyframes floatOrb {
  0%, 100% { transform: translate(0,0) scale(1); }
  50%       { transform: translate(40px,-50px) scale(1.08); }
}
\`\`\`

## Key Screen Wireframes

### Dashboard (CA Morning View)
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ ⚡ CA ERP Suite    [IT] [TDS] [GST] [3CD] [Practice]  v1.0 ▼  │ ← sticky blur
├──────────────────────────────────────────────────────────────────┤
│  Good morning, CA Gautam 👋  |  GBC & Associates · Mira Road   │
│  FY 2025-26 · Tax Year 2026-27 · IT Act 2025 in effect         │
├──────────────────────────────────────────────────────────────────┤
│  [247 Assessees] [ITR Pending: 38] [3CD Pending: 12]           │
│  [TDS Q1 Due: 8] [GSTR-3B Due Today: 22] [Billing ₹1.2L]     │
├────────────────┬────────────────┬────────────────┬──────────────┤
│ Today's        │ Bulk Status    │ Error Alerts   │ WIP Tracker  │
│ Deadlines      │ 12/38 filed ✓  │ 3 schema err   │ 8 pending    │
└────────────────┴────────────────┴────────────────┴──────────────┘
\`\`\`

### Single-Window IT Computation (Winman Equivalent)
\`\`\`
┌────────────────────────────────────────────────────────────────┐
│ Assessee: GAUTAM CHANDRA  PAN: ABCPG1234D  AY: 2026-27       │
│ ITR Form: [ITR-3 ▼]  Status: Draft  Tax: Old ₹1,12,500 / New ₹95,000 ✓ │
├────────────────────────────────────────────────────────────────┤
│ HEAD OF INCOME          AMOUNT (₹)   TAX IMPACT    SECTION    │
│ ─────────────────────────────────────────────────────────────  │
│ ▶ Salary Income         8,50,000     [live calc]   Sec 15      │
│   Employer: GBC Corp    Std Ded:      50,000                   │
│   Form 16 ✓ imported    Net:          8,00,000                 │
│ ▶ House Property        (1,40,000)   [saves ₹28K]  Sec 22      │
│   Self-occ loss cap     2,00,000 limit                         │
│ ▶ Business Income (44AD) 12,00,000  [live calc]   Sec 44AD    │
│ ▶ Capital Gains                                                 │
│   LTCG (Equity 112A)    1,60,000     12.5% on 35K  Sec 112A   │
│   STCG (Equity 111A)      90,000     20%            Sec 111A   │
│ ─────────────────────────────────────────────────────────────  │
│ GTI                    22,10,000                               │
│ Less: 80C (ELSS+LIC)   (1,50,000)                             │
│ Total Income           20,60,000                               │
│ Tax (New Regime)          95,000  ← RECOMMENDED                │
│ Cess 4%                    3,800                               │
│ TDS Credit                95,400                               │
│ Net Payable / (Refund)      (600)  REFUND ₹600                │
│ ─────────────────────────────────────────────────────────────  │
│ [Error Check] [Generate JSON] [Upload to IT Portal] [e-Verify] │
└────────────────────────────────────────────────────────────────┘
\`\`\`

### Form 3CD Clause View (AI-Assisted)
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ Form 3CD — GAUTAM CHANDRA | AY 2026-27 | Clause 1-44          │
│ Progress: ████████████░░░░ 28/44 clauses completed  AI: ON ✦   │
├─────────────────────────────────────────────────────────────────┤
│ Clause 26 — Deductions under Chapter VI-A        [AI ✦ Auto]  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ AI Suggestion: Based on computation:                        ││
│ │ 80C — ELSS ₹50,000 + LIC ₹15,000 = ₹65,000               ││
│ │ 80D — Health Insurance ₹25,000 (Self)                      ││
│ │ Total claimed: ₹90,000 (within ₹1.5L + ₹25K limits)       ││
│ │ [Accept AI] [Edit] [Skip]                                  ││
│ └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│ Clause 34 — TDS/TCS Details    [Auto from TDS Module ✓]        │
│ 194C — XYZ Contractors ₹4,50,000 TDS ₹9,000 (2%)             │
│ 194J — ABC Consultant ₹2,00,000 TDS ₹20,000 (10%)            │
│ [DSC Sign] [Generate 3CD JSON] [e-File]                        │
└─────────────────────────────────────────────────────────────────┘
\`\`\``
},

"TechStack.md": {
icon:"⚙️", desc:"Complete tech stack — Firebase Studio, Prisma, React, Node.js, Java",
content:`# TechStack.md — Technology Stack
# CA ERP Suite — Full Stack for Indian Tax Software

## Development Environment
| Tool | Role | URL |
|------|------|-----|
| Firebase Studio | Primary AI IDE (Gemini agent, cloud-based, no install) | studio.firebase.google.com |
| Google AI Studio | Alt — direct Gemini 2.5 Pro (1M context) | aistudio.google.com |
| GitHub | Version control + CI/CD trigger | github.com |
| Docker Desktop | Local container orchestration | docker.com |

## Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React 18 | 18.x | CA dashboard, computation UI, ledger views |
| Next.js 14 | 14.x | Client portal (SSR for fast load) |
| TypeScript | 5.x | Type safety — critical for financial calculations |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Professional component library |
| React Query | 5.x | Server state — computation API caching |
| Zustand | 4.x | Client state — open assessee, active FY |
| React Hook Form + Zod | 7.x / 3.x | Form validation with accounting rules |
| Recharts | 2.x | Tax trend charts, ITC dashboards |
| PDF.js | 4.x | In-browser Form 16 PDF preview before import |
| React Native + Expo | 0.73+ | Mobile app for CA field work |

## Backend (Microservices)
| Service | Language | Port | Responsibility |
|---------|----------|------|----------------|
| auth-service | Node.js 20 + Fastify | 3000 | JWT, TOTP MFA, session, DSC validation |
| itr-service | Java 21 + Spring Boot 3 | 3001 | IT computation, ITR JSON, ERI API, AIS |
| tds-service | Node.js 20 + Fastify + Prisma | 3002 | TDS returns, TRACES, Form 16, challan |
| gst-service | Node.js 20 + Fastify + Prisma | 3003 | GSTR-1/3B/9, GSP, reconciliation |
| bs-service | Node.js 20 + Fastify + Prisma | 3004 | Balance sheet, P&L, Tally import, depreciation |
| audit-service | Node.js 20 + Fastify + Prisma | 3005 | Form 3CD/3CA/3CB, clause engine |
| ai-service | Python 3.11 + FastAPI | 3006 | Claude API, Form 16 OCR, 3CD AI, regime optimiser |
| notification-svc | Node.js 20 + Fastify | 3007 | WhatsApp, email, SMS, push |

## Database (Prisma ORM for all Node.js services)
| Database | Version | Purpose |
|----------|---------|---------|
| PostgreSQL 16 | 16 | Core DB — assessees, vouchers, computation, audit trail |
| MongoDB Atlas | 7.x | ITR JSON, TDS FVU files, raw API responses |
| Redis 7 | 7.x | Sessions, OTP (Aadhaar), rate limits, computation cache |
| Amazon S3 | — | ITR-V PDFs, Form 16, 3CD JSONs, Balance Sheet PDFs |
| Elasticsearch 8 | 8.x | Assessee search, PAN lookup, GSTIN verification |
| ClickHouse | 23.x | Compliance analytics — filing trends, CA MIS |

## Prisma ORM Setup
\`\`\`bash
# All Node.js services use Prisma as the ONLY DB layer
npm install prisma @prisma/client

# In each service root:
npx prisma init
npx prisma migrate dev --name init     # creates first migration
npx prisma generate                     # generates typed Prisma Client
npx prisma studio                       # visual DB browser at :5555

# In production CI/CD:
npx prisma migrate deploy              # runs pending migrations
\`\`\`

## AI / ML Stack
\`\`\`
Claude claude-sonnet-4-6 (Anthropic)  — 3CD clause suggestions, tax advice, notice drafting
LangChain 0.2+ (Python)              — Multi-step AI pipelines, RAG on IT Act 2025
Google Vision API                     — Form 16 PDF OCR, bank statement extraction
AWS Textract                          — Fallback OCR for complex PDFs
Custom spaCy NER model               — Indian financial entity extraction (PAN, TAN, GSTIN, amounts)
Custom scikit-learn model             — Invoice classifier (B2B/B2CS/credit note)
RapidFuzz (Python)                    — Vendor name fuzzy matching for GSTR-2B reconciliation
\`\`\`

## Financial Computation Rules (Non-Negotiable)
\`\`\`typescript
// ALWAYS use Decimal for monetary calculations — NEVER float/double
import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// Store in paise (integer) internally — display in ₹ with 2 decimal places
const taxInPaise = new Decimal(income).mul(0.20).mul(100).toDecimalPlaces(0);
const displayTax = (taxInPaise.toNumber() / 100).toLocaleString('en-IN', { 
  style: 'currency', currency: 'INR' 
});

// NEVER use JavaScript's built-in number arithmetic for financial data
// ❌ WRONG: const tax = income * 0.2;  // floating point errors
// ✅ RIGHT: const tax = new Decimal(income).mul('0.2');
\`\`\`

## Key Validation Patterns
\`\`\`typescript
// PAN validation
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// TAN validation  
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

// GSTIN validation
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// IT Act 2025 — New Regime Tax Slabs (FY 2025-26 / Tax Year 2026-27)
const NEW_SLABS = [
  { from: 0,       to: 400000,   rate: 0    },
  { from: 400000,  to: 800000,   rate: 0.05 },
  { from: 800000,  to: 1200000,  rate: 0.10 },
  { from: 1200000, to: 1600000,  rate: 0.15 },
  { from: 1600000, to: 2000000,  rate: 0.20 },
  { from: 2000000, to: 2400000,  rate: 0.25 },
  { from: 2400000, to: Infinity, rate: 0.30 },
];

// Health & Education Cess: 4% on tax + surcharge
const CESS_RATE = new Decimal('0.04');
\`\`\``
},

"Database.md": {
icon:"🗄️", desc:"Complete Prisma schema — assessees, vouchers, ITR, TDS, GST, audit trail",
content:`# Database.md — Prisma Schema + Database Architecture
# CA ERP Suite — Double-Entry Bookkeeping Schema Design

## Core Rule: Every financial mutation must maintain debit = credit invariant.
## All monetary values stored in PAISE (integer). Display ÷ 100 = ₹.
## Audit log is APPEND-ONLY. No UPDATE/DELETE on audit_logs ever.

---

## Prisma Schema (/prisma/schema.prisma)

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // for Prisma migrations
}

// ── ENUMS ──────────────────────────────────────────────────────────

enum UserRole {
  CA_OWNER
  CA_STAFF
  ARTICLE_CLERK
  CLIENT
  ADMIN
}

enum AssesseeType {
  INDIVIDUAL
  HUF
  FIRM
  COMPANY
  LLP
  AOP
  BOI
  TRUST
  LOCAL_AUTHORITY
}

enum ITRForm {
  ITR1  // Salaried, HP, Other Sources
  ITR2  // Capital Gains, foreign income
  ITR3  // Business income, partner in firm
  ITR4  // Presumptive income (44AD/44ADA/44AE)
  ITR5  // Firms, LLPs, AOPs, BOIs
  ITR6  // Companies (not Sec 11)
  ITR7  // Trusts, political parties
}

enum TaxRegime {
  OLD   // With deductions (80C, 80D, HRA etc.)
  NEW   // IT Act 2025 — lower slabs, no deductions
}

enum FilingStatus {
  DRAFT
  VALIDATED
  UPLOADED
  PROCESSED
  DEFECTIVE
  RECTIFICATION_REQUIRED
  ITR_V_RECEIVED
  INTIMATION_RECEIVED
}

enum VoucherType {
  PAYMENT
  RECEIPT
  JOURNAL
  CONTRA
  SALES
  PURCHASE
  CREDIT_NOTE
  DEBIT_NOTE
}

enum TDSFormType {
  FORM_24Q   // Salary TDS (IT Act 2025: Sec 392)
  FORM_26Q   // Non-salary resident TDS (Sec 393)
  FORM_27Q   // NRI payments (Sec 393)
  FORM_27EQ  // TCS (Sec 394)
}

enum GSTReturnType {
  GSTR1
  GSTR3B
  GSTR9
  GSTR9C
  GSTR4
  CMP08
  IFF
}

enum AccountType {
  ASSET_CURRENT
  ASSET_FIXED
  ASSET_INTANGIBLE
  LIABILITY_CURRENT
  LIABILITY_LONG_TERM
  EQUITY
  INCOME_DIRECT
  INCOME_INDIRECT
  EXPENSE_DIRECT
  EXPENSE_INDIRECT
}

// ── FIRM & USERS ───────────────────────────────────────────────────

model Firm {
  id            String    @id @default(uuid())
  name          String    @db.VarChar(200)
  icaiRegNo     String?   @db.VarChar(20)
  pan           String?   @db.Char(10)
  address       Json?     // {line1, city, state, pin}
  plan          String    @default("solo")
  assesseeLimit Int       @default(100)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())

  users         User[]
  assessees     Assessee[]
  @@index([pan])
}

model User {
  id            String    @id @default(uuid())
  firmId        String
  name          String    @db.VarChar(100)
  email         String    @unique @db.VarChar(150)
  passwordHash  String    @db.VarChar(200)  // bcrypt cost 12
  role          UserRole
  totpSecret    String?   @db.VarChar(100)
  mfaEnabled    Boolean   @default(false)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime?

  firm          Firm      @relation(fields:[firmId], references:[id])
  auditLogs     AuditLog[]
  @@index([firmId])
  @@index([email])
}

// ── ASSESSEE MASTER ────────────────────────────────────────────────

model Assessee {
  id            String        @id @default(uuid())
  firmId        String
  pan           String        @unique @db.Char(10)
  name          String        @db.VarChar(200)
  type          AssesseeType
  mobile        String?       @db.VarChar(15)
  email         String?       @db.VarChar(150)
  aadhaarHash   String?       @db.VarChar(64)  // SHA-256 only — never raw Aadhaar
  dateOfBirth   DateTime?
  residentialStatus String?   @db.VarChar(20)  // RESIDENT / NOR / NR
  tan           String?       @db.VarChar(10)
  gstin         String?       @db.VarChar(15)
  cin           String?       @db.VarChar(21)  // for companies
  createdAt     DateTime      @default(now())

  firm          Firm          @relation(fields:[firmId], references:[id])
  itrFilings    ITRFiling[]
  tdsReturns    TDSReturn[]
  gstReturns    GSTReturn[]
  vouchers      VoucherHeader[]
  accounts      LedgerAccount[]

  @@index([firmId])
  @@index([pan])
  @@index([gstin])
}

// ── INCOME TAX COMPUTATION ─────────────────────────────────────────

model ITRFiling {
  id              String        @id @default(uuid())
  assesseeId      String
  ay              String        @db.Char(7)   // "2026-27"
  taxYear         String        @db.Char(7)   // "2025-26" (IT Act 2025 terminology)
  itrForm         ITRForm
  regime          TaxRegime     @default(NEW)
  status          FilingStatus  @default(DRAFT)

  // Computation (all amounts in PAISE)
  salaryIncome    BigInt        @default(0)
  hpIncome        BigInt        @default(0)   // negative = loss (HP)
  businessIncome  BigInt        @default(0)
  capitalGainsLT  BigInt        @default(0)
  capitalGainsST  BigInt        @default(0)
  otherIncome     BigInt        @default(0)
  grossTotalIncome BigInt       @default(0)   // = sum of above heads
  totalDeductions BigInt        @default(0)   // Ch VI-A: 80C, 80D, etc.
  totalIncome     BigInt        @default(0)   // GTI - deductions
  taxOnIncome     BigInt        @default(0)
  surcharge       BigInt        @default(0)
  cess            BigInt        @default(0)   // 4% on (tax + surcharge)
  totalTaxLiability BigInt      @default(0)
  tdsCredit       BigInt        @default(0)   // from 26AS/AIS
  advanceTaxPaid  BigInt        @default(0)
  selfAssessmentTax BigInt      @default(0)
  netPayable      BigInt        @default(0)   // can be negative = refund
  refundAmount    BigInt        @default(0)

  // Filing details
  ackNumber       String?       @db.VarChar(30)
  itrvS3Key       String?       @db.VarChar(500)  // S3 path to ITR-V PDF
  itrJsonS3Key    String?       @db.VarChar(500)  // S3 path to ITR JSON
  filedAt         DateTime?
  intimationStatus String?
  errorLog        Json?

  assessee        Assessee      @relation(fields:[assesseeId], references:[id])
  deductions      ITRDeduction[]
  capitalGains    CapitalGainEntry[]

  @@index([assesseeId, ay])
  @@unique([assesseeId, ay, itrForm])
}

model ITRDeduction {
  id              String    @id @default(uuid())
  itrFilingId     String
  section         String    @db.VarChar(20)  // "80C", "80D", "80CCD_2" etc.
  description     String    @db.VarChar(200)
  amountPaise     BigInt
  itrFiling       ITRFiling @relation(fields:[itrFilingId], references:[id])
  @@index([itrFilingId])
}

model CapitalGainEntry {
  id              String    @id @default(uuid())
  itrFilingId     String
  assetType       String    @db.VarChar(50)   // EQUITY/DEBT/PROPERTY/GOLD/VDA
  termType        String    @db.VarChar(5)    // SHORT/LONG
  saleValuePaise  BigInt
  costPaise       BigInt
  indexedCostPaise BigInt   @default(0)
  gainPaise       BigInt    // = saleValue - indexedCost (or cost)
  taxRate         String    @db.VarChar(10)   // "12.5" / "20" / "15" / "30"
  sectionRef      String    @db.VarChar(20)   // "112A" / "111A" / "112"
  itrFiling       ITRFiling @relation(fields:[itrFilingId], references:[id])
}

// ── TDS MODULE ─────────────────────────────────────────────────────

model TDSReturn {
  id              String      @id @default(uuid())
  assesseeId      String
  tan             String      @db.VarChar(10)
  quarter         String      @db.VarChar(10)  // "Q1FY26" (Apr–Jun 2025)
  fy              String      @db.Char(7)       // "2025-26"
  formType        TDSFormType
  status          FilingStatus @default(DRAFT)
  tokenNumber     String?     @db.VarChar(20)
  fvuS3Key        String?     @db.VarChar(500)
  filedAt         DateTime?

  assessee        Assessee    @relation(fields:[assesseeId], references:[id])
  deductees       TDSDeductee[]

  @@index([assesseeId, fy, quarter])
}

model TDSDeductee {
  id              String      @id @default(uuid())
  tdsReturnId     String
  deducteePan     String      @db.Char(10)
  deducteeName    String      @db.VarChar(200)
  tdsSection      String      @db.VarChar(10)  // "192B","194C","194J" etc.
  // IT Act 2025: Sec 392 (salary), Sec 393 (others), Sec 394 (TCS)
  itAct2025Sec    String?     @db.VarChar(10)
  amountPaidPaise BigInt
  tdsDeductedPaise BigInt
  tdsRatePct      Decimal     @db.Decimal(5,2)
  challanBsr      String?     @db.VarChar(7)
  challanDate     DateTime?
  challanSerial   String?     @db.VarChar(10)
  // 206AB flag: deductee filed ITR for 2 years?
  isSec206AB      Boolean     @default(false)

  tdsReturn       TDSReturn   @relation(fields:[tdsReturnId], references:[id])
  @@index([tdsReturnId])
  @@index([deducteePan])
}

// ── ACCOUNTING / DOUBLE-ENTRY ──────────────────────────────────────

model LedgerAccount {
  id              String      @id @default(uuid())
  assesseeId      String
  code            String      @db.VarChar(20)  // e.g. "1001", "4001"
  name            String      @db.VarChar(200)
  accountType     AccountType
  parentId        String?     // for COA hierarchy
  openingDebitPaise  BigInt   @default(0)
  openingCreditPaise BigInt   @default(0)
  fy              String      @db.Char(7)

  assessee        Assessee    @relation(fields:[assesseeId], references:[id])
  debitLines      VoucherLine[] @relation("DebitAccount")
  creditLines     VoucherLine[] @relation("CreditAccount")

  @@index([assesseeId, fy])
  @@unique([assesseeId, fy, code])
}

model VoucherHeader {
  id              String      @id @default(uuid())
  assesseeId      String
  voucherType     VoucherType
  voucherNo       String      @db.VarChar(30)
  voucherDate     DateTime
  narration       String?     @db.Text
  totalAmtPaise   BigInt      // = sum of debit lines = sum of credit lines
  isPosted        Boolean     @default(false)
  fy              String      @db.Char(7)
  // Posted vouchers in a locked FY are IMMUTABLE at DB level
  fyLocked        Boolean     @default(false)

  assessee        Assessee    @relation(fields:[assesseeId], references:[id])
  lines           VoucherLine[]

  @@index([assesseeId, fy, voucherDate])
}

model VoucherLine {
  id              String          @id @default(uuid())
  voucherHeaderId String
  ledgerAccountId String
  debitAmtPaise   BigInt          @default(0)  // ALWAYS separate — never signed
  creditAmtPaise  BigInt          @default(0)  // ALWAYS separate — never signed
  narration       String?         @db.VarChar(500)
  hsnSac          String?         @db.VarChar(8)  // GST: mandatory on taxable lines
  gstRate         Decimal?        @db.Decimal(5,2)

  voucherHeader   VoucherHeader   @relation(fields:[voucherHeaderId], references:[id])
  debitAccount    LedgerAccount   @relation("DebitAccount", fields:[ledgerAccountId], references:[id])
  creditAccount   LedgerAccount   @relation("CreditAccount", fields:[ledgerAccountId], references:[id])

  @@index([voucherHeaderId])
}

// ── GST MODULE ─────────────────────────────────────────────────────

model GSTReturn {
  id              String        @id @default(uuid())
  assesseeId      String
  gstin           String        @db.VarChar(15)
  returnType      GSTReturnType
  taxPeriod       String        @db.VarChar(10)  // "072025" (MMYYYY)
  status          FilingStatus  @default(DRAFT)
  ackNumber       String?       @db.VarChar(30)
  filedAt         DateTime?
  jsonS3Key       String?       @db.VarChar(500)
  itcEligiblePaise BigInt       @default(0)
  itcBlockedPaise  BigInt       @default(0)   // Section 17(5) blocked ITC
  taxPayablePaise  BigInt       @default(0)

  assessee        Assessee      @relation(fields:[assesseeId], references:[id])
  @@index([assesseeId, taxPeriod, returnType])
}

// ── FORM 3CD TAX AUDIT ─────────────────────────────────────────────

model TaxAuditReport {
  id              String    @id @default(uuid())
  assesseeId      String
  ay              String    @db.Char(7)
  formType        String    @db.VarChar(5)  // "3CA" or "3CB"
  status          FilingStatus @default(DRAFT)
  ackNumber       String?   @db.VarChar(30)
  filedAt         DateTime?
  clause34TdsJson Json?     // TDS data auto-pulled from TDS module
  aiSuggestionsJson Json?   // Claude suggestions per clause

  clauses         AuditClause[]
  @@index([assesseeId, ay])
}

model AuditClause {
  id              String          @id @default(uuid())
  reportId        String
  clauseNo        Int             // 1-44
  clauseText      String          @db.Text
  answerYesNo     Boolean?
  answerNarrative String?         @db.Text
  aiSuggested     Boolean         @default(false)
  caVerified      Boolean         @default(false)
  lastEditedBy    String?         // userId

  report          TaxAuditReport  @relation(fields:[reportId], references:[id])
  @@index([reportId, clauseNo])
}

// ── AUDIT TRAIL (APPEND-ONLY — NEVER UPDATE/DELETE) ────────────────

model AuditLog {
  id          BigInt    @id @default(autoincrement())
  firmId      String?
  userId      String?
  action      String    @db.VarChar(50)   // CREATE|UPDATE|FILE|DOWNLOAD|LOGIN
  module      String?   @db.VarChar(20)   // ITR|TDS|GST|3CD|BS|AUTH
  tableName   String?   @db.VarChar(50)
  recordId    String?
  oldData     Json?     // before state
  newData     Json?     // after state
  ipAddress   String?
  userAgent   String?   @db.Text
  ts          DateTime  @default(now())

  // CRITICAL: No @updatedAt — this table is APPEND-ONLY
  user        User?     @relation(fields:[userId], references:[id])

  @@index([firmId, ts])
  @@index([userId, ts])
  @@index([module, ts])
}
\`\`\`

## PostgreSQL Constraints (enforced at DB level)
\`\`\`sql
-- Financial year lock: posted vouchers in locked FY cannot be mutated
CREATE RULE no_update_locked_voucher AS
  ON UPDATE TO voucher_headers
  WHERE OLD.fy_locked = true
  DO INSTEAD NOTHING;

-- Audit log append-only
CREATE RULE no_update_audit AS
  ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS  
  ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Double-entry invariant enforced by trigger
CREATE OR REPLACE FUNCTION check_double_entry()
RETURNS TRIGGER AS $$
DECLARE total_debit BIGINT; total_credit BIGINT;
BEGIN
  SELECT SUM(debit_amt_paise), SUM(credit_amt_paise)
  INTO total_debit, total_credit
  FROM voucher_lines WHERE voucher_header_id = NEW.voucher_header_id;
  IF total_debit != total_credit THEN
    RAISE EXCEPTION 'Double-entry violated: Debit ≠ Credit for voucher %', NEW.voucher_header_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_double_entry
  AFTER INSERT OR UPDATE ON voucher_lines
  FOR EACH ROW EXECUTE FUNCTION check_double_entry();
\`\`\``
},

"API.md": {
icon:"🔌", desc:"All REST API endpoints — ITR, TDS, GST, 3CD, Balance Sheet, AI",
content:`# API.md — REST API Specification
# CA ERP Suite — All Endpoints

## Base URLs
\`\`\`
Production:  https://api.caerp.in/v1
Staging:     https://api-staging.caerp.in/v1
Local:       http://localhost:3000/api/v1
\`\`\`

## Auth Headers (all endpoints except /auth/*)
\`\`\`
Authorization: Bearer <jwt_access_token>
X-Firm-ID: <firm_uuid>
X-Request-ID: <uuid>   ← mandatory for traceability
Content-Type: application/json
\`\`\`

---

## AUTH SERVICE

### POST /auth/signup — Register CA firm
\`\`\`json
Request: { "firmName":"GBC & Associates","icaiRegNo":"123456","caName":"Gautam","email":"...","password":"..." }
Response 201: { "firmId":"uuid","userId":"uuid","accessToken":"eyJ...","refreshToken":"eyJ..." }
\`\`\`

### POST /auth/login
\`\`\`json
Request: { "email":"...","password":"...","totpCode":"123456" }
Response: { "accessToken":"...","refreshToken":"...","firm":{...},"user":{...} }
\`\`\`

### POST /auth/mfa/setup | POST /auth/refresh | POST /auth/logout

---

## ASSESSEE API

### POST /assessees — Create assessee
\`\`\`json
Request: { "pan":"ABCPG1234D","name":"Gautam Chandra","type":"INDIVIDUAL","mobile":"...","email":"..." }
Response 201: { "assesseeId":"uuid","pan":"ABCPG1234D" }
\`\`\`

### GET /assessees — List all (paginated)
\`\`\`
GET /assessees?page=1&limit=50&search=Gautam&type=INDIVIDUAL&filingStatus=DRAFT
\`\`\`

### GET /assessees/:id | PUT /assessees/:id | GET /assessees/:id/summary

---

## INCOME TAX API (itr-service — Java Spring Boot)

### POST /itr/form16/parse — AI parse Form 16 PDF
\`\`\`json
Request: { "assesseeId":"uuid","form16PdfBase64":"..." }
Response: { 
  "employerName":"GBC Corp","tan":"MUMD12345B","grossSalary":850000,"stdDeduction":50000,
  "tdsDeducted":42000,"80C":150000,"mappedFields":{...},"confidence":0.97
}
\`\`\`

### POST /itr/ais/fetch — Fetch AIS/TIS from IT portal via ERI API
\`\`\`json
Request: { "assesseeId":"uuid","ay":"2026-27" }
Response: { "tdsEntries":[...],"capitalGains":[...],"otherIncome":[...],"totalAIS":12 }
\`\`\`

### POST /itr/compute — Tax computation
\`\`\`json
Request: {
  "assesseeId":"uuid","ay":"2026-27",
  "incomeHeads": {
    "salary":{ "grossSalary":850000,"standardDeduction":75000 },
    "housePropery":{ "annualValue":240000,"municipalTax":12000,"netRent":228000,"loan30pct":68400 },
    "capitalGains":{ "ltcgEquity":160000,"stcgEquity":90000,"stkIndexed":0 },
    "other":{ "interestSavings":10000 }
  },
  "deductions":{ "80C":150000,"80D":25000,"80CCD2":57000 },
  "regimePreference":"AUTO"
}
Response: {
  "grossTotalIncome":1157600,"totalDeductions":232000,"totalIncome":925600,
  "taxOldRegime":112500,"taxNewRegime":95000,"recommendedRegime":"NEW","savings":17500,
  "breakdown":{ "baseTax":91750,"surcharge":0,"cess":3800 }
}
// All amounts in PAISE
\`\`\`

### POST /itr/generate-json — Generate ITR JSON per IT dept schema
### POST /itr/upload — Upload via ERI API to IT portal
### POST /itr/everify — Aadhaar OTP e-verification
### GET  /itr/status/:ackNumber — e-return processing status
### GET  /itr/bulk-status — All assessees processing status (Winman MIS)

---

## TDS API (tds-service — Node.js + Prisma)

### POST /tds/deductee — Add deductee to TDS return
\`\`\`json
Request: {
  "tdsReturnId":"uuid","deducteePan":"ABCDE1234F","deducteeName":"XYZ Ltd",
  "tdsSection":"194J",
  "itAct2025Section":"393",
  "amountPaidPaise":200000,"tdsDeductedPaise":20000,"tdsRatePct":"10.00",
  "challanBsr":"0001234","challanDate":"2025-07-07","challanSerial":"00001"
}
\`\`\`

### POST /tds/returns/:id/compute-interest — Late deduction/payment interest
\`\`\`json
Response: { 
  "lateDeductionInterestPaise":1500,  // 1% p.m. from deduction date
  "lateDepositInterestPaise":3000,    // 1.5% p.m. from due date
  "section206ABApplicable":["ABCDE1234F"]  // non-filers
}
\`\`\`

### POST /tds/returns/:id/generate-fvu — Generate FVU file (NSDL format)
### POST /tds/returns/:id/generate-form16 — Bulk Form 16 / Form 16A
### GET  /tds/traces/fvu-download/:tan — Download from TRACES
### POST /tds/challan/verify — OLTAS challan verification

---

## GST API (gst-service — Node.js + Prisma)

### POST /gst/reconcile — GSTR-2B vs Purchase Register
\`\`\`json
Request: { "assesseeId":"uuid","taxPeriod":"072025","purchaseData":[...] }
Response: {
  "matched":142,"mismatched":8,"missingIn2B":3,
  "blockedITC":[{"vendor":"ABC","reason":"Sec17(5)_personal","amtPaise":15000}],
  "itcGapPaise":45000,"report":[...]
}
\`\`\`

### POST /gst/gstr1/generate | POST /gst/gstr3b/compute
### POST /gst/file/:returnType — File via GSP API
### POST /gst/einvoice/irn — Generate IRN via IRP

---

## BALANCE SHEET API (bs-service — Node.js + Prisma)

### POST /bs/import/tally — Import TB from Tally XML
\`\`\`json
Request: { "assesseeId":"uuid","fy":"2025-26","tallyXml":"<ENVELOPE>..." }
Response: { "accountsCreated":48,"totalAccounts":48,"trialBalanceId":"uuid" }
\`\`\`

### POST /bs/import/excel — Import TB from Excel (custom mapping)
### POST /bs/generate — Generate Balance Sheet + P&L + Cash Flow
\`\`\`json
Response: {
  "balanceSheet":{ "totalAssets":12500000,"totalLiabilities":12500000 },
  "pandl":{ "netProfit":2300000,"grossProfit":4500000 },
  "cashFlow":{ "fromOperations":2800000,"fromInvesting":-500000,"fromFinancing":-300000 },
  "pdfS3Key":"firms/uuid/FY2025-26/balance-sheet.pdf"
}
\`\`\`

### POST /bs/depreciation — Depreciation schedule (SLM/WDV — Schedule II)
### GET  /bs/trial-balance/:assesseeId/:fy — Trial balance report
### POST /bs/export-to-itr — Export BS values to ITR Schedule BP/AL/SH

---

## FORM 3CD API (audit-service — Node.js + Prisma)

### POST /audit/ai-suggest/:reportId — AI suggest all 44 clauses
\`\`\`json
Request: { "assesseeId":"uuid","ay":"2026-27" }
Response: {
  "clauses":[
    { "clauseNo":26,"suggested":"80C: ELSS ₹50K + LIC ₹15K = ₹65K","confidence":0.95 },
    { "clauseNo":34,"autoImportedFromTDS":true,"tdsEntries":[...] },
    { "clauseNo":17,"cashPaymentsAbove10K":[{"vendor":"XYZ","amount":15000}] }
  ]
}
\`\`\`

### PUT  /audit/clauses/:id — Update clause answer (with audit trail)
### POST /audit/reports/:id/sign — DSC digital signature
### POST /audit/reports/:id/file — e-File 3CD to IT portal

---

## AI SERVICE

### POST /ai/chat — Tax advice chatbot
\`\`\`json
Request: { "question":"What is the TDS rate on professional fees under IT Act 2025?","context":"tds_rates" }
Response: { "answer":"Under Section 393 of IT Act 2025 (equivalent to 194J)...",
            "references":["Section 393 IT Act 2025","CBDT Circular 2025-14"] }
\`\`\`

### POST /ai/regime-compare — Old vs New regime comparison
### POST /ai/notice/analyse — GST/IT notice PDF analysis + reply draft`
},

"Architecture.md": {
icon:"🏗️", desc:"Microservices architecture, data flow, AWS Mumbai deployment",
content:`# Architecture.md — System Architecture
# CA ERP Suite — Cloud-Native on AWS Mumbai (ap-south-1)
# PDPB Compliance: ALL Indian financial data stays in India

## System Architecture Diagram
\`\`\`
┌──────────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                                    │
│  React 18 Web App      │  Next.js Client Portal  │  React Native App │
│  (CA Dashboard)        │  (Assessee Login)        │  (CA Mobile)      │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │ HTTPS / WSS
┌─────────────────────────────────▼────────────────────────────────────┐
│ API GATEWAY — AWS API Gateway + Kong + NGINX                         │
│  Rate Limiting (100/min normal, 10/min auth)                         │
│  JWT Verification (RS256) + Firm-level tenancy                       │
│  X-Request-ID injection for full traceability                        │
└──────┬────────┬────────┬────────┬────────┬────────┬─────────────────┘
       │        │        │        │        │        │
┌──────▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌─────────┐
│ auth    │ │ itr │ │ tds │ │ gst │ │ bs  │ │audit│ │  ai     │
│ service │ │ svc │ │ svc │ │ svc │ │ svc │ │ svc │ │ service │
│ Node.js │ │Java │ │Node │ │Node │ │Node │ │Node │ │ Python  │
│ Fastify │ │ SB3 │ │ +Pr │ │ +Pr │ │ +Pr │ │ +Pr │ │ FastAPI │
└────┬────┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └────┬────┘
     │          │        │        │        │        │         │
     └──────────┴────────┴────────┴────────┴────────┴─────────┘
                                   │ Prisma ORM (Node.js) / Spring JPA (Java)
┌──────────────────────────────────▼────────────────────────────────────┐
│ DATA LAYER (AWS Mumbai ap-south-1)                                     │
│  PostgreSQL 16 (RDS Multi-AZ)  │  MongoDB Atlas (Mumbai cluster)      │
│  Redis 7 (ElastiCache)          │  Amazon S3 (ITR-V, PDFs, JSONs)     │
│  Elasticsearch 8 (OpenSearch)   │  ClickHouse (Analytics / MIS)       │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼────────────────────────────────────┐
│ GOVERNMENT API INTEGRATIONS                                            │
│  Income Tax ERI API  │  TRACES / NSDL  │  GSTN GSP API               │
│  IRP (e-Invoicing)   │  NIC e-Way Bill  │  MCA21 v3 API              │
│  UIDAI Aadhaar OTP   │  DigiLocker      │  Tally ODBC / TDL/XML      │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

## Key Data Flow: ITR Computation + Filing (Winman Replicated + AI)

\`\`\`
1. CA clicks "New ITR" → select assessee (PAN lookup via Elasticsearch)
2. Form 16 PDF uploaded → ai-service → Google Vision OCR → NER extraction
3. Extracted data → itr-service.compute() → trial balance synced from bs-service
4. AIS data fetched → ERI API → reconcile with Form 16 in itr-service
5. Tax computed under both regimes → Claude API suggests optimal regime
6. CA reviews single-window computation table (React — no navigation)
7. 3CD: audit-service.aiSuggest() → Claude reads TB+computation → 44 clauses filled
8. DSC signature on 3CD → Aadhaar OTP / Class 3 DSC
9. ITR JSON generated (validated against IT dept schema → error locator)
10. ERI API upload → IT portal ACK received → stored in PostgreSQL
11. ITR-V auto-downloaded from S3 → WhatsApp to assessee via notification-svc
12. AuditLog written: who/when/what for every step above
\`\`\`

## Multi-Tenancy: Schema-per-Firm
\`\`\`sql
-- Each firm gets its own PostgreSQL schema
-- Prisma uses RLS (Row Level Security) with firm_id on every table
ALTER TABLE assessees ENABLE ROW LEVEL SECURITY;
CREATE POLICY firm_isolation ON assessees 
  USING (firm_id = current_setting('app.current_firm_id')::uuid);
-- Set at connection time: SET app.current_firm_id = 'firm-uuid';
\`\`\`

## Kubernetes Auto-Scaling (Tax Season)
\`\`\`yaml
# itr-service scales massively in July/March (ITR filing rush)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: itr-service-hpa }
spec:
  minReplicas: 3
  maxReplicas: 50  # ITR filing season surge
  metrics:
  - type: Resource
    resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }
\`\`\``
},

"Security.md": {
icon:"🔒", desc:"Security for CA software — DSC auth, financial data encryption, PDPB compliance",
content:`# Security.md — Security Requirements
# CA ERP Suite — ICAI / IT Dept / GST Compliance Security Standards

## Why Security is Critical Here
CA firms handle: PAN numbers, Aadhaar data, bank accounts, tax computation, GSTIN details.
A breach exposes 500–2000 assessees' complete financial profiles per CA firm.
The IT Dept / GSTN mandate security standards for ERI / GSP licence holders.

---

## Authentication & Session
\`\`\`
✅ JWT RS256 — access token 15 minutes, RS256 key pair
✅ Refresh token rotation — sliding 7-day window (revoke all on password change)
✅ TOTP MFA mandatory for CA_OWNER (Google Authenticator / Authy)
✅ TOTP optional for CA_STAFF, ARTICLE_CLERK
✅ Aadhaar OTP — for e-verification actions ONLY; OTP cached in Redis TTL 10min
✅ DSC (Class 3 Digital Signature) — private key stored in HashiCorp Vault; never in code
✅ Rate limiting: 10 req/min on auth endpoints; 100 req/min on data endpoints
✅ Account lockout: 5 failed login attempts → 30 min lockout → email alert
✅ IP allowlisting: ERI API calls only from whitelisted server IPs
\`\`\`

## Data Encryption
\`\`\`
At Rest:
  PostgreSQL (RDS): AWS KMS encryption (AES-256)
  Aadhaar: NEVER stored — only SHA-256 hash
  PAN: Stored encrypted using pgcrypto AES-256 per firm
  DSC private key: HashiCorp Vault (Shamir secret sharing)
  ITR JSONs / PDFs: S3 server-side encryption (SSE-KMS)

In Transit:
  TLS 1.3 for all external connections
  mTLS for inter-microservice communication (Istio service mesh)
  Certificate pinning in React Native mobile app
  HSTS header: max-age=31536000; includeSubDomains; preload

Computation Safety:
  All monetary values in PAISE (BigInt) — NEVER float/double
  Use Decimal.js for all calculations (Java: BigDecimal)
  GST rounding: round to nearest paise at each line (per GST rules)
\`\`\`

## What MUST NEVER Be Stored
\`\`\`
❌ Raw Aadhaar number (only hash)
❌ Raw bank account credentials
❌ GSP / ERI API passwords in code (Vault only)
❌ DSC private key in file system
❌ OTP after expiry (Redis TTL enforces)
❌ IT portal password for assessee (ERI uses session token)
❌ User passwords (bcrypt hash, cost factor 12)
\`\`\`

## Indian Compliance Requirements
| Regulation | Requirement | Implementation |
|-----------|-------------|----------------|
| PDPB 2023 | Data localisation | All data in AWS Mumbai ap-south-1 only |
| IT Act 43A | Reasonable security | AES-256, TLS 1.3, VAPT quarterly |
| ERI Licence | IT Dept security | Dedicated server, IP whitelisted, DSC mandatory |
| GSP Licence | GSTN security | ISO 27001, no data sharing, audit trail |
| ICAI Guidelines | CA data confidentiality | Firm-level isolation, no data mixing |

## Audit Trail Requirements (Accounting Non-Negotiable)
\`\`\`typescript
// Every mutation to financial data MUST log:
await prisma.auditLog.create({ data: {
  firmId: req.firmId,
  userId: req.userId,
  action: 'UPDATE_ITR_COMPUTATION',
  module: 'ITR',
  tableName: 'itr_filings',
  recordId: itrFiling.id,
  oldData: JSON.stringify(oldValues),  // before state
  newData: JSON.stringify(newValues),  // after state
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
}});
// Retention: 7 years (per IT Act — financial records)
// append-only enforced at PostgreSQL rule level
\`\`\`

## Form 3CD Financial Year Lock
\`\`\`sql
-- Once CA locks a financial year, posted vouchers become immutable
UPDATE firms SET fy_locked_years = array_append(fy_locked_years, '2024-25') WHERE id = $1;
-- All inserts to locked FY blocked at application layer + DB trigger
\`\`\`

## OWASP Top 10 Checklist for CA ERP
\`\`\`
✅ A01 Broken Access Control — firm_id on every query; RLS in PostgreSQL
✅ A02 Cryptographic Failures — AES-256, TLS 1.3, bcrypt, Vault for secrets
✅ A03 Injection — Prisma parameterised queries ALWAYS; no raw SQL from user input
✅ A04 Insecure Design — double-entry invariant enforced at DB trigger level
✅ A05 Security Misconfiguration — Helm charts reviewed; no default passwords
✅ A06 Vulnerable Components — npm audit + Dependabot in CI; Python safety
✅ A07 Auth Failures — JWT RS256; MFA; lockout; rate limiting
✅ A08 Software Integrity — SLSA Level 2; signed Docker images
✅ A09 Logging Failures — structured logging; Datadog; PII masked in logs
✅ A10 SSRF — whitelist-only outbound URLs (ERI, GSTN, TRACES endpoints)
\`\`\``
},

"Deployment.md": {
icon:"🚀", desc:"Docker Compose, GitHub Actions CI/CD, AWS EKS, Prisma migrate steps",
content:`# Deployment.md — Deployment Configuration
# CA ERP Suite — Docker + K8s + Firebase Studio + GitHub Actions

## Environments
| Env | URL | Purpose | Region |
|-----|-----|---------|--------|
| Local | localhost | Firebase Studio dev | - |
| Staging | staging.caerp.in | QA + ERI UAT | ap-south-1 |
| Production | app.caerp.in | Live CA firms | ap-south-1 (Mumbai) |

---

## Firebase Studio Local Setup
\`\`\`bash
# 1. Go to studio.firebase.google.com
# 2. Import your GitHub repo (ca-erp-suite)
# 3. Firebase Studio opens cloud workspace with Gemini AI
# 4. Open AI chat → paste Master Prompt from AI_Instructions.md
# 5. No local install needed — runs in browser
\`\`\`

## Docker Compose (Local / Staging)
\`\`\`yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: caerp
      POSTGRES_USER: caerp_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "caerp_user"]
      interval: 10s; timeout: 5s; retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --requirepass ${REDIS_PASSWORD}

  elasticsearch:
    image: elasticsearch:8.12.0
    environment: { "discovery.type": "single-node", "xpack.security.enabled": "false" }
    ports: ["9200:9200"]

  prisma-migrate:
    build: ./services/auth-service
    command: npx prisma migrate deploy
    environment:
      DATABASE_URL: postgresql://caerp_user:${POSTGRES_PASSWORD}@postgres:5432/caerp?schema=public
    depends_on: { postgres: { condition: service_healthy } }
    restart: "no"

  auth-service:
    build: ./services/auth-service
    ports: ["3000:3000"]
    env_file: .env.auth
    command: sh -c "npx prisma generate && node dist/index.js"
    depends_on: [prisma-migrate, redis]

  itr-service:
    build: ./services/itr-service
    ports: ["3001:3001"]
    env_file: .env.itr
    depends_on: [prisma-migrate]

  tds-service:
    build: ./services/tds-service
    ports: ["3002:3002"]
    env_file: .env.tds
    command: sh -c "npx prisma generate && node dist/index.js"
    depends_on: [prisma-migrate]

  gst-service:
    build: ./services/gst-service
    ports: ["3003:3003"]
    env_file: .env.gst
    command: sh -c "npx prisma generate && node dist/index.js"
    depends_on: [prisma-migrate]

  bs-service:
    build: ./services/bs-service
    ports: ["3004:3004"]
    env_file: .env.bs
    command: sh -c "npx prisma generate && node dist/index.js"
    depends_on: [prisma-migrate]

  ai-service:
    build: ./services/ai-service
    ports: ["3006:3006"]
    env_file: .env.ai  # ANTHROPIC_API_KEY, GOOGLE_VISION_API_KEY

  frontend:
    build: ./frontend
    ports: ["3010:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080

  nginx:
    image: nginx:alpine
    ports: ["8080:80", "8443:443"]
    volumes: [./nginx.conf:/etc/nginx/nginx.conf, ./certs:/etc/nginx/certs]

volumes: { pgdata: {}, esdata: {} }
\`\`\`

## Environment Variables (.env template)
\`\`\`bash
# Prisma / PostgreSQL (Prisma is ONLY DB access method for Node.js)
DATABASE_URL=postgresql://caerp_user:pass@localhost:5432/caerp?schema=public
DIRECT_URL=postgresql://caerp_user:pass@localhost:5432/caerp  # migrations only

# Auth
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_EXPIRY_SECONDS=900

# Government APIs (store in HashiCorp Vault in prod)
ERI_CERT_PATH=./certs/eri.p12
ERI_CERT_PASSWORD=your_eri_cert_password
GSTN_GSP_USERNAME=your_gsp_username
GSTN_GSP_PASSWORD=your_gsp_password
TRACES_API_KEY=your_traces_api_key

# AI
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_VISION_API_KEY=AIza...

# Storage + Notifications
AWS_REGION=ap-south-1
AWS_S3_BUCKET=caerp-documents-prod
TWILIO_ACCOUNT_SID=AC...
WHATSAPP_BSP_TOKEN=...
\`\`\`

## GitHub Actions CI/CD
\`\`\`yaml
name: CA ERP Suite Deploy
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          pnpm test               # Frontend + Node.js Jest tests
          pytest services/ai-service/tests/    # Python tests
          mvn test -pl services/itr-service     # Java JUnit tests
      - name: Prisma validate
        run: npx prisma validate
      - name: Security scan
        run: |
          npm audit --audit-level=high
          trivy image $IMAGE_NAME

  build-push:
    needs: test
    steps:
      - name: Build + push to ECR
        run: docker build -t $ECR_REGISTRY/$SERVICE:$SHA . && docker push ...

  deploy-staging:
    if: github.event_name == 'pull_request'
    steps:
      - name: Prisma migrate staging
        run: npx prisma migrate deploy --schema=./prisma/schema.prisma
      - name: Deploy to EKS staging
        run: kubectl set image deploy/$SERVICE $SERVICE=$IMAGE -n staging

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Blue-green deploy EKS prod
        run: |
          npx prisma migrate deploy  # Run migrations before pods start
          kubectl set image deploy/$SERVICE $SERVICE=$IMAGE -n prod
          kubectl rollout status deploy/$SERVICE -n prod
\`\`\``
},

"AI_Instructions.md": {
icon:"🤖", desc:"Master prompt for Firebase Studio — generate CA ERP module by module",
content:`# AI_Instructions.md — Master Prompt for Firebase Studio
# CA ERP Suite — Winman Equivalent + AI-Powered Cloud Platform

## HOW TO USE THIS IN FIREBASE STUDIO
1. Go to studio.firebase.google.com (free — Google account only)
2. Click "Import GitHub repo" → connect ca-erp-suite repository
3. Firebase Studio spins up cloud workspace with Gemini AI agent
4. Click ✦ Gemini icon in sidebar → AI chat opens
5. Paste the MASTER PROMPT below
6. Gemini reads all /project-docs files and generates module by module
7. No local install needed — all in browser

---

## MASTER PROMPT

\`\`\`
You are working inside Firebase Studio (studio.firebase.google.com).
Read ALL files inside /project-docs carefully before writing any code:

- PRD.md          → product requirements, assessee flows, Winman equivalent features
- Features.md     → complete feature checklist with P0/P1/P2 priorities
- UIUX.md         → GBC Associates-inspired Navy/Gold design, single-window computation UI, animations
- TechStack.md    → Firebase Studio IDE, Prisma ORM, React, Node.js, Java Spring Boot, AI stack
- Database.md     → FULL Prisma schema (schema.prisma) — all models including double-entry bookkeeping
- API.md          → all REST endpoints for ITR, TDS, GST, 3CD, Balance Sheet, AI services
- Architecture.md → microservices on AWS Mumbai, data flow, multi-tenancy, Kubernetes scaling
- Security.md     → DSC auth, financial data encryption, PDPB compliance, OWASP for CA software
- Deployment.md   → Docker Compose, GitHub Actions with prisma migrate deploy, AWS EKS
- AI_Instructions.md → this file

Project: CA ERP Suite — Cloud-native equivalent of Winman CA-ERP + Winman TDS + Winman GST
Target: Indian Chartered Accountants with 100–2000 assessee files

CRITICAL RULES:
1. ORM: Prisma 5.x is the ONLY way to query PostgreSQL from Node.js — NO raw SQL
2. FINANCIAL AMOUNTS: Always store in PAISE (BigInt). Use Decimal.js — NEVER float/double
3. DOUBLE-ENTRY: Every voucher must have debit_amt_paise = credit_amt_paise (enforced at DB level)
4. AUDIT TRAIL: AuditLog is APPEND-ONLY — never UPDATE or DELETE audit_logs
5. FY LOCK: Posted vouchers in a locked financial year are IMMUTABLE
6. SECURITY: PAN encrypted, Aadhaar as SHA-256 hash only, DSC keys in Vault, no raw credentials in code
7. IT ACT 2025: Use IT Act 2025 sections (effective 1 Apr 2026) for all TDS/ITR references
8. TAX SLABS: New Regime: 0/5/10/15/20/25/30% for ₹0-4L/4-8L/8-12L/12-16L/16-20L/20-24L/24L+

Start with:
Step 1 → Generate monorepo structure + root package.json + /prisma/schema.prisma from Database.md
Then ask which module to generate next.
\`\`\`

---

## STEP-BY-STEP MODULE PROMPTS

### Step 2 — Prisma Schema + DB
\`\`\`
Generate /prisma/schema.prisma exactly as in Database.md.
Run: npx prisma migrate dev --name init
Run: npx prisma generate
Add PostgreSQL triggers from Database.md for:
1. enforce_double_entry — debit MUST equal credit on every voucher
2. no_update_locked_voucher — FY-locked posted vouchers are immutable
3. no_update_audit + no_delete_audit — audit_logs append-only
\`\`\`

### Step 3 — Auth Service
\`\`\`
Generate /services/auth-service in Node.js 20 + Fastify + TypeScript + Prisma.
Implement from API.md /auth endpoints:
- POST /auth/signup: bcrypt(password, 12), create Firm + User, return JWT RS256 pair
- POST /auth/login: verify password + TOTP (if mfaEnabled), return tokens
- POST /auth/refresh: rotate refresh token (old token invalidated in Redis)
- POST /auth/mfa/setup: generate TOTP secret + QR code (speakeasy library)
- POST /auth/logout: add refresh token to Redis denylist

Security from Security.md:
- Rate limiting: 10 req/min on all /auth/* routes
- Account lockout: 5 failures → Redis key with 30min TTL
- All responses include X-Request-ID
- Audit log every login/logout to AuditLog model via Prisma
\`\`\`

### Step 4 — ITR Service (Java Spring Boot — most critical)
\`\`\`
Generate /services/itr-service in Java 21 + Spring Boot 3 + Spring JPA.
This is the most critical service — Winman CA-ERP equivalent.

Implement:
1. Form 16 PDF parser (call ai-service /ai/form16/parse — microservice call)
2. IT Act 2025 New Regime tax computation:
   Slabs: 0/5/10/15/20/25/30% for ₹0-4L/4-8L/8-12L/12-16L/16-20L/20-24L/24L+
   Old Regime: with 80C/80D/HRA/standard deduction
   Regime comparator: compute both → recommend lower tax
   USE BigDecimal for ALL calculations — never float/double
3. ITR-1/2/3/4/5/6/7 JSON generator per IT dept e-filing schema
4. ERI API integration: upload ITR, download ITR-V, e-verify
5. AIS/TIS fetch from IT portal ERI endpoint
6. Bulk e-return processing status (MIS report — Winman-inspired)
7. Error locator: validate ITR JSON against schema + business rules before upload

Section references (IT Act 2025 effective 1 Apr 2026):
- Standard deduction: Section 16(ia) equivalent → ₹75,000 in new regime
- HRA: Sec 10(13A) equivalent + Form 124 (replaces 12BB)
- TDS salary: Section 392
- Capital gains LTCG equity: Section 112A equivalent → 12.5% above ₹1.25L
- STCG equity: Section 111A equivalent → 20%
\`\`\`

### Step 5 — TDS Service
\`\`\`
Generate /services/tds-service in Node.js 20 + Fastify + TypeScript + Prisma.

Implement all API.md /tds endpoints:
1. Deductee CRUD with PAN validation (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
2. Section-wise TDS rate lookup (IT Act 2025 mapping: 192B→Sec392, 194C/194J→Sec393)
3. 206AB/206CCA compliance check (call IT portal API to check non-filer list)
4. Interest computation: Late deduction 1%/month, late deposit 1.5%/month
5. FVU file generation in NSDL format (refer NSDL RPU format spec)
6. TRACES API: download consolidated FVU, challan input file, TBR
7. Bulk Form 16 generation: merge Part A (TRACES) + Part B (computed by itr-service)
8. Auto-import salary data from itr-service (no re-entry — Winman-inspired)
9. TDS report for 3CD clause 34 (exported to audit-service)

Use Prisma for all DB operations — TDSReturn, TDSDeductee models from schema.prisma
\`\`\`

### Step 6 — Balance Sheet Service
\`\`\`
Generate /services/bs-service in Node.js 20 + Fastify + TypeScript + Prisma.

Implement:
1. Tally XML importer: parse Tally Prime XML export → create LedgerAccount + VoucherHeader + VoucherLine
   ENFORCE double-entry at application level before DB insert (DB trigger is safety net only)
2. Excel importer: xlsx library → custom COA mapping (user-defined column mapping)
3. Trial balance report: pull from LedgerAccount + sum VoucherLine debit/credit per account per FY
4. Balance Sheet generator (Schedule III — Companies Act 2013):
   - Current Assets / Non-Current Assets
   - Current Liabilities / Non-Current Liabilities
   - Equity (Share Capital + Reserves)
5. P&L Account: Gross Profit → Net Profit computation from account types
6. Cash Flow Statement: Indirect method (start from net profit, adjust non-cash items)
7. Depreciation: SLM = (Cost - Residual) / Life; WDV = Opening WDV × Rate (Schedule II)
8. Export to ITR: map BS values → ITR Schedule BP (business income), Schedule AL (assets/liabilities)
9. PDF generation with CA letterhead: puppeteer → PDF → upload to S3
\`\`\`

### Step 7 — Form 3CD Audit Service
\`\`\`
Generate /services/audit-service in Node.js 20 + Fastify + TypeScript + Prisma.

Implement:
1. TaxAuditReport CRUD (Form 3CA / 3CB / 3CD)
2. AI suggest endpoint: call ai-service → Claude API reads computation + TB → suggest all 44 clauses
3. Clause 34 auto-import: fetch TDS data from tds-service and populate clause
4. Clause 17(l) checker: scan VoucherLines for cash payments > ₹10,000 (flag these)
5. Clause 26 auto-populate: fetch deductions from ITRFiling.ITRDeduction[]
6. DSC signing: integrate with DSC vault (HashiCorp Vault) → sign 3CD JSON
7. e-File: POST to IT portal (ERI API) with signed 3CD JSON → ACK
8. All 44 clause responses must be versioned in AuditClause with aiSuggested + caVerified flags

Audit trail: every clause change writes AuditLog (who, when, old answer, new answer)
\`\`\`

### Step 8 — AI Service
\`\`\`
Generate /services/ai-service in Python 3.11 + FastAPI.

Implement:
1. Form 16 OCR parser:
   - Google Vision API → extract text from PDF
   - Custom spaCy NER model → extract: employer name, TAN, gross salary, TDS, 80C details
   - Return structured JSON matching ITRFiling computation fields
   
2. 3CD Clause AI Suggester (Claude API):
   System prompt: "You are an expert CA auditor with 20 years experience in Form 3CD.
   IT Act 2025 (effective 1 Apr 2026) references apply. 
   Analyse the trial balance and ITR computation, suggest answers for each clause."
   - RAG on Form 3CD instruction booklet (ICAI)
   - Return clause-by-clause suggestions with confidence score

3. Tax Regime Optimizer (Claude API):
   - Accept income details, deductions
   - Compute both regimes using IT Act 2025 slabs
   - Give plain language explanation of recommendation
   - Example: "New Regime saves ₹17,500 because your 80C deductions 
     are less than the slab advantage in new regime."

4. IT/GST Notice Analyser:
   - Vision API: read notice PDF
   - Claude API: classify (DRC-01/ASMT-10/143(1)/148)
   - Extract: demand amount, relevant period, due date for reply
   - Draft reply citing correct CGST sections / IT Act 2025 sections

5. Tax Advice Chatbot (RAG on laws):
   - Knowledge base: IT Act 2025, CGST Act, ICAI Standards
   - Chroma vector DB: semantic search on tax sections
   - Claude API: answer with section citations
   - Example Q: "What is the TDS rate on freelance design work under IT Act 2025?"
   - Expected A: "Under Section 393 of Income Tax Act 2025 (equivalent to Section 194J of the 1961 Act)..."
\`\`\`

### Step 9 — React Frontend
\`\`\`
Generate /frontend in React 18 + Vite + TypeScript + Tailwind CSS.
Design exactly as per UIUX.md: Navy #0B1746, Gold #C9A84C, Playfair Display (headings), Syne (body), Fira Code (amounts/PAN).

Critical components to build:
1. Dashboard: stat cards (ITR pending, TDS due, GST due, billing), deadline calendar, WIP tracker
2. SingleWindowComputation (Winman equivalent):
   - Expandable income table — all heads on one screen
   - Live tax recomputation on every field change (React Query mutation + optimistic update)
   - Tax comparator: Old vs New regime, show savings amount
   - No navigation between windows — entire computation on one page
3. Form3CDClauses: 44-clause accordion, AI suggestion badge, clause 34 TDS auto-import
4. TrialBalance: grid view with debit/credit columns, search, export to Excel
5. BalanceSheet: Schedule III format with notes expansion, PDF download
6. TDSReturnsGrid: deductee list with section codes, challan mapping, 206AB flags
7. BulkStatusDashboard (Winman MIS): all assessees status in one table, bulk download
8. ClientPortal: assessee login, view ITR filed, download ITR-V, upload documents
9. WhatsAppBotConfig: template management, reminder schedule config

Financial amounts MUST use Fira Code font and toLocaleString('en-IN') format.
PAN/TAN/GSTIN MUST be displayed in Fira Code uppercase.
Regime comparison: show ₹ savings with green/gold colour based on which is better.
\`\`\`

---

## DEBUGGING PROMPTS (paste into Firebase Studio Gemini)

### Prisma Double-Entry Constraint Trigger Error
\`\`\`
PostgreSQL trigger enforce_double_entry is throwing:
"ERROR: Double-entry violated: Debit ≠ Credit for voucher {id}"

Paste into Gemini:
Check /services/bs-service/src/voucher.service.ts
The Tally XML importer is not correctly mapping debit/credit amounts.
1. Verify: debitAmtPaise + creditAmtPaise per line item are NEVER both non-zero
2. Each VoucherLine has ONE non-zero side (debit XOR credit)
3. Sum of all debitAmtPaise across lines = sum of all creditAmtPaise
4. Use Prisma transaction: prisma.$transaction([...]) so all lines commit atomically
\`\`\`

### ITR JSON Schema Validation Failure at IT Portal
\`\`\`
IT portal rejecting ITR JSON with: "Business Rule Error BR-ITR3-001"

Paste into Gemini:
The itr-service Java Spring Boot is generating invalid ITR-3 JSON.
IT Act 2025 note: AY 2026-27 uses Tax Year concept, not Previous Year.
1. Check the "TaxYear" field: should be "2025-26" not "AY 2026-27"
2. Check Schedule BP: business income must reconcile with balance sheet net profit
3. Verify Section 44AD presumptive: turnover ≤ ₹3 crore (IT Act 2025 threshold)
4. Run the error locator utility before submission
\`\`\`

### Prisma BigInt Serialization Error in API Response
\`\`\`
JSON serialization error: "BigInt value cannot be serialized to JSON"

Paste into Gemini:
All monetary fields in Prisma schema are BigInt (paise storage).
Fix in all Node.js services: add custom BigInt serializer to Fastify:
  fastify.addHook('preSerialization', (req, reply, payload, done) => {
    done(null, JSON.parse(JSON.stringify(payload, (k, v) =>
      typeof v === 'bigint' ? Number(v) : v
    )));
  });
Then verify frontend receives values correctly and divides by 100 for ₹ display.
\`\`\``
},
};

// ── WORKFLOW STEPS ────────────────────────────────────────────────────────────
const STEPS = [
  {n:1,c:"#C9A84C",t:"Create /project-docs Folder",d:"Create the folder in your ca-erp-suite project root. All 10 files go here.",tool:"mkdir /project-docs"},
  {n:2,c:"#1B7A5A",t:"Fill All 10 Documents",d:"Copy each document from this guide into the corresponding .md file. Customise CA firm name, features.",tool:"10 files · ~5,000 lines"},
  {n:3,c:"#0B6B7B",t:"Open Firebase Studio",d:"Go to studio.firebase.google.com — free, no install. Import your GitHub repo. Gemini AI reads your entire codebase.",tool:"studio.firebase.google.com"},
  {n:4,c:"#4B2B8A",t:"Paste Master Prompt",d:"Open Gemini chat (✦ icon). Paste the Master Prompt from AI_Instructions.md. Gemini reads all 10 docs and starts building.",tool:"Gemini ✦ sidebar"},
  {n:5,c:"#B85A08",t:"Generate Prisma Schema First",d:"First thing: generate /prisma/schema.prisma from Database.md. Run prisma migrate dev. Generates all typed Prisma Client.",tool:"npx prisma migrate dev"},
  {n:6,c:"#8B2520",t:"Build Auth + ITR (Core)",d:"Auth service (JWT RS256 + TOTP MFA). Then ITR service (Java Spring Boot) — the Winman CA-ERP equivalent. Most critical.",tool:"Step 3 + 4 prompts"},
  {n:7,c:"#1565C0",t:"Build TDS + Balance Sheet",d:"TDS service with TRACES integration, 206AB check, bulk Form 16. Balance Sheet with Tally import + Schedule III.",tool:"Step 5 + 6 prompts"},
  {n:8,c:"#C9A84C",t:"Build 3CD + AI Service",d:"Form 3CD with 44-clause AI suggestions (Claude API). AI service: OCR Form 16, regime optimiser, notice analyser.",tool:"Step 7 + 8 prompts"},
  {n:9,c:"#1B7A5A",t:"Build React Frontend",d:"Single-window computation UI (Winman-inspired), MIS bulk status dashboard, Balance Sheet renderer, client portal.",tool:"Step 9 prompt"},
  {n:10,c:"#0B6B7B",t:"Docker + Deploy",d:"docker-compose up. Prisma migrate runs on startup. GitHub Actions CI/CD. Deploy to AWS EKS Mumbai (PDPB compliance).",tool:"docker-compose up → EKS"},
];

// ── FREE TOOLS ────────────────────────────────────────────────────────────────
const TOOLS = [
  {icon:"🔥",n:"Firebase Studio",r:"Primary AI IDE",tags:["Free (Google account)","Gemini AI agent","No install — runs in browser","studio.firebase.google.com"]},
  {icon:"🤖",n:"Google AI Studio",r:"Direct Gemini API",tags:["Free API key","Gemini 2.5 Pro","1M token context","aistudio.google.com"]},
  {icon:"🔺",n:"Prisma ORM",r:"Database Layer",tags:["Free open-source","Type-safe queries","Auto-migrations","Prisma Studio GUI"]},
  {icon:"☁️",n:"Vercel",r:"Frontend Deploy",tags:["Free hobby tier","Next.js native","Edge CDN India"]},
  {icon:"🚂",n:"Railway",r:"Backend Deploy",tags:["Free $5 credit","Docker support","PostgreSQL free tier"]},
  {icon:"🐙",n:"GitHub",r:"Version Control + CI/CD",tags:["Free private repos","GitHub Actions 2000 min","Dependabot security"]},
  {icon:"🔴",n:"Upstash Redis",r:"Cache + Sessions",tags:["Free 10K req/day","Serverless Redis","OTP storage"]},
  {icon:"📊",n:"Grafana Cloud",r:"Monitoring",tags:["Free 10K metrics","Filing trend dashboards","Error alerts"]},
  {icon:"🐋",n:"Docker Desktop",r:"Local Containers",tags:["Free personal use","Compose all services","Prisma migrate"]},
  {icon:"🧠",n:"Claude claude-sonnet-4-6",r:"AI Model",tags:["Best for 3CD clauses","200K context","IT Act 2025 aware"]},
  {icon:"🔍",n:"Elastic Cloud",r:"Assessee Search",tags:["14-day free trial","PAN/GSTIN lookup","Elasticsearch 8"]},
  {icon:"💾",n:"Supabase / Neon",r:"Dev PostgreSQL",tags:["Free PostgreSQL","Prisma compatible","512MB free tier"]},
];

const TABS = [
  {id:"overview",  label:"🏠 Overview"},
  {id:"docs",      label:"📁 /project-docs"},
  {id:"workflow",  label:"⚡ Build Workflow"},
  {id:"tools",     label:"🛠️ Free Tools"},
  {id:"prompt",    label:"🤖 Master Prompt"},
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,    setTab]    = useState("overview");
  const [doc,    setDoc]    = useState("PRD.md");
  const [copied, setCopied] = useState("");

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(()=>setCopied(""),2200);
  };

  const masterPrompt = Object.values(DOCS).find(d=>d.icon==="🤖")?.content
    ?.match(/## MASTER PROMPT\n\`\`\`\n([\s\S]+?)\n\`\`\`/)?.[1] || "";

  const renderDoc = (content) => {
    const lines = content.split("\n");
    const els = [];
    let preLines = [], inPre = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("```")) {
        if (inPre) {
          els.push(<pre key={i}>{preLines.join("\n")}</pre>);
          preLines = []; inPre = false;
        } else { inPre = true; }
        continue;
      }
      if (inPre) { preLines.push(line); continue; }
      if (line.startsWith("# "))     { els.push(<h1 key={i}>{line.slice(2)}</h1>); continue; }
      if (line.startsWith("## "))    { els.push(<h2 key={i}>{line.slice(3)}</h2>); continue; }
      if (line.startsWith("### "))   { els.push(<h3 key={i}>{line.slice(4)}</h3>); continue; }
      if (line.startsWith("| ") || line.startsWith("|---")) {
        if (line.includes("---")) continue;
        const cells = line.split("|").filter(c=>c.trim());
        const isHeader = i > 0 && lines[i+1]?.includes("---");
        if (isHeader) {
          els.push(<table key={i}><thead><tr>{cells.map((c,j)=><th key={j}>{c.trim()}</th>)}</tr></thead></table>);
        } else {
          const lastTbl = els[els.length-1];
          if (lastTbl?.type === "table") {
            const rows = lastTbl.props.children.find(c=>c.type==="tbody")?.props.children||[];
            const newRow = <tr key={i}>{cells.map((c,j)=><td key={j}>{c.trim()}</td>)}</tr>;
            const head = lastTbl.props.children.find(c=>c.type==="thead");
            const body = <tbody>{[...rows, newRow]}</tbody>;
            els[els.length-1] = <table key={`t${i}`}>{head}{body}</table>;
          } else {
            els.push(<table key={i}><tbody><tr>{cells.map((c,j)=><td key={j}>{c.trim()}</td>)}</tr></tbody></table>);
          }
        }
        continue;
      }
      if (line.startsWith("- [ ] ")||line.startsWith("- [x] ")||line.startsWith("- ")) {
        const done = line.startsWith("- [x]");
        const txt  = line.startsWith("- [ ] ")||line.startsWith("- [x] ") ? line.slice(6) : line.slice(2);
        els.push(<li key={i} style={{display:"flex",gap:7,padding:"3px 0",fontSize:12,color:"#A8B8D0",listStyle:"none"}}>
          <span style={{color:done?"#3EC89A":"var(--gold)",flexShrink:0,marginTop:1}}>{done?"✓":"▸"}</span>{txt}
        </li>);
        continue;
      }
      if (line.trim()==="") { els.push(<div key={i} style={{height:6}} />); continue; }
      els.push(<p key={i}>{line.split(/`([^`]+)`/).map((s,j)=>j%2===1?<code key={j}>{s}</code>:s)}</p>);
    }
    return <div className="md">{els}</div>;
  };

  return (
    <div>
      <style>{CSS}</style>
      <div className="mesh">
        <div className="orb" style={{width:500,height:500,top:"-10%",right:"-5%",background:"radial-gradient(circle,rgba(201,168,76,1),transparent 70%)",animationDuration:"14s"}} />
        <div className="orb" style={{width:600,height:600,bottom:"-20%",left:"-10%",background:"radial-gradient(circle,rgba(13,123,123,1),transparent 70%)",animationDuration:"18s",animationDelay:"-5s"}} />
        <div className="orb" style={{width:400,height:400,top:"40%",left:"20%",background:"radial-gradient(circle,rgba(75,43,138,1),transparent 70%)",animationDuration:"22s",animationDelay:"-9s"}} />
      </div>

      <header className="hdr">
        <div className="logo">CA <em>ERP Suite</em></div>
        <div className="tabs">
          {TABS.map(t=><button key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}
        </div>
        <div className="hbadge">/project-docs Guide</div>
      </header>

      <main className="main">

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            <div className="hero">
              <div className="pill">📄 AI Full-Stack Project Builder Guide · PDF Methodology</div>
              <h1>CA ERP Suite<br/>Complete /project-docs Plan</h1>
              <p>All 10 structured documents following the PDF guide — enabling Firebase Studio + Gemini to build 85–92% of a production-ready Winman-equivalent Income Tax · TDS · GST · Balance Sheet platform for Indian Chartered Accountants.</p>
              <div className="hstats">
                {[["10","Project Docs"],["6","CA Modules"],["IT Act 2025","Compliant"],["Prisma ORM","Only DB Layer"],["Firebase Studio","Free IDE"],["85–92%","AI Generated"]].map(([n,l])=>(
                  <div key={l} className="hs"><span>{n}</span> {l}</div>
                ))}
              </div>
            </div>

            <div className="ibox igold">
              <strong style={{color:"var(--gold)"}}>PDF Methodology Applied:</strong> Following the guide exactly — Idea → /project-docs → Firebase Studio AI → Generate → Test → Debug → Deploy. The 10 documents below give Gemini AI a complete blueprint: PRD explains the Winman problem, Database.md has the full Prisma schema with double-entry bookkeeping rules, AI_Instructions.md has 9 step-by-step module prompts. CA finance knowledge from the ca-finance-expert skill (IT Act 2025, GST sections, TDS rates, 3CD clauses) is embedded throughout.
            </div>

            <div className="sechd" style={{marginTop:28}}>
              <div className="si">📁</div>
              <div><div className="st">All 10 /project-docs Files</div><div className="ss">Click any file to view, copy and paste into your project folder</div></div>
            </div>

            <div className="wf-grid">
              {Object.entries(DOCS).map(([name, d], i)=>(
                <div key={name} className="wfc" style={{"--cc":"var(--gold)",animationDelay:`${i*0.06}s`,cursor:"pointer"}}
                  onClick={()=>{setDoc(name);setTab("docs")}}>
                  <div className="wfn">{d.icon} {name}</div>
                  <div className="wft">{d.desc.split("—")[0].trim()}</div>
                  <div className="wfd">{d.desc.split("—").slice(1).join("—").trim()}</div>
                  <div className="wtool">Click to view + copy →</div>
                </div>
              ))}
            </div>

            <div style={{marginTop:32}}>
              <div className="sechd">
                <div className="si">🏦</div>
                <div><div className="st">What Makes This a CA ERP (Not Just a SaaS)</div></div>
              </div>
              <div className="wf-grid">
                {[
                  {c:"#C9A84C",t:"Double-Entry Enforced at DB",d:"PostgreSQL trigger verifies debit = credit on every VoucherLine insert. No corrupt accounting data possible."},
                  {c:"#1565C0",t:"IT Act 2025 Ready",d:"New Regime slabs (₹4-8L=5%, ₹8-12L=10%…), TDS Sections 392/393/394, Tax Year concept — all embedded in prompts."},
                  {c:"#0D7B7B",t:"Winman Single-Window UX",d:"SingleWindowComputation React component — live tax recomputation as CA types. All income heads on one screen. No page navigation."},
                  {c:"#D4700A",t:"44-Clause 3CD AI Assistant",d:"Claude claude-sonnet-4-6 reads trial balance + ITR computation → auto-suggests answers for all 44 Form 3CD clauses. CA just verifies."},
                  {c:"#1B7A5A",t:"Paise Storage (Never Float)",d:"ALL monetary amounts stored as BigInt in paise. Decimal.js for calculations. BigDecimal in Java. Never float/double — prevents ₹ rounding errors."},
                  {c:"#4B2B8A",t:"FY Lock + Immutable Audit",d:"Financial year lock prevents mutation of posted entries. AuditLog is append-only at PostgreSQL rule level — complete regulatory compliance."},
                ].map((s,i)=>(
                  <div key={i} className="wfc" style={{"--cc":s.c,animationDelay:`${i*0.07}s`}}>
                    <div className="wft" style={{color:s.c}}>{s.t}</div>
                    <div className="wfd">{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DOCS VIEWER ── */}
        {tab==="docs" && (
          <div>
            <div className="sechd">
              <div className="si">📁</div>
              <div><div className="st">/project-docs — All 10 Files</div><div className="ss">Click a file → view full content → copy into your project folder</div></div>
            </div>
            <div className="doc-panel">
              <div className="dsidebar">
                <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",letterSpacing:2,textTransform:"uppercase",padding:"3px 7px",marginBottom:3}}>📁 /project-docs</div>
                {Object.entries(DOCS).map(([name, d])=>(
                  <button key={name} className={`dbtn ${doc===name?"on":""}`} onClick={()=>setDoc(name)}>
                    {d.icon} {name}
                    <span className="dchip">{name.split(".")[1]}</span>
                  </button>
                ))}
              </div>
              <div className="dcontent">
                <div className="dtop">
                  <div>
                    <div className="dfn">{DOCS[doc].icon} {doc}</div>
                    <div className="dds">{DOCS[doc].desc}</div>
                  </div>
                  <button className={`cbtn ${copied===doc?"ok":""}`} onClick={()=>copy(DOCS[doc].content, doc)}>
                    {copied===doc?"✓ Copied!":"⎘ Copy File"}
                  </button>
                </div>
                <div className="dbody">{renderDoc(DOCS[doc].content)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── WORKFLOW ── */}
        {tab==="workflow" && (
          <div>
            <div className="sechd">
              <div className="si">⚡</div>
              <div><div className="st">10-Step Build Workflow</div><div className="ss">PDF Guide: Idea → Documentation → AI Code Generation → Testing → Debugging → Deployment</div></div>
            </div>
            <div className="ibox igold">
              <strong style={{color:"var(--gold)"}}>PDF Guide Applied:</strong> The guide says "Professional AI builders give structured project documents to the AI. These documents act like a blueprint." All 10 documents are pre-filled with CA ERP specifics — Winman workflows, IT Act 2025 sections, Prisma schema, double-entry rules, GST CGST sections. Firebase Studio + Gemini reads all 10 and generates 85–92% automatically.
            </div>
            <div className="wf-grid">
              {STEPS.map((s,i)=>(
                <div key={i} className="wfc" style={{"--cc":s.c,animationDelay:`${i*0.07}s`}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:s.c,opacity:0.15,position:"absolute",right:12,top:6}}>{String(s.n).padStart(2,"0")}</div>
                  <div className="wfn">STEP {s.n}</div>
                  <div className="wft">{s.t}</div>
                  <div className="wfd">{s.d}</div>
                  <div className="wtool">{s.tool}</div>
                </div>
              ))}
            </div>

            <div style={{marginTop:28}}>
              <div className="sechd">
                <div className="si">📊</div>
                <div><div className="st">What AI Generates vs What CA Developer Fixes</div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
                {[
                  {t:"AI Generates (85–92%)",c:"#1B7A5A",items:["Full Prisma schema (all 15 models, all enums)","PostgreSQL double-entry enforcement triggers","All REST API endpoints (ITR, TDS, GST, 3CD, BS)","Java Spring Boot ITR computation engine","React single-window computation component","Docker Compose with prisma-migrate init container","GitHub Actions CI/CD with prisma migrate deploy","Balance Sheet Schedule III HTML/PDF generator","Form 16 OCR pipeline (Google Vision + NER)","Claude API integration for 3CD clause suggestions","JWT RS256 auth + TOTP MFA + session management","Bulk e-return status MIS dashboard (Winman MIS)"]},
                  {t:"CA Developer Reviews + Fixes (8–15%)",c:"#B85A08",items:["ERI API authentication (IT portal cert-based auth)","Exact NSDL FVU file format for TDS e-filing","GSTN GSP API token refresh logic","Form 3CD clause 34 TDS import edge cases","Tax computation for special assessees (NRI, AOP)","Winman data migration format (import PY files)","IT Act 2025 new section references (verify mapping)","TRACES API response parsing for all return types","Aadhaar OTP integration with UIDAI AUA licence","DSC signing flow with Class 3 certificate vault","Performance optimisation for 2000 assessee firms","VAPT fixes before GSP licence application"]},
                ].map((col,i)=>(
                  <div key={i} style={{background:"var(--faint)",border:`1px solid ${col.c}33`,borderRadius:13,borderTop:`3px solid ${col.c}`,padding:18}}>
                    <div style={{fontSize:13,fontWeight:700,color:col.c,marginBottom:12}}>{col.t}</div>
                    {col.items.map((item,j)=>(
                      <div key={j} style={{display:"flex",gap:7,padding:"4px 0",fontSize:12,color:"#A8B8D0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <span style={{color:col.c,flexShrink:0}}>{i===0?"✓":"→"}</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TOOLS ── */}
        {tab==="tools" && (
          <div>
            <div className="sechd">
              <div className="si">🛠️</div>
              <div><div className="st">Free AI Coding Stack (PDF Guide Tools — CA ERP Edition)</div><div className="ss">Build 85–92% of CA ERP Suite for ₹0 in tool costs. Pay only for government API licences (ERI, GSP) and Claude API usage.</div></div>
            </div>
            <div className="ibox igreen">
              <strong style={{color:"#3EC89A"}}>Total Free Tool Cost to Start:</strong> ₹0 — Firebase Studio (free), Vercel (free frontend), Railway (free backend ₹5 credit), Prisma (open-source), Upstash Redis (free tier). Only costs: AWS Mumbai (after 100+ CA firms), Claude API (per token — starts at ~₹1,000/month), Google Vision API (~₹10 per 1000 Form 16 pages).
            </div>
            <div className="tool-grid">
              {TOOLS.map((t,i)=>(
                <div key={i} className="toolc" style={{animationDelay:`${i*0.06}s`}}>
                  <div style={{fontSize:26,marginBottom:7}}>{t.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>{t.n}</div>
                  <div style={{fontSize:10,fontWeight:600,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{t.r}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{t.tags.map((tag,j)=>(
                    <span key={j} style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:"rgba(255,255,255,0.06)",color:"#8899BB",fontFamily:"'Fira Code',monospace"}}>{tag}</span>
                  ))}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:24}}>
              <div className="sechd">
                <div className="si">💰</div>
                <div><div className="st">Cost Escalation as CA Firm Count Grows</div></div>
              </div>
              <div className="tbl-wrap">
                <table className="dtbl">
                  <thead><tr><th>Stage</th><th>CA Firms</th><th>Tools</th><th>Monthly Cost</th></tr></thead>
                  <tbody>
                    {[
                      ["Development","0 (dev only)","Firebase Studio + Railway Free + Prisma + Upstash","₹0–500/month"],
                      ["Beta","10–50 CA firms","Railway Starter + Vercel Pro + Upstash + Claude API","₹5,000–15,000/month"],
                      ["Growth","100–500 CAs","AWS t3.large Mumbai + RDS + ElastiCache + Claude","₹30,000–1L/month"],
                      ["Scale","500–2000 CAs","AWS EKS Mumbai + RDS Multi-AZ + Datadog + GSP","₹2–8L/month"],
                      ["Enterprise","2000+ CAs","Full AWS prod + ERI licence + own GSP + SOC 2","₹10–30L/month"],
                    ].map((r,i)=>(
                      <tr key={i}>
                        {r.map((c,j)=><td key={j} style={j===3?{fontFamily:"'Fira Code',monospace",color:"var(--gold)",fontWeight:700}:{}}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MASTER PROMPT ── */}
        {tab==="prompt" && (
          <div>
            <div className="sechd">
              <div className="si">🤖</div>
              <div><div className="st">Master Prompt — Paste into Firebase Studio Gemini</div><div className="ss">After adding all 10 /project-docs files, paste this into the Gemini ✦ chat panel</div></div>
            </div>
            <div className="ibox igold">
              <strong style={{color:"var(--gold)"}}>PDF Guide Step 9:</strong> "Read all files inside /project-docs. Generate a production-ready full stack project." — Below is the CA ERP-specific master prompt with all critical constraints (Prisma, BigInt paise, double-entry, IT Act 2025, audit trail). After the master prompt, use the 9 module-specific prompts from AI_Instructions.md to generate each service.
            </div>
            <div className="prompt-box">
              <div className="ptop">
                <span className="plbl">🤖 Master Prompt — Firebase Studio Gemini Chat</span>
                <button className={`cbtn ${copied==="mp"?"ok":""}`} onClick={()=>copy(DOCS["AI_Instructions.md"].content,"mp")}>
                  {copied==="mp"?"✓ Copied Full File!":"⎘ Copy AI_Instructions.md"}
                </button>
              </div>
              <div className="pbody">{`You are working inside Firebase Studio (studio.firebase.google.com).
Read ALL files inside /project-docs carefully before writing any code:

- PRD.md          → Winman CA-ERP equivalent, IT Act 2025 ITR flows
- Features.md     → P0/P1/P2 checklist: ITR, TDS, GST, 3CD, Balance Sheet
- UIUX.md         → Navy/Gold design, single-window computation (Winman UX)
- TechStack.md    → Firebase Studio IDE, Prisma ORM, React, Java Spring Boot 3
- Database.md     → FULL Prisma schema with double-entry bookkeeping models
- API.md          → All endpoints: /itr, /tds, /gst, /bs, /audit, /ai
- Architecture.md → AWS Mumbai microservices, Prisma data flow
- Security.md     → DSC auth, Aadhaar hash-only, PDPB compliance, OWASP
- Deployment.md   → Docker Compose with prisma-migrate, GitHub Actions
- AI_Instructions.md → This file: master prompt + 9 step-by-step module prompts

Project: CA ERP Suite — Winman CA-ERP + Winman TDS + Winman GST, cloud-native
Target: Indian Chartered Accountants, 100–2000 assessees per firm

CRITICAL RULES (non-negotiable):
1. Prisma 5.x is the ONLY DB access layer for Node.js — NO raw SQL ever
2. Store ALL monetary amounts in PAISE (BigInt) — NEVER float/double
3. Use Decimal.js (Node.js) / BigDecimal (Java) for ALL tax calculations
4. Double-entry invariant: debit_amt_paise = credit_amt_paise (DB trigger enforces)
5. AuditLog is APPEND-ONLY — PostgreSQL rule prevents UPDATE/DELETE
6. Financial Year lock: posted vouchers in locked FY are immutable
7. IT Act 2025 (effective 1 Apr 2026): New Regime slabs 0/5/10/15/20/25/30%
8. TDS: Sec 392 (salary), Sec 393 (non-salary/NRI), Sec 394 (TCS)
9. Aadhaar: store SHA-256 hash ONLY — never raw Aadhaar number
10. DSC private keys: HashiCorp Vault ONLY — never in code or env files

Start with Step 1: Generate monorepo structure + /prisma/schema.prisma from Database.md
Then run: npx prisma migrate dev --name init && npx prisma generate
Then ask me which service to generate next.`}
              </div>
            </div>

            <div className="sechd" style={{marginTop:24}}>
              <div className="si">📋</div>
              <div><div className="st">9 Module-Specific Prompts (from AI_Instructions.md)</div></div>
            </div>
            <div className="wf-grid">
              {[
                {t:"Step 2 — Prisma Schema + DB Triggers",c:"#C9A84C",prompt:"Generate /prisma/schema.prisma from Database.md. Run prisma migrate dev. Add PostgreSQL triggers for double-entry enforcement, FY lock (immutable posted entries), and audit log append-only rule. Use npx prisma studio to verify all models created correctly."},
                {t:"Step 3 — Auth Service (Node.js + Prisma)",c:"#1B7A5A",prompt:"Generate /services/auth-service. Node.js 20 + Fastify + TypeScript + Prisma. JWT RS256 (15 min access token), bcrypt cost 12, TOTP MFA (speakeasy), rate limiting 10/min on auth routes, account lockout 5 failures → Redis 30min TTL, AuditLog every login/logout via Prisma."},
                {t:"Step 4 — ITR Service (Java Spring Boot 3)",c:"#1565C0",prompt:"Generate /services/itr-service. Java 21 + Spring Boot 3 + BigDecimal. IT Act 2025 New Regime slabs (0/5/10/15/20/25/30%). Old regime with 80C/80D. Regime comparator. ITR-1 to ITR-7 JSON generator. ERI API integration. AIS/TIS fetch. Bulk processing status (Winman MIS). Error locator before upload."},
                {t:"Step 5 — TDS Service (Node.js + Prisma)",c:"#D4700A",prompt:"Generate /services/tds-service. Node.js + Fastify + Prisma. All 4 forms (24Q/26Q/27Q/27EQ). IT Act 2025: Sec 392/393/394. 206AB/206CCA check. Interest: 1%/1.5% p.m. FVU NSDL format. TRACES integration. Bulk Form 16 generation. Auto-import salary from itr-service (no re-entry)."},
                {t:"Step 6 — Balance Sheet Service",c:"#0B6B7B",prompt:"Generate /services/bs-service. Node.js + Fastify + Prisma. Tally XML importer → create LedgerAccount + VoucherLine (enforce double-entry). Schedule III Balance Sheet. P&L Account. Cash Flow Statement (indirect method). Depreciation (SLM/WDV Schedule II). Export BS values to ITR Schedule BP/AL. PDF via puppeteer → S3."},
                {t:"Step 7 — Form 3CD Audit Service",c:"#4B2B8A",prompt:"Generate /services/audit-service. Node.js + Fastify + Prisma. TaxAuditReport + AuditClause models. 44-clause structured entry. AI suggest endpoint (calls ai-service Claude API). Clause 34 auto-import from tds-service. Clause 17(l): scan VoucherLines for cash > ₹10,000. DSC signing via Vault. e-File 3CD via ERI API."},
                {t:"Step 8 — AI Service (Python FastAPI)",c:"#8B2520",prompt:"Generate /services/ai-service. Python 3.11 + FastAPI. Form 16 OCR (Google Vision + spaCy NER). 3CD clause suggester (Claude claude-sonnet-4-6 + RAG on ICAI 3CD instructions). Old vs New Regime optimizer (IT Act 2025 slabs). GST/IT Notice analyser (Vision + Claude). Tax chatbot (Chroma + Claude, cite IT Act 2025 sections)."},
                {t:"Step 9 — React Frontend",c:"#C9A84C",prompt:"Generate /frontend. React 18 + Vite + TypeScript + Tailwind. Navy #0B1746 + Gold #C9A84C + Fira Code for amounts. SingleWindowComputation: all ITR heads on one table, live Decimal.js tax recomputation. Form3CDClauses: 44 accordions with AI suggestion badges. BulkStatusDashboard: all assessees MIS (Winman-inspired). ClientPortal: Next.js SSR for assessee login."},
                {t:"Step 10 — Docker + CI/CD",c:"#1B7A5A",prompt:"Generate complete docker-compose.yml from Deployment.md with: postgres:16, redis:7, elasticsearch:8, prisma-migrate init container (runs before all Node.js services), all 8 microservices. Generate .github/workflows/deploy.yml with: Prisma validate + Jest + pytest + JUnit → Docker build → prisma migrate deploy on staging → blue-green EKS prod deploy."},
              ].map((p,i)=>(
                <div key={i} className="wfc" style={{"--cc":p.c,animationDelay:`${i*0.06}s`}}>
                  <div className="wfn">{p.t}</div>
                  <div className="wfd" style={{fontSize:11.5,marginBottom:10}}>{p.prompt.substring(0,120)}…</div>
                  <button className={`cbtn ${copied===`p${i}`?"ok":""}`}
                    style={{fontSize:10,padding:"5px 11px"}}
                    onClick={()=>copy(p.prompt,`p${i}`)}>
                    {copied===`p${i}`?"✓ Copied!":"⎘ Copy Prompt"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
