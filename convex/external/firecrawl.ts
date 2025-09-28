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
    resultsPerPage: 10,
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
