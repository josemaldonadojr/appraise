import { v } from "convex/values";
import { internal } from "../_generated/api";
import { workflow } from "../workflows";
import { ConvexError } from "convex/values";

export const AppraisalStatus = {
    REQUEST_INITIATED: "REQUEST_INITIATED",
    GEOCODING_IN_PROGRESS: "GEOCODING_IN_PROGRESS",
    GEOCODED: "GEOCODED",
    SEARCHING_COMPARABLES: "SEARCHING_COMPARABLES",
    COMPARABLES_SAVED: "COMPARABLES_SAVED",
    ACCOUNT_LOOKUP_IN_PROGRESS: "ACCOUNT_LOOKUP_IN_PROGRESS",
    ACCOUNT_NUMBER_SAVED: "ACCOUNT_NUMBER_SAVED",
    PROPERTY_SCRAPE_IN_PROGRESS: "PROPERTY_SCRAPE_IN_PROGRESS",
    DATA_ENRICHED: "DATA_ENRICHED",
    LLM_APPRAISAL_IN_PROGRESS: "LLM_APPRAISAL_IN_PROGRESS",
    APPRAISAL_COMPLETE: "APPRAISAL_COMPLETE",
    FAILED: "FAILED",
} as const;

export const appraisalWorkflow = workflow.define({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
        address: v.string(),
    },
    handler: async (step, args): Promise<void> => {
        const { appraisalRequestId, address } = args;

        try {

            const geocodeResult = await step.runAction(internal.external.actions.geocodeAddress, { address });

            await step.runMutation(internal.db.mutations.updateGeocodeResult, {
                requestId: appraisalRequestId,
                line1: geocodeResult.line1,
                fullAddress: geocodeResult.fullAddress,
                city: geocodeResult.city,
                state: geocodeResult.state,
                postalCode: geocodeResult.postalCode,
                countryCode: geocodeResult.countryCode,
                longitude: geocodeResult.longitude,
                latitude: geocodeResult.latitude,
            });

            if (!geocodeResult.longitude || !geocodeResult.latitude) {
                throw new ConvexError({
                    code: "GeocodingError",
                    message: "Geocoding failed: No longitude or latitude found"
                });
            }

            const comparableAddresses = await step.runAction(internal.external.actions.findComparables, {
                longitude: geocodeResult.longitude,
                latitude: geocodeResult.latitude,
            });

            const geocodedComparables = [];
            for (const comparable of comparableAddresses) {
                if (comparable.fullAddress) {
                    try {
                        const geocodedComparable = await step.runAction(internal.external.actions.geocodeAddress, {
                            address: comparable.fullAddress
                        });
                        geocodedComparables.push(geocodedComparable);
                    } catch (error) {
                        console.error(`Failed to geocode comparable address: ${comparable.fullAddress}`, error);
                        geocodedComparables.push(comparable);
                    }
                } else {
                    geocodedComparables.push(comparable);
                }
            }

            const comparableBatchResult = await step.runMutation(internal.db.mutations.saveComparableBatch, {
                requestId: appraisalRequestId,
                comparableProperties: geocodedComparables,
            });

            if (comparableBatchResult.needAccountLookup.length > 0) {
                const finalResult = await step.runAction(internal.external.actions.planAccountLookup, {
                    comparableAddresses: comparableBatchResult.needAccountLookup,
                });

                await step.runMutation(internal.db.mutations.saveAccountNumbers, {
                    requestId: appraisalRequestId,
                    accountsToSave: finalResult,
                });

                for (const account of finalResult) {
                    if (account.accountNumber) {
                        try {
                            const enrichedData = await step.runAction(internal.external.actions.enrichPropertyData, {
                                accountNumber: account.accountNumber,
                            });

                            await step.runMutation(internal.db.mutations.enrichPropertyWithData, {
                                propertyId: account.comparableId,
                                enrichedData: enrichedData.propertyData,
                            });

                            await step.runMutation(internal.db.mutations.saveSalesHistory, {
                                propertyId: account.comparableId,
                                salesHistory: enrichedData.salesHistory,
                            });
                        } catch (error) {
                            console.error(`Failed to enrich property data for account ${account.accountNumber}:`, error);
                        }
                    }
                }
            }

            const subjectProperty = await step.runQuery(internal.db.query.getSubjectPropertyByRequestId, {
                appraisalRequestId: appraisalRequestId,
            });

            const subjectSalesHistory = await step.runQuery(internal.db.query.getSalesHistoryByPropertyId, {
                propertyId: subjectProperty[0]._id,
            });

            // Extract only the relevant fields, excluding system fields like _id and _creationTime
            const subject = subjectProperty[0];
            const subjectData = {
                line1: subject.line1,
                fullAddress: subject.fullAddress,
                city: subject.city,
                state: subject.state,
                postalCode: subject.postalCode,
                countryCode: subject.countryCode,
                longitude: subject.longitude,
                latitude: subject.latitude,
                accountNumber: subject.accountNumber,
                bedrooms: subject.bedrooms,
                lotSize: subject.lotSize,
                bathrooms: subject.bathrooms,
                halfBathrooms: subject.halfBathrooms,
                parcelId: subject.parcelId,
                asOfDate: subject.asOfDate,
                fireplaces: subject.fireplaces,
                ownerName: subject.ownerName,
                yearBuilt: subject.yearBuilt,
                subdivision: subject.subdivision,
                totalRooms: subject.totalRooms,
                qualityCode: subject.qualityCode,
                fireDistrict: subject.fireDistrict,
                propertyType: subject.propertyType,
                baseAreaSqft: subject.baseAreaSqft,
                exteriorWalls: subject.exteriorWalls,
                landValueUsd: subject.landValueUsd,
                schoolDistrict: subject.schoolDistrict,
                totalAreaSqft: subject.totalAreaSqft,
                legalDescription: subject.legalDescription,
                neighborhoodCode: subject.neighborhoodCode,
                parkingAreaSqft: subject.parkingAreaSqft,
                architecturalType: subject.architecturalType,
                basementAreaSqft: subject.basementAreaSqft,
                commercialValueUsd: subject.commercialValueUsd,
                agricultureValueUsd: subject.agricultureValueUsd,
                residentialValueUsd: subject.residentialValueUsd,
                totalMarketValueUsd: subject.totalMarketValueUsd,
                finishedBasementAreaSqft: subject.finishedBasementAreaSqft,
                salesHistory: subjectSalesHistory,
            };

            // Get comparables from database
            const comparables = await step.runQuery(internal.db.query.getComparablesByRequestId, {
                appraisalRequestId: appraisalRequestId,
            });

            // Format comparables for appraisal
            const compsReadyForAppraisal = [];
            for (const comparable of comparables) {
                const comparableSalesHistory = await step.runQuery(internal.db.query.getSalesHistoryByPropertyId, {
                    propertyId: comparable._id,
                });


                if (comparable.accountNumber) {
                    const comparableData = {
                        line1: comparable.line1,
                        fullAddress: comparable.fullAddress,
                        city: comparable.city,
                        state: comparable.state,
                        postalCode: comparable.postalCode,
                        countryCode: comparable.countryCode,
                        longitude: comparable.longitude,
                        latitude: comparable.latitude,
                        accountNumber: comparable.accountNumber,
                        bedrooms: comparable.bedrooms,
                        lotSize: comparable.lotSize,
                        bathrooms: comparable.bathrooms,
                        halfBathrooms: comparable.halfBathrooms,
                        parcelId: comparable.parcelId,
                        asOfDate: comparable.asOfDate,
                        fireplaces: comparable.fireplaces,
                        ownerName: comparable.ownerName,
                        yearBuilt: comparable.yearBuilt,
                        subdivision: comparable.subdivision,
                        totalRooms: comparable.totalRooms,
                        qualityCode: comparable.qualityCode,
                        fireDistrict: comparable.fireDistrict,
                        propertyType: comparable.propertyType,
                        baseAreaSqft: comparable.baseAreaSqft,
                        exteriorWalls: comparable.exteriorWalls,
                        landValueUsd: comparable.landValueUsd,
                        schoolDistrict: comparable.schoolDistrict,
                        totalAreaSqft: comparable.totalAreaSqft,
                        legalDescription: comparable.legalDescription,
                        neighborhoodCode: comparable.neighborhoodCode,
                        parkingAreaSqft: comparable.parkingAreaSqft,
                        architecturalType: comparable.architecturalType,
                        basementAreaSqft: comparable.basementAreaSqft,
                        commercialValueUsd: comparable.commercialValueUsd,
                        agricultureValueUsd: comparable.agricultureValueUsd,
                        residentialValueUsd: comparable.residentialValueUsd,
                        totalMarketValueUsd: comparable.totalMarketValueUsd,
                        finishedBasementAreaSqft: comparable.finishedBasementAreaSqft,
                        salesHistory: comparableSalesHistory,
                    };
                    compsReadyForAppraisal.push(comparableData);
                }
            }

            // const compsReadyForAppraisal = [];
            // for (const comparable of geocodedComparables) {
            //     if (comparable.accountNumber) {
            //         const comparableData = {
            //             line1: comparable.line1,
            //             fullAddress: comparable.fullAddress,
            //             city: comparable.city,
            //             state: comparable.state,
            //             postalCode: comparable.postalCode,
            //             countryCode: comparable.countryCode,
            //             longitude: comparable.longitude,
            //             latitude: comparable.latitude,
            //             accountNumber: comparable.accountNumber,
            //             bedrooms: comparable.bedrooms,
            //             lotSize: comparable.lotSize,
            //             bathrooms: comparable.bathrooms,
            //             halfBathrooms: comparable.halfBathrooms,
            //             parcelId: comparable.parcelId,
            //             asOfDate: comparable.asOfDate,
            //             fireplaces: comparable.fireplaces,
            //             ownerName: comparable.ownerName,
            //             yearBuilt: comparable.yearBuilt,
            //             subdivision: comparable.subdivision,
            //             totalRooms: comparable.totalRooms,
            //             qualityCode: comparable.qualityCode,
            //             fireDistrict: comparable.fireDistrict,
            //             propertyType: comparable.propertyType,
            //             baseAreaSqft: comparable.baseAreaSqft,
            //             exteriorWalls: comparable.exteriorWalls,
            //             landValueUsd: comparable.landValueUsd,
            //             schoolDistrict: comparable.schoolDistrict,
            //             totalAreaSqft: comparable.totalAreaSqft,
            //             legalDescription: comparable.legalDescription,
            //             neighborhoodCode: comparable.neighborhoodCode,
            //             parkingAreaSqft: comparable.parkingAreaSqft,
            //             architecturalType: comparable.architecturalType,
            //             basementAreaSqft: comparable.basementAreaSqft,
            //             commercialValueUsd: comparable.commercialValueUsd,
            //             agricultureValueUsd: comparable.agricultureValueUsd,
            //             residentialValueUsd: comparable.residentialValueUsd,
            //             totalMarketValueUsd: comparable.totalMarketValueUsd,
            //             finishedBasementAreaSqft: comparable.finishedBasementAreaSqft,
            //         };
            //         compsReadyForAppraisal.push(comparableData);
            //     }
            // }
            // console.log(compsReadyForAppraisal.length, 'compsReadyForAppraisal');
            const appraisalResult = await step.runAction(internal.external.appraise.appraise, {
                subject: subjectData,
                comps: compsReadyForAppraisal,
                cfg: {
                    glaRateStart: 90,
                    bedroomStart: 4000,
                    bathFullStart: 5000,
                    bathHalfStart: 2500,
                    basementFinishedStart: 35,
                    garageRateStart: 20,
                    lotMethod: "lump_sum",
                    timeAdjMonthlyStart: 0.004,
                },
            });
        } catch (error) {
            console.error("Appraisal workflow failed:", error);

            const errorMessage = error instanceof ConvexError
                ? JSON.stringify(error.data)
                : error instanceof Error ? error.message : "An unknown error occurred.";

            await step.runMutation(internal.db.mutations.markFailed, {
                requestId: appraisalRequestId,
                errorDetails: { message: errorMessage },
            });
        }
    },
});