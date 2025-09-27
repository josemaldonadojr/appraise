import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

type Subject = Record<string, any>;
type Comp = Record<string, any>;

export type RatesConfig = {
    glaRateStart: number; // e.g., 90
    bedroomStart: number; // e.g., 4000
    bathFullStart: number; // e.g., 5000
    bathHalfStart: number; // e.g., 2500
    basementFinishedStart: number; // e.g., 35
    garageRateStart: number; // e.g., 20
    lotMethod: "lump_sum" | "per_sqft" | "none";
    timeAdjMonthlyStart: number | null; // e.g., 0.004
};

export function role(): string {
    return `
Role
You are a licensed residential real estate appraiser producing a sales comparison
analysis for a single-family residence. Follow USPAP-style rigor in reasoning,
but do not claim USPAP compliance. Use only the data provided unless explicitly
stated. Be conservative, consistent, and explain adjustments clearly. Output
both a concise narrative and a structured JSON result.
`.trim();
}

export function objective(): string {
    return `
Objective
- Analyze the Subject property versus provided comparable sales.
- Make market-supported line-item adjustments.
- Reconcile to an indicated value range and a point estimate as of the Subject’s as_of_date.
- Include an audit-friendly adjustment table and brief market context.
`.trim();
}

function safeStringify(obj: unknown, maxChars = 5000): string {
    const json = JSON.stringify(obj, null, 2);
    return json.length > maxChars ? json.slice(0, maxChars) + "\n... [truncated]" : json;
}

export function inputs(subject: Subject, comps: Comp[]): string {
    return `
Inputs
- Subject (JSON):
${safeStringify(subject)}

- Comps (JSON array):
${safeStringify(comps)}
`.trim();
}

export function constraints(): string {
    return `
Constraints
- Time: Value is as of Subject.as_of_date.
- Geography: Prioritize same subdivision/neighborhood_code, then nearby substitutes.
- Data hygiene: If a field is missing for a comp, note it and avoid speculative adjustments.
- No external data: Do not assume MLS remarks or features that aren’t provided.
`.trim();
}

export function adjustmentGuidelines(cfg: RatesConfig): string {
    return `
Adjustment Guidelines
Use paired-sales logic and market norms. If explicit local factors aren’t given,
use these reasonableness defaults and calibrate to the comp set:

- Gross living area (GLA): $65–$125/sqft typical. Start at $${cfg.glaRateStart}/sqft.
- Bedroom count: Start at $${cfg.bedroomStart} per bedroom where utility differs.
- Full baths: Start at $${cfg.bathFullStart} each.
- Half baths: Start at $${cfg.bathHalfStart} each.
- Age/Condition/Quality: $5,000–$25,000 based on gap and evidence.
- Basement finished area: Start at $${cfg.basementFinishedStart}/sqft.
- Garage/parking (sqft if only metric available): Start at $${cfg.garageRateStart}/sqft.
- Lot size: Method: ${cfg.lotMethod}.
- Time/market conditions: Monthly rate: ${cfg.timeAdjMonthlyStart ?? "null"} (derive from comp set if possible).
Adjustment Direction Convention
- If a comp is superior to Subject on a feature, subtract from comp price.
- If a comp is inferior, add to comp price.
`.trim();
}

export function processSection(): string {
    return `
Process
1) Data recap
2) Market sanity checks
3) Line-item adjustments with table
4) Reconciliation with weights and range
5) Risk and data quality notes
`.trim();
}

export function outputFormat(): string {
    return `
Output Format
Return both:
A) NarrativeSummary: 150–300 words, plain language.
B) AppraisalJSON: Strictly follow this schema:

{
  "subject": {
    "address": string,
    "as_of_date": "YYYY-MM-DD",
    "summary": string
  },
  "assumptions": {
    "gla_rate_per_sqft": number,
    "bath_full_rate": number,
    "bath_half_rate": number,
    "bedroom_rate": number,
    "basement_finished_rate": number,
    "garage_rate_per_sqft": number,
    "lot_adjustment_method": "lump_sum" | "per_sqft" | "none",
    "time_adjustment_monthly_rate": number | null,
    "location_adjustments_note": string
  },
  "comps": [
    {
      "id": string,
      "sale_date": "YYYY-MM-DD",
      "unadjusted_price": number,
      "price_per_sqft": number | null,
      "differences": {
        "gla_sqft": number | null,
        "beds_diff": number | null,
        "baths_full_diff": number | null,
        "baths_half_diff": number | null,
        "basement_finished_sqft_diff": number | null,
        "garage_sqft_diff": number | null,
        "lot_diff_descriptor": string | null,
        "quality_diff_descriptor": string | null,
        "location_diff_descriptor": string | null,
        "age_diff_years": number | null
      },
      "adjustments": [
        { "feature": string, "amount": number, "rationale": string }
      ],
      "time_adjustment": number,
      "net_adjustment": number,
      "adjusted_price": number,
      "weight": number
    }
  ],
  "reconciliation": {
    "indicated_range": { "low": number, "high": number },
    "central_tendency": { "mean": number, "median": number },
    "weighted_value": number,
    "final_value_opinion": number,
    "reasoning": string
  },
  "risks": [string]
}
Rules and Ethics
- Do not fabricate facts outside the provided data.
- Be explicit where assumptions are made.
- Keep math traceable and consistent with the stated rates.
- Do not state compliance or certification; this is an analytical aid only.
`.trim();
}

