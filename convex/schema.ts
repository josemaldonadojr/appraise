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
