import { v, ConvexError } from "convex/values";
import { internalAction } from "../_generated/server";

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


export const geocodeAddress = internalAction({
    args: { address: v.string() },
    returns: v.object({
        longitude: v.union(v.float64(), v.null()),
        latitude: v.union(v.float64(), v.null()),
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
    }),
    handler: async (ctx, args) => {
        console.log(` Geocoding address: ${args.address}`)
        if (!process.env.MAPBOX_TOKEN) {
            throw new ConvexError({
                code: "ConfigurationError",
                message: "MAPBOX_TOKEN environment variable not set"
            });
        }

        try {
            const geocodeApiUrl = buildForwardGeocodeUrl(args.address, {
                limit: 1,
                country: "us",
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

            return results[0];
        } catch (error) {
            if (error instanceof ConvexError) {
                throw error;
            }
            throw new ConvexError({
                code: "GeocodingError",
                message: `Geocoding request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
});

function buildPlaceSearchUrl(longitude: number, latitude: number) {
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`);
    url.searchParams.set("access_token", process.env.MAPBOX_TOKEN!);
    url.searchParams.set("types", "address");
    url.searchParams.set("limit", "2");
    return url.toString();
}

type Schema = {
    line1: string | null;
    fullAddress: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    countryCode: string | null;
    longitude: number | null;
    latitude: number | null;
};

function mapToSchema(geojson: any): Schema | null {
    if (!geojson?.features || !Array.isArray(geojson.features) || geojson.features.length === 0) {
        return null;
    }

    const feature = geojson.features[0];
    if (!feature) return null;

    const context = feature.context || [];
    const getContextByType = (type: string) =>
        context.find((item: any) => item.id?.startsWith(type));

    const address = feature.address;
    const streetName = feature.text;
    const line1 = address && streetName ? `${address} ${streetName}` : null;

    const placeItem = getContextByType("place.");
    const regionItem = getContextByType("region.");
    const postcodeItem = getContextByType("postcode.");
    const countryItem = getContextByType("country.");

    const city = placeItem?.text || null;
    const state = regionItem?.short_code?.split("-")[1] || regionItem?.text || null;
    const postalCode = postcodeItem?.text || null;
    const countryCode = countryItem?.short_code?.toUpperCase() || null;

    const [longitude, latitude] = feature.center || [null, null];

    return {
        line1,
        fullAddress: feature.place_name || "",
        city,
        state,
        postalCode,
        countryCode,
        longitude: typeof longitude === "number" ? longitude : null,
        latitude: typeof latitude === "number" ? latitude : null,
    };
}

export const findComparables = internalAction({
    args: { longitude: v.number(), latitude: v.number() },
    returns: v.array(v.object({
        longitude: v.union(v.float64(), v.null()),
        latitude: v.union(v.float64(), v.null()),
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
    })),
    handler: async (ctx, args) => {
        console.log(` Finding comparables near ${args.longitude}, ${args.latitude}`);

        const placeSearchUrl = buildPlaceSearchUrl(args.longitude, args.latitude);
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

        const results = placeSearchData.features
            .map((feature: any) => mapToSchema({ features: [feature] }))
            .filter((schema: Schema | null): schema is Schema => schema !== null);
        return results;

    },
});

function parseCSV(csvContent: string): Array<Record<string, string>> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        rows.push(row);
    }

    return rows;
}

/**
 * Normalize address by converting common street suffixes to their abbreviations
 */
function normalizeAddress(address: string): string {
    const streetSuffixMap: Record<string, string> = {
        'Avenue': 'Ave',
        'Boulevard': 'Blvd',
        'Circle': 'Cir',
        'Court': 'Ct',
        'Drive': 'Dr',
        'Lane': 'Ln',
        // 'Place': 'Pl',
        'Road': 'Rd',
        'Street': 'St',
        'Trail': 'Trl',
        'Way': 'Way',
    };

    let normalizedAddress = address;
    for (const [full, abbrev] of Object.entries(streetSuffixMap)) {
        const regex = new RegExp(`\\b${full}\\b`, 'gi');
        normalizedAddress = normalizedAddress.replace(regex, abbrev);
    }

    return normalizedAddress;
}

/**
 * Extract account ID from a CSV row (converted from Python get_account_id_from_row)
 */
function getAccountIdFromRow(row: Record<string, string>): string {
    const accountFields = ["Account", "ACCOUNT", "Account Number", "AccountNumber", "Acct", "Account ID"];

    for (const key of accountFields) {
        if (key in row && row[key]?.trim()) {
            return row[key].trim();
        }
    }

    for (const [key, val] of Object.entries(row)) {
        if (typeof val === 'string' && val.includes('/assessor/details/')) {
            const match = val.match(/\/assessor\/details\/([A-Za-z0-9]+)/);
            if (match) {
                return match[1];
            }
        }
    }

    return "";
}

export const planAccountLookup = internalAction({
    args: {
        comparableAddresses: v.array(v.object({
            address: v.union(v.string(), v.null()),
            id: v.id("properties"),
        }))
    },
    returns: v.array(v.object({
        comparableId: v.id("properties"),
        accountNumber: v.union(v.string(), v.null()),
    })),
    handler: async (ctx, args) => {
        console.log(`Looking up account numbers for ${args.comparableAddresses.length} properties`);
        const results = [];
        for (const comparable of args.comparableAddresses) {
            if (!comparable.address) {
                results.push({
                    comparableId: comparable.id,
                    accountNumber: null
                });
                continue;
            }

            try {
                const normalizedAddress = normalizeAddress(comparable.address);
                console.log(`Normalized address: ${normalizedAddress}`);

                const url = new URL("https://lookups.sccmo.org/assessor/export");
                url.searchParams.set("reset_session", "true");
                url.searchParams.set("SitusName", normalizedAddress);
                url.searchParams.set("searchPropertyType[0]", "0");
                const response = await fetch(url.toString(), {
                    method: 'GET',
                });

                if (!response.ok) {
                    console.error(`Failed to fetch data for ${comparable.address}: ${response.status}`);
                    results.push({
                        comparableId: comparable.id,
                        accountNumber: null
                    });
                    continue;
                }
                const csvContent = await response.text();
                const rows = parseCSV(csvContent);

                const accountId = rows.length > 0 ? getAccountIdFromRow(rows[0]) : "";

                results.push({
                    comparableId: comparable.id,
                    accountNumber: accountId || null
                });

            } catch (error) {
                console.error(`Error processing ${comparable.address}:`, error);
                results.push({
                    comparableId: comparable.id,
                    accountNumber: null
                });
            }
        }
        return results;
    },
})