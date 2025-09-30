import { v } from "convex/values";
import { internal } from "../_generated/api";
import { workflow } from "../workflows";
import { ConvexError } from "convex/values";

export const appraisalWorkflow = workflow.define({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
        address: v.string(),
    },
    handler: async (step, args): Promise<void> => {
        const { appraisalRequestId, address } = args;

        try {
            await step.runMutation(internal.db.mutations.updateStatus, {
                requestId: appraisalRequestId,
                status: "address-start",
            });

            const mainAccount = await step.runAction(internal.external.actions.lookupSingleAccount, { address });

            const foundAddresses = await step.runAction(internal.external.firecrawl.searchAddresses, { address });

            if (foundAddresses.length === 0) {
                throw new ConvexError({
                    code: "AddressSearchError",
                    message: "No addresses found for the given street"
                });
            }

            await step.runMutation(internal.db.mutations.updateStatus, {
                requestId: appraisalRequestId,
                status: "lookup-start",
            });

            const accountLookupPromises = foundAddresses.map(addressResult =>
                step.runAction(internal.external.actions.lookupSingleAccount, {
                    address: addressResult.address,
                })
            );

            const accountResults = await Promise.all(accountLookupPromises);

            await step.runMutation(internal.db.mutations.updateStatus, {
                requestId: appraisalRequestId,
                status: "scrape-start",
            });

            const propertyDetails = await step.runAction(internal.external.firecrawl.batchScrapePropertyDetailsAction, {
                accountResults: [mainAccount, ...accountResults],
            });

            const insertPropertyPromises = propertyDetails.map((propertyDetail, index) => {
                const isSubject = propertyDetail.accountNumber === mainAccount.accountNumber;
                step.runMutation(internal.db.mutations.insertProperty, {
                    property: {
                        ...propertyDetail,
                        propertyRole: isSubject ? "subject" : "comparable",
                        appraisalRequestId: appraisalRequestId,
                    },
                })
            });

            await Promise.all(insertPropertyPromises);



            const properties = await step.runQuery(internal.db.query.getPropertiesByAppraisalRequest, {
                appraisalRequestId: appraisalRequestId,
            });


            const propertiesForAppraisal = properties.map((property) => {
                const { _id, _creationTime, appraisalRequestId, ...propertyData } = property;
                return propertyData;
            });

            await step.runMutation(internal.db.mutations.updateStatus, {
                requestId: appraisalRequestId,
                status: "appraise-start",
            });

            const appraisalResult = await step.runAction(internal.external.appraise.appraise, {
                properties: propertiesForAppraisal,
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

            await step.runMutation(internal.external.appraise.saveAppraisalJson, {
                appraisalRequestId: appraisalRequestId,
                appraisalJson: appraisalResult,
            });

            await step.runMutation(internal.db.mutations.updateStatus, {
                requestId: appraisalRequestId,
                status: "done",
            });

            const request = await step.runQuery(internal.db.mutations.getRequest, { appraisalRequestId });
            const { reconciliation, subject } = appraisalResult;
            const { final_value_opinion, indicated_range } = reconciliation;
            const propertyAddress = subject.address;
            const estimatedValue = `$${indicated_range.low.toLocaleString()} - $${indicated_range.high.toLocaleString()}`;
            const reportId = appraisalRequestId;
            const viewReportUrl = `https://appraisement.co/results?requestId=${appraisalRequestId}`;

            await step.runAction(internal.external.resend.sendTestEmail, {
                propertyAddress,
                estimatedValue,
                appraisalId: reportId,
                viewReportUrl,
                userEmail: request?.email || "delivered@resend.dev"
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