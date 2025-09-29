import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const createRequest = internalMutation({
    args: {
        address: v.string(),
    },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args) => {
        return await ctx.db.insert("appraisal_requests", {
            address: args.address,
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


export const insertProperty = internalMutation({
    args: {
        property: v.object({
            bath: v.number(),
            bedrooms: v.number(),
            subdivision: v.string(),
            fireplaces: v.number(),
            accountNumber: v.string(),
            parcelId: v.string(),
            schoolDistrict: v.string(),
            fireDistrict: v.string(),
            neighborhoodCode: v.string(),
            lotSize: v.string(),
            propertyType: v.string(),
            yearBuilt: v.number(),
            qualityCode: v.string(),
            architecturalType: v.string(),
            exteriorWalls: v.string(),
            totalAreaSqft: v.number(),
            baseAreaSqft: v.number(),
            parkingAreaSqft: v.number(),
            totalRooms: v.number(),
            basementAreaSqft: v.number(),
            finishedBasementAreaSqft: v.number(),
            propertyRole: v.union(v.literal("subject"), v.literal("comparable")),
        })
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("properties", args.property);
    },
});