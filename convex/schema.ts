import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
    line1: v.union(v.string(), v.null()),
    fullAddress: v.string(),
    city: v.union(v.string(), v.null()),
    state: v.union(v.string(), v.null()),
    postalCode: v.union(v.string(), v.null()),
    countryCode: v.union(v.string(), v.null()),
    longitude: v.union(v.number(), v.null()),
    latitude: v.union(v.number(), v.null()),
    accountNumber: v.optional(v.union(v.string(), v.null())),
  })
    .index("byFullAddress", ["fullAddress"])
    .index("byCity", ["city"])
    .index("byCoordinates", ["longitude", "latitude"])
    .index("byAccountNumber", ["accountNumber"]),

  comparables: defineTable({
    comparablePropertyId: v.id("properties"),
    appraisalRequestId: v.id("appraisal_requests"),
  })
    .index("byComparableProperty", ["comparablePropertyId"])
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
