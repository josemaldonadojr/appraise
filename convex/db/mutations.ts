import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { AppraisalStatus } from "../appraisals/workflow";

export const createRequest = internalMutation({
    args: {
        address: v.string(),
    },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args) => {
        return await ctx.db.insert("appraisal_requests", {
            address: args.address,
            status: AppraisalStatus.REQUEST_INITIATED,
        });
    },
});

export const linkWorkflow = internalMutation({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
        workflowId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.appraisalRequestId, { workflowId: args.workflowId });
    },
});

export const updateGeocodeResult = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
        longitude: v.union(v.float64(), v.null()),
        latitude: v.union(v.float64(), v.null())
    },
    returns: v.id("properties"),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { status: AppraisalStatus.GEOCODED });
        
        // Check if a property with this full address already exists
        const existingProperty = await ctx.db.query("properties")
            .withIndex("byFullAddress", q => q.eq("fullAddress", args.fullAddress))
            .first();
            
        if (existingProperty) {
            // Property already exists, return its ID
            return existingProperty._id;
        } else {
            // Create new property
            return await ctx.db.insert("properties", {
                line1: args.line1,
                fullAddress: args.fullAddress,
                city: args.city,
                state: args.state,
                postalCode: args.postalCode,
                countryCode: args.countryCode,
                longitude: args.longitude,
                latitude: args.latitude,
            });
        }
    },
});

export const saveComparableBatch = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        comparableProperties: v.array(v.object({
            longitude: v.union(v.float64(), v.null()),
            latitude: v.union(v.float64(), v.null()),
            line1: v.union(v.string(), v.null()),
            fullAddress: v.string(),
            city: v.union(v.string(), v.null()),
            state: v.union(v.string(), v.null()),
            postalCode: v.union(v.string(), v.null()),
            countryCode: v.union(v.string(), v.null()),
        })),
    },
    returns: v.object({
        allComparables: v.array(v.object({
            id: v.id("properties"),
            address: v.union(v.string(), v.null()),
        })),
        needAccountLookup: v.array(v.object({
            id: v.id("properties"),
            address: v.union(v.string(), v.null()),
        })),
    }),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { status: AppraisalStatus.COMPARABLES_SAVED });

        const allComparables = [];
        const needAccountLookup = [];

        for (const comparableProperty of args.comparableProperties) {
            const existingProperty = await ctx.db.query("properties").withIndex("byFullAddress", q => q.eq("fullAddress", comparableProperty.fullAddress)).first();

            let comparablePropertyId;
            let hasAccountNumber = false;
            
            if (existingProperty) {
                comparablePropertyId = existingProperty._id;
                // Check if the existing property already has an account number
                hasAccountNumber = existingProperty.accountNumber !== null && existingProperty.accountNumber !== undefined;
            } else {
                comparablePropertyId = await ctx.db.insert("properties", {
                    line1: comparableProperty.line1,
                    fullAddress: comparableProperty.fullAddress,
                    city: comparableProperty.city,
                    state: comparableProperty.state,
                    postalCode: comparableProperty.postalCode,
                    countryCode: comparableProperty.countryCode,
                    longitude: comparableProperty.longitude,
                    latitude: comparableProperty.latitude,
                });
                // New properties don't have account numbers yet
                hasAccountNumber = false;
            }

            const comparable = {
                id: comparablePropertyId,
                address: comparableProperty.line1,
            };

            allComparables.push(comparable);

            // Only add to account lookup if it doesn't already have an account number
            if (!hasAccountNumber) {
                needAccountLookup.push(comparable);
            }

            await ctx.db.insert("comparables", {
                comparablePropertyId: comparablePropertyId,
                appraisalRequestId: args.requestId,
            });
        }

        return {
            allComparables,
            needAccountLookup,
        };
    },
});

export const finalizeAppraisal = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        finalResult: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { finalResult: args.finalResult, status: AppraisalStatus.LLM_APPRAISAL_IN_PROGRESS });
    },
});

export const markFailed = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        errorDetails: v.object({ message: v.string() }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { errorDetails: { message: args.errorDetails.message }, status: AppraisalStatus.FAILED });
    },
});

export const saveAccountNumbers = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        accountsToSave: v.array(v.object({
            comparableId: v.id("properties"),
            accountNumber: v.union(v.string(), v.null()),
        })),
    },
    handler: async (ctx, args) => {
        for (const account of args.accountsToSave) {
            await ctx.db.patch(account.comparableId, { accountNumber: account.accountNumber });
        }
        await ctx.db.patch(args.requestId, { status: AppraisalStatus.ACCOUNT_NUMBER_SAVED });
    },
});