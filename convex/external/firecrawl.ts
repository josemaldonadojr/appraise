"use node"

import { v, ConvexError } from "convex/values";
import { internalAction } from "../_generated/server";
import FirecrawlApp from '@mendable/firecrawl-js';
import { z } from 'zod';

export type AddressSearchResult = {
    address: string;
};

export type FirecrawlConfig = {
    apiKey: string;
    baseUrl: string;
    cacheMaxAge: number;
    resultsPerPage: number;
};

export type AddressSearchOptions = {
    includeDetails?: boolean;
    maxResults?: number;
};

// Configuration
const DEFAULT_CONFIG: Omit<FirecrawlConfig, 'apiKey'> = {
    baseUrl: 'https://lookups.sccmo.org/assessor/search',
    cacheMaxAge: 172800000, // 2 days in milliseconds
    resultsPerPage: 3,
};

// Zod schema for address search results
const AddressSearchSchema = z.object({
    addresses: z.array(z.string())
});

export function extractStreetNameFromAddress(address: string): string {
    // Remove leading numbers and any leading/trailing whitespace
    return address.replace(/^\d+\s*/, '').trim();
}

export function buildAssessorSearchUrl(streetName: string, config: FirecrawlConfig): string {
    const url = new URL(config.baseUrl);
    url.searchParams.set("reset_session", "true");
    url.searchParams.set("SitusName", streetName);
    url.searchParams.set("searchPropertyType[0]", "0");
    url.searchParams.set("results_per_page", config.resultsPerPage.toString());
    return url.toString();
}

export function createFirecrawlApp(apiKey: string): FirecrawlApp {
    if (!apiKey) {
        throw new ConvexError({
            code: "ConfigurationError",
            message: "FIRECRAWL_API_KEY environment variable not set"
        });
    }
    return new FirecrawlApp({ apiKey });
}

export function parseAddressSearchResponse(response: any): AddressSearchResult[] {
    try {
        const data = response.data?.json || response.json;
        const parsed = AddressSearchSchema.parse(data);
        // Transform array of strings into array of objects with address property
        return parsed.addresses.map(address => ({ address }));
    } catch (error) {
        console.error('Failed to parse address search response:', error);
        console.error('Response structure:', JSON.stringify(response, null, 2));
        throw new ConvexError({
            code: "AddressSearchError",
            message: "Invalid response format from Firecrawl"
        });
    }
}

