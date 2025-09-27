import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { AppraisalStatus } from "../appraisals/workflow";

export const createRequest = internalMutation({
    args: {
        address: v.string(),
    },
    returns: v.id("appraisal_requests"),
    handler: async (ctx, args) => {
        return await ctx.db.insert("appraisal_requests", {
            address: args.address,
            status: AppraisalStatus.REQUEST_INITIATED,
        });
    },
});

export const linkWorkflow = internalMutation({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
        workflowId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.appraisalRequestId, { workflowId: args.workflowId });
    },
});

export const updateGeocodeResult = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        line1: v.union(v.string(), v.null()),
        fullAddress: v.string(),
        city: v.union(v.string(), v.null()),
        state: v.union(v.string(), v.null()),
        postalCode: v.union(v.string(), v.null()),
        countryCode: v.union(v.string(), v.null()),
        longitude: v.union(v.float64(), v.null()),
        latitude: v.union(v.float64(), v.null())
    },
    returns: v.id("properties"),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { status: AppraisalStatus.GEOCODED });

        // Check if a property with this full address already exists
        const existingProperty = await ctx.db.query("properties")
            .withIndex("byFullAddress", q => q.eq("fullAddress", args.fullAddress))
            .first();

        if (existingProperty) {
            // Property already exists, return its ID
            return existingProperty._id;
        } else {
            // Create new property
            return await ctx.db.insert("properties", {
                appraisalRequestId: args.requestId,
                line1: args.line1,
                fullAddress: args.fullAddress,
                city: args.city,
                state: args.state,
                postalCode: args.postalCode,
                countryCode: args.countryCode,
                longitude: args.longitude,
                latitude: args.latitude,
                bedrooms: null,
                lotSize: null,
                bathrooms: null,
                halfBathrooms: null,
                parcelId: null,
                asOfDate: null,
                fireplaces: null,
                ownerName: null,
                yearBuilt: null,
                subdivision: null,
                totalRooms: null,
                qualityCode: null,
                fireDistrict: null,
                propertyType: null,
                baseAreaSqft: null,
                exteriorWalls: null,
                landValueUsd: null,
                schoolDistrict: null,
                totalAreaSqft: null,
                legalDescription: null,
                neighborhoodCode: null,
                parkingAreaSqft: null,
                architecturalType: null,
                basementAreaSqft: null,
                commercialValueUsd: null,
                agricultureValueUsd: null,
                residentialValueUsd: null,
                totalMarketValueUsd: null,
                finishedBasementAreaSqft: null,
            });
        }
    },
});

