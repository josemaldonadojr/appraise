import { v } from "convex/values";
import { internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";

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

function buildPlaceSearchUrl(longitude: number, latitude: number) {
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`);
    url.searchParams.set("access_token", process.env.MAPBOX_TOKEN!);
    url.searchParams.set("types", "address");
    url.searchParams.set("limit", "5");
    return url.toString();
}

export const getNearestProperties = internalAction({
    args: {
        propertyId: v.id("properties"),
    },
    returns: v.any(),
    handler: async (ctx, args): Promise<any> => {
        const property = await ctx.runQuery(internal.properties.getPropertyById, {
            propertyId: args.propertyId,
        });

        if (!property) {
            throw new Error("Property not found");
        }

        const placeSearchUrl = buildPlaceSearchUrl(property.longitude!, property.latitude!);
        const placeSearchResponse = await fetch(placeSearchUrl);
        const placeSearchData = await placeSearchResponse.json();

        for (const feature of placeSearchData.features) {
            const placeName = feature.place_name;

            const geocodedAddresses = await ctx.runAction(api.geocode.forwardGeocodeCached, {
                query: placeName,
                limit: 1
            });

            if (geocodedAddresses.length > 0) {
                const normalizedAddress = geocodedAddresses[0];

                const comparablePropertyId = await ctx.runMutation(internal.properties.saveProperty, normalizedAddress);

                await ctx.runMutation(internal.properties.createComparable, {
                    subjectPropertyId: args.propertyId,
                    comparablePropertyId: comparablePropertyId
                });
            }
        }

        return placeSearchData
    },
});

export const getPropertyById = internalQuery({
    args: { propertyId: v.id("properties") },
    handler: async (ctx, args) => {
        return await ctx.db.query("properties").withIndex("by_id", (q) => q.eq("_id", args.propertyId)).unique();
    },
});

export const createComparable = internalMutation({
    args: {
        subjectPropertyId: v.id("properties"),
        comparablePropertyId: v.id("properties"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("comparables", {
            subjectPropertyId: args.subjectPropertyId,
            comparablePropertyId: args.comparablePropertyId,
        });
    },
});