export async function searchAddressesWithFirecrawl(
    address: string,
    options: AddressSearchOptions = {}
): Promise<AddressSearchResult[]> {
    const config: FirecrawlConfig = {
        ...DEFAULT_CONFIG,
        apiKey: process.env.FIRECRAWL_API_KEY || ''
    };

    const app = createFirecrawlApp(config.apiKey);
    const streetName = extractStreetNameFromAddress(address);
    const searchUrl = buildAssessorSearchUrl(streetName, config);

    console.log(`Searching addresses for: ${address} (street: ${streetName})`);

    try {
        const result = await app.scrape(searchUrl, {
            formats: [{
                type: "json",
                schema: AddressSearchSchema,
                prompt: `Extract property addresses from the St. Charles County assessor search results. 
                        Return only the street addresses in a simple format.`
            }],
            onlyMainContent: true,
            maxAge: config.cacheMaxAge,
            origin: "website",
            proxy: "stealth"
        });

        const addresses = parseAddressSearchResponse(result);

        if (addresses.length === 0) {
            throw new ConvexError({
                code: "AddressSearchError",
                message: "No addresses found in search results"
            });
        }

        console.log(`Found ${addresses.length} addresses`);
        return addresses;

    } catch (error) {
        if (error instanceof ConvexError) {
            throw error;
        }

        console.error('Address search error:', error);
        throw new ConvexError({
            code: "AddressSearchError",
            message: `Address search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
}

// Types for batch property scraping
export type AccountResult = {
    address: string | null;
    accountNumber: string | null;
};

export type BatchPropertyResult = {
    bath?: number;
    bedrooms?: number;
    subdivision?: string;
    fireplaces?: number;
    accountNumber?: string;
    parcelId?: string;
    schoolDistrict?: string;
    fireDistrict?: string;
    neighborhoodCode?: string;
    lotSize?: string;
    propertyType?: string;
    yearBuilt?: number;
    qualityCode?: string;
    architecturalType?: string;
    exteriorWalls?: string;
    totalAreaSqft?: number;
    baseAreaSqft?: number;
    parkingAreaSqft?: number;
    totalRooms?: number;
    basementAreaSqft?: number;
    finishedBasementAreaSqft?: number;
    salesHistory?: {
        previousOwners?: string;
        saleDate?: string;
        salePrice?: string;
        adjustedSalePrice?: string;
    }[];
    propertyAddress?: string;
};

const schema = {
    type: "object",
    properties: {
        bath: { type: "number" },
        bedrooms: { type: "number" },
        subdivision: { type: "string" },
        fireplaces: { type: "number" },
        accountNumber: { type: "string" },
        parcelId: { type: "string" },
        schoolDistrict: { type: "string" },
        fireDistrict: { type: "string" },
        neighborhoodCode: { type: "string" },
        lotSize: { type: "string" },
        propertyType: { type: "string" },
        yearBuilt: { type: "number" },
        qualityCode: { type: "string" },
        architecturalType: { type: "string" },
        exteriorWalls: { type: "string" },
        totalAreaSqft: { type: "number" },
        baseAreaSqft: { type: "number" },
        parkingAreaSqft: { type: "number" },
        totalRooms: { type: "number" },
        basementAreaSqft: { type: "number" },
        finishedBasementAreaSqft: { type: "number" },
        propertyAddress: { type: "string" },
        salesHistory: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    previousOwners: { type: "string" },
                    saleDate: { type: "string" },
                    salePrice: { type: "string" },
                    adjustedSalePrice: { type: "string" },
                },
            }
        },
    },
    required: ["bath", "bedrooms", "fireplaces", "subdivision"]
};

export async function batchScrapePropertyDetails(
    accountResults: AccountResult[]
): Promise<BatchPropertyResult[]> {
    const config: FirecrawlConfig = {
        ...DEFAULT_CONFIG,
        apiKey: process.env.FIRECRAWL_API_KEY || ''
    };

    const app = createFirecrawlApp(config.apiKey);

    const validResults = accountResults.filter(result => result.accountNumber);
    const detailUrls = validResults.map(result =>
        `https://lookups.sccmo.org/assessor/details/${result.accountNumber}`
    );

    if (detailUrls.length === 0) {
        console.log('No valid account numbers found for batch scraping');
        return [];
    }

    try {
        const batchScrapeResult = await app.batchScrape(detailUrls, {
            options: {
                formats: [
                    {
                        type: "json",
                        prompt: "Extract the property address and bath and bedrooms and subdivision and fireplaces and Account Number and Parcel ID and School District and Fire District and Neighborhood Code and Lot Size and Property Type and Year Built and Quality Code and Architectural Type and Exterior Walls and Total Area SqFt and Base Area SqFt and Parking Area SqFt and Total Rooms and Basement Area SqFt and Finished Basement Area SqFt and Sales History from the page.",
                        schema: schema
                    }
                ]
            }
        });

        if (batchScrapeResult.status === "completed") {

            const results = batchScrapeResult.data.map(d => d.json) as BatchPropertyResult[];
            return results;
        }

    } catch (error) {
        console.error('Batch scrape failed:', error);
        return [];
    }
    return [];
}

export const searchAddresses = internalAction({
    args: {
        address: v.string(),
        includeDetails: v.optional(v.boolean())
    },
    returns: v.array(v.object({
        address: v.string(),
    })),
    handler: async (ctx, args) => {
        return await searchAddressesWithFirecrawl(args.address, {
            includeDetails: args.includeDetails
        });
    },
});

export const batchScrapePropertyDetailsAction = internalAction({
    args: {
        accountResults: v.array(v.object({
            address: v.union(v.string(), v.null()),
            accountNumber: v.union(v.string(), v.null())
        }))
    },
    returns: v.array(v.object({
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
        salesHistory: v.optional(v.array(v.object({
            previousOwners: v.optional(v.string()),
            saleDate: v.optional(v.string()),
            salePrice: v.optional(v.string()),
            adjustedSalePrice: v.optional(v.string()),
        })),),
        propertyAddress: v.optional(v.string()),
    })),
    handler: async (ctx, args) => {
        const results = await batchScrapePropertyDetails(args.accountResults);
        return results;
    },
});
