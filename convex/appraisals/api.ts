import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { workflow } from "../workflows";
import type { Id } from "../_generated/dataModel";

export const startRequest = mutation({
    args: { address: v.string() },
    returns: v.object({
        appraisalRequestId: v.id("appraisal_requests"),
        workflowId: v.string(),
    }),
    handler: async (ctx, args): Promise<any> => {
        const appraisalRequestId: Id<"appraisal_requests"> = await ctx.runMutation(internal.db.mutations.createRequest, {
            address: args.address,
        });

        const workflowId = await workflow.start(
            ctx,
            internal.appraisals.workflow.appraisalWorkflow,
            { appraisalRequestId, address: args.address }
        );

        await ctx.runMutation(internal.db.mutations.linkWorkflow, { appraisalRequestId, workflowId });

        return { appraisalRequestId, workflowId };
    },
});


export const getRequestStatus = query({
    args: { appraisalRequestId: v.id("appraisal_requests") },
    handler: async (ctx, args): Promise<any> => {
        const request = await ctx.db.get(args.appraisalRequestId);
        if (!request) return null;

        return {
            status: request.status,
            finalResult: request.finalResult,
            errorDetails: request.errorDetails,
        };
    },
});