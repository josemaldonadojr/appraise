import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { ActionCache } from "@convex-dev/action-cache";
import { components } from "./_generated/api";

type MapboxCoordinates = {
    longitude?: number;
    latitude?: number;
};

type MapboxContext = {
    place?: { name?: string };
    region?: { region_code?: string };
    postcode?: { name?: string };
    country?: { country_code?: string };
};

type MapboxProperties = {
    name?: string;
    name_preferred?: string;
    place_formatted?: string;
    full_address?: string;
    coordinates?: MapboxCoordinates;
    context?: MapboxContext;
};

type MapboxGeometry = {
    coordinates?: [number, number];
};

type MapboxFeature = {
    properties?: MapboxProperties;
    geometry?: MapboxGeometry;
};

type MapboxGeocodingResponse = {
    features: MapboxFeature[];
};

function buildForwardGeocodeUrl(searchQuery: string, geocodeOptions: { limit?: number; country?: string } = {}) {
    const { limit = 1, country = "us" } = geocodeOptions;
    const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("types", "address");
    url.searchParams.set("autocomplete", "false");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("country", country);
    url.searchParams.set("access_token", process.env.MAPBOX_TOKEN!);
    return url.toString();
}

function normalizeFeatureV6(mapboxFeature: MapboxFeature) {
    const featureProperties = mapboxFeature.properties ?? {};
    const addressContext = featureProperties.context ?? {};
    const coordinateData = featureProperties.coordinates ?? {};
    const fullAddress = featureProperties.full_address ??
        [featureProperties.name_preferred || featureProperties.name, featureProperties.place_formatted]
            .filter(Boolean)
            .join(", ");

    return {
        line1: featureProperties.name ?? null,
        fullAddress,
        city: addressContext.place?.name ?? null,
        state: addressContext.region?.region_code ?? null,
        postalCode: addressContext.postcode?.name ?? null,
        countryCode: addressContext.country?.country_code ?? null,
        longitude: coordinateData.longitude ?? mapboxFeature.geometry?.coordinates?.[0] ?? null,
        latitude: coordinateData.latitude ?? mapboxFeature.geometry?.coordinates?.[1] ?? null,
    };
}

export const forwardGeocode = internalAction({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
        country: v.optional(v.string()),
    },
    returns: v.array(v.object({
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
        longitude: v.union(v.number(), v.null()),
        latitude: v.union(v.number(), v.null()),
    })),
    handler: async (ctx, args) => {
        if (!process.env.MAPBOX_TOKEN) {
            throw new ConvexError({
                code: "ConfigurationError",
                message: "MAPBOX_TOKEN environment variable not set"
            });
        }

        try {
            const geocodeApiUrl = buildForwardGeocodeUrl(args.query, {
                limit: args.limit,
                country: args.country,
            });

            const mapboxResponse = await fetch(geocodeApiUrl);

            if (!mapboxResponse.ok) {
                throw new ConvexError({
                    code: "GeocodingError",
                    message: `Geocoding failed: ${mapboxResponse.statusText}`
                });
            }

            const geocodingData: MapboxGeocodingResponse = await mapboxResponse.json();
            const results = geocodingData.features.map(normalizeFeatureV6);

            if (results.length > 0) {
                const firstResult = results[0];
                await ctx.runMutation(internal.properties.saveProperty, {
                    line1: firstResult.line1,
                    fullAddress: firstResult.fullAddress,
                    city: firstResult.city,
                    state: firstResult.state,
                    postalCode: firstResult.postalCode,
                    countryCode: firstResult.countryCode,
                    longitude: firstResult.longitude,
                    latitude: firstResult.latitude,
                });
            }

            return results;
        } catch (error) {
            if (error instanceof ConvexError) {
                throw error;
            }
            throw new ConvexError({
                code: "GeocodingError",
                message: `Geocoding request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    },
});

const geocodeCache = new ActionCache(components.actionCache, {
    action: internal.geocode.forwardGeocode,
    name: "forwardGeocodeV1",
    ttl: 1000 * 60 * 60 * 24 * 7,
}) as ActionCache<any>;

export const forwardGeocodeCached = action({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
        country: v.optional(v.string()),
    },
    returns: v.array(v.object({
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
        longitude: v.union(v.number(), v.null()),
        latitude: v.union(v.number(), v.null()),
    })),
    handler: async (ctx, args): Promise<Array<{
        line1: string | null;
        fullAddress: string;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        countryCode: string | null;
        longitude: number | null;
        latitude: number | null;
    }>> => {
        return await geocodeCache.fetch(ctx, args);
    },
});