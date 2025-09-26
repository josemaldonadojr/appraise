import { action, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const initiateAppraisalRequest = action({
    args: { address: v.string() },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args): Promise<Id<"appraisal_requests">> => {
        const geocodedAddresses = await ctx.runAction(api.geocode.forwardGeocodeCached, {
            query: args.address
        });

        if (geocodedAddresses.length === 0) {
            throw new Error("Address not found");
        }

        const bestMatchAddress = geocodedAddresses[0];

        const existingProperty = await ctx.runQuery(internal.appraisal.getPropertyByAddress, {
            fullAddress: bestMatchAddress.fullAddress
        });

        let propertyId;
        if (existingProperty) {
            propertyId = existingProperty._id;
        } else {
            propertyId = await ctx.runMutation(internal.properties.saveProperty, bestMatchAddress);
        }

        const existingAppraisalRequest = await ctx.runQuery(internal.appraisal.getAppraisalRequestByPropertyId, {
            propertyId
        });

        let appraisalRequestId;
        if (existingAppraisalRequest) {
            appraisalRequestId = existingAppraisalRequest._id;
        } else {
            appraisalRequestId = await ctx.runMutation(internal.appraisal.createAppraisalRequest, {
                propertyId,
            });
        }

        return appraisalRequestId;

    }
});

export const createAppraisalRequest = internalMutation({
    args: { propertyId: v.id("properties") },
    handler: async (ctx, args) => {
        return await ctx.db.insert("appraisal_requests", {
            propertyId: args.propertyId,
        });
    }
});

export const getAppraisalRequestByPropertyId = internalQuery({
    args: { propertyId: v.id("properties") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("appraisal_requests")
            .withIndex("byPropertyId", q => q.eq("propertyId", args.propertyId))
            .unique();
    }
});

export const getPropertyByAddress = internalQuery({
    args: { fullAddress: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("properties")
            .withIndex("byFullAddress", q => q.eq("fullAddress", args.fullAddress))
            .unique();
    }
});