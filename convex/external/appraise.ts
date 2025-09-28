import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { AppraisalStatus } from "../appraisals/workflow";

type Subject = Record<string, any>;
type Comp = Record<string, any>;
type SalesHistory = Record<string, any>;

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
a structured JSON result.
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

// Pipe-delimited helpers derived from external prototype
const PIPE_HEADERS: Array<string> = [
    "recordType",
    "accountNumber",
    "line1",
    "city",
    "state",
    "postalCode",
    "baseAreaSqft",
    "basementAreaSqft",
    "finishedBasementAreaSqft",
    "bathrooms",
    "halfBathrooms",
    "bedrooms",
    "parkingAreaSqft",
    "totalAreaSqft",
    "yearBuilt",
    "totalMarketValueUsd",
    "landValueUsd",
    "lotSize",
    "neighborhoodCode",
    "qualityCode",
    "propertyType",
    "salesHistory",
    "salesHistory.previousOwner",
    "salesHistory.saleDate",
    "salesHistory.salePriceUsd",
    "salesHistory.adjustedSalePriceUsd",
    "salesHistory.unitPriceSqftUsd",
];

function sanitizeForPipe(value: unknown): string {
    const str = String(value ?? "");
    return str.replace(/\n/g, " ").replace(/\r/g, " ");
}

function buildPipeRow(obj: any, recordType: "subject" | "comp"): string {
    // Handle sales history - get the most recent sale or empty values
    const salesHistory = obj?.salesHistory?.[0] || {};

    const values = [
        recordType,
        sanitizeForPipe(obj?.accountNumber),
        sanitizeForPipe(obj?.line1),
        sanitizeForPipe(obj?.city),
        sanitizeForPipe(obj?.state),
        sanitizeForPipe(obj?.postalCode),
        sanitizeForPipe(obj?.baseAreaSqft),
        sanitizeForPipe(obj?.basementAreaSqft),
        sanitizeForPipe(obj?.finishedBasementAreaSqft),
        sanitizeForPipe(obj?.bathrooms),
        sanitizeForPipe(obj?.halfBathrooms),
        sanitizeForPipe(obj?.bedrooms),
        sanitizeForPipe(obj?.parkingAreaSqft),
        sanitizeForPipe(obj?.totalAreaSqft),
        sanitizeForPipe(obj?.yearBuilt),
        sanitizeForPipe(obj?.totalMarketValueUsd),
        sanitizeForPipe(obj?.landValueUsd),
        sanitizeForPipe(obj?.lotSize),
        sanitizeForPipe(obj?.neighborhoodCode),
        sanitizeForPipe(obj?.qualityCode),
        sanitizeForPipe(obj?.propertyType),
        sanitizeForPipe(obj?.salesHistory ? JSON.stringify(obj.salesHistory) : ""),
        sanitizeForPipe(salesHistory?.previousOwner),
        sanitizeForPipe(salesHistory?.saleDate),
        sanitizeForPipe(salesHistory?.salePriceUsd),
        sanitizeForPipe(salesHistory?.adjustedSalePriceUsd),
        sanitizeForPipe(salesHistory?.unitPriceSqftUsd),
    ];
    return values.join("|");
}

export function buildPipeDelimited(subject: Subject, comps: Array<Comp>): string {
    const headerLine = PIPE_HEADERS.join("|");
    const subjectLine = buildPipeRow(subject, "subject");
    const compLines = (Array.isArray(comps) ? comps : []).map((c) => buildPipeRow(c, "comp"));
    return [headerLine, subjectLine, ...compLines].join("\n");
}

export function composePrompt(subject: Subject, comps: Comp[], cfg: RatesConfig): string {
    return [
        role(),
        objective(),
        inputs(subject, comps),
        constraints(),
        adjustmentGuidelines(cfg),
        processSection(),
    ].join("\n\n");
}

export const appraise = internalAction({
    args: {
        subject: v.object({
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
            salesHistory: v.array(v.object({
                previousOwner: v.union(v.string(), v.null()),
                saleDate: v.union(v.string(), v.null()),
                salePriceUsd: v.union(v.number(), v.null()),
                adjustedSalePriceUsd: v.union(v.number(), v.null()),
                unitPriceSqftUsd: v.union(v.number(), v.null()),
            })),
        }),
        comps: v.array(v.object({
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
            salesHistory: v.array(v.object({
                previousOwner: v.union(v.string(), v.null()),
                saleDate: v.union(v.string(), v.null()),
                salePriceUsd: v.union(v.number(), v.null()),
                adjustedSalePriceUsd: v.union(v.number(), v.null()),
                unitPriceSqftUsd: v.union(v.number(), v.null()),
            })),
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
    returns: v.any(),
    handler: async (ctx, args) => {
        const prompt = composePrompt(args.subject, args.comps, args.cfg);

        const { object } = await generateObject({
            model: openai('gpt-5'),
            schema: z.object({
                subject: z.object({
                    address: z.string(),
                    as_of_date: z.string(),
                    summary: z.string()
                }),
                assumptions: z.object({
                    gla_rate_per_sqft: z.number(),
                    bath_full_rate: z.number(),
                    bath_half_rate: z.number(),
                    bedroom_rate: z.number(),
                    basement_finished_rate: z.number(),
                    garage_rate_per_sqft: z.number(),
                    lot_adjustment_method: z.enum(["lump_sum", "per_sqft", "none"]),
                    time_adjustment_monthly_rate: z.union([z.number(), z.null()]),
                    location_adjustments_note: z.string()
                }),
                comps: z.array(z.object({
                    id: z.union([z.string(), z.null()]),
                    sale_date: z.string(),
                    unadjusted_price: z.number(),
                    price_per_sqft: z.union([z.number(), z.null()]),
                    differences: z.object({
                        gla_sqft: z.union([z.number(), z.null()]),
                        beds_diff: z.union([z.number(), z.null()]),
                        baths_full_diff: z.union([z.number(), z.null()]),
                        baths_half_diff: z.union([z.number(), z.null()]),
                        basement_finished_sqft_diff: z.union([z.number(), z.null()]),
                        garage_sqft_diff: z.union([z.number(), z.null()]),
                        lot_diff_descriptor: z.union([z.string(), z.null()]),
                        quality_diff_descriptor: z.union([z.string(), z.null()]),
                        location_diff_descriptor: z.union([z.string(), z.null()]),
                        age_diff_years: z.union([z.number(), z.null()])
                    }),
                    adjustments: z.array(z.object({
                        feature: z.string(),
                        amount: z.number(),
                        rationale: z.string()
                    })),
                    time_adjustment: z.number(),
                    net_adjustment: z.number(),
                    adjusted_price: z.number(),
                    weight: z.number()
                })),
                reconciliation: z.object({
                    indicated_range: z.object({
                        low: z.number(),
                        high: z.number()
                    }),
                    central_tendency: z.object({
                        mean: z.number(),
                        median: z.number()
                    }),
                    weighted_value: z.number(),
                    final_value_opinion: z.number(),
                    reasoning: z.string()
                }),
                risks: z.array(z.string())
            }),
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
            ]
        });

        return object;

    },
});

export const saveAppraisalJson = internalMutation({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
        appraisalJson: v.any(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("appraisal_json", {
            appraisalRequestId: args.appraisalRequestId,
            appraisalJson: args.appraisalJson,
        });

        // Update the appraisal request status to complete
        await ctx.db.patch(args.appraisalRequestId, {
            status: AppraisalStatus.APPRAISAL_COMPLETE,
        });
    },
});