import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const saveProperty = internalMutation({
    args: {
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
        longitude: v.union(v.number(), v.null()),
        latitude: v.union(v.number(), v.null()),
    },
    returns: v.id("properties"),
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("properties")
            .withIndex("byFullAddress", (q) => q.eq("fullAddress", args.fullAddress))
            .unique();

        if (existing) {
            return existing._id;
        }


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
    },
});