export const saveComparableBatch = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        comparableProperties: v.array(v.object({
            longitude: v.union(v.float64(), v.null()),
            latitude: v.union(v.float64(), v.null()),
            line1: v.union(v.string(), v.null()),
            fullAddress: v.string(),
            city: v.union(v.string(), v.null()),
            state: v.union(v.string(), v.null()),
            postalCode: v.union(v.string(), v.null()),
            countryCode: v.union(v.string(), v.null()),
        })),
    },
    returns: v.object({
        allComparables: v.array(v.object({
            id: v.id("properties"),
            address: v.union(v.string(), v.null()),
        })),
        needAccountLookup: v.array(v.object({
            id: v.id("properties"),
            address: v.union(v.string(), v.null()),
        })),
    }),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { status: AppraisalStatus.COMPARABLES_SAVED });

        const allComparables = [];
        const needAccountLookup = [];

        for (const comparableProperty of args.comparableProperties) {
            const existingProperty = await ctx.db.query("properties").withIndex("byFullAddress", q => q.eq("fullAddress", comparableProperty.fullAddress)).first();

            let comparablePropertyId;
            let hasAccountNumber = false;

            if (existingProperty) {
                comparablePropertyId = existingProperty._id;
                // Check if the existing property already has an account number
                hasAccountNumber = existingProperty.accountNumber !== null && existingProperty.accountNumber !== undefined;
            } else {
                comparablePropertyId = await ctx.db.insert("properties", {
                    appraisalRequestId: args.requestId,
                    line1: comparableProperty.line1,
                    fullAddress: comparableProperty.fullAddress,
                    city: comparableProperty.city,
                    state: comparableProperty.state,
                    postalCode: comparableProperty.postalCode,
                    countryCode: comparableProperty.countryCode,
                    longitude: comparableProperty.longitude,
                    latitude: comparableProperty.latitude,
                    bedrooms: null,
                    lotSize: null,
                    bathrooms: null,
                    halfBathrooms: null,
                    parcelId: null,
                    asOfDate: null,
                    fireplaces: null,
                    ownerName: null,
                    yearBuilt: null,
                    subdivision: null,
                    totalRooms: null,
                    qualityCode: null,
                    fireDistrict: null,
                    propertyType: null,
                    baseAreaSqft: null,
                    exteriorWalls: null,
                    landValueUsd: null,
                    schoolDistrict: null,
                    totalAreaSqft: null,
                    legalDescription: null,
                    neighborhoodCode: null,
                    parkingAreaSqft: null,
                    architecturalType: null,
                    basementAreaSqft: null,
                    commercialValueUsd: null,
                    agricultureValueUsd: null,
                    residentialValueUsd: null,
                    totalMarketValueUsd: null,
                    finishedBasementAreaSqft: null,
                });
                // New properties don't have account numbers yet
                hasAccountNumber = false;
            }

            const comparable = {
                id: comparablePropertyId,
                address: comparableProperty.line1,
            };

            allComparables.push(comparable);

            // Only add to account lookup if it doesn't already have an account number
            if (!hasAccountNumber) {
                needAccountLookup.push(comparable);
            }

            await ctx.db.insert("comparables", {
                comparablePropertyId: comparablePropertyId,
                appraisalRequestId: args.requestId,
            });
        }

        return {
            allComparables,
            needAccountLookup,
        };
    },
});

export const finalizeAppraisal = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        finalResult: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { finalResult: args.finalResult, status: AppraisalStatus.LLM_APPRAISAL_IN_PROGRESS });
    },
});

export const markFailed = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        errorDetails: v.object({ message: v.string() }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, { errorDetails: { message: args.errorDetails.message }, status: AppraisalStatus.FAILED });
    },
});

export const saveAccountNumbers = internalMutation({
    args: {
        requestId: v.id("appraisal_requests"),
        accountsToSave: v.array(v.object({
            comparableId: v.id("properties"),
            accountNumber: v.union(v.string(), v.null()),
        })),
    },
    handler: async (ctx, args) => {
        for (const account of args.accountsToSave) {
            await ctx.db.patch(account.comparableId, { accountNumber: account.accountNumber });
        }
        await ctx.db.patch(args.requestId, { status: AppraisalStatus.ACCOUNT_NUMBER_SAVED });
    },
});

