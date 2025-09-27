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
            }
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