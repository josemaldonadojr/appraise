import { action, internalQuery, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

export const initiateAppraisalRequest = action({
    args: { address: v.string() },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args): Promise<Id<"appraisal_requests">> => {
        const geocodedAddresses: Array<{
            line1: string | null;
            fullAddress: string;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            countryCode: string | null;
            longitude: number | null;
            latitude: number | null;
        }> = await ctx.runAction(api.geocode.forwardGeocodeCached, {
            query: args.address
        });

        if (geocodedAddresses.length === 0) {
            throw new ConvexError({
                code: "NotFound",
                message: "Address not found"
            });
        }

        const bestMatchAddress = geocodedAddresses[0];

        const existingProperty: Doc<"properties"> | null = await ctx.runQuery(internal.appraisal.getPropertyByAddress, {
            fullAddress: bestMatchAddress.fullAddress
        });

        let propertyId: Id<"properties">;
        if (existingProperty) {
            propertyId = existingProperty._id;
        } else {
            propertyId = await ctx.runMutation(internal.properties.saveProperty, bestMatchAddress);
        }

        const existingAppraisalRequest: Doc<"appraisal_requests"> | null = await ctx.runQuery(internal.appraisal.getAppraisalRequestByPropertyId, {
            propertyId
        });

        let appraisalRequestId: Id<"appraisal_requests">;
        if (existingAppraisalRequest) {
            appraisalRequestId = existingAppraisalRequest._id;
        } else {
            appraisalRequestId = await ctx.runMutation(internal.appraisal.createAppraisalRequest, {
                propertyId,
            });
            await ctx.scheduler.runAfter(0, internal.properties.getNearestProperties, {
                propertyId,
            });
        }

        return appraisalRequestId;

    }
});

export const createAppraisalRequest = internalMutation({
    args: { propertyId: v.id("properties") },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args): Promise<Id<"appraisal_requests">> => {
        return await ctx.db.insert("appraisal_requests", {
            propertyId: args.propertyId,
        });
    }
});

export const getAppraisalRequestByPropertyId = internalQuery({
    args: { propertyId: v.id("properties") },
    returns: v.union(
        v.object({
            _id: v.id("appraisal_requests"),
            _creationTime: v.number(),
            propertyId: v.id("properties"),
        }),
        v.null()
    ),
    handler: async (ctx, args): Promise<Doc<"appraisal_requests"> | null> => {
        return await ctx.db
            .query("appraisal_requests")
            .withIndex("byPropertyId", q => q.eq("propertyId", args.propertyId))
            .unique();
    }
});

export const getPropertyByAddress = internalQuery({
    args: { fullAddress: v.string() },
    returns: v.union(
        v.object({
            _id: v.id("properties"),
            _creationTime: v.number(),
            line1: v.union(v.string(), v.null()),
            fullAddress: v.string(),
            city: v.union(v.string(), v.null()),
            state: v.union(v.string(), v.null()),
            postalCode: v.union(v.string(), v.null()),
            countryCode: v.union(v.string(), v.null()),
            longitude: v.union(v.number(), v.null()),
            latitude: v.union(v.number(), v.null()),
        }),
        v.null()
    ),
    handler: async (ctx, args): Promise<Doc<"properties"> | null> => {
        return await ctx.db
            .query("properties")
            .withIndex("byFullAddress", q => q.eq("fullAddress", args.fullAddress))
            .unique();
    }
});