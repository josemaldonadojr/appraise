"use node";

import { v, ConvexError } from "convex/values";
import { internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

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
    returns: v.null(),
    handler: async (ctx, args): Promise<null> => {
        const property: Doc<"properties"> | null = await ctx.runQuery(internal.properties.getPropertyById, {
            propertyId: args.propertyId,
        });

        if (!property) {
            throw new ConvexError({
                code: "NotFound",
                message: "Property not found"
            });
        }

        if (!property.longitude || !property.latitude) {
            throw new ConvexError({
                code: "InvalidInput",
                message: "Property coordinates are required"
            });
        }

        const placeSearchUrl = buildPlaceSearchUrl(property.longitude, property.latitude);
        const placeSearchResponse = await fetch(placeSearchUrl);
        if (!placeSearchResponse.ok) {
            throw new ConvexError({
                code: "ExternalAPIError",
                message: `Mapbox API error: ${placeSearchResponse.status}`
            });
        }

        const placeSearchData = await placeSearchResponse.json();

        if (!placeSearchData.features || !Array.isArray(placeSearchData.features)) {
            throw new ConvexError({
                code: "ExternalAPIError",
                message: "Invalid response from Mapbox API"
            });
        }

        for (const feature of placeSearchData.features) {
            const placeName = feature.place_name;

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
                query: placeName,
                limit: 1
            });

            if (geocodedAddresses.length > 0) {
                const normalizedAddress = geocodedAddresses[0];

                const comparablePropertyId: Id<"properties"> = await ctx.runMutation(internal.properties.saveProperty, normalizedAddress);

                await ctx.runMutation(internal.properties.createComparable, {
                    subjectPropertyId: args.propertyId,
                    comparablePropertyId: comparablePropertyId
                });
            }
        }

        return null;
    },
});

export const getPropertyById = internalQuery({
    args: { propertyId: v.id("properties") },
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
        return await ctx.db.get(args.propertyId);
    },
});

export const createComparable = internalMutation({
    args: {
        subjectPropertyId: v.id("properties"),
        comparablePropertyId: v.id("properties"),
    },
    returns: v.id("comparables"),
    handler: async (ctx, args): Promise<Id<"comparables">> => {
        return await ctx.db.insert("comparables", {
            subjectPropertyId: args.subjectPropertyId,
            comparablePropertyId: args.comparablePropertyId,
        });
    },
});