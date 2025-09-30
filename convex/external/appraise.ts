import { internalAction, internalMutation } from "../_generated/server";
import { v, Infer } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { ActionCache } from "@convex-dev/action-cache";
import { components, internal } from "../_generated/api";

const PropertySchema = v.object({
    propertyAddress: v.optional(v.string()),
    bath: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    subdivision: v.optional(v.string()),
    fireplaces: v.optional(v.number()),
    accountNumber: v.optional(v.string()),
    parcelId: v.optional(v.string()),
    schoolDistrict: v.optional(v.string()),
    fireDistrict: v.optional(v.string()),
    neighborhoodCode: v.optional(v.string()),
    lotSize: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    qualityCode: v.optional(v.string()),
    architecturalType: v.optional(v.string()),
    exteriorWalls: v.optional(v.string()),
    totalAreaSqft: v.optional(v.number()),
    baseAreaSqft: v.optional(v.number()),
    parkingAreaSqft: v.optional(v.number()),
    totalRooms: v.optional(v.number()),
    basementAreaSqft: v.optional(v.number()),
    finishedBasementAreaSqft: v.optional(v.number()),
    propertyRole: v.union(v.literal("subject"), v.literal("comparable")),
    salesHistory: v.optional(v.array(v.object({
        previousOwners: v.optional(v.string()),
        saleDate: v.optional(v.string()),
        salePrice: v.optional(v.string()),
        adjustedSalePrice: v.optional(v.string()),
    }))),
});
type Property = Infer<typeof PropertySchema>;


const RatesConfigSchema = v.object({
    glaRateStart: v.number(),
    bedroomStart: v.number(),
    bathFullStart: v.number(),
    bathHalfStart: v.number(),
    basementFinishedStart: v.number(),
    garageRateStart: v.number(),
    lotMethod: v.union(v.literal("lump_sum"), v.literal("per_sqft"), v.literal("none")),
    timeAdjMonthlyStart: v.union(v.number(), v.null()),
});
type RatesConfig = Infer<typeof RatesConfigSchema>;

// Cache configuration for appraisal results
const APPRAISAL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days - appraisal results are stable for similar properties

function safeStringify(obj: unknown, maxChars = 5000): string {
    const json = JSON.stringify(obj, null, 2);
    return json.length > maxChars ? json.slice(0, maxChars) + "\n... [truncated]" : json;
}

function role(): string {
    return `
Role
You are a licensed residential real estate appraiser producing a sales comparison
analysis for a single-family residence. Follow USPAP-style rigor in reasoning,
but do not claim USPAP compliance. Use only the data provided unless explicitly
stated. Be conservative, consistent, and explain adjustments clearly. Output
a structured JSON result.
`.trim();
}

function objective(): string {
    return `
Objective
- Analyze the Subject property versus provided comparable sales.
- Make market-supported line-item adjustments.
- Reconcile to an indicated value range and a point estimate.
- Include an audit-friendly adjustment table and brief market context.
`.trim();
}

function constraints(): string {
    return `
Constraints
- Time: Value is as of the Subject property's relevant date, which must be determined from the latest relevant sale date in the input data (e.g., in salesHistory).
- Geography: Prioritize same subdivision/neighborhood_code, then nearby substitutes.
- Data hygiene: If a field is missing for a comp, note it and avoid speculative adjustments.
- No external data: Do not assume MLS remarks or features that aren’t provided.
`.trim();
}

function adjustmentGuidelines(cfg: RatesConfig): string {
    return `
Adjustment Guidelines
Use paired-sales logic and market norms. If explicit local factors aren't given,
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

function processSection(): string {
    return `
Process
1) Data recap
2) Market sanity checks
3) Line-item adjustments with table
4) Reconciliation with weights and range
5) Risk and data quality notes
`.trim();
}

export function appraiserPrompt(properties: Property[], cfg: RatesConfig): string {
    return [
        role(),
        objective(),
        `Inputs
- Properties (JSON array containing one 'subject' and multiple 'comparable' entries, identified by 'propertyRole'):
${safeStringify(properties)}
`.trim(),
        constraints(),
        adjustmentGuidelines(cfg),
        processSection(),
    ].join("\n\n");
}


export const appraise = internalAction({
    args: {
        properties: v.array(PropertySchema),
        cfg: RatesConfigSchema,
    },
    returns: v.any(),
    handler: async (ctx, args) => {
        const prompt = appraiserPrompt(args.properties, args.cfg);

        const AppraiserOutputSchema = z.object({
            subject: z.object({
                address: z.string().describe("The street address of the subject property, typically from the 'propertyAddress' input field."),
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
        });

        const { object } = await generateObject({
            model: openai('gpt-4o-mini-2024-07-18'),
            schema: AppraiserOutputSchema,
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

// Pure function for appraisal (cacheable)
export const appraisePure = internalAction({
    args: {
        properties: v.array(PropertySchema),
        cfg: RatesConfigSchema,
    },
    returns: v.any(),
    handler: async (ctx, args) => {
        console.log(`Running appraisal for ${args.properties.length} properties (pure function)`);
        const prompt = appraiserPrompt(args.properties, args.cfg);

        const AppraiserOutputSchema = z.object({
            subject: z.object({
                address: z.string().describe("The street address of the subject property, typically from the 'propertyAddress' input field."),
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
        });

        const { object } = await generateObject({
            model: openai('gpt-5'),
            schema: AppraiserOutputSchema,
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

// Cache instance for appraisal results
const appraisalCache = new ActionCache(components.actionCache, {
    action: internal.external.appraise.appraisePure,
    name: "appraisal",
    ttl: APPRAISAL_CACHE_TTL,
});

// Cached version of the appraisal function
export const appraiseCached = internalAction({
    args: {
        properties: v.array(PropertySchema),
        cfg: RatesConfigSchema,
        force: v.optional(v.boolean())
    },
    returns: v.any(),
    handler: async (ctx, args): Promise<any> => {
        const result: any = await appraisalCache.fetch(
            ctx,
            { properties: args.properties, cfg: args.cfg },
            { force: args.force }
        );

        return result;
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

        await ctx.db.patch(args.appraisalRequestId, {
            status: "done",
        });
    },
});