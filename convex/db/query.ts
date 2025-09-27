import { internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export const getSubjectPropertyByRequestId = internalQuery({
    args: {
        appraisalRequestId: v.id("appraisal_requests"),
    },
    returns: v.array(v.any()),
    handler: async (ctx, args) => {
        return await ctx.db.query("properties").withIndex("byAppraisalRequest", (q) => q.eq("appraisalRequestId", args.appraisalRequestId)).collect();
    },
});