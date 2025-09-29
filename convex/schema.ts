import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
    appraisalRequestId: v.optional(v.id("appraisal_requests")),
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
    propertyRole: v.union(v.literal("subject"), v.literal("comparable")),
  })
    .index("byAccountNumber", ["accountNumber"])
    .index("byAppraisalRequest", ["appraisalRequestId"]),


  appraisal_requests: defineTable({
    address: v.string(),
    status: v.string(),
    workflowId: v.optional(v.string()),
    // userId: v.id("users"),

    finalResult: v.optional(v.number()),
    errorDetails: v.optional(v.object({ message: v.string() })),
  }).index("byStatus", ["status"]),

});
