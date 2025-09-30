import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const createRequest = internalMutation({
    args: {
        address: v.string(),
        email: v.string(),
    },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args) => {
        return await ctx.db.insert("appraisal_requests", {
            address: args.address,
            email: args.email,
            status: "running",
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

export const updateStatus = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { status: args.status });
    },
});

export const finalizeAppraisal = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        finalResult: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { finalResult: args.finalResult, status: "done" });
    },
});

export const markFailed = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        errorDetails: v.object({ message: v.string() }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { errorDetails: { message: args.errorDetails.message }, status: "failed" });
    },
});


export const getRequest = internalQuery({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
    },
    returns: v.union(v.object({
        _id: v.id("appraisal_requests"),
        _creationTime: v.number(),
        address: v.string(),
        email: v.string(),
        status: v.string(),
        workflowId: v.optional(v.string()),
        finalResult: v.optional(v.number()),
        errorDetails: v.optional(v.object({ message: v.string() })),
    }), v.null()),
    handler: async (ctx, args) => {
        return await ctx.db.get(args.appraisalRequestId);
    },
});

export const insertProperty = internalMutation({
    args: {
        property: v.object({
            appraisalRequestId: v.id("appraisal_requests"),
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
        })
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("properties", args.property);
    },
});