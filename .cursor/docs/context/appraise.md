Title: Appraise — Production-Grade AI Appraisal Assistant

1) What we are building
- A professional AI assistant that augments licensed real estate appraisers and mortgage lenders.
- Not a consumer AVM or Zestimate clone. This is a human-in-the-loop (HITL) drafting and data workflow tool that streamlines data aggregation, comps workflows, and narrative report drafting.
- The end product: AI-generated draft appraisals and artifacts that a certified appraiser reviews, edits, and signs. The human retains final judgment and legal accountability.

2) Strategic positioning
- Key differentiator vs AVMs: we combine structured data (public records, MLS, tax) with unstructured, on-site materials (photos, notes, floor plans) and expert adjustments. Qualitative condition and unique features matter.
- Human-centric by design: aligns with industry reality—Fannie Mae/Freddie Mac still require certified appraisers for most loans.
- The AI removes grunt work, not human judgment.

3) Compliance and ethics (non-negotiable guardrails)
- USPAP: Support the ETHICS RULE and RECORD KEEPING RULE. The system helps maintain a complete workfile; never produces predetermined opinions. Final sign-off is human.
- Agency guidelines: Output aligns with Fannie Mae/Freddie Mac narrative expectations and comp rules (e.g., 3 closed comps in last 12 months; explain out-of-area or distressed comps).
- Privacy and security: Treat NPI/PII under GLBA/FCRA/CFPB guidance; respect HMDA; honor state privacy (e.g., TX Data Privacy and Security Act) with minimization, role-based access, encryption, and auditability.

4) Core capabilities (high-level)
- Data ingestion: Given an address, orchestrate retrieval from public records, MLS, and real estate providers; normalize, validate, dedupe; upsert into source-of-truth data model.
- Draft report generation: Combine quantitative modeling, retrieved policy context, and narrative generation to produce a compliant draft.
- HITL review: Side-by-side view of draft narrative vs. source data; interactive comps manager; explicit Accept/Reject/Edit workflows; capture edits as training signals.

5) Data model (single source of truth)
- properties: Subject property facts (beds/baths, GLA, lot, foundation, materials, taxes, etc.).
- comparables: Mirrors property schema; tracks AI-suggested vs. user-added flag; supports adjustments and rationales.
- appraisal_workfiles: Un/semistructured attachments—photos, floor plans, inspection PDFs, notes—used to incorporate qualitative insights.
- generated_reports: AI-generated drafts, revisions, and review states.
- users: Roles (appraiser, lender, admin), permissions, audit trails.

6) AI system (compound approach)
- Quantitative anchor: Predictive regression (e.g., GLM) on structured data to produce an initial value estimate and feature sensitivities.
- Retrieval-Augmented Generation (RAG): Pull USPAP, GSE guidelines, state regs, and prior exemplars from a curated knowledge base; also retrieve relevant items from the workfile (photos/notes) to ground claims.
- Narrative LLM: Fine-tuned to produce professional, compliant, and explainable appraisal prose. Always cites source data and aligns with policy snippets surfaced by RAG.
- Continuous learning loop: Appraiser edits, Accept/Reject decisions, and comp adjustments feed back as labeled data for ongoing improvement.

7) HITL user experience (principles)
- Transparency: Clearly mark AI-generated content; link every material claim to source data or guideline snippet.
- Control: Appraisers can override comps, edit adjustments, annotate rationales, and modify narrative—fast and in-place.
- Feedback capture: Structured Accept/Reject per section; reasons captured to improve future drafts.
- Comparable Sales Manager: Add/remove comps, apply adjustments, justify exceptions—all traceable.

8) MVP scope (Phase 1)
- Property type: Single-family detached.
- Ingestion: Public record baseline; consistent normalization and upsert.
- Modeling: Simple quantitative estimate with confidence band.
- NLG: Basic, compliant text-only draft covering subject summary, market overview, comps rationale, assumptions/limiting conditions.
- UI: Side-by-side draft + raw data; basic comps table; inline edit + Accept/Reject.

9) Phase 2+ (expansion)
- Add condos; enrich ingestion (MLS); full RAG knowledge base (USPAP, GSEs, state rules).
- Fine-tuned narrative model on expert-annotated examples.
- Advanced Comparable Manager and edit telemetry loop.
- Light document AI for floor plans and simple inspection PDFs.

10) Security and operations (defaults)
- Encrypt in transit and at rest; role-based access; least-privilege.
- Full audit logging for data access, AI prompts/outputs, and user edits.
- Modular components to update models or guidance without system rewrites.
- Observability on ingestion retries, model errors, and prompt grounding coverage.

11) Future enhancements (vision)
- Multimodal condition assessment: Computer vision on photos/video to flag condition issues (e.g., damaged roof tiles) and suggest narrative phrasing with evidence links.
- Automated document analysis: Parse inspections/title docs to extract key findings and feed the draft.
- Market dynamics enrichment: Integrate third-party predictive signals (e.g., propensity to list) to contextualize local trends for lenders and appraisers.

12) Non-goals and guardrails
- Not an instant consumer price widget; no fully automated “final value.”
- No bypass of USPAP or agency rules.
- No output without traceable sources; avoid hallucination via strict RAG grounding and source linking.

13) Success criteria (what “good” looks like)
- Time savings: Significant reduction in time-to-draft for standard assignments.
- Compliance confidence: Drafts map statements to authoritative sources; easier audits and sign-offs.
- Appraiser satisfaction: Edits shrink over time; the tool feels like a competent junior analyst that improves with feedback.
- Data completeness: Ingestion achieves high reliability with idempotent upserts and resilient retries.