export const enrichPropertyWithData = internalMutation({
    args: {
        propertyId: v.id("properties"),
        enrichedData: v.object({
            bedrooms: v.union(v.number(), v.null()),
            lotSize: v.union(v.string(), v.null()),
            bathrooms: v.union(v.number(), v.null()),
            halfBathrooms: v.union(v.number(), v.null()),
            parcelId: v.union(v.string(), v.null()),
            asOfDate: v.union(v.string(), v.null()),
            fireplaces: v.union(v.number(), v.null()),
            ownerName: v.union(v.string(), v.null()),
            yearBuilt: v.union(v.number(), v.null()),
            subdivision: v.union(v.string(), v.null()),
            totalRooms: v.union(v.number(), v.null()),
            qualityCode: v.union(v.string(), v.null()),
            fireDistrict: v.union(v.string(), v.null()),
            propertyType: v.union(v.string(), v.null()),
            baseAreaSqft: v.union(v.number(), v.null()),
            exteriorWalls: v.union(v.string(), v.null()),
            landValueUsd: v.union(v.number(), v.null()),
            schoolDistrict: v.union(v.string(), v.null()),
            totalAreaSqft: v.union(v.number(), v.null()),
            legalDescription: v.union(v.string(), v.null()),
            neighborhoodCode: v.union(v.string(), v.null()),
            parkingAreaSqft: v.union(v.number(), v.null()),
            architecturalType: v.union(v.string(), v.null()),
            basementAreaSqft: v.union(v.number(), v.null()),
            commercialValueUsd: v.union(v.number(), v.null()),
            agricultureValueUsd: v.union(v.number(), v.null()),
            residentialValueUsd: v.union(v.number(), v.null()),
            totalMarketValueUsd: v.union(v.number(), v.null()),
            finishedBasementAreaSqft: v.union(v.number(), v.null()),
        }),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.propertyId, {
            bedrooms: args.enrichedData.bedrooms ?? null,
            lotSize: args.enrichedData.lotSize ?? null,
            bathrooms: args.enrichedData.bathrooms ?? null,
            halfBathrooms: args.enrichedData.halfBathrooms ?? null,
            parcelId: args.enrichedData.parcelId ?? null,
            asOfDate: args.enrichedData.asOfDate ?? null,
            fireplaces: args.enrichedData.fireplaces ?? null,
            ownerName: args.enrichedData.ownerName ?? null,
            yearBuilt: args.enrichedData.yearBuilt ?? null,
            subdivision: args.enrichedData.subdivision ?? null,
            totalRooms: args.enrichedData.totalRooms ?? null,
            qualityCode: args.enrichedData.qualityCode ?? null,
            fireDistrict: args.enrichedData.fireDistrict ?? null,
            propertyType: args.enrichedData.propertyType ?? null,
            baseAreaSqft: args.enrichedData.baseAreaSqft ?? null,
            exteriorWalls: args.enrichedData.exteriorWalls ?? null,
            landValueUsd: args.enrichedData.landValueUsd ?? null,
            schoolDistrict: args.enrichedData.schoolDistrict ?? null,
            totalAreaSqft: args.enrichedData.totalAreaSqft ?? null,
            legalDescription: args.enrichedData.legalDescription ?? null,
            neighborhoodCode: args.enrichedData.neighborhoodCode ?? null,
            parkingAreaSqft: args.enrichedData.parkingAreaSqft ?? null,
            architecturalType: args.enrichedData.architecturalType ?? null,
            basementAreaSqft: args.enrichedData.basementAreaSqft ?? null,
            commercialValueUsd: args.enrichedData.commercialValueUsd ?? null,
            agricultureValueUsd: args.enrichedData.agricultureValueUsd ?? null,
            residentialValueUsd: args.enrichedData.residentialValueUsd ?? null,
            totalMarketValueUsd: args.enrichedData.totalMarketValueUsd ?? null,
            finishedBasementAreaSqft: args.enrichedData.finishedBasementAreaSqft ?? null,
        });
        return null;
    },
});

export const saveSalesHistory = internalMutation({
    args: {
        propertyId: v.id("properties"),
        salesHistory: v.array(v.object({
            previousOwner: v.union(v.string(), v.null()),
            saleDate: v.union(v.string(), v.null()),
            salePriceUsd: v.union(v.number(), v.null()),
            adjustedSalePriceUsd: v.union(v.number(), v.null()),
            unitPriceSqftUsd: v.union(v.number(), v.null()),
        })),
    },
    handler: async (ctx, args) => {
        for (const sale of args.salesHistory) {
            await ctx.db.insert("sales_history", {
                propertyId: args.propertyId,
                previousOwner: sale.previousOwner,
                saleDate: sale.saleDate,
                salePriceUsd: sale.salePriceUsd,
                adjustedSalePriceUsd: sale.adjustedSalePriceUsd,
                unitPriceSqftUsd: sale.unitPriceSqftUsd,
            });
        }
    },
});