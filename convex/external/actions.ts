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
        'Place': 'Pl',
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

export const lookupSingleAccount = internalAction({
    args: {
        address: v.string(),
    },
    returns: v.object({
        address: v.string(),
        accountNumber: v.union(v.string(), v.null()),
    }),
    handler: async (_, args) => {
        try {
            const url = new URL("https://lookups.sccmo.org/assessor/export");
            url.searchParams.set("reset_session", "true");
            url.searchParams.set("SitusName", args.address);
            url.searchParams.set("searchPropertyType[0]", "0");
            url.searchParams.set("results_per_page", "3");

            const response = await fetch(url.toString(), {
                method: 'GET',
            });

            if (!response.ok) {
                console.error(`Failed to fetch data for ${args.address}: ${response.status}`);
                return {
                    address: args.address,
                    accountNumber: null,
                };
            }

            const csvContent = await response.text();
            const rows = parseCSV(csvContent);
            const accountId = rows.length > 0 ? getAccountIdFromRow(rows[0]) : "";
            console.log(`Account ID for ${args.address}: ${accountId}`);
            return {
                address: args.address,
                accountNumber: accountId,
            };

        } catch (error) {
            console.error(`Error processing ${args.address}:`, error);
            return {
                address: args.address,
                accountNumber: null,
            };
        }
    },
});

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


/**
 * Search for addresses using St. Charles County assessor API with Firecrawl
 */
// export const searchAddresses = internalAction({
//     args: { address: v.string() },
//     returns: v.array(v.object({
//         address: v.string(),
//     })),
//     handler: async (ctx, args) => {
//         console.log(`Searching addresses for: ${args.address}`);

//         if (!process.env.FIRECRAWL_API_KEY) {
//             throw new ConvexError({
//                 code: "ConfigurationError",
//                 message: "FIRECRAWL_API_KEY environment variable not set"
//             });
//         }

//         try {
//             // Extract street name from the address (remove house numbers)
//             const streetName = extractStreetName(args.address);
//             console.log(`Extracted street name: ${streetName}`);

//             // Build the St. Charles County assessor search URL
//             const searchUrl = new URL("https://lookups.sccmo.org/assessor/search");
//             searchUrl.searchParams.set("reset_session", "true");
//             searchUrl.searchParams.set("SitusName", streetName);
//             searchUrl.searchParams.set("searchPropertyType[0]", "0");
//             searchUrl.searchParams.set("results_per_page", "10");

//             const firecrawlOptions = {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     "url": searchUrl.toString(),
//                     "onlyMainContent": true,
//                     "maxAge": 172800000,
//                     "parsers": ["pdf"],
//                     "formats": [
//                         {
//                             "type": "json",
//                             "schema": {
//                                 "type": "object",
//                                 "required": [],
//                                 "properties": {
//                                     "addresses": {
//                                         "type": "array",
//                                         "items": {
//                                             "type": "object",
//                                             "required": [],
//                                             "properties": {
//                                                 "address": {
//                                                     "type": "string"
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     ],
//                     "origin": "website",
//                     "proxy": "stealth"
//                 })
//             };

//             const response = await fetch('https://api.firecrawl.dev/v2/scrape', firecrawlOptions);

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error(`❌ Firecrawl API error! Status: ${response.status}, Body: ${errorText}`);
//                 throw new ConvexError({
//                     code: "AddressSearchError",
//                     message: `Firecrawl API error: ${response.status} ${response.statusText}`
//                 });
//             }

//             const firecrawlData = await response.json();

//             let addresses = [];
//             if (firecrawlData.data && firecrawlData.data.json && firecrawlData.data.json.addresses) {
//                 addresses = firecrawlData.data.json.addresses;
//             } else if (firecrawlData.json && firecrawlData.json.addresses) {
//                 addresses = firecrawlData.json.addresses;
//             } else {
//                 console.error(`No addresses found in response. Full response:`, firecrawlData);
//                 throw new ConvexError({
//                     code: "AddressSearchError",
//                     message: "No addresses found in Firecrawl response"
//                 });
//             }

//             console.log(`Found ${addresses.length} addresses`);
//             return addresses;

//         } catch (error) {
//             if (error instanceof ConvexError) {
//                 throw error;
//             }
//             throw new ConvexError({
//                 code: "AddressSearchError",
//                 message: `Address search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
//             });
//         }
//     },
// });