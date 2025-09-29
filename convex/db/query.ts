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

export const getSalesHistoryByPropertyId = internalQuery({
    args: {
        propertyId: v.id("properties"),
    },
    returns: v.array(v.any()),
    handler: async (ctx, args) => {
        const salesHistory = await ctx.db.query("sales_history").withIndex("byProperty", (q) => q.eq("propertyId", args.propertyId)).collect();
        const returnSalesHistory = [];
        for (const sale of salesHistory) {
            const returnedSale = {
                previousOwner: sale.previousOwner,
                saleDate: sale.saleDate,
                salePriceUsd: sale.salePriceUsd,
                adjustedSalePriceUsd: sale.adjustedSalePriceUsd,
                unitPriceSqftUsd: sale.unitPriceSqftUsd,
            }
            returnSalesHistory.push(returnedSale);
        }
        return returnSalesHistory;
    },
});