export function composePrompt(subject: Subject, comps: Comp[], cfg: RatesConfig): string {
    return [
        role(),
        objective(),
        inputs(subject, comps),
        constraints(),
        adjustmentGuidelines(cfg),
        processSection(),
        outputFormat(),
        "Now use these inputs:\n- SUBJECT_JSON:\n<inject subject JSON here>\n\n- COMPS_JSON:\n<inject comps JSON array here>\n\nDeliverables\n- NarrativeSummary\n- AppraisalJSON",
    ].join("\n\n");
}

export const appraise = internalAction({
    args: {
        subject: v.object({
            appraisalRequestId: v.union(v.id("appraisal_requests"), v.null()),
            line1: v.union(v.string(), v.null()),
            fullAddress: v.string(),
            city: v.union(v.string(), v.null()),
            state: v.union(v.string(), v.null()),
            postalCode: v.union(v.string(), v.null()),
            countryCode: v.union(v.string(), v.null()),
            longitude: v.union(v.number(), v.null()),
            latitude: v.union(v.number(), v.null()),
            accountNumber: v.optional(v.union(v.string(), v.null())),

            bedrooms: v.union(v.number(), v.null()),
            lotSize: v.union(v.string(), v.null()),
            bathrooms: v.union(v.number(), v.null()),
            halfBathrooms: v.union(v.number(), v.null()),
            parcelId: v.union(v.string(), v.null()),
            asOfDate: v.union(v.string(), v.null()),
            fireplaces: v.union(v.number(), v.null()),
            ownerName: v.union(v.string(), v.null()),
            yearBuilt: v.union(v.number(), v.null()),
            subdivision: v.union(v.string(), v.null()),
            totalRooms: v.union(v.number(), v.null()),
            qualityCode: v.union(v.string(), v.null()),
            fireDistrict: v.union(v.string(), v.null()),
            propertyType: v.union(v.string(), v.null()),
            baseAreaSqft: v.union(v.number(), v.null()),
            exteriorWalls: v.union(v.string(), v.null()),
            landValueUsd: v.union(v.number(), v.null()),
            schoolDistrict: v.union(v.string(), v.null()),
            totalAreaSqft: v.union(v.number(), v.null()),
            legalDescription: v.union(v.string(), v.null()),
            neighborhoodCode: v.union(v.string(), v.null()),
            parkingAreaSqft: v.union(v.number(), v.null()),
            architecturalType: v.union(v.string(), v.null()),
            basementAreaSqft: v.union(v.number(), v.null()),
            commercialValueUsd: v.union(v.number(), v.null()),
            agricultureValueUsd: v.union(v.number(), v.null()),
            residentialValueUsd: v.union(v.number(), v.null()),
            totalMarketValueUsd: v.union(v.number(), v.null()),
            finishedBasementAreaSqft: v.union(v.number(), v.null()),
        }),
        comps: v.array(v.object({
            appraisalRequestId: v.union(v.id("appraisal_requests"), v.null()),
            line1: v.union(v.string(), v.null()),
            fullAddress: v.string(),
            city: v.union(v.string(), v.null()),
            state: v.union(v.string(), v.null()),
            postalCode: v.union(v.string(), v.null()),
            countryCode: v.union(v.string(), v.null()),
            longitude: v.union(v.number(), v.null()),
            latitude: v.union(v.number(), v.null()),
            accountNumber: v.optional(v.union(v.string(), v.null())),

            bedrooms: v.union(v.number(), v.null()),
            lotSize: v.union(v.string(), v.null()),
            bathrooms: v.union(v.number(), v.null()),
            halfBathrooms: v.union(v.number(), v.null()),
            parcelId: v.union(v.string(), v.null()),
            asOfDate: v.union(v.string(), v.null()),
            fireplaces: v.union(v.number(), v.null()),
            ownerName: v.union(v.string(), v.null()),
            yearBuilt: v.union(v.number(), v.null()),
            subdivision: v.union(v.string(), v.null()),
            totalRooms: v.union(v.number(), v.null()),
            qualityCode: v.union(v.string(), v.null()),
            fireDistrict: v.union(v.string(), v.null()),
            propertyType: v.union(v.string(), v.null()),
            baseAreaSqft: v.union(v.number(), v.null()),
            exteriorWalls: v.union(v.string(), v.null()),
            landValueUsd: v.union(v.number(), v.null()),
            schoolDistrict: v.union(v.string(), v.null()),
            totalAreaSqft: v.union(v.number(), v.null()),
            legalDescription: v.union(v.string(), v.null()),
            neighborhoodCode: v.union(v.string(), v.null()),
            parkingAreaSqft: v.union(v.number(), v.null()),
            architecturalType: v.union(v.string(), v.null()),
            basementAreaSqft: v.union(v.number(), v.null()),
            commercialValueUsd: v.union(v.number(), v.null()),
            agricultureValueUsd: v.union(v.number(), v.null()),
            residentialValueUsd: v.union(v.number(), v.null()),
            totalMarketValueUsd: v.union(v.number(), v.null()),
            finishedBasementAreaSqft: v.union(v.number(), v.null()),
        })),
        cfg: v.object({
            glaRateStart: v.number(),
            bedroomStart: v.number(),
            bathFullStart: v.number(),
            bathHalfStart: v.number(),
            basementFinishedStart: v.number(),
            garageRateStart: v.number(),
            lotMethod: v.union(v.literal("lump_sum"), v.literal("per_sqft"), v.literal("none")),
            timeAdjMonthlyStart: v.number(),
        }),
    },
    returns: v.object({}),
    handler: async (ctx, args) => {
        const prompt = composePrompt(args.subject, args.comps, args.cfg);
        console.log(prompt, 'prompt')
    },
});