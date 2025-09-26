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
  })
    .index("byFullAddress", ["fullAddress"])
    .index("byCity", ["city"])
    .index("byCoordinates", ["longitude", "latitude"]),

  comparables: defineTable({
    subjectPropertyId: v.id("properties"),
    comparablePropertyId: v.id("properties"),
  })
    .index("bySubjectPropertyId", ["subjectPropertyId"]